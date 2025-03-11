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
// Try to use port 5000, but fall back to another if it's in use
const PRIMARY_PORT = 5000;
const FALLBACK_PORTS = [3000, 3001, 3002, 3003, 3004, 4000, 4001, 4002, 4003, 4004];
const PORT_ENV = process.env.PORT ? parseInt(process.env.PORT) : null;

async function startServer() {
  let portIndex = 0;
  let PORT = PORT_ENV || PRIMARY_PORT;
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

    // Register routes
    const { registerRoutes } = await import("./routes");
    await registerRoutes(app);

    // Start server with error handling for port in use
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        if (portIndex < FALLBACK_PORTS.length) {
          PORT = FALLBACK_PORTS[portIndex++];
          log(`المنفذ السابق قيد الاستخدام بالفعل، سيتم محاولة استخدام المنفذ ${PORT}`);
          server.listen(PORT, "0.0.0.0", () => {
            log(`الخادم يعمل على المنفذ ${PORT} في وضع ${isDev ? "التطوير" : "الإنتاج"}`);
          });
        } else {
          console.error("جميع المنافذ قيد الاستخدام بالفعل، يرجى إيقاف أحد التطبيقات الأخرى التي تستخدم هذه المنافذ.");
          process.exit(1);
        }
      } else {
        console.error("خطأ في بدء الخادم:", error);
        process.exit(1);
      }
    });
    
    server.listen(PORT, "0.0.0.0", () => {
      log(`الخادم يعمل على المنفذ ${PORT} في وضع ${isDev ? "التطوير" : "الإنتاج"}`);
    });

  } catch (error) {
    console.error("فشل بدء تشغيل الخادم:", error);
    process.exit(1);
  }
}

startServer();