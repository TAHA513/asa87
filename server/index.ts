import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// تحسين وسيط التسجيل
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
      log(logLine);
    }
  });

  next();
});

const startServer = async () => {
  try {
    log("🔄 بدء تهيئة الخادم...");

    const server = await registerRoutes(app);

    // إضافة معالج الأخطاء العام
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("⚠️ خطأ في الخادم:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "خطأ داخلي في الخادم";
      res.status(status).json({ message });
    });

    // مؤقتاً استخدم serveStatic فقط بدلاً من Vite للتشخيص
    log("🏗️ تهيئة الملفات الثابتة...");
    serveStatic(app);

    const port = 5000;
    let isServerStarted = false;

    server.listen(port, "0.0.0.0", () => {
      isServerStarted = true;
      log(`✅ الخادم يعمل على المنفذ ${port}`);
    });

    // التحقق من بدء تشغيل الخادم
    setTimeout(() => {
      if (!isServerStarted) {
        log("⚠️ تأخر بدء تشغيل الخادم، جاري المحاولة على منفذ آخر...");
        server.listen(5001, "0.0.0.0", () => {
          log("✅ الخادم يعمل على المنفذ 5001");
        });
      }
    }, 5000);

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        log(`⚠️ المنفذ ${port} مشغول، جاري المحاولة على المنفذ 5001...`);
        server.listen(5001, "0.0.0.0", () => {
          log("✅ الخادم يعمل على المنفذ 5001");
        });
      } else {
        console.error("❌ خطأ غير متوقع:", error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error("❌ خطأ في تهيئة الخادم:", error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error("❌ خطأ غير متوقع أثناء بدء التشغيل:", error);
  process.exit(1);
});