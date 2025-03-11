import { ViteDevServer, createServer } from "vite";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// الحصول على مسار المجلد الحالي
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// مسار الجذر للمشروع
const root = path.resolve(__dirname, "../");

// عدم تشغيل Vite في وضع الإنتاج
let viteDevServer: ViteDevServer | null = null;

export async function setupVite(app: express.Express) {
  // تشغيل Vite في وضع التطوير فقط
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 بدء إعداد خادم Vite للتطوير...");

    try {
      viteDevServer = await createServer({
        root: path.resolve(root, "client"),
        server: {
          middlewareMode: true,
          hmr: {
            port: 24678,
            // استخدام 0.0.0.0 بدلاً من localhost للسماح بالاتصالات من أي عنوان IP
            host: "0.0.0.0",
            // تحسين إعدادات HMR لتقليل إعادة الاتصالات
            clientPort: 443,
            protocol: 'wss',
            timeout: 30000, // زيادة مهلة الانتظار
            overlay: false // تعطيل التراكب لتقليل التحديثات غير الضرورية
          },
          watch: {
            // تبسيط مراقبة الملفات
            usePolling: false,
            interval: 1000,
          },
        },
        appType: "spa",
        // تعطيل تحديثات HMR المفرطة
        optimizeDeps: {
          force: false
        },
        // تقليل سجلات التحميل
        logLevel: "warn",
      });

      console.log("✅ تم إعداد خادم Vite بنجاح");

      // استخدام وسيط Vite
      app.use(viteDevServer.middlewares);
    } catch (error) {
      console.error("❌ فشل في إعداد خادم Vite:", error);
    }
  } else {
    // في وضع الإنتاج، نقدم الملفات المبنية مسبقًا
    console.log("📦 تقديم تطبيق الواجهة المبني مسبقًا...");

    const clientDist = path.resolve(root, "client/dist");

    // التأكد من وجود المجلد المبني
    if (!fs.existsSync(clientDist)) {
      console.error("❌ مجلد client/dist غير موجود. هل نسيت بناء التطبيق؟");
      process.exit(1);
    }

    // تقديم الأصول الثابتة
    app.use(express.static(clientDist, {
      index: false,
      maxAge: '1d',
    }));
  }

  // معالج الطرق لجميع الطلبات التي تبدأ بـ /
  app.get("*", async (req, res, next) => {
    // تخطي طلبات الواجهة البرمجية
    if (req.path.startsWith("/api")) {
      return next();
    }

    try {
      let template: string;

      if (viteDevServer) {
        // وضع التطوير: استخدام Vite للحصول على HTML
        template = fs.readFileSync(
          path.resolve(root, "client/index.html"),
          "utf-8"
        );
        template = await viteDevServer.transformIndexHtml(req.url, template);
      } else {
        // وضع الإنتاج: استخدام الملف المبني
        template = fs.readFileSync(
          path.resolve(root, "client/dist/index.html"),
          "utf-8"
        );
      }

      // إرسال الصفحة إلى المتصفح
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (error) {
      console.error("❌ خطأ في تقديم الصفحة:", error);
      if (viteDevServer) {
        // إرسال الخطأ إلى Vite للعرض في المتصفح
        viteDevServer.ssrFixStacktrace(error as Error);
      }
      next(error);
    }
  });

  return viteDevServer;
}

// التنظيف عند إغلاق التطبيق
export function closeVite() {
  if (viteDevServer) {
    console.log("🧹 إغلاق خادم Vite...");
    viteDevServer.close();
    viteDevServer = null;
  }
}

// Placeholder for setupViteDevServer - requires more context for a complete implementation
import type { Express } from 'express';
import type { Server } from 'http';
export async function setupViteDevServer(app: Express, httpServer: Server) {
  // Placeholder implementation - replace with actual Vite server setup logic
  console.log("Vite dev server placeholder initialized.");
  // تحديد مسار الملفات الثابتة
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}