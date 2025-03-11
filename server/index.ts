
import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { setupRoutes } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, log } from "./vite";
import { initializeDatabase } from "./initialize-database";

// Environment setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    log("Database initialized successfully");

    // Create Express app and HTTP server
    const app = express();
    const server = createServer(app);

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, "../tmp"),
    }));

    // Setup authentication
    await setupAuth(app);
    
    // API routes
    setupRoutes(app, server);

    // Static files in production
    if (!isDev) {
      app.use(express.static(path.join(__dirname, "../public")));
    } else {
      // Development mode - use Vite
      await setupVite(app, server);
    }

    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT} in ${isDev ? "development" : "production"} mode`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
