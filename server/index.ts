import express from "express";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import compression from "compression";
import { db } from "./db";

// إعداد التطبيق
const app = express();

// الإعدادات الأساسية
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تسجيل الطلبات للتشخيص
app.use((req, res, next) => {
  if (!req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
  }
  next();
});


// معالجة الأخطاء
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('خطأ في الخادم:', err);
  res.status(500).json({ 
    error: true, 
    message: err.message || 'خطأ في الخادم' 
  });
});

// فحص حالة الخادم
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  try {
    // تسجيل المسارات
    console.log('تسجيل المسارات...');
    registerRoutes(app);

    // إعداد Vite في وضع التطوير
    if (process.env.NODE_ENV !== 'production') {
      console.log('إعداد Vite...');
      await setupVite(app);
    }

    // بدء الخادم
    const port = process.env.PORT || 5000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`الخادم يعمل على المنفذ ${port}`);
    });

  } catch (error) {
    console.error('خطأ في بدء الخادم:', error);
    process.exit(1);
  }
}

// بدء الخادم
startServer();