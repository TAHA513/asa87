import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { users, products, sales, exchangeRates, expenseCategories } from "@shared/schema";
import type { User, InsertUser, Product, Sale, ExchangeRate, ExpenseCategory } from "@shared/schema";

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

  // حذف منتج
  async deleteProduct(id: number): Promise<void> {
    try {
      await db.delete(products).where(eq(products.id, id));
    } catch (error) {
      console.error("خطأ في حذف المنتج من قاعدة البيانات:", error);
      throw error;
    }
  }

  // إضافة فئة مصروفات جديدة
  async createExpenseCategory(data: {
    name: string;
    description?: string | null;
    budgetAmount?: number | null;
    userId: number;
  }): Promise<ExpenseCategory> {
    try {
      console.log("Creating expense category with data:", data);
      const [category] = await db
        .insert(expenseCategories)
        .values({
          name: data.name,
          description: data.description,
          budgetAmount: data.budgetAmount?.toString(),
          userId: data.userId,
          createdAt: new Date(),
        })
        .returning();

      console.log("Created expense category:", category);
      return category;
    } catch (error) {
      console.error("خطأ في إنشاء فئة المصروفات:", error);
      throw error;
    }
  }

  // الحصول على فئات المصروفات
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
      return await db.select().from(expenseCategories);
    } catch (error) {
      console.error("خطأ في جلب فئات المصروفات:", error);
      return [];
    }
  }

  // إضافة عملية بيع
  async createSale(sale: Sale): Promise<Sale | null> {
    try {
      const [savedSale] = await db
        .insert(sales)
        .values(sale)
        .returning();
      return savedSale;
    } catch (error) {
      console.error("خطأ في حفظ عملية البيع في قاعدة البيانات:", error);
      return null;
    }
  }

  // الحصول على جميع المبيعات
  async getSales(): Promise<Sale[]> {
    try {
      return await db.select().from(sales);
    } catch (error) {
      console.error("خطأ في جلب المبيعات من قاعدة البيانات:", error);
      return [];
    }
  }

  // الحصول على سعر الصرف الحالي
  async getCurrentExchangeRate(): Promise<ExchangeRate | null> {
    try {
      const [rate] = await db
        .select()
        .from(exchangeRates)
        .orderBy(desc(exchangeRates.date))
        .limit(1);
      return rate;
    } catch (error) {
      console.error("خطأ في جلب سعر الصرف من قاعدة البيانات:", error);
      return null;
    }
  }

  // تعيين سعر الصرف
  async setExchangeRate(rate: number): Promise<ExchangeRate | null> {
    try {
      const [newRate] = await db
        .insert(exchangeRates)
        .values({
          usdToIqd: rate.toString(),
          date: new Date()
        })
        .returning();
      return newRate;
    } catch (error) {
      console.error("خطأ في حفظ سعر الصرف في قاعدة البيانات:", error);
      return null;
    }
  }
}

export const dbStorage = new DatabaseStorage();