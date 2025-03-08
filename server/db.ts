
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

// بعض الأحيان يحتاج المنفذ إلى إضافة صريحة
// حاول تحليل العنوان للتأكد من أن المنفذ موجود
try {
  const dbUrl = new URL(connectionString);
  if (!dbUrl.port) {
    // استخدم المنفذ الافتراضي 5432 إذا لم يكن محددًا
    const urlWithPort = connectionString.replace(dbUrl.host, `${dbUrl.host}:5432`);
    console.log("تمت إضافة المنفذ الافتراضي للعنوان");
    connectionString = urlWithPort;
  }
} catch (e) {
  // إذا فشل التحليل، استمر باستخدام العنوان الأصلي
  console.error("تعذر تحليل عنوان قاعدة البيانات", e);
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
