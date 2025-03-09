
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

// تكوين Neon لاستخدام WebSockets
neonConfig.webSocketConstructor = ws;

// التحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("يجب تعيين DATABASE_URL. هل نسيت توفير قاعدة بيانات؟");
}

// إنشاء مجموعة اتصالات واحدة للتطبيق بأكمله
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // زيادة مهلة الاتصال إلى 10 ثوانٍ
  max: 10, // تقليل عدد الاتصالات المتزامنة لتجنب تجاوز الحد
  idleTimeoutMillis: 30000, // إغلاق الاتصالات الخاملة بعد 30 ثانية
  keepAlive: true, // الحفاظ على الاتصالات نشطة
  allowExitOnIdle: false // منع إنهاء المجموعة عند الخمول
});

// تكوين Drizzle مع التكتيب المناسب
export const db = drizzle(pool, { schema });

// متغير للتحقق من حالة الاتصال
let isConnected = false;

// اختبار الاتصال عند بدء التشغيل
const testConnection = async () => {
  try {
    console.log("جاري اختبار الاتصال بقاعدة البيانات...");
    await pool.query('SELECT 1');
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
    isConnected = true;
    return true;
  } catch (err) {
    console.error("فشل اتصال قاعدة البيانات الأولي:", err);
    isConnected = false;
    return false;
  }
};

// تصدير دالة لاختبار الاتصال
export const ensureConnection = async () => {
  if (!isConnected) {
    return await testConnection();
  }
  return true;
};

// معالجة أخطاء المجموعة دون تعطيل
pool.on('error', (err) => {
  console.error('خطأ غير متوقع في اتصال العميل:', err);
  isConnected = false;
  // لا تنهي العملية، دع المجموعة تعالج إعادة الاتصال
});

// الحفاظ على الاتصال نشطًا باستخدام نبض دوري
const keepAliveInterval = setInterval(() => {
  if (isConnected) {
    pool.query('SELECT 1')
      .catch(err => {
        console.warn('فشل اختبار الاتصال الدوري:', err);
        isConnected = false;
      });
  } else {
    testConnection().catch(() => {}); // محاولة إعادة الاتصال إذا كان منقطعًا
  }
}, 60000); // إرسال نبض كل دقيقة

// معالجة التنظيف عند إيقاف التطبيق
process.on('SIGTERM', () => {
  console.log('إغلاق مجموعة قاعدة البيانات...');
  clearInterval(keepAliveInterval);
  pool.end().then(() => {
    console.log('تم إغلاق مجموعة قاعدة البيانات.');
    process.exit(0);
  });
});

// تصدير الدوال والمتغيرات اللازمة
export { sql, pool, testConnection };
