
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// تكوين Neon لاستخدام WebSockets
neonConfig.webSocketConstructor = ws;

// التحقق من صحة عنوان قاعدة البيانات
if (!process.env.DATABASE_URL) {
  console.error("خطأ: متغير البيئة DATABASE_URL غير موجود");
}

// التأكد من أن عنوان قاعدة البيانات صحيح
let connectionString = process.env.DATABASE_URL || '';
const isPostgresURL = connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://');

if (!isPostgresURL && connectionString) {
  console.error("تنبيه: يبدو أن عنوان قاعدة البيانات ليس بالتنسيق الصحيح");
}

// إضافة المنفذ الصريح وتصحيح العنوان
try {
  const dbUrl = new URL(connectionString);
  
  // التأكد من وجود المنفذ
  if (!dbUrl.port) {
    dbUrl.port = "5432";
    console.log("تمت إضافة المنفذ الافتراضي 5432 للعنوان");
  }
  
  // استبدال العنوان الأصلي بالعنوان المصحح
  connectionString = dbUrl.toString();
  console.log("عنوان الاتصال المصحح (بدون كلمة المرور):", connectionString.replace(/:[^:@]*@/, ":***@"));
  
} catch (e) {
  // إذا فشل التحليل، نحاول تصحيح العنوان يدويًا
  console.error("تعذر تحليل عنوان قاعدة البيانات:", e.message);
  
  if (connectionString.includes('@') && !connectionString.includes(':5432')) {
    // محاولة إضافة المنفذ يدويًا
    const parts = connectionString.split('@');
    if (parts.length >= 2) {
      const hostPart = parts[1].split('/')[0];
      connectionString = connectionString.replace('@' + hostPart, '@' + hostPart + ':5432');
      console.log("تمت إضافة المنفذ يدويًا للعنوان");
    }
  }
}

// إنشاء مجمع الاتصالات واتصال قاعدة البيانات
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

// اختبار الاتصال الأولي (اختياري)
if (process.env.NODE_ENV !== 'production') {
  pool.query('SELECT NOW()').then(result => {
    console.log("تم التحقق من اتصال قاعدة البيانات بنجاح:", result.rows[0]);
  }).catch(err => {
    console.error("فشل الاتصال الأولي بقاعدة البيانات:", err.message);
  });
}
