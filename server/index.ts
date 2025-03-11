
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { setupRoutes } from './routes.js';
import { setupPassport as setupAuth } from './auth.js';
import { initializeDatabase } from './initialize-database.js';
import { setupViteDevServer } from './vite.js';

const app = express();
const httpServer = createServer(app);

// تكوين جلسات المستخدمين
app.use(
  session({
    name: "app.session",
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    rolling: true, // تحديث وقت انتهاء الصلاحية مع كل طلب
    cookie: {
      secure: false, // تعيين إلى false للسماح بالجلسات عبر HTTP
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // أسبوع واحد
      sameSite: 'lax', // السماح بإرسال الكوكيز عبر الطلبات الخارجية
      path: '/', // تأكد من أن الكوكيز متاح لجميع المسارات
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // تنظيف الجلسات منتهية الصلاحية كل 24 ساعة
    }),
  })
);

// إضافة مراقبة لتحديثات الجلسة
app.use((req, res, next) => {
  const oldEnd = res.end;
  res.end = function (...args) {
    if (req.session && req.session.save && typeof req.session.save === 'function') {
      req.session.save((err) => {
        if (err) {
          console.error('خطأ في حفظ الجلسة:', err);
        }
        // @ts-ignore
        oldEnd.apply(res, args);
      });
    } else {
      // @ts-ignore
      oldEnd.apply(res, args);
    }
  };
  next();
});

// تكوين CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// إعداد معالجة JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد المصادقة
setupAuth(app);

// إعداد المسارات
setupRoutes(app);

// تهيئة قاعدة البيانات
initializeDatabase().catch(console.error);

// إعداد خادم التطوير Vite
setupViteDevServer(app, httpServer);

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
});
