import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

// تكوين WebSocket للاتصال بـ Neon
neonConfig.webSocketConstructor = ws;

// التحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("يجب تعيين DATABASE_URL في متغيرات البيئة");
}

console.log("إعداد اتصال قاعدة البيانات...");

// إعداد تجمع الاتصالات مع إعدادات محسنة
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 20000, // 20 ثانية للاتصال
  max: 20, // زيادة عدد الاتصالات
  idleTimeoutMillis: 120000, // زيادة وقت الخمول
  keepAlive: true,
  allowExitOnIdle: false
});

// إعداد Drizzle ORM
export const db = drizzle(pool, { schema });

// وظيفة إعادة الاتصال بقاعدة البيانات مع محاولات أكثر
async function connectWithRetry(maxRetries = 10, delay = 3000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log("محاولة الاتصال بقاعدة البيانات...");
      await pool.query('SELECT 1');
      console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
      return true;
    } catch (err) {
      retries++;
      console.error(`❌ فشل الاتصال بقاعدة البيانات (محاولة ${retries}/${maxRetries}):`, err);
      
      if (retries >= maxRetries) {
        console.error("⚠️ فشلت جميع محاولات الاتصال بقاعدة البيانات");
        return false;
      }
      
      console.log(`⏱️ الانتظار ${delay}ms قبل إعادة المحاولة...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

// التحقق من اتصال قاعدة البيانات
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error("فشل التحقق من اتصال قاعدة البيانات:", err);
    return false;
  }
}

// وظيفة للتحقق من وجود جداول معينة
export async function checkTablesExist(tableNames: string[]): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
    `, [tableNames]);
    
    return result.rowCount === tableNames.length;
  } catch (err) {
    console.error("فشل التحقق من وجود الجداول:", err);
    return false;
  }
}

// بدء الاتصال عند تحميل الملف
connectWithRetry();

// التعامل مع أخطاء تجمع الاتصالات
pool.on('error', (err) => {
  console.error('خطأ في اتصال قاعدة البيانات:', err);
  connectWithRetry(5, 2000); // محاولة إعادة الاتصال مع زيادة المحاولات
});

// الحفاظ على نشاط الاتصال بشكل أكثر تكراراً
const pingInterval = setInterval(() => {
  pool.query('SELECT 1')
    .then(() => {
      // لا نحتاج لطباعة نجاح كل ping للحفاظ على نظافة السجل
    })
    .catch(err => {
      console.warn('فشل ping للحفاظ على الاتصال، محاولة إعادة الاتصال:', err);
      connectWithRetry(3, 1000);
    });
}, 20000); // كل 20 ثانية

// التعامل مع انقطاع الاتصال
pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('خطأ في عميل قاعدة البيانات:', err);
  });
});

// التنظيف عند إغلاق التطبيق
process.on('SIGTERM', async () => {
  clearInterval(pingInterval);
  console.log('إغلاق اتصالات قاعدة البيانات...');
  await pool.end();
  console.log('تم إغلاق اتصالات قاعدة البيانات');
});

// التعامل مع الإغلاق غير المتوقع
process.on('SIGINT', async () => {
  clearInterval(pingInterval);
  console.log('إغلاق اتصالات قاعدة البيانات بسبب SIGINT...');
  await pool.end();
  console.log('تم إغلاق اتصالات قاعدة البيانات');
  process.exit(0);
});

// تصدير sql للاستخدام في ملفات أخرى
export { sql, pool };