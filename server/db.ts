import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

// تكوين WebSocket للاتصال بـ Neon
neonConfig.webSocketConstructor = ws;

// التحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("يجب تعيين DATABASE_URL في أداة Secrets بـ Replit");
}

// إعداد تجمع الاتصالات مع إعدادات محسنة
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 ثوانٍ للاتصال
  max: 10, // عدد العملاء الأقصى
  idleTimeoutMillis: 60000, // إغلاق الاتصالات الخاملة بعد دقيقة
  keepAlive: true,
  allowExitOnIdle: false
});

// إعداد Drizzle ORM
export const db = drizzle(pool, { schema });

// وظيفة إعادة الاتصال بقاعدة البيانات
async function connectWithRetry(maxRetries = 5, delay = 5000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await pool.query('SELECT 1');
      console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
      return;
    } catch (err) {
      retries++;
      console.error(`❌ فشل الاتصال بقاعدة البيانات (محاولة ${retries}/${maxRetries}):`, err);
      
      if (retries >= maxRetries) {
        console.error("⚠️ فشلت جميع محاولات الاتصال بقاعدة البيانات");
        return;
      }
      
      console.log(`⏱️ الانتظار ${delay}ms قبل إعادة المحاولة...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// بدء الاتصال عند تحميل الملف
connectWithRetry();

// التعامل مع أخطاء تجمع الاتصالات
pool.on('error', (err) => {
  console.error('خطأ في اتصال قاعدة البيانات:', err);
  connectWithRetry(3, 2000); // محاولة إعادة الاتصال
});

// الحفاظ على نشاط الاتصال
const pingInterval = setInterval(() => {
  pool.query('SELECT 1')
    .catch(err => {
      console.warn('فشل ping للحفاظ على الاتصال:', err);
      connectWithRetry(2, 1000);
    });
}, 30000); // كل 30 ثانية

// التنظيف عند إغلاق التطبيق
process.on('SIGTERM', async () => {
  clearInterval(pingInterval);
  console.log('إغلاق اتصالات قاعدة البيانات...');
  await pool.end();
  console.log('تم إغلاق اتصالات قاعدة البيانات');
});

// تصدير sql للاستخدام في ملفات أخرى
export { sql };