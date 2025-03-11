import { spawn } from 'child_process';
import { db } from './db';
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { bcrypt } from '@node-rs/bcrypt';
import path from 'path';
import fs from 'fs';

async function runScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`جاري تنفيذ: ${scriptPath}`);

    const process = spawn('npx', ['tsx', scriptPath], {
      stdio: 'inherit'
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`تم تنفيذ ${scriptPath} بنجاح`);
        resolve();
      } else {
        console.error(`فشل في تنفيذ ${scriptPath} مع رمز الخروج: ${code}`);
        reject(new Error(`فشل تنفيذ ${scriptPath}`));
      }
    });
  });
}

async function initializeDatabase() {
  try {
    console.log("جاري تهيئة قاعدة البيانات...");

    // إنشاء قائمة بجميع أسماء الجداول من ملف schema.ts
    const tableNames = Object.keys(schema).filter(key => {
      const table = (schema as any)[key];
      return table && typeof table === 'object' && table.$type === 'table';
    });

    console.log(`الجداول التي سيتم إنشاؤها: ${tableNames.join(', ')}`);

    // استخدام drizzle للتعامل مع قاعدة البيانات
    try {
      console.log("التحقق من وجود المستخدم الافتراضي...");

      // إضافة حساب المستخدم الافتراضي
      const existingUsers = await db.select().from(schema.users).limit(1);

      if (existingUsers.length === 0) {
        console.log("بدء إضافة بيانات المستخدم الافتراضي");

        // إنشاء حساب المستخدم الافتراضي
        const defaultUserData = {
          username: 'admin',
          password: await bcrypt.hash('admin123'), // كلمة المرور الافتراضية
          fullName: 'مدير النظام',
          role: 'admin',
          isActive: true,
          permissions: ['all'],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.insert(schema.users).values(defaultUserData);
        console.log("تم إنشاء المستخدم الافتراضي بنجاح");
      } else {
        console.log("المستخدم الافتراضي موجود بالفعل، تخطي إنشاء حساب جديد");
      }

      // إضافة فئات المنتجات الافتراضية
      const categories = await db.select().from(schema.productCategories).limit(1);
      if (categories.length === 0) {
        console.log("إضافة فئات المنتجات الافتراضية...");

        const defaultCategories = [
          { name: 'الإلكترونيات', description: 'الأجهزة الإلكترونية والكهربائية' },
          { name: 'الأثاث', description: 'أثاث المنزل والمكتب' },
          { name: 'الملابس', description: 'الملابس والأزياء' },
          { name: 'الأجهزة المنزلية', description: 'أجهزة المطبخ والمنزل' },
          { name: 'مستلزمات السيارات', description: 'قطع غيار وإكسسوارات السيارات' }
        ];

        await db.insert(schema.productCategories).values(defaultCategories);
        console.log("تم إضافة فئات المنتجات الافتراضية بنجاح");
      }

      // إضافة منتجات افتراضية
      const products = await db.select().from(schema.products).limit(1);
      if (products.length === 0) {
        console.log("إضافة منتجات افتراضية...");

        // الحصول على معرف فئة الإلكترونيات
        const electronicsCategory = await db.select().from(schema.productCategories).where(sql => sql`${schema.productCategories.name} = 'الإلكترونيات'`).limit(1);
        const categoryId = electronicsCategory.length > 0 ? electronicsCategory[0].id : null;

        const defaultProducts = [
          {
            name: 'تلفاز سامسونج 55 بوصة',
            description: 'تلفاز ذكي LED بدقة 4K وشاشة 55 بوصة',
            productCode: 'TV-SAM-55',
            barcode: '8801234567890',
            productType: 'الإلكترونيات',
            quantity: 10,
            minQuantity: 2,
            costPrice: 400,
            priceIqd: 600000,
            categoryId: categoryId,
            stock: 10,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'غسالة LG أوتوماتيك',
            description: 'غسالة ملابس أوتوماتيك تحميل أمامي سعة 10 كغم',
            productCode: 'WM-LG-10',
            barcode: '8807654321098',
            productType: 'الأجهزة المنزلية',
            quantity: 5,
            minQuantity: 1,
            costPrice: 300,
            priceIqd: 450000,
            categoryId: categoryId,
            stock: 5,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        await db.insert(schema.products).values(defaultProducts);
        console.log("تم إضافة المنتجات الافتراضية بنجاح");
      }

      // إضافة عملاء افتراضيين
      const customers = await db.select().from(schema.customers).limit(1);
      if (customers.length === 0) {
        console.log("إضافة عملاء افتراضيين...");

        const defaultCustomers = [
          {
            name: 'علي محمد',
            phone: '0770123456',
            email: 'ali@example.com',
            address: 'بغداد - الكرادة',
            createdAt: new Date()
          },
          {
            name: 'سارة أحمد',
            phone: '0780987654',
            email: 'sara@example.com',
            address: 'بغداد - المنصور',
            createdAt: new Date()
          }
        ];

        await db.insert(schema.customers).values(defaultCustomers);
        console.log("تم إضافة العملاء الافتراضيين بنجاح");
      }

      // إضافة سعر صرف افتراضي
      const rates = await db.select().from(schema.exchangeRates).limit(1);
      if (rates.length === 0) {
        console.log("إضافة سعر صرف افتراضي...");

        await db.insert(schema.exchangeRates).values({
          usdToIqd: 1500,
          date: new Date()
        });

        console.log("تم إضافة سعر الصرف الافتراضي بنجاح");
      }

      // -------  إنشاء جداول معلومات النظام وإعداداته -------
      await db.schema
        .createTable("user_settings")
        .ifNotExists()
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("user_id", "integer", (col) => col.notNull().references(() => "users.id"))
        .addColumn("theme_name", "text", (col) => col.notNull())
        .addColumn("font_name", "text", (col) => col.notNull())
        .addColumn("font_size", "text", (col) => col.notNull())
        .addColumn("appearance", "text", (col) => col.notNull())
        .addColumn("colors", "jsonb", (col) => col.notNull())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .execute();

      await db.schema
        .createTable("store_settings")
        .ifNotExists()
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("store_name", "text", (col) => col.notNull())
        .addColumn("store_address", "text")
        .addColumn("store_phone", "text")
        .addColumn("store_email", "text")
        .addColumn("tax_number", "text")
        .addColumn("logo_url", "text")
        .addColumn("receipt_notes", "text")
        .addColumn("enable_logo", "boolean", (col) => col.notNull().defaultTo(true))
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .execute();
        
      // إضافة إعدادات المتجر الافتراضية إذا لم تكن موجودة
      const storeSettings = await db.select().from(schema.storeSettings).limit(1);
      if (storeSettings.length === 0) {
        console.log("إضافة إعدادات المتجر الافتراضية...");
        await db.insert(schema.storeSettings).values({
          storeName: "نظام SAS للإدارة",
          storeAddress: "العنوان الافتراضي",
          storePhone: "07xxxxxxxx",
          storeEmail: "info@example.com",
          taxNumber: "123456789",
          receiptNotes: "شكراً لتعاملكم معنا",
          enableLogo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log("تم إضافة إعدادات المتجر الافتراضية بنجاح");
      }


      console.log("اكتملت عملية بذر البيانات بنجاح");

    } catch (error) {
      console.error("حدث خطأ أثناء التهيئة:", error);
      throw error;
    }

  } catch (error) {
    console.error("حدث خطأ أثناء تهيئة قاعدة البيانات:", error);
    console.error(error);
  }
}

// تنفيذ وظيفة التهيئة
initializeDatabase().catch(error => {
  console.error("فشل تهيئة قاعدة البيانات:", error);
  process.exit(1);
});