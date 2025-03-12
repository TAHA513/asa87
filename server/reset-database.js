
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

// تكوين WebSocket للاتصال بـ Neon
neonConfig.webSocketConstructor = ws;

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("لم يتم تعيين DATABASE_URL");
  }

  console.log("جاري الاتصال بقاعدة البيانات...");
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("جاري حذف جميع الجداول من قاعدة البيانات...");
    
    // استعلام لحذف جميع الجداول
    await pool.query(`
      DO $$ 
      DECLARE
          tables CURSOR FOR
              SELECT tablename FROM pg_tables
              WHERE schemaname = 'public';
      BEGIN
          FOR table_record IN tables LOOP
              EXECUTE 'DROP TABLE IF EXISTS "' || table_record.tablename || '" CASCADE';
          END LOOP;
      END $$;
    `);
    
    console.log("تم حذف جميع الجداول بنجاح");
    
    // إنشاء الجداول الجديدة
    console.log("جاري إنشاء الجداول الجديدة...");
    
    // إنشاء جدول المستخدمين
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        email TEXT,
        phone TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMP,
        permissions TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول فئات المنتجات
    await pool.query(`
      CREATE TABLE product_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول المنتجات
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        product_code VARCHAR(50) NOT NULL UNIQUE,
        barcode VARCHAR(100) UNIQUE,
        product_type TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_quantity INTEGER NOT NULL DEFAULT 0,
        production_date TIMESTAMP,
        expiry_date TIMESTAMP,
        cost_price DECIMAL(10, 2) NOT NULL,
        price_iqd DECIMAL(10, 2) NOT NULL,
        category_id INTEGER REFERENCES product_categories(id),
        is_weight_based BOOLEAN NOT NULL DEFAULT FALSE,
        enable_direct_weighing BOOLEAN NOT NULL DEFAULT FALSE,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        thumbnail_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول العملاء
    await pool.query(`
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول المبيعات
    await pool.query(`
      CREATE TABLE sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        quantity INTEGER NOT NULL,
        price_iqd DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        final_price_iqd DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL REFERENCES users(id),
        is_installment BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    
    // إنشاء جدول الفواتير
    await pool.query(`
      CREATE TABLE invoices (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER NOT NULL,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        final_amount DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        payment_method TEXT NOT NULL DEFAULT 'cash',
        notes TEXT,
        printed BOOLEAN NOT NULL DEFAULT FALSE,
        original_invoice_id INTEGER,
        modification_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // إضافة المرجع الذاتي لجدول الفواتير
    await pool.query(`
      ALTER TABLE invoices 
      ADD CONSTRAINT invoices_original_invoice_id_fkey 
      FOREIGN KEY (original_invoice_id) 
      REFERENCES invoices(id);
    `);
    
    // إنشاء جدول عناصر الفاتورة
    await pool.query(`
      CREATE TABLE invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity DECIMAL(10, 3) NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول سجل الفواتير
    await pool.query(`
      CREATE TABLE invoice_history (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id),
        action TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        changes JSONB NOT NULL,
        reason TEXT,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول التقسيط
    await pool.query(`
      CREATE TABLE installments (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        identity_number TEXT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        down_payment DECIMAL(10, 2) NOT NULL DEFAULT 0,
        number_of_payments INTEGER NOT NULL,
        remaining_amount DECIMAL(10, 2) NOT NULL,
        start_date TIMESTAMP NOT NULL DEFAULT NOW(),
        next_payment_date TIMESTAMP NOT NULL,
        guarantor_name TEXT,
        guarantor_phone TEXT,
        status TEXT NOT NULL DEFAULT 'active'
      );
    `);
    
    // إنشاء جدول دفعات التقسيط
    await pool.query(`
      CREATE TABLE installment_payments (
        id SERIAL PRIMARY KEY,
        installment_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
        notes TEXT
      );
    `);
    
    // إنشاء جدول أسعار الصرف
    await pool.query(`
      CREATE TABLE exchange_rates (
        id SERIAL PRIMARY KEY,
        usd_to_iqd DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول الحملات التسويقية
    await pool.query(`
      CREATE TABLE marketing_campaigns (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        platforms TEXT[] NOT NULL,
        budget DECIMAL(10, 2) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'draft',
        user_id INTEGER NOT NULL,
        metrics JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول تحليلات الحملات
    await pool.query(`
      CREATE TABLE campaign_analytics (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL,
        platform TEXT NOT NULL,
        impressions INTEGER NOT NULL DEFAULT 0,
        clicks INTEGER NOT NULL DEFAULT 0,
        conversions INTEGER NOT NULL DEFAULT 0,
        spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
        date TIMESTAMP NOT NULL
      );
    `);
    
    // إنشاء جدول حسابات وسائل التواصل الاجتماعي
    await pool.query(`
      CREATE TABLE social_media_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        platform TEXT NOT NULL,
        account_name TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول مفاتيح API
    await pool.query(`
      CREATE TABLE api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        platform TEXT NOT NULL,
        key_type TEXT NOT NULL,
        key_value TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول حركات المخزون
    await pool.query(`
      CREATE TABLE inventory_transactions (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT NOT NULL,
        reference TEXT,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL,
        notes TEXT
      );
    `);
    
    // إنشاء جدول تعديلات المخزون
    await pool.query(`
      CREATE TABLE inventory_adjustments (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        old_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        reason TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL,
        notes TEXT
      );
    `);
    
    // إنشاء جدول تنبيهات المخزون
    await pool.query(`
      CREATE TABLE inventory_alerts (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        type TEXT NOT NULL,
        threshold INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        last_triggered TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول إشعارات التنبيهات
    await pool.query(`
      CREATE TABLE alert_notifications (
        id SERIAL PRIMARY KEY,
        alert_id INTEGER NOT NULL REFERENCES inventory_alerts(id),
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول التقارير
    await pool.query(`
      CREATE TABLE reports (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        date_range JSONB NOT NULL,
        filters JSONB,
        data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        format TEXT NOT NULL DEFAULT 'json'
      );
    `);
    
    // إنشاء جدول فئات المصروفات
    await pool.query(`
      CREATE TABLE expense_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER,
        budget_amount DECIMAL(10, 2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL
      );
    `);
    
    // إنشاء جدول المصروفات
    await pool.query(`
      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        category_id INTEGER NOT NULL REFERENCES expense_categories(id),
        user_id INTEGER NOT NULL,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_period TEXT,
        recurring_day INTEGER,
        notes TEXT,
        attachments TEXT[],
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول الموردين
    await pool.query(`
      CREATE TABLE suppliers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        tax_number TEXT,
        payment_terms TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        categories TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL
      );
    `);
    
    // إنشاء جدول معاملات الموردين
    await pool.query(`
      CREATE TABLE supplier_transactions (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP NOT NULL,
        reference TEXT,
        status TEXT NOT NULL DEFAULT 'completed',
        notes TEXT,
        attachments TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id INTEGER NOT NULL
      );
    `);
    
    // إنشاء جدول المواعيد
    await pool.query(`
      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول تخزين الملفات
    await pool.query(`
      CREATE TABLE file_storage (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        content_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول إعدادات المستخدم
    await pool.query(`
      CREATE TABLE user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        theme_name TEXT NOT NULL,
        font_name TEXT NOT NULL,
        font_size TEXT NOT NULL,
        appearance TEXT NOT NULL,
        colors JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول أنشطة النظام
    await pool.query(`
      CREATE TABLE system_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        activity_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details JSONB NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // إنشاء جدول تقارير النشاط
    await pool.query(`
      CREATE TABLE activity_reports (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        date_range JSONB NOT NULL,
        filters JSONB,
        report_type TEXT NOT NULL,
        generated_by INTEGER NOT NULL REFERENCES users(id),
        data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // إنشاء جدول إعدادات المتجر
    await pool.query(`
      CREATE TABLE store_settings (
        id SERIAL PRIMARY KEY,
        store_name TEXT NOT NULL,
        store_address TEXT,
        store_phone TEXT,
        store_email TEXT,
        tax_number TEXT,
        logo_url TEXT,
        receipt_notes TEXT,
        enable_logo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("تم إنشاء جميع الجداول بنجاح");
    console.log("إعادة تهيئة قاعدة البيانات تمت بنجاح");
    
  } catch (error) {
    console.error("حدث خطأ أثناء إعادة تهيئة قاعدة البيانات:", error);
    throw error;
  } finally {
    // إغلاق الاتصال
    await pool.end();
    console.log("تم إغلاق الاتصال بقاعدة البيانات");
  }
}

// تنفيذ وظيفة إعادة تهيئة قاعدة البيانات
resetDatabase()
  .then(() => {
    console.log("تمت إعادة تهيئة قاعدة البيانات بنجاح");
    process.exit(0);
  })
  .catch((error) => {
    console.error("حدث خطأ أثناء إعادة تهيئة قاعدة البيانات:", error);
    process.exit(1);
  });
