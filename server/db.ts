import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;
// إعداد منطق إعادة اتصال مناسب
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

// التحقق من عنوان قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// دالة مساعدة لإعادة المحاولة مع انتظار متزايد
async function connectWithRetry(retryCount = 0): Promise<Pool> {
  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000, // 5 ثوان كحد أقصى للاتصال
      max: 20, // أقصى عدد للاتصالات المتزامنة
      idleTimeoutMillis: 30000, // إغلاق الاتصالات الخاملة بعد 30 ثانية
      keepAlive: true, // الحفاظ على الاتصالات نشطة
      allowExitOnIdle: false // منع إنهاء المجمع عند الخمول
    });
    
    // اختبار الاتصال
    await pool.query('SELECT 1');
    return pool;
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      console.log(`فشل الاتصال بقاعدة البيانات. إعادة المحاولة (${retryCount + 1}/${MAX_RETRIES}) بعد ${RETRY_DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectWithRetry(retryCount + 1);
    }
    console.error('فشل الاتصال بقاعدة البيانات بعد عدة محاولات:', err);
    throw err;
  }
}

// إنشاء مجمع الاتصالات مع معالجة الأخطاء وإعادة المحاولة
const pool = await connectWithRetry().catch(err => {
  console.error('لا يمكن إنشاء مجمع اتصالات قاعدة البيانات:', err);
  // لا نريد إنهاء التطبيق تمامًا، سنستخدم مجمع احتياطي بسيط
  return new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000
  });
});

// Configure drizzle with proper typing
export const db = drizzle(pool, { schema });

// Test connection on startup and handle errors gracefully
pool.connect()
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch(err => {
    console.error("Initial database connection failed:", err);
    // Don't exit process, let it retry
  });

// Handle pool errors without crashing
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit, let the pool handle reconnection
});

// Keep connection alive with periodic ping
setInterval(() => {
  pool.query('SELECT 1')
    .catch(err => {
      console.warn('Keep-alive ping failed:', err);
    });
}, 60000); // Ping every minute

// Handle cleanup on application shutdown
process.on('SIGTERM', () => {
  console.log('Closing database pool...');
  pool.end().then(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});

// Export sql for use in other files
export { sql };