import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function seedDatabase() {
  console.log("تم تجاهل إضافة البيانات الاختبارية بناءً على طلب المستخدم");
  return {};
}

export async function seedData() {
  try {
    console.log("بدء إضافة بيانات المستخدم الافتراضي");

    // التحقق ما إذا كان المستخدم موجود بالفعل
    const existingUsers = await db.select().from(users).where(sql`username = 'admin'`);

    if (existingUsers.length === 0) {
      // إنشاء مستخدم افتراضي إذا لم يكن موجوداً
      const hashedPassword = await hashPassword("123456");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        fullName: "مدير النظام",
        email: "admin@example.com",
        phone: "07700000000",
        role: "admin",
        permissions: ["all"],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("تم إنشاء حساب المستخدم الافتراضي بنجاح");
    } else {
      console.log("المستخدم الافتراضي موجود بالفعل، تخطي إنشاء حساب جديد");
    }

    console.log("اكتملت عملية بذر البيانات بنجاح");
  } catch (error) {
    console.error("حدث خطأ أثناء إضافة بيانات المستخدم:", error);
  }
}

// تشغيل الوظيفة إذا تم استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  // إنشاء مستخدم افتراضي فقط دون بيانات اختبارية أخرى
  seedData()
    .then(() => {
      console.log("تمت إضافة المستخدم الافتراضي فقط بنجاح!");
      process.exit(0);
    })
    .catch(error => {
      console.error("حدث خطأ أثناء إعداد المستخدم الافتراضي:", error);
      process.exit(1);
    });
}