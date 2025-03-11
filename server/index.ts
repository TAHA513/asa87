import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { initializeDatabase } from "./initialize-database";

// Environment setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== "production";
const PORT = 5000; // Always use port 5000 as per requirements

async function startServer() {
  try {
    // Define log function
    const log = (message: string) => console.log(message);
    
    // Initialize database
    await initializeDatabase();
    log("قاعدة البيانات تم تهيئتها بنجاح");

    // Create Express app and HTTP server
    const app = express();
    const server = createServer(app);

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, "../tmp"),
    }));

    // Basic route for testing
    app.get('/', (req, res) => {
      res.json({ message: 'مرحباً بك في نظام إدارة الأعمال' });
    });

    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      log(`الخادم يعمل على المنفذ ${PORT} في وضع ${isDev ? "التطوير" : "الإنتاج"}`);
    });

  } catch (error) {
    console.error("فشل بدء تشغيل الخادم:", error);
    process.exit(1);
  }
}

startServer();