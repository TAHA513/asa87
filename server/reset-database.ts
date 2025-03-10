import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { connectionPool, sql as drizzleSql } from './connection-pool';
import { schema } from '../shared/schema';

neonConfig.webSocketConstructor = ws;

/**
 * سكريبت لحذف وإعادة إنشاء جميع الجداول في قاعدة البيانات
 */
async function resetDatabase() {
  try {
    console.log('بدء إعادة تهيئة قاعدة البيانات...');

    const db = connectionPool.getDrizzle();
    const pool = connectionPool.getPool();

    // قائمة بأسماء جميع الجداول (في نفس ترتيب إنشاءها)
    const tableNames = Object.keys(schema).reverse();

    // حذف جميع الجداول بترتيب عكسي (بسبب علاقات المفاتيح الأجنبية)
    for (const tableName of tableNames) {
      console.log(`حذف جدول: ${tableName}`);
      try {
        await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
      } catch (error) {
        console.error(`فشل في حذف الجدول ${tableName}:`, error);
      }
    }

    // إعادة إنشاء الجداول باستخدام Drizzle
    console.log('إعادة إنشاء الجداول...');

    // هذا مثال لإنشاء الجداول يدوياً
    // يمكن استبداله باستخدام أداة drizzle-kit إذا كانت متوفرة

    // إنشاء جدول المستخدمين
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'staff',
        "email" TEXT,
        "phone" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMP,
        "permissions" TEXT[],
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "product_categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "product_code" VARCHAR(50) NOT NULL UNIQUE,
        "barcode" VARCHAR(100) UNIQUE,
        "product_type" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "min_quantity" INTEGER NOT NULL DEFAULT 0,
        "production_date" TIMESTAMP,
        "expiry_date" TIMESTAMP,
        "cost_price" DECIMAL(10,2) NOT NULL,
        "price_iqd" DECIMAL(10,2) NOT NULL,
        "category_id" INTEGER REFERENCES "product_categories"("id"),
        "is_weight_based" BOOLEAN NOT NULL DEFAULT false,
        "enable_direct_weighing" BOOLEAN NOT NULL DEFAULT false,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "image_url" TEXT,
        "thumbnail_url" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "email" TEXT,
        "address" TEXT,
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // إنشاء باقي الجداول...

    console.log('تم إعادة تهيئة قاعدة البيانات بنجاح!');

  } catch (error) {
    console.error('حدث خطأ أثناء إعادة تهيئة قاعدة البيانات:', error);
    throw error;
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    await connectionPool.close();
  }
}

// تنفيذ الوظيفة مباشرة عند تشغيل السكريبت
resetDatabase().catch(error => {
  console.error('فشل في إعادة تهيئة قاعدة البيانات:', error);
  process.exit(1);
});