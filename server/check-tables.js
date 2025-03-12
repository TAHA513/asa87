
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

// تكوين WebSocket للاتصال بـ Neon
neonConfig.webSocketConstructor = ws;

async function checkTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error("لم يتم تعيين DATABASE_URL");
  }

  console.log("جاري الاتصال بقاعدة البيانات...");
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
    
    // الجداول المتوقعة من ملف schema.ts
    const expectedTables = [
      'users', 'products', 'product_categories', 'customers', 'sales', 
      'invoices', 'invoice_items', 'invoice_history', 'installments', 
      'installment_payments', 'exchange_rates', 'marketing_campaigns', 
      'campaign_analytics', 'social_media_accounts', 'api_keys', 
      'inventory_transactions', 'inventory_adjustments', 'inventory_alerts', 
      'alert_notifications', 'reports', 'expense_categories', 'expenses', 
      'suppliers', 'supplier_transactions', 'appointments', 'file_storage',
      'user_settings', 'system_activities', 'activity_reports', 'store_settings'
    ];

    // استعلام للحصول على قائمة الجداول الموجودة
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length === 0) {
      console.log("❌ لا توجد جداول في قاعدة البيانات!");
    } else {
      console.log(`✅ تم العثور على ${tablesResult.rows.length} جدول:`);
      
      const existingTables = tablesResult.rows.map(row => row.table_name);
      console.log(existingTables);
      
      // التحقق من الجداول المفقودة
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        console.log(`\n❌ هناك ${missingTables.length} جدول مفقود:`);
        console.log(missingTables);
      } else {
        console.log("\n✅ جميع الجداول المتوقعة موجودة!");
      }
    }
    
  } catch (error) {
    console.error("حدث خطأ أثناء التحقق من الجداول:", error);
    throw error;
  } finally {
    // إغلاق الاتصال
    await pool.end();
    console.log("تم إغلاق الاتصال بقاعدة البيانات");
  }
}

// تنفيذ وظيفة التحقق من الجداول
checkTables()
  .then(() => {
    console.log("تم التحقق من الجداول بنجاح");
    process.exit(0);
  })
  .catch((error) => {
    console.error("حدث خطأ أثناء التحقق من الجداول:", error);
    process.exit(1);
  });
