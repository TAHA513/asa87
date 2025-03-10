import express from "express";
import compression from "compression";
import { db, sql } from "./db"; // Assuming 'sql`' is imported from a library like 'pg-sql`
import { registerRoutes } from "./routes";

// إعداد التطبيق
const app = express();

// الإعدادات الأساسية
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تسجيل الطلبات للتشخيص
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
  next();
});

// التعامل مع الأخطاء
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('خطأ في الخادم:', err);
  res.status(500).json({ 
    error: true, 
    message: err.message || 'خطأ في الخادم' 
  });
});

// فحص حالة الخادم
app.get('/health', async (req, res) => {
  try {
    // اختبار الاتصال بقاعدة البيانات
    const dbTest = await db.execute(sql`SELECT 1`);
    if (!dbTest) {
      throw new Error('فشل الاتصال بقاعدة البيانات');
    }

    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('خطأ في فحص الحالة:', error);
    res.status(500).json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    });
  }
});

async function startServer() {
  try {
    console.log('بدء تشغيل الخادم...');

    // اختبار الاتصال بقاعدة البيانات
    console.log('اختبار الاتصال بقاعدة البيانات...');
    const dbTest = await db.execute(sql`SELECT 1`);
    if (!dbTest) {
      throw new Error('فشل الاتصال بقاعدة البيانات');
    }
    console.log('تم الاتصال بقاعدة البيانات بنجاح');

    // تسجيل المسارات
    console.log('تسجيل المسارات...');
    registerRoutes(app);
    console.log('تم تسجيل المسارات بنجاح');

    // بدء الخادم
    const port = Number(process.env.PORT || 5000);
    app.listen(port, '0.0.0.0', () => {
      console.log(`الخادم يعمل على المنفذ ${port}`);
    });

  } catch (error) {
    console.error('خطأ في بدء الخادم:', error);
    console.error('تفاصيل الخطأ:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// بدء الخادم
startServer();