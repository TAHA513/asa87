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

const MemoryStoreSession = MemoryStore(session);

const app = express();

// إعداد الجلسات مع تخزين محسن للذاكرة
app.use(session({
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // تنظيف الجلسات منتهية الصلاحية كل 24 ساعة
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000 // 24 ساعة
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // حد أقصى 50 ميجابايت
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

// معالجة الأخطاء غير المتوقعة في العملية
process.on('uncaughtException', (error) => {
  console.error('خطأ غير متوقع:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض غير معالج:', promise, 'السبب:', reason);
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

    const server = await registerRoutes(app);
    app.use(errorHandler);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // استخدام المنفذ 5000 فقط
    const port = 5000;
    const httpServer = createServer(app);
    
    // إيقاف أي عملية تستخدم نفس المنفذ قبل البدء
    try {
        const { execSync } = require('child_process');
        execSync(`lsof -t -i:${port} | xargs -r kill -9`);
        console.log(`تم إيقاف أي عمليات سابقة على المنفذ ${port}`);
    } catch (error) {
        console.log('لا توجد عمليات سابقة على هذا المنفذ');
    }
    
    // معالج لإغلاق السيرفر بشكل صحيح عند توقف التطبيق
    const shutdownGracefully = () => {
      console.log('إغلاق السيرفر بشكل آمن...');
      httpServer.close(() => {
        console.log('تم إغلاق السيرفر بنجاح');
        process.exit(0);
      });
    };
    
    // تسجيل معالجي الإغلاق
    process.on('SIGINT', shutdownGracefully);
    process.on('SIGTERM', shutdownGracefully);

  // إعداد Socket.IO
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ["https://admin.socket.io", process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173"],
      credentials: true
    }
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

  // التعامل مع اتصالات المستخدمين
  io.on("connection", (socket) => {
    console.log("مستخدم جديد متصل:", socket.id);

    // تسجيل المستخدم إذا كان مصادقًا
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

  // إضافة طريقة مساعدة لإرسال الإشعارات
  storage.sendNotification = (userId, notificationType, data) => {
    io.to(`user-${userId}`).emit("notification", {
      type: notificationType,
      data,
      timestamp: new Date()
    });
    return true;
  };

  // Start inventory check timer with notification support
  const checkInventoryLevels = async () => {
    // Your existing inventory check logic here...
  };

  setInterval(async () => {
    try {
      await checkInventoryLevels();
      // إرسال تحديثات للمستخدمين النشطين
      const adminUsers = await storage.getUsersByRole("admin");
      for (const user of adminUsers) {
        storage.sendNotification(user.id, "inventory_check_complete", { 
          timestamp: new Date(),
          message: "تم الانتهاء من فحص المخزون بنجاح"
        });
      }
    } catch (error) {
      console.error("خطأ أثناء فحص المخزون:", error);
    }
  }, 60 * 60 * 1000);

  // إضافة فحص المواعيد القادمة وإرسال تنبيهات
  setInterval(async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const upcomingAppointments = await storage.getAppointmentsByDateRange(tomorrow, dayAfter);

      // إرسال تنبيهات للمستخدمين حول المواعيد القادمة
      if (upcomingAppointments.length > 0) {
        const users = await storage.getActiveUsers();
        for (const user of users) {
          storage.sendNotification(user.id, "upcoming_appointments", {
            count: upcomingAppointments.length,
            appointments: upcomingAppointments.map(a => ({
              id: a.id,
              title: a.title,
              date: a.date,
              customerName: a.customerName || "عميل"
            }))
          });
        }
      }
    } catch (error) {
      console.error("خطأ أثناء فحص المواعيد القادمة:", error);
    }
  }, 12 * 60 * 60 * 1000); // تشغيل مرتين في اليوم

    // تعريف دالة لبدء الخادم مع محاولات إعادة المحاولة
    const startServer = () => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`تم تشغيل السيرفر على المنفذ ${port}`);
      }).on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`المنفذ ${port} قيد الاستخدام. جاري إيقاف العمليات السابقة...`);
          
          // محاولة إيقاف العمليات التي تستخدم المنفذ
          try {
            const { execSync } = require('child_process');
            execSync(`lsof -t -i:${port} | xargs -r kill -9`);
            console.log(`تم إيقاف العمليات على المنفذ ${port}، إعادة المحاولة خلال 2 ثانية...`);
            
            // إعادة المحاولة بعد ثانيتين
            setTimeout(startServer, 2000);
          } catch (killError) {
            console.error('فشل في إيقاف العمليات:', killError);
          }
        } else {
          console.error('خطأ في تشغيل السيرفر:', error);
        }
      });
    };
    
    // بدء الخادم
    startServer();

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