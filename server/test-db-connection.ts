// اختبار الاتصال بقاعدة البيانات
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "@shared/schema";

console.log("بدء اختبار الاتصال بقاعدة البيانات...");

// التحقق من وجود متغير البيئة
console.log(`متغير البيئة DATABASE_URL موجود: ${process.env.DATABASE_URL ? 'نعم' : 'لا'}`);

if (process.env.DATABASE_URL) {
  // طباعة URL بدون كلمة المرور للأمان
  const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]*@/, ":***@");
  console.log(`شكل عنوان قاعدة البيانات: ${safeUrl}`);

  // التحقق من شكل URL
  const urlParts = process.env.DATABASE_URL.split(":");

  if (urlParts.length < 3) {
    console.log("تنسيق URL غير صحيح. يجب أن يكون: postgres://username:password@hostname:port/database_name");
  } else {
    // تحليل URL بالكامل
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log(`البروتوكول: ${dbUrl.protocol}`);
      console.log(`اسم المستخدم: ${dbUrl.username}`);
      console.log(`اسم المضيف: ${dbUrl.hostname}`);
      console.log(`المنفذ: ${dbUrl.port || 'الافتراضي (5432)'}`);
      console.log(`اسم قاعدة البيانات: ${dbUrl.pathname.replace('/', '')}`);
    } catch (e) {
      console.log("تعذر تحليل عنوان قاعدة البيانات بشكل صحيح");

      // تحليل يدوي بسيط
      const hostPortPart = urlParts[2].split("@")[1] || "غير موجود";
      const hostPart = hostPortPart.split("/")[0] || "غير موجود";
      const port = hostPart.split(":")[1] || "غير موجود";
      const host = hostPart.split(":")[0] || "غير موجود";

      console.log(`اسم المضيف (تحليل يدوي): ${host}`);
      console.log(`المنفذ (تحليل يدوي): ${port}`);
    }
  }
}

async function testConnection() {
  try {
    // تهيئة اتصال neon
    neonConfig.webSocketConstructor = ws;

    // محاولة الاتصال
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.log("خطأ: متغير البيئة DATABASE_URL غير موجود");
      return;
    }

    console.log("جاري محاولة الاتصال بقاعدة البيانات...");
    const pool = new Pool({ connectionString });

    // اختبار الاتصال
    const client = await pool.connect();

    console.log("تم الاتصال بقاعدة البيانات بنجاح!");

    // اختبار الاستعلام
    console.log("جاري اختبار استعلام بسيط...");
    const result = await client.query("SELECT current_timestamp as time, current_database() as database");
    console.log("نتيجة الاستعلام:", result.rows[0]);

    // اختبار وجود جدول المستخدمين
    console.log("التحقق من وجود جدول المستخدمين...");
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    console.log(`جدول المستخدمين موجود: ${tableResult.rows[0].exists ? 'نعم' : 'لا'}`);

    // إغلاق الاتصال
    client.release();
    console.log("تم إغلاق الاتصال بنجاح");

  } catch (error) {
    console.log("فشل الاتصال بقاعدة البيانات:", error);
  } finally {
    console.log("إغلاق اتصال قاعدة البيانات...");
    console.log("اكتمل اختبار الاتصال");
    process.exit(0);
  }
}

testConnection();