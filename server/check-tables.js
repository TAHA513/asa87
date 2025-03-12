
// سكريبت للتحقق من وجود الجداول في قاعدة البيانات
const { Client } = require('pg');
require('dotenv').config();

// متغيرات الاتصال بقاعدة البيانات
const connectionString = process.env.DATABASE_URL;

async function checkTables() {
  console.log('بدء التحقق من جداول قاعدة البيانات...');
  
  const client = new Client({
    connectionString
  });

  try {
    await client.connect();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');

    // استعلام للحصول على قائمة الجداول
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const { rows } = await client.query(tablesQuery);
    
    if (rows.length === 0) {
      console.log('لا توجد جداول في قاعدة البيانات');
    } else {
      console.log(`تم العثور على ${rows.length} جدول في قاعدة البيانات:`);
      
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
      
      // قائمة الجداول التي يجب أن تكون موجودة
      const expectedTables = [
        'users',
        'products',
        'product_categories',
        'customers',
        'sales',
        'invoices',
        'invoice_items',
        'installments',
        'installment_payments',
        'exchange_rates',
        'marketing_campaigns',
        'campaign_analytics',
        'social_media_accounts',
        'api_keys',
        'inventory_transactions',
        'inventory_adjustments',
        'inventory_alerts',
        'alert_notifications',
        'reports',
        'expense_categories',
        'expenses',
        'suppliers',
        'supplier_transactions',
        'appointments',
        'file_storage',
        'user_settings',
        'system_activities',
        'activity_reports',
        'store_settings'
      ];
      
      // التحقق من الجداول المفقودة
      const existingTables = rows.map(row => row.table_name);
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        console.log('\nالجداول المفقودة:');
        missingTables.forEach((table, index) => {
          console.log(`${index + 1}. ${table}`);
        });
      } else {
        console.log('\nجميع الجداول المتوقعة موجودة.');
      }
    }
  } catch (error) {
    console.error('حدث خطأ أثناء التحقق من الجداول:', error);
  } finally {
    await client.end();
    console.log('تم إغلاق الاتصال بقاعدة البيانات');
  }
}

checkTables().catch(err => {
  console.error('خطأ غير متوقع:', err);
  process.exit(1);
});
