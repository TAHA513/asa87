import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, products } from "@shared/schema";
import type { User, InsertUser, Product } from "@shared/schema";

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

  // إضافة منتج جديد
  async createProduct(product: Product): Promise<Product | null> {
    try {
      const [savedProduct] = await db
        .insert(products)
        .values(product)
        .returning();
      return savedProduct;
    } catch (error) {
      console.error("خطأ في حفظ المنتج في قاعدة البيانات:", error);
      return null;
    }
  }

  // الحصول على جميع المنتجات
  async getProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products);
    } catch (error) {
      console.error("خطأ في جلب المنتجات من قاعدة البيانات:", error);
      return [];
    }
  }

  // الحصول على منتج بواسطة المعرف
  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error("خطأ في البحث عن المنتج في قاعدة البيانات:", error);
      return undefined;
    }
  }

  // تحديث منتج
  async updateProduct(id: number, update: Partial<Product>): Promise<Product | null> {
    try {
      const [updatedProduct] = await db
        .update(products)
        .set(update)
        .where(eq(products.id, id))
        .returning();
      return updatedProduct;
    } catch (error) {
      console.error("خطأ في تحديث المنتج في قاعدة البيانات:", error);
      return null;
    }
  }

  // حذف منتج
  async deleteProduct(id: number): Promise<void> {
    try {
      await db.delete(products).where(eq(products.id, id));
    } catch (error) {
      console.error("خطأ في حذف المنتج من قاعدة البيانات:", error);
      throw error;
    }
  }
}

export const dbStorage = new DatabaseStorage();