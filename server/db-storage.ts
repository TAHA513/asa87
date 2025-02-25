import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import type { User, InsertUser } from "@shared/schema";

export class DatabaseStorage {
  // سيتم استخدام هذا المخزن فقط للبيانات الجديدة
  async saveNewUser(user: InsertUser) {
    try {
      const [savedUser] = await db
        .insert(users)
        .values({
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          lastLoginAt: null,
        })
        .returning();
      return savedUser;
    } catch (error) {
      console.error("خطأ في حفظ المستخدم في قاعدة البيانات:", error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("خطأ في البحث عن المستخدم في قاعدة البيانات:", error);
      return undefined;
    }
  }

  // يمكن إضافة المزيد من الدوال لحفظ البيانات الجديدة حسب الحاجة
}

export const dbStorage = new DatabaseStorage();