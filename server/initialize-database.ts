import { db } from './db';
import * as schema from '../shared/schema';
import * as bcrypt from '@node-rs/bcrypt';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log("جاري تهيئة قاعدة البيانات...");

    // Verify database connection
    const testQuery = await db.execute(sql`SELECT 1`);
    if (!testQuery) {
      throw new Error("فشل الاتصال بقاعدة البيانات");
    }

    console.log("تم الاتصال بقاعدة البيانات بنجاح");

    // Add default user if none exists
    const existingUsers = await db.select().from(schema.users);

    if (existingUsers.length === 0) {
      console.log("إنشاء المستخدم الافتراضي...");

      const defaultUserData = {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        fullName: 'مدير النظام',
        role: 'admin',
        isActive: true,
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(schema.users).values(defaultUserData);
      console.log("تم إنشاء المستخدم الافتراضي بنجاح");
    }

    // Add default product categories if none exist
    const categories = await db.select().from(schema.productCategories);

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

    // Check if inventory_alerts table exists
    try {
      await db.select().from(schema.inventoryAlerts).limit(1);
    } catch (error) {
      console.log("إنشاء جدول تنبيهات المخزون...");
      // Create the inventory_alerts table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS inventory_alerts (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          type TEXT NOT NULL,
          threshold INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          last_triggered TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("تم إنشاء جدول تنبيهات المخزون بنجاح");
    }

    // Check if alert_notifications table exists
    try {
      await db.select().from(schema.alertNotifications).limit(1);
    } catch (error) {
      console.log("إنشاء جدول إشعارات التنبيهات...");
      // Create the alert_notifications table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS alert_notifications (
          id SERIAL PRIMARY KEY,
          alert_id INTEGER NOT NULL REFERENCES inventory_alerts(id),
          message TEXT NOT NULL,
          read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("تم إنشاء جدول إشعارات التنبيهات بنجاح");
    }

    console.log("اكتملت عملية تهيئة قاعدة البيانات بنجاح");

  } catch (error) {
    console.error("حدث خطأ أثناء تهيئة قاعدة البيانات:", error);
    throw error;
  }
}