import express from "express";
import http from "http";
import cors from "cors";
import { initializeDatabase } from "./initialize-database";
import { setupAuth } from "./auth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import path from "path";
import { fileURLToPath } from "url";
import fileUpload from "express-fileupload";
import session from "express-session";
import createMemoryStore from "memorystore";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== "production";
const PORT = 5000; // Always use port 5000 as per requirements

async function startServer() {
  try {
    // Initialize Express app and HTTP server
    const app = express();
    const server = http.createServer(app);

    // Configure session store
    const MemoryStore = createMemoryStore(session);
    const sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });

    // Configure Express middleware
    app.use(express.json());
    app.use(cors());
    app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, "../tmp"),
    }));

    // Configure sessions before auth
    app.use(session({
      secret: process.env.SESSION_SECRET || 'default-secret-key',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Initialize database
    console.log("جاري تهيئة قاعدة البيانات...");
    await initializeDatabase();
    console.log("اكتملت عملية تهيئة قاعدة البيانات بنجاح");

    // Setup authentication after session
    await setupAuth(app);

    // Register API routes
    await registerRoutes(app);

    // Set up Vite for development or serve static files for production
    if (isDev) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`الخادم يعمل على المنفذ ${PORT} في وضع ${isDev ? "التطوير" : "الإنتاج"}`);
    });

  } catch (error) {
    console.error("فشل بدء تشغيل الخادم:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error("خطأ غير متوقع:", error);
  process.exit(1);
});