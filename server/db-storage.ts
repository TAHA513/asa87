import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import type { User, InsertUser } from "@shared/schema";

export class DatabaseStorage {
  // حفظ مستخدم جديد في قاعدة البيانات
  async saveNewUser(user: InsertUser): Promise<User | null> {
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

  // البحث عن مستخدم باسم المستخدم
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

  // الحصول على مستخدم بواسطة المعرف
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("خطأ في البحث عن المستخدم في قاعدة البيانات:", error);
      return undefined;
    }
  }
}

export const dbStorage = new DatabaseStorage();