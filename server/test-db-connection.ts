import { Pool } from '@neondatabase/serverless';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { connectionPool } from './connection-pool';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// تكوين Neon لاستخدام WebSockets
neonConfig.webSocketConstructor = ws;

// التحقق من متغير البيئة
if (!process.env.DATABASE_URL) {
  console.error("❌ خطأ: متغير البيئة DATABASE_URL غير موجود");
  process.exit(1);
}

async function testDatabaseConnection() {
  console.log('جاري اختبار الاتصال بقاعدة البيانات...');

  try {
    const pool = connectionPool.getPool();
    const result = await pool.query('SELECT 1');

    console.log('نتيجة اختبار قاعدة البيانات:', result);
    console.log('تم الاتصال بقاعدة البيانات بنجاح');

    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return false;
  } finally {
    // يمكن ترك الاتصال مفتوحًا هنا للاستخدام اللاحق
  }
}

// تصدير الوظيفة لاستخدامها في ملفات أخرى
export { testDatabaseConnection };

// تنفيذ السكريبت مباشرة عند تشغيله
if (require.main === module) {
  testDatabaseConnection().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}