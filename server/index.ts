import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fileUpload from "express-fileupload";
import path from "path";
import session from "express-session";
import { db, sql } from "./db";
import { seedData } from "./seed-data";
import MemoryStore from 'memorystore';
import { createServer } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { Server as SocketServer } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const MemoryStoreSession = MemoryStore(session);

async function startServer() {
  console.log('بدء تشغيل السيرفر...');

  try {
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
          let logLine = `${req.method} ${path} ${res.statusCode} في ${duration}مللي ثانية`;
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

    // اختبار اتصال قاعدة البيانات
    console.log('جاري اختبار الاتصال بقاعدة البيانات...');
    try {
      await db.execute(sql`SELECT 1`);
      console.log('تم الاتصال بقاعدة البيانات بنجاح');
    } catch (dbError) {
      console.error('خطأ في اتصال قاعدة البيانات:', dbError);
      throw dbError;
    }

    const httpServer = createServer(app);

    // تسجيل المسارات
    await registerRoutes(app);

    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    // إعداد Socket.IO
    const io = new SocketServer(httpServer, {
      cors: {
        origin: ["https://admin.socket.io", process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173"],
        credentials: true
      }
    });

    instrument(io, {
      auth: {
        type: "basic",
        username: "admin",
        password: process.env.SOCKET_ADMIN_PASSWORD || "password"
      },
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
    });

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

    app.set("io", io);

    const port = process.env.PORT || 3000; // تغيير المنفذ إلى 3000

    // بدء الاستماع للمنفذ
    console.log(`محاولة بدء السيرفر على المنفذ ${port}...`);
    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`تم تشغيل السيرفر على المنفذ ${port}`);
    });

    // تنفيذ البذور
    await seedData().catch(err => {
      console.error("خطأ في تنفيذ البذور:", err);
    });

  } catch (error) {
    console.error('فشل في بدء السيرفر:', error);
    process.exit(1);
  }
}

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

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('خطأ غير متوقع:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض غير معالج:', promise, 'السبب:', reason);
});

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


startServer();