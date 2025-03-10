
import { db, sql } from "./db";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function createTestUser() {
  try {
    console.log("جاري إنشاء مستخدم اختبار...");
    
    // التحقق من وجود المستخدم
    const existingUser = await storage.getUserByUsername("admin");
    
    if (existingUser) {
      console.log("المستخدم موجود بالفعل:", existingUser.username);
      return;
    }
    
    // إنشاء مستخدم جديد
    const hashedPassword = await hashPassword("admin123");
    
    const user = await storage.createUser({
      username: "admin",
      password: hashedPassword,
      fullName: "مدير النظام",
      email: "admin@example.com",
      role: "admin",
      isActive: true
    });
    
    console.log("تم إنشاء مستخدم اختبار بنجاح:", user.username);
  } catch (error) {
    console.error("خطأ في إنشاء مستخدم الاختبار:", error);
  }
}

// تنفيذ الدالة
createTestUser();
