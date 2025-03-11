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

    console.log("اكتملت عملية تهيئة قاعدة البيانات بنجاح");

  } catch (error) {
    console.error("حدث خطأ أثناء تهيئة قاعدة البيانات:", error);
    throw error;
  }
}