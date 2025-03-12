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
import fs from "fs";

// تحميل متغيرات البيئة
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

// إنشاء مجلد للسجلات إذا لم يكن موجوداً
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// دالة لتسجيل الأحداث في ملف
function logToFile(message: string, type: 'info' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} [${type.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(path.join(logsDir, `${type}.log`), logMessage);
}

async function startServer() {
  try {
    // تهيئة Express والخادم
    const app = express();
    const server = http.createServer(app);

    // إعداد الميدلوير الأساسي
    app.use(express.json());
    app.use(cors());
    app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, "../tmp"),
    }));

    // إعداد تسجيل الطلبات
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logToFile(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
      });
      next();
    });

    // استيراد مخزن الجلسات من ملف storage
    const { storage } = await import("./storage");
    const sessionStore = storage.sessionStore;
    
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

    logToFile("جاري تهيئة قاعدة البيانات...");
    await initializeDatabase();
    logToFile("اكتملت عملية تهيئة قاعدة البيانات بنجاح");

    // إعداد المصادقة
    await setupAuth(app);
    logToFile("تم إعداد نظام المصادقة بنجاح");

    // تسجيل المسارات
    await registerRoutes(app);
    logToFile("تم تسجيل جميع المسارات بنجاح");

    // إعداد Vite للتطوير أو الملفات الثابتة للإنتاج
    if (isDev) {
      await setupVite(app, server);
      logToFile("تم إعداد Vite للتطوير");
    } else {
      serveStatic(app);
      logToFile("تم إعداد خدمة الملفات الثابتة للإنتاج");
    }

    // معالجة الأخطاء العامة
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logToFile(err.stack || err.message, 'error');
      res.status(500).json({ message: 'حدث خطأ داخلي في الخادم' });
    });

    // بدء الخادم
    server.listen(PORT, "0.0.0.0", () => {
      const mode = isDev ? "التطوير" : "الإنتاج";
      const message = `الخادم يعمل على المنفذ ${PORT} في وضع ${mode}`;
      console.log(message);
      logToFile(message);
    });

  } catch (error) {
    const errorMessage = "فشل بدء تشغيل الخادم: " + (error instanceof Error ? error.message : String(error));
    console.error(errorMessage);
    logToFile(errorMessage, 'error');
    process.exit(1);
  }
}

// إضافة معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  const errorMessage = "خطأ غير متوقع: " + error.message;
  console.error(errorMessage);
  logToFile(errorMessage, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const errorMessage = "وعد مرفوض غير معالج: " + String(reason);
  console.error(errorMessage);
  logToFile(errorMessage, 'error');
});

// بدء الخادم
startServer().catch((error) => {
  const errorMessage = "خطأ غير متوقع: " + (error instanceof Error ? error.message : String(error));
  console.error(errorMessage);
  logToFile(errorMessage, 'error');
  process.exit(1);
});