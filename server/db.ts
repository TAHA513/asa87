import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// تكوين WebSocket للاتصال بقاعدة البيانات
neonConfig.webSocketConstructor = ws;

// التحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("يجب تعيين DATABASE_URL. هل نسيت تهيئة قاعدة البيانات؟");
}

// إنشاء مجمع اتصالات بسيط
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  max: 10,
  idleTimeoutMillis: 60000,
});

// تصدير كائن قاعدة البيانات مع المخطط
export const db = drizzle(pool, { schema });

// التحقق من الاتصال عند بدء التشغيل
pool.connect()
  .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح'))
  .catch(err => console.error('فشل الاتصال بقاعدة البيانات:', err));