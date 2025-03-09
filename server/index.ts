import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fileUpload from "express-fileupload";
import path from "path";
import session from "express-session";
import { db, sql } from "./db";
import { seedData } from "./seed-data";
import MemoryStore from 'memorystore';

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
    // استيراد دالة اختبار الاتصال
    const { ensureConnection, testConnection } = require('./db');
    
    // اختبار اتصال قاعدة البيانات
    console.log('جاري اختبار الاتصال بقاعدة البيانات...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('فشل الاتصال بقاعدة البيانات، إعادة المحاولة بعد 5 ثوانٍ...');
      setTimeout(startServer, 5000);
      return;
    }

    const server = await registerRoutes(app);
    app.use(errorHandler);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000;
    
    // التحقق من عدم استخدام المنفذ قبل الاستماع
    const checkPortBeforeListen = () => {
      const netServer = require('node:net').createServer();
      
      netServer.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`⚠️ المنفذ ${port} قيد الاستخدام بالفعل، سيتم المحاولة مرة أخرى بعد 5 ثوانٍ...`);
          setTimeout(checkPortBeforeListen, 5000);
        } else {
          console.error(`❌ خطأ في الاستماع:`, err);
          process.exit(1);
        }
      });
      
      netServer.once('listening', () => {
        netServer.close(() => {
          server.listen({
            port,
            host: "0.0.0.0",
          }, () => {
            log(`✅ تم تشغيل السيرفر على المنفذ ${port}`);
          });
        });
      });
      
      netServer.listen(port, '0.0.0.0');
    };
    
    checkPortBeforeListen();

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