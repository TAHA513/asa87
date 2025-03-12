const { Client } = require('pg');
require('dotenv').config();

// متغيرات الاتصال بقاعدة البيانات
const connectionString = process.env.DATABASE_URL;

async function resetDatabase() {
  console.log('بدء إعادة تعيين قاعدة البيانات...');
  console.log('تحذير: سيتم حذف جميع البيانات الموجودة في الجداول المحددة!');

  const client = new Client({
    connectionString
  });

  try {
    await client.connect();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');

    // قائمة بالجداول التي سيتم إعادة تعيينها
    // الترتيب مهم بسبب العلاقات الخارجية
    const tables = [
      'alert_notifications',
      'invoice_items',
      'invoice_history',
      'invoices',
      'installment_payments',
      'installments',
      'sales',
      'inventory_transactions',
      'inventory_adjustments',
      'inventory_alerts',
      'campaign_analytics',
      'marketing_campaigns',
      'supplier_transactions',
      'suppliers',
      'expenses',
      'expense_categories',
      'social_media_accounts',
      'api_keys',
      'appointments',
      'customers',
      'products',
      'product_categories',
      'reports',
      'activity_reports',
      'system_activities',
      'file_storage',
      'user_settings',
      'exchange_rates',
      'store_settings'
      // عدم حذف جدول المستخدمين للحفاظ على بيانات الدخول
      // 'users'
    ];

    // تعطيل القيود الخارجية مؤقتًا
    await client.query('SET CONSTRAINTS ALL DEFERRED');

    // إفراغ كل جدول
    for (const table of tables) {
      try {
        await client.query(`TRUNCATE TABLE ${table} CASCADE`);
        console.log(`تم إفراغ جدول ${table} بنجاح`);
      } catch (error) {
        // إذا لم يكن الجدول موجودًا بعد، سنتجاهل الخطأ ونستمر
        if (error.code === '42P01') {
          console.log(`جدول ${table} غير موجود بعد، جاري تخطيه...`);
        } else {
          console.error(`خطأ في إفراغ جدول ${table}:`, error);
        }
      }
    }

    // إعادة تفعيل القيود الخارجية
    await client.query('SET CONSTRAINTS ALL IMMEDIATE');

    // إعادة تعيين تسلسلات المعرفات لكل جدول
    for (const table of tables) {
      try {
        await client.query(`
          DO $$
          BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}') THEN
              PERFORM setval(pg_get_serial_sequence('${table}', 'id'), 1, false);
            END IF;
          END $$;
        `);
        console.log(`تم إعادة تعيين تسلسل معرفات جدول ${table} بنجاح`);
      } catch (error) {
        console.error(`خطأ في إعادة تعيين تسلسل معرفات جدول ${table}:`, error);
      }
    }

    console.log('تمت إعادة تعيين قاعدة البيانات بنجاح');

    // إضافة بيانات أولية (إذا لزم الأمر)
    // مثل إنشاء حساب مدير افتراضي، إعدادات المتجر الأساسية، إلخ.

    // مثال: إضافة مستخدم مدير إذا لم يكن هناك مستخدمين
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      // هذا مجرد مثال - في الإنتاج يجب استخدام كلمة مرور آمنة ومشفرة
      await client.query(`
        INSERT INTO users (username, password, full_name, role, is_active)
        VALUES ('admin', '$2a$12$4vA2ZxfnSt/kxb1FIJCGNOwNLi7yXIm5eJA0YTOojzmIvnPCOejsW', 'مدير النظام', 'admin', true)
      `);
      console.log('تم إنشاء حساب مدير افتراضي');
    }

    // إضافة إعدادات المتجر الافتراضية إذا كان الجدول موجودًا
    try {
      const settingsCount = await client.query('SELECT COUNT(*) FROM store_settings');
      if (parseInt(settingsCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO store_settings (store_name, store_address, store_phone, receipt_notes, enable_logo)
          VALUES ('نظام SAS للإدارة', 'العراق', '07xxxxxxxxx', 'شكراً لتعاملكم معنا', true)
        `);
        console.log('تم إنشاء إعدادات المتجر الافتراضية');
      }
    } catch (error) {
      console.log('جدول إعدادات المتجر غير موجود بعد، تم تخطي إضافة البيانات الافتراضية');
    }

  } catch (error) {
    console.error('حدث خطأ أثناء إعادة تعيين قاعدة البيانات:', error);
  } finally {
    await client.end();
    console.log('تم إغلاق الاتصال بقاعدة البيانات');
  }
}

resetDatabase().catch(err => {
  console.error('خطأ غير متوقع:', err);
  process.exit(1);
});