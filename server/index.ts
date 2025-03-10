import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import session from "express-session";
import MemoryStore from 'memorystore';
import { createServer } from "http";
import { setupAuth } from "./auth";
import compression from 'compression';
import { testDatabaseConnection } from './test-db-connection';
import { connectionPool } from "./connection-pool";
import { cpus } from 'os';
import cluster from 'cluster';

// تحسين معالجة الأخطاء العامة
process.on('uncaughtException', (error) => {
  console.error('خطأ غير متوقع:', error);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض غير معالج:', promise, 'السبب:', reason);
});

// Only use clustering in production
const ENABLE_CLUSTERING = process.env.NODE_ENV === 'production' && process.env.DISABLE_CLUSTERING !== 'true';
const numCPUs = Math.min(cpus().length, 2); // Limit to 2 workers in Replit environment

if (ENABLE_CLUSTERING && cluster.isPrimary) {
  console.log(`Master process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // إنشاء تطبيق Express
  const app = express();

  // الإعدادات الأساسية
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // إعداد الجلسات
  const sessionStore = new (MemoryStore(session))({
    checkPeriod: 86400000,
    ttl: 86400,
    noDisposeOnSet: true
  });

  const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
      httpOnly: true,
      sameSite: 'lax'
    },
    name: 'session_id'
  });

  app.use(sessionMiddleware);

  // تسجيل الطلبات للتشخيص
  app.use((req, res, next) => {
    if (!req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
    }
    next();
  });

  // معالجة الأخطاء
  const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('خطأ في الخادم:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "خطأ في الخادم";
    res.status(status).json({ error: true, message, code: err.code || 'SERVER_ERROR' });
  };

  app.use(errorHandler);

  // فحص الصحة
  app.get('/health', (req, res) => {
    const health = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      env: process.env.NODE_ENV
    };
    res.json(health);
  });

  // إعداد المسارات
  try {
    console.log('بدء تسجيل المسارات...');
    registerRoutes(app);
    console.log('تم تسجيل المسارات بنجاح');

    // إنشاء خادم HTTP
    const server = createServer(app);
    const port = process.env.PORT || 5000;

    // إعداد بيئة التطوير
    if (process.env.NODE_ENV !== 'production') {
      console.log('إعداد بيئة التطوير مع Vite...');
      try {
        setupVite(app, server);
        console.log('تم إعداد Vite بنجاح');
      } catch (error) {
        console.error('خطأ في إعداد Vite:', error);
        console.log('الرجوع إلى الخدمة الثابتة...');
        serveStatic(app);
      }
    } else {
      serveStatic(app);
    }

    // بدء الخادم
    server.listen(port, '0.0.0.0', () => {
      console.log(`الخادم يعمل على المنفذ ${port} (وضع ${process.env.NODE_ENV})`);
      console.log(`العامل ${process.pid} بدأ`);
    });

    // اختبار اتصال قاعدة البيانات
    testDatabaseConnection().then(() => {
      console.log('تم الاتصال بقاعدة البيانات بنجاح');
    }).catch(error => {
      console.error('فشل الاتصال بقاعدة البيانات:', error);
    });

  } catch (error) {
    console.error('خطأ فادح أثناء بدء تشغيل الخادم:', error);
    process.exit(1);
  }
}