import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fileUpload from "express-fileupload";
import path from "path";
import session from "express-session";
import { db, sql } from "./db";
import { seedData } from "./seed-data";
import MemoryStore from 'memorystore';
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { Server as SocketServer } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
// Import improved modules and middleware
import { rateLimiter } from "./middleware/rate-limiter";
import { cacheMiddleware, getCacheStats } from "./middleware/caching";
import { loadBalancerMiddleware } from "./middleware/load-balancer";
import { connectionPool, db } from "./connection-pool";
import { workerPool } from "./workers/task-processor";
import compression from 'compression';
import cluster from 'cluster';
import http from 'http';
import { cpus } from 'os';

// Only use clustering in production, use single process in development for easier debugging
const ENABLE_CLUSTERING = process.env.NODE_ENV === 'production' && process.env.DISABLE_CLUSTERING !== 'true';
const numCPUs = Math.min(cpus().length, 2); // Limit to 2 workers in Replit environment

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

  // Create separate apps for API and frontend
  const app = express();
  const apiApp = express();

  // إعداد الجلسات مع تخزين محسن للذاكرة
  // Shared session store with improved settings
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000, // تنظيف الجلسات منتهية الصلاحية كل 24 ساعة
    stale: false, // Don't serve stale content
    ttl: 86400, // 24 hours in seconds
    noDisposeOnSet: true, // Performance optimization
    dispose: function(key, val) {
      // Clean up any resources when session is removed
    }
  });

  const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000, // 24 ساعة
      httpOnly: true,
      sameSite: 'lax'
    },
    name: 'session_id' // Custom name to avoid default name fingerprinting
  });

  // Apply middleware to API app - order is important for performance
  apiApp.use(loadBalancerMiddleware); // First check if we can handle the request
  apiApp.use(compression()); // Compress all responses
  apiApp.use(sessionMiddleware);
  apiApp.use(express.json({ limit: '1mb' })); // Limit JSON size
  apiApp.use(express.urlencoded({ extended: false, limit: '1mb' }));
  apiApp.use(rateLimiter); // Add rate limiting to prevent overload
  
  // Add file upload middleware with improved settings
  apiApp.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // حد أقصى 50 ميجابايت
    useTempFiles: true,
    tempFileDir: '/tmp/',
    parseNested: true,
    debug: false,
    abortOnLimit: true, // Automatically abort if file size limit exceeded
    safeFileNames: true, // Remove potentially dangerous characters
    preserveExtension: true // Keep file extensions
  }));

  // خدمة الملفات المرفوعة بشكل ثابت with aggressive caching
  apiApp.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
    maxAge: '7d', // Cache for 7 days
    etag: true,
    lastModified: true
  }));

  // Apply lightweight middleware to main app
  app.use(compression()); // Compress all responses
  app.use(sessionMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use("/api", apiApp); // Mount the API app under /api

  // Add caching for static assets with improved settings
  app.use(express.static(path.join(process.cwd(), "dist/public"), {
    maxAge: '7d', // Cache static assets for 7 days
    etag: true,
    lastModified: true,
    immutable: true, // For files with content hashes in name
    index: ['index.html'], // Specify index files
    setHeaders: (res, path) => {
      // Extra headers for security and caching
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Add appropriate caching based on file type
      if (path.endsWith('.html')) {
        // Don't cache HTML for too long
        res.setHeader('Cache-Control', 'public, max-age=0');
      } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        // Long caching for assets
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      }
    }
  }));

  // Optimized request logging
  app.use((req, res, next) => {
    // Skip logging for static assets and health checks
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/) || req.path === '/health') {
      return next();
    }
    
    const start = Date.now();
    const path = req.path;
    
    // Simplified response capture
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api") && duration > 100) { // Only log slow API requests
        log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
      }
    });

    next();
  });

  // Apply intelligent caching middleware based on endpoint type
  apiApp.use((req, res, next) => {
    // Use different caching strategies based on the endpoint
    if (req.path.startsWith('/api/products')) {
      return cacheMiddleware({ 
        duration: 60000, // 1 minute
        group: 'products'
      })(req, res, next);
    } 
    else if (req.path.startsWith('/api/customers')) {
      return cacheMiddleware({ 
        duration: 120000, // 2 minutes 
        group: 'customers'
      })(req, res, next);
    }
    else if (req.path.startsWith('/api/reports')) {
      // Don't cache reports by default
      return next();
    }
    else {
      // Default caching for other endpoints
      return cacheMiddleware({ 
        duration: 30000  // 30 seconds
      })(req, res, next);
    }
  });

  // Advanced error handler with circuit breaker pattern
  class CircuitBreaker {
    private errorCount: number = 0;
    private lastErrorTime: number = 0;
    private isOpen: boolean = false;
    private readonly ERROR_THRESHOLD: number = 10;
    private readonly ERROR_TIMEOUT: number = 30000; // 30 seconds circuit open time
    
    recordError() {
      const now = Date.now();
      // Reset error count if last error was more than 60 seconds ago
      if (now - this.lastErrorTime > 60000) {
        this.errorCount = 0;
      }
      
      this.errorCount++;
      this.lastErrorTime = now;
      
      // Open circuit if error threshold is reached
      if (this.errorCount >= this.ERROR_THRESHOLD && !this.isOpen) {
        console.error('Circuit breaker opened due to too many errors');
        this.isOpen = true;
        
        // Auto-close circuit after timeout
        setTimeout(() => {
          console.log('Circuit breaker reset, half-open state');
          this.isOpen = false;
          this.errorCount = 0;
        }, this.ERROR_TIMEOUT);
      }
    }
    
    isCircuitOpen() {
      return this.isOpen;
    }
  }
  
  const circuitBreaker = new CircuitBreaker();

  // Middleware to check circuit breaker
  app.use((req, res, next) => {
    if (circuitBreaker.isCircuitOpen() && req.path !== '/health') {
      return res.status(503).json({
        error: true,
        message: 'Service temporarily unavailable, please try again later',
        code: 'CIRCUIT_OPEN'
      });
    }
    next();
  });

  // Improved error handling middleware
  const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Record error for circuit breaker if it's server error
    if (!err.status || err.status >= 500) {
      circuitBreaker.recordError();
      console.error('Server error:', err);
    }

    if (res.headersSent) {
      return next(err);
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Server error";

    // Simplified response
    res.status(status).json({ 
      error: true,
      message,
      code: err.code || 'SERVER_ERROR'
    });
  };

  // معالجة الأخطاء غير المتوقعة في العملية with improved stability
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    circuitBreaker.recordError();
    
    // Only exit in extreme cases to maintain service
    if (error.message && (
      error.message.includes('ENOMEM') || // Out of memory
      error.message.includes('FATAL ERROR')
    )) {
      console.error('Critical error detected, restarting process...');
      // Give pending requests a chance to complete
      setTimeout(() => {
        process.exit(1); // Replit will automatically restart the process
      }, 2000);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection:', promise, 'Reason:', reason);
    // Don't exit for unhandled rejections, just record them
    circuitBreaker.recordError();
  });

  // Advanced server start with graceful handling
  async function startServer() {
  try {
    // Database connection with retry logic
    let dbConnected = false;
    let retryCount = 0;
    const MAX_DB_RETRIES = 5;

    while (!dbConnected && retryCount < MAX_DB_RETRIES) {
      try {
        console.log('جاري اختبار الاتصال بقاعدة البيانات...');
        const result = await connectionPool.executeQuery(() => db.execute(sql`SELECT 1`));
        console.log('نتيجة اختبار قاعدة البيانات:', result);
        console.log('تم الاتصال بقاعدة البيانات بنجاح');
        dbConnected = true;
      } catch (dbError) {
        retryCount++;
        console.error(`خطأ في اتصال قاعدة البيانات (محاولة ${retryCount}/${MAX_DB_RETRIES}):`, dbError);
        if (retryCount < MAX_DB_RETRIES) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
          console.log(`سيتم إعادة المحاولة بعد ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('فشلت كل محاولات الاتصال بقاعدة البيانات. سيستمر التطبيق بدون اتصال بقاعدة البيانات.');
          // Continue without database - app will handle missing DB gracefully
        }
      }
    }

    // Register API routes with error handling
    console.log('Starting to register routes...');
    let server;
    try {
      server = await registerRoutes(apiApp);
      console.log('All routes registered successfully');
    } catch (routeError) {
      console.error('Error registering routes:', routeError);
      // Continue with partial routes - better than complete failure
      console.log('Continuing with partial route registration');
    }
    
    // Apply error handlers
    apiApp.use(errorHandlerMiddleware);
    app.use(errorHandlerMiddleware);

    // Create advanced health check endpoint
    app.get('/health', (req, res) => {
      const health = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        database: dbConnected ? 'connected' : 'disconnected',
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        cache: getCacheStats()
      };
      
      // If the database is required but not connected, report unhealthy
      const status = dbConnected ? 200 : 503;
      
      res.status(status).json(health);
    });

    // Setup Vite or serve static content
    if (app.get("env") === "development") {
      try {
        await setupVite(app, server);
      } catch (viteError) {
        console.error('Error setting up Vite:', viteError);
        // Fallback to static serving
        serveStatic(app);
      }
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT || 5000;
    // Use a single HTTP server for both apps
    const httpServer = createServer(app);

    // إعداد Socket.IO with optimized settings and error handling
    const io = new SocketServer(httpServer, {
      cors: {
        origin: ["https://admin.socket.io", "*"], // Allow all origins
        credentials: true
      },
      // Optimize performance
      perMessageDeflate: {
        threshold: 1024, // Only compress messages larger than 1KB
      },
      pingInterval: 25000, // Increase ping interval to reduce traffic
      pingTimeout: 10000,
      connectTimeout: 10000,
      transports: ['websocket', 'polling'], // Prefer WebSocket for better performance
      maxHttpBufferSize: 1e6 // 1MB max message size
    });

    // Socket.IO error handling
    io.engine.on("connection_error", (err) => {
      console.log("Socket.IO connection error:", err);
    });

    // إعداد لوحة المراقبة - متاحة على /admin/socket
    instrument(io, {
      auth: {
        type: "basic",
        username: "admin",
        password: process.env.SOCKET_ADMIN_PASSWORD || "password" // استخدم كلمة مرور آمنة في الإنتاج
      },
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
    });

    // Socket.IO connection management with memory-optimized tracking
    const userSockets = new Map<string, Set<string>>();
    const socketMaxAge = 4 * 60 * 60 * 1000; // 4 hours max socket lifetime
    
    // Periodic socket cleanup to prevent memory leaks
    const socketCleanupInterval = setInterval(() => {
      const now = Date.now();
      io.sockets.sockets.forEach((socket) => {
        const socketCreatedAt = (socket as any).handshake?.issued || now;
        if (now - socketCreatedAt > socketMaxAge) {
          console.log(`Closing long-lived socket: ${socket.id}`);
          socket.disconnect(true);
        }
      });
    }, 30 * 60 * 1000); // Run every 30 minutes

    io.on("connection", (socket) => {
      // تسجيل المستخدم إذا كان مصادقًا
      socket.on("register", (userId: string) => {
        if (userId) {
          // Add socket to user's room
          socket.join(`user-${userId}`);
          
          // Track this socket for the user - memory efficient
          if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
          }
          userSockets.get(userId)?.add(socket.id);
          
          // Limit sockets per user to prevent DoS
          const userSocketCount = userSockets.get(userId)?.size || 0;
          if (userSocketCount > 10) {
            socket.emit('error', 'Too many connections');
            socket.disconnect(true);
          }
        }
      });

      socket.on("disconnect", () => {
        // Clean up socket tracking
        for (const [userId, socketIds] of userSockets.entries()) {
          if (socketIds.has(socket.id)) {
            socketIds.delete(socket.id);
            if (socketIds.size === 0) {
              userSockets.delete(userId);
            }
            break;
          }
        }
      });
      
      // Add error handling for socket
      socket.on("error", (error) => {
        console.error("Socket error:", error);
        // Don't disconnect, let the client retry
      });
    });

    // تصدير الـ Socket.IO للاستخدام في ملفات أخرى
    app.set("io", io);
    apiApp.set("io", io);

    // Graceful shutdown handling
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
    function gracefulShutdown() {
      console.log('Received shutdown signal, closing server...');
      
      // Clean up resources
      clearInterval(socketCleanupInterval);
      
      // Close HTTP server
      httpServer.close(() => {
        console.log('HTTP server closed');
        
        // Close database connections
        connectionPool.close().then(() => {
          console.log('Database connections closed');
          process.exit(0);
        }).catch(err => {
          console.error('Error closing database connections:', err);
          process.exit(1);
        });
      });
      
      // Force close after timeout
      setTimeout(() => {
        console.error('Forceful shutdown after timeout');
        process.exit(1);
      }, 10000);
    }

    // Start server with retry logic
    let serverStarted = false;
    let serverRetries = 0;
    const MAX_SERVER_RETRIES = 3;
    
    while (!serverStarted && serverRetries < MAX_SERVER_RETRIES) {
      try {
        await new Promise<void>((resolve, reject) => {
          httpServer.listen({
            port,
            host: "0.0.0.0",
            // TCP keep-alive
            keepAlive: true,
            keepAliveInitialDelay: 60000 // 60 seconds
          }, () => {
            log(`تم تشغيل السيرفر على المنفذ ${port}`);
            serverStarted = true;
            resolve();
          });
          
          httpServer.on('error', (err) => {
            reject(err);
          });
        });
      } catch (serverError: any) {
        serverRetries++;
        console.error(`Error starting server (attempt ${serverRetries}/${MAX_SERVER_RETRIES}):`, serverError);
        
        if (serverError.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, waiting for it to be released...`);
          // Wait longer for port conflicts
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          // For other errors, exponential backoff
          const delay = Math.min(1000 * Math.pow(2, serverRetries - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!serverStarted) {
      throw new Error(`Failed to start server after ${MAX_SERVER_RETRIES} attempts`);
    }

    // تنفيذ البذور بعد بدء السيرفر (in background)
    seedData().catch(err => {
      console.error("خطأ في تنفيذ البذور:", err);
      // Don't crash server on seed error
    });

  } catch (error) {
    console.error('فشل في بدء السيرفر:', error);
    // Don't exit immediately, try to recover if possible
    if (error instanceof Error && 
        (error.message.includes('FATAL') || error.message.includes('cannot recover'))) {
      process.exit(1);
    }
  }
}

// Start server with global error handling
startServer().catch(err => {
  console.error('Unhandled error in server startup:', err);
  // Wait a moment before exiting to allow logs to be written
  setTimeout(() => process.exit(1), 1000);
});