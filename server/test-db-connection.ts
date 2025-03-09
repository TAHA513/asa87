
import { Pool } from '@neondatabase/serverless';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// تكوين Neon لاستخدام WebSockets
neonConfig.webSocketConstructor = ws;

// التحقق من متغير البيئة
if (!process.env.DATABASE_URL) {
  console.error("❌ خطأ: متغير البيئة DATABASE_URL غير موجود");
  process.exit(1);
}

async function testConnection() {
  try {
    // تهيئة اتصال neon
    neonConfig.webSocketConstructor = ws;

    // محاولة الاتصال
    const connectionString = process.env.DATABASE_URL;
    console.log("🔄 جاري محاولة الاتصال بقاعدة البيانات...");
    
    const pool = new Pool({ connectionString });

    // اختبار الاتصال
    const client = await pool.connect();
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح!");

    // اختبار الاستعلام
    console.log("🔍 معلومات قاعدة البيانات:");
    const dbInfoResult = await client.query("SELECT current_database() as db_name, current_user as username");
    console.log(`   📊 اسم قاعدة البيانات: ${dbInfoResult.rows[0].db_name}`);
    console.log(`   👤 اسم المستخدم: ${dbInfoResult.rows[0].username}`);

    // الحصول على قائمة الجداول
    console.log("\n📋 التحقق من الجداول الموجودة في قاعدة البيانات:");
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    // الجداول المتوقعة من ملف schema.ts
    const expectedTables = [
      'users', 'products', 'product_categories', 'customers', 'sales', 
      'invoices', 'invoice_items', 'invoice_history', 'installments', 
      'installment_payments', 'exchange_rates', 'marketing_campaigns', 
      'campaign_analytics', 'social_media_accounts', 'api_keys', 
      'inventory_transactions', 'inventory_adjustments', 'inventory_alerts', 
      'alert_notifications', 'reports', 'expense_categories', 'expenses', 
      'suppliers', 'supplier_transactions', 'appointments', 'file_storage',
      'user_settings', 'system_activities', 'activity_reports'
    ];

    if (tablesResult.rows.length === 0) {
      console.log("❌ لا توجد جداول في قاعدة البيانات!");
    } else {
      console.log(`✅ تم العثور على ${tablesResult.rows.length} جدول:`);
      
      const existingTables = tablesResult.rows.map(row => row.table_name);
      console.table(existingTables);
      
      // التحقق من الجداول المفقودة
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        console.log(`\n⚠️ الجداول المفقودة (${missingTables.length}):`);
        console.table(missingTables);
        console.log("\nℹ️ لإنشاء الجداول المفقودة، قم بتنفيذ الأمر التالي:");
        console.log("npx drizzle-kit push:pg");
      } else {
        console.log("\n✅ جميع الجداول المتوقعة موجودة في قاعدة البيانات!");
      }
    }

    // إغلاق الاتصال
    await client.release();
    await pool.end();
    
  } catch (error) {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", error);
  }
}

// تنفيذ الاختبار
testConnection();
