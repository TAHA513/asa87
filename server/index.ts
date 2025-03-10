import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fileUpload from "express-fileupload";
import path from "path";
import { db, sql } from "./db";
import { seedData } from "./seed-data";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupDatabaseHealthRoute, checkDatabaseHealth } from './db-health-check';
import { Server as SocketServer } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import session from "express-session";
import MemoryStore from 'memorystore';

const MemoryStoreSession = MemoryStore(session);

const app = express();

// تكوين خيارات الجلسات للاستخدام في جميع أنحاء التطبيق
export const sessionOptions = {
  store: new MemoryStoreSession({
    checkPeriod: 86400000, // تنظيف الجلسات منتهية الصلاحية كل 24 ساعة
    ttl: 24 * 60 * 60 * 1000 // مدة صلاحية الجلسة 24 ساعة
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
    httpOnly: true,
    sameSite: 'lax'
  }
};

// تطبيق إعدادات الجلسة على التطبيق
app.use(session(sessionOptions));

// إعداد البيانات الأساسية للتطبيق
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// خدمة الملفات المرفوعة بشكل ثابت
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// تسجيل وقت الطلب
app.use((req, res, next) => {
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

// معالجة الأخطاء
const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  console.error('خطأ في السيرفر:', err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "خطأ في السيرفر";

  res.status(status).json({ 
    error: true,
    message 
  });
};

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

    // إعداد المصادقة
    setupAuth(app);
    
    // إضافة مسار لفحص صحة قاعدة البيانات
    setupDatabaseHealthRoute(app);

    const httpServer = await registerRoutes(app);
    app.use(errorHandler);
    
    // فحص دوري لصحة قاعدة البيانات
    setInterval(async () => {
      try {
        const health = await checkDatabaseHealth();
        if (health.status !== 'healthy') {
          console.warn(`تحذير: حالة قاعدة البيانات: ${health.status}`, health.message);
        }
      } catch (error) {
        console.error('خطأ في الفحص الدوري لصحة قاعدة البيانات:', error);
      }
    }, 30 * 60 * 1000); // فحص كل 30 دقيقة

    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    // استخدام المنفذ 5000 دائماً
    const port = 5000;

    // إعداد Socket.IO
    const io = new SocketServer(httpServer, {
      cors: {
        origin: ["https://admin.socket.io", process.env.NODE_ENV === "production" ? "*" : "http://localhost:5000"],
        credentials: true
      }
    });

    // إعداد لوحة المراقبة
    instrument(io, {
      auth: {
        type: "basic",
        username: "admin",
        password: process.env.SOCKET_ADMIN_PASSWORD || "password"
      },
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
    });

    // التعامل مع اتصالات المستخدمين
    io.on("connection", (socket) => {
      console.log("مستخدم جديد متصل:", socket.id);

      socket.on("register", (userId) => {
        if (userId) {
          console.log(`تسجيل المستخدم ${userId} مع Socket ${socket.id}`);
          socket.join(`user-${userId}`);
        }
      });

      socket.on("disconnect", () => {
        console.log("مستخدم قطع الاتصال:", socket.id);
      });
    });

    // تصدير الـ Socket.IO للاستخدام في ملفات أخرى
    app.set("io", io);

    // تعريف وظيفة إرسال الإشعارات
    const sendNotification = (userId: number, type: string, data: any) => {
      io.to(`user-${userId}`).emit("notification", {
        type,
        data,
        timestamp: new Date()
      });
      return true;
    };

    // إضافة وظيفة الإشعارات للتخزين
    storage.sendNotification = sendNotification;

    // بدء الخادم على المنفذ 5000
    httpServer.listen({
      port: port,
      host: "0.0.0.0"
    }, () => {
      log(`تم تشغيل السيرفر على المنفذ ${port}`);
    });

    // تنفيذ البذور بعد بدء السيرفر
    await seedData().catch(err => {
      console.error("خطأ في تنفيذ البذور:", err);
    });

  } catch (error) {
    console.error('فشل في بدء السيرفر:', error);
    process.exit(1);
  }
}

startServer();