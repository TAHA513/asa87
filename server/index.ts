import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// إضافة وسيط الأمان مع السماح بجميع الموارد المطلوبة
app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  next();
});

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

    // إضافة مسار صحي أولاً
    app.get("/health", (_req, res) => {
      res.json({ status: "ok", message: "الخادم يعمل بشكل صحيح" });
    });
    log("✅ تم إضافة مسار الفحص الصحي");

    // تسجيل مسارات API
    const server = await registerRoutes(app);
    log("✅ تم تسجيل جميع المسارات API");

    // معالج الأخطاء العام
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("⚠️ خطأ في الخادم:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "خطأ داخلي في الخادم";
      res.status(status).json({ message });
    });

    // خدمة الملفات الثابتة للتطبيق
    const clientPath = path.join(__dirname, "../client/dist");
    app.use(express.static(clientPath));

    // توجيه كل المسارات غير المعروفة إلى index.html
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientPath, "index.html"));
    });

    log("✅ تم إعداد خدمة الملفات الثابتة");

    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`✅ الخادم يعمل على المنفذ ${port}`);
    });

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