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
// Import performance middleware
import { rateLimiter } from "./middleware/rate-limiter";
import { cacheMiddleware } from "./middleware/caching";
import compression from 'compression';

const MemoryStoreSession = MemoryStore(session);

// Create separate apps for API and frontend
const app = express();
const apiApp = express();

// إعداد الجلسات مع تخزين محسن للذاكرة
// Shared session store
const sessionStore = new MemoryStoreSession({
  checkPeriod: 86400000 // تنظيف الجلسات منتهية الصلاحية كل 24 ساعة
});

const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000 // 24 ساعة
  }
});

// Apply middleware to API app
apiApp.use(sessionMiddleware);
apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: false }));
apiApp.use(compression()); // Add compression for all API responses
apiApp.use(rateLimiter); // Add rate limiting to prevent overload
apiApp.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // حد أقصى 50 ميجابايت
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// خدمة الملفات المرفوعة بشكل ثابت
apiApp.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Apply middleware to main app
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use("/api", apiApp); // Mount the API app under /api

// Add caching for static assets
app.use(express.static(path.join(process.cwd(), "dist/public"), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true
}));

// تسجيل وقت الطلب مع التحسينات
app.use((req, res, next) => {
  // Skip logging for static assets to reduce overhead
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    return next();
  }
  
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Apply caching middleware to API routes
apiApp.use(cacheMiddleware(30000)); // Cache API responses for 30 seconds

// تحسين معالجة الأخطاء
const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  // فقط تسجيل الأخطاء الحرجة في وحدة التحكم
  if (err.status >= 500 || !err.status) {
    console.error('خطأ في السيرفر:', err);
  }

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "خطأ في السيرفر";

  // تعديل الاستجابة لتكون أسرع وأخف
  res.status(status).json({ 
    error: true,
    message,
    code: err.code || 'SERVER_ERROR'
  });
};

// إضافة تحسين لمعالجة الطلبات المتزامنة
apiApp.use((req, res, next) => {
  // تعيين حد زمني للطلبات الطويلة
  req.setTimeout(20000); // 20 seconds timeout - reduced to prevent hangs
  res.setTimeout(20000);
  next();
});

// Create error handling middleware
const errorHandlerMiddleware = (err: any, _req: Request, res: Response, next: NextFunction) => {
  // فقط تسجيل الأخطاء الحرجة في وحدة التحكم
  if (err.status >= 500 || !err.status) {
    console.error('خطأ في السيرفر:', err);
  }

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "خطأ في السيرفر";

  // تعديل الاستجابة لتكون أسرع وأخف
  res.status(status).json({ 
    error: true,
    message,
    code: err.code || 'SERVER_ERROR'
  });
};

// Better error handling strategy with circuit breaker pattern
let errorCount = 0;
const ERROR_THRESHOLD = 10;
const ERROR_RESET_INTERVAL = 60000; // 1 minute

// Reset error count periodically
setInterval(() => {
  errorCount = 0;
}, ERROR_RESET_INTERVAL);

// معالجة الأخطاء غير المتوقعة في العملية
process.on('uncaughtException', (error) => {
  console.error('خطأ غير متوقع:', error);
  errorCount++;
  
  // If too many errors occur, restart the server processes
  if (errorCount > ERROR_THRESHOLD) {
    console.error('تجاوز عدد الأخطاء الحد المسموح. جاري إعادة تشغيل العملية...');
    // Give pending requests a chance to complete
    setTimeout(() => {
      process.exit(1); // Replit will automatically restart the process
    }, 1000);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض غير معالج:', promise, 'السبب:', reason);
  errorCount++;
});

// التأكد من اتصال قاعدة البيانات قبل بدء السيرفر
async function startServer() {
  try {
    // اختبار اتصال قاعدة البيانات
    console.log('جاري اختبار الاتصال بقاعدة البيانات...');
    try {
      const result = await db.execute(sql`SELECT 1`);
      console.log('نتيجة اختبار قاعدة البيانات:', result);
      console.log('تم الاتصال بقاعدة البيانات بنجاح');
    } catch (dbError) {
      console.error('خطأ في اتصال قاعدة البيانات:', dbError);
      throw dbError;
    }

    // Register API routes on the API app
    console.log('Starting to register routes...');
    const server = await registerRoutes(apiApp);
    console.log('All routes registered successfully');
    
    // Apply error handlers
    apiApp.use(errorHandlerMiddleware);
    app.use(errorHandlerMiddleware);

    // Setup Vite or serve static content
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT || 5000;
    // Use a single HTTP server for both apps
    const httpServer = createServer(app);

    // إعداد Socket.IO with optimized settings
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
      transports: ['websocket', 'polling'] // Prefer WebSocket for better performance
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

    // Socket.IO connection management with improved room management
    const userSockets = new Map<string, Set<string>>();

    io.on("connection", (socket) => {
      // Reduce logging to improve performance
      // console.log("مستخدم جديد متصل:", socket.id);

      // تسجيل المستخدم إذا كان مصادقًا
      socket.on("register", (userId: string) => {
        if (userId) {
          // Add socket to user's room
          socket.join(`user-${userId}`);
          
          // Track this socket for the user
          if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
          }
          userSockets.get(userId)?.add(socket.id);
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
    });

    // تصدير الـ Socket.IO للاستخدام في ملفات أخرى
    app.set("io", io);
    apiApp.set("io", io);

    // Add health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    httpServer.listen({
      port,
      host: "0.0.0.0",
      // Enable keep-alive connections
    }, () => {
      log(`تم تشغيل السيرفر على المنفذ ${port}`);
    });

    // تنفيذ البذور بعد بدء السيرفر (in background)
    seedData().catch(err => {
      console.error("خطأ في تنفيذ البذور:", err);
    });

  } catch (error) {
    console.error('فشل في بدء السيرفر:', error);
    process.exit(1);
  }
}

startServer();