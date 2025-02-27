import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  
  // التعامل مع احتمالية أن المنفذ مشغول
  try {
    if (!server.listening) {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`🚀 الخادم يعمل على http://0.0.0.0:${port}`);
      });
    } else {
      log(`🚀 الخادم يعمل بالفعل على http://0.0.0.0:${port}`);
    }
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      log(`⚠️ المنفذ ${port} مشغول بالفعل، جاري محاولة استخدام منفذ آخر...`);
      // محاولة استخدام منفذ آخر
      server.listen({
        port: 0, // سيختار النظام منفذ متاح تلقائياً
        host: "0.0.0.0",
      }, () => {
        const address = server.address();
        const actualPort = typeof address === 'object' ? address.port : port;
        log(`🚀 الخادم يعمل على http://0.0.0.0:${actualPort}`);
      });
    } else {
      throw error;
    }
  }
})();
