import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fileUpload from "express-fileupload";
import path from "path";
import session from "express-session";
import MemoryStore from 'memorystore';
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import compression from 'compression';
import cluster from 'cluster';
import http from 'http';
import { cpus } from 'os';
import { seedDatabase } from './seed-data';
import { testDatabaseConnection } from './test-db-connection';
import { connectionPool, db as databaseConnection } from "./connection-pool";
import { sql } from "./db";


// Only use clustering in production, use single process in development for easier debugging
const ENABLE_CLUSTERING = process.env.NODE_ENV === 'production' && process.env.DISABLE_CLUSTERING !== 'true';
const numCPUs = Math.min(cpus().length, 2); // Limit to 2 workers in Replit environment

// Improved error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Give time for logs to be written
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', promise, 'Reason:', reason);
});

// Cluster primary process
if (ENABLE_CLUSTERING && cluster.isPrimary) {
  console.log(`Master process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // This code will be executed by each worker process or by the main process if clustering is disabled
  const MemoryStoreSession = MemoryStore(session);

  // Create Express app
  const app = express();

  // Apply basic middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(compression());

  // Session configuration
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000, // 24 hours
    ttl: 86400,
    noDisposeOnSet: true
  });

  const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
      httpOnly: true,
      sameSite: 'lax'
    },
    name: 'session_id'
  });

  app.use(sessionMiddleware);

  // Request logging for debugging
  app.use((req, res, next) => {
    if (!req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
    }
    next();
  });

  // Error handling middleware
  const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);

    if (res.headersSent) {
      return next(err);
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Server error";

    res.status(status).json({ 
      error: true,
      message,
      code: err.code || 'SERVER_ERROR'
    });
  };

  // Advanced health check endpoint
  app.get('/health', (req, res) => {
    const health = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      env: process.env.NODE_ENV
    };
    res.json(health);
  });

  // Setup routes
  try {
    console.log('Starting to register routes...');
    registerRoutes(app);
    console.log('Routes registered successfully');

    app.use(errorHandler);

    // Create HTTP server
    const server = createServer(app);

    // Setup development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('Setting up development environment with Vite...');
      try {
        await setupVite(app, server);
        console.log('Vite setup completed successfully');
      } catch (error) {
        console.error('Error setting up Vite:', error);
        console.log('Falling back to static serving...');
        serveStatic(app);
      }
    } else {
      serveStatic(app);
    }

    // Start server with improved error handling
    const port = process.env.PORT || 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port} (${process.env.NODE_ENV} mode)`);
      console.log(`Worker ${process.pid} started`);
    });

    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${port} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${port} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}