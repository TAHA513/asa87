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
import dotenv from "dotenv";

// تحميل متغيرات البيئة
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== "production";
const PORT = 5000;

async function startServer() {
  try {
    // تهيئة Express والخادم
    const app = express();
    const server = http.createServer(app);

    // إعداد الميدلوير الأساسي
    app.use(express.json());
    app.use(cors({
      origin: true,
      credentials: true
    }));
    app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, "../tmp"),
    }));

    // ملاحظة: تم نقل إعدادات الجلسة إلى ملف auth.ts لتجنب التكرار

    console.log("جاري تهيئة قاعدة البيانات...");
    await initializeDatabase();
    console.log("اكتملت عملية تهيئة قاعدة البيانات بنجاح");

    // إعداد المصادقة (يتضمن إعدادات الجلسة)
    await setupAuth(app);

    // تسجيل المسارات
    await registerRoutes(app);

    // تحسين معالجة الأخطاء العامة
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("خطأ غير معالج:", err);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    });

    // إعداد Vite للتطوير أو الملفات الثابتة للإنتاج
    if (isDev) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // بدء الخادم
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`الخادم يعمل على المنفذ ${PORT} في وضع ${isDev ? "التطوير" : "الإنتاج"}`);
    });

  } catch (error) {
    console.error("فشل بدء تشغيل الخادم:", error);
    process.exit(1);
  }
}

// إضافة معالجة أخطاء عملية Node غير المتوقعة
process.on('uncaughtException', (err) => {
  console.error('خطأ غير متوقع:', err);
  // لا تغلق الخادم في حالة الأخطاء غير المتوقعة
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض غير معالج:', reason);
  // لا تغلق الخادم في حالة الوعود المرفوضة غير المعالجة
});

// بدء الخادم
startServer().catch((error) => {
  console.error("خطأ غير متوقع:", error);
  process.exit(1);
});