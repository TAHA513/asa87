import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

// التحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// إنشاء مجمع الاتصال مع معالجة الأخطاء ومنطق إعادة المحاولة
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // مهلة 5 ثواني
  max: 20, // الحد الأقصى 20 اتصال في المجمع
  idleTimeoutMillis: 30000, // إغلاق الاتصالات غير النشطة بعد 30 ثانية
  keepAlive: true, // الحفاظ على الاتصالات نشطة
  allowExitOnIdle: false // منع المجمع من الإنهاء عند عدم النشاط
});

// تكوين drizzle مع الأنواع المناسبة
export const db = drizzle(pool, { schema });

// اختبار الاتصال عند بدء التشغيل ومعالجة الأخطاء بسلاسة
pool.connect()
  .then(() => {
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
  })
  .catch(err => {
    console.error("فشل الاتصال الأولي بقاعدة البيانات:", err);
  });

// معالجة أخطاء المجمع دون تعطل
pool.on('error', (err) => {
  console.error('خطأ غير متوقع في العميل غير النشط:', err);
});

// الحفاظ على الاتصال نشطًا مع ping دوري
setInterval(() => {
  pool.query('SELECT 1')
    .catch(err => {
      console.warn('فشل ping للحفاظ على النشاط:', err);
    });
}, 60000); // ping كل دقيقة

// معالجة التنظيف عند إيقاف التطبيق
process.on('SIGTERM', () => {
  console.log('جاري إغلاق مجمع قاعدة البيانات...');
  pool.end().then(() => {
    console.log('تم إغلاق مجمع قاعدة البيانات.');
    process.exit(0);
  });
});

export { sql };