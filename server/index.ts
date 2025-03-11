
import express from "express";
import http from "http";
import cors from "cors";
import { initializeDatabase } from "./initialize-database.js";
import { setupVite, serveStatic } from "./vite.js";
import path from "path";
import { fileURLToPath } from "url";
import fileUpload from "express-fileupload";
import session from "express-session";
import createMemoryStore from "memorystore";
import { setupAuth } from "./auth.js";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== "production";
// Try to use ports in order until one is available
const PRIMARY_PORT = 5000;
const FALLBACK_PORTS = [3000, 3001, 3002, 3003, 3004, 4000, 4001, 4002, 4003, 4004];
const PORT_ENV = process.env.PORT ? parseInt(process.env.PORT) : null;

async function startServer() {
  let portIndex = 0;
  let PORT = PORT_ENV || PRIMARY_PORT;
  
  try {
    // Define log function
    const log = (message: string) => console.log(message);
    
    // Initialize Express app and HTTP server
    const app = express();
    const server = http.createServer(app);
    
    // Set up Socket.IO بإعدادات محسنة
    const io = new SocketIOServer(server, {
      cors: {
        origin: ["https://admin.socket.io", "http://localhost:3000", "*"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 30000,
      allowEIO3: true
    });
    
    // Set up Socket.IO Admin UI
    instrument(io, {
      auth: false,
      mode: "development",
    });
    
    // إضافة معالج للتعامل مع اتصالات العميل
    io.on('connection', (socket) => {
      console.log('Socket.IO client connected:', socket.id);
      
      socket.on('disconnect', (reason) => {
        console.log('Socket.IO client disconnected:', socket.id, reason);
      });
      
      socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
      });
    });
    
    // Configure session store
    const MemoryStore = createMemoryStore(session);
    const sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // تكوين متطور للـ Express middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    app.use(fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 }, // حد 50MB للملفات
      useTempFiles: true,
      tempFileDir: './tmp/' // تخزين مؤقت للملفات
    }));
    
    // تكوين معزز للجلسات
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "enhanced-secret-key-for-development",
        resave: true,
        saveUninitialized: true,
        store: sessionStore,
        cookie: { 
          secure: false, 
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          sameSite: 'lax',
          path: '/'
        },
        rolling: true // تحديث الكوكيز مع كل طلب
      })
    );
    
    // إضافة معالج الخطأ العام
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('خطأ في تطبيق Express:', err);
      res.status(500).json({ message: 'حدث خطأ في الخادم', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    });
    
    // تنظيف الذاكرة بشكل دوري
    const memoryCleanupInterval = setInterval(() => {
      if (global.gc) {
        try {
          global.gc();
          console.log('تم تنظيف الذاكرة بنجاح');
        } catch (e) {
          console.error('فشل تنظيف الذاكرة:', e);
        }
      }
    }, 60000 * 15); // كل 15 دقيقة
    
    // تنظيف الموارد عند إغلاق التطبيق
    process.on('SIGTERM', () => {
      clearInterval(memoryCleanupInterval);
      sessionStore.stopInterval();
    });
    
    // Set up authentication
    setupAuth(app);
    
    // Initialize database
    log("جاري تهيئة قاعدة البيانات...");
    await initializeDatabase();
    log("اكتملت عملية تهيئة قاعدة البيانات بنجاح");
    
    // Function to attempt to start the server
    const startListening = () => {
      server.listen(PORT, "0.0.0.0", () => {
        log(`الخادم يعمل على المنفذ ${PORT} في وضع ${isDev ? "التطوير" : "الإنتاج"}`);
      });
    };

    // Set up error handler for port in use
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        if (portIndex < FALLBACK_PORTS.length) {
          PORT = FALLBACK_PORTS[portIndex++];
          log(`المنفذ السابق قيد الاستخدام بالفعل، سيتم محاولة استخدام المنفذ ${PORT}`);
          startListening();
        } else {
          console.error("جميع المنافذ قيد الاستخدام بالفعل، يرجى إيقاف أحد التطبيقات الأخرى التي تستخدم هذه المنافذ.");
          process.exit(1);
        }
      } else {
        console.error("خطأ في بدء الخادم:", error);
        process.exit(1);
      }
    });
    
    console.log("Starting to register routes...");
    // Import and register routes dynamically
    const { registerRoutes } = await import("./routes.js");
    await registerRoutes(app);
    console.log("All routes registered successfully");
    
    // Set up Vite for development or serve static files for production
    if (isDev) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Initial attempt to start the server
    startListening();
    
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
