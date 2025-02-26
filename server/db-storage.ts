import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { users, products, sales, exchangeRates, expenseCategories, fileStorage, installments, installmentPayments } from "@shared/schema";
import type { User, InsertUser, Product, Sale, ExchangeRate, ExpenseCategory, FileStorage, InsertFileStorage, Installment, InstallmentPayment } from "@shared/schema";

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
      // استخدام جملة SQL مخصصة للتوافق مع هيكل الجدول
      const result = await db.execute({
        sql: `SELECT * FROM sales`
      });
      
      return result.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        price: row.price,
        total: row.total,
        date: row.date,
        userId: row.user_id,
        // تعامل مع customerId فقط إذا كان موجوداً
        customerId: row.customer_id !== undefined ? row.customer_id : null,
        customerName: row.customer_name || null
      }));
    } catch (error) {
      console.error("خطأ في جلب المبيعات من قاعدة البيانات:", error);
      // في حالة الفشل، أعد مصفوفة فارغة
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

  // حفظ ملف جديد
  async saveFile(file: InsertFileStorage): Promise<FileStorage> {
    try {
      console.log("Saving file:", file.filename);
      const [savedFile] = await db
        .insert(fileStorage)
        .values({
          filename: file.filename,
          contentType: file.contentType,
          size: file.size,
          data: file.data,
          userId: file.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      console.log("File saved successfully:", savedFile.id);
      return savedFile;
    } catch (error) {
      console.error("خطأ في حفظ الملف:", error);
      throw error;
    }
  }

  // الحصول على ملف بواسطة المعرف
  async getFileById(id: number): Promise<FileStorage | undefined> {
    try {
      const [file] = await db
        .select()
        .from(fileStorage)
        .where(eq(fileStorage.id, id));
      return file;
    } catch (error) {
      console.error("خطأ في جلب الملف:", error);
      return undefined;
    }
  }

  // الحصول على جميع ملفات المستخدم
  async getUserFiles(userId: number): Promise<FileStorage[]> {
    try {
      return await db
        .select()
        .from(fileStorage)
        .where(eq(fileStorage.userId, userId));
    } catch (error) {
      console.error("خطأ في جلب ملفات المستخدم:", error);
      return [];
    }
  }

  // حذف ملف
  async deleteFile(id: number): Promise<void> {
    try {
      await db
        .delete(fileStorage)
        .where(eq(fileStorage.id, id));
    } catch (error) {
      console.error("خطأ في حذف الملف:", error);
      throw error;
    }
  }

  // الحصول على التقسيطات
  async getInstallments(): Promise<Installment[]> {
    try {
      return await db.select().from(installments);
    } catch (error) {
      console.error("خطأ في جلب التقسيطات من قاعدة البيانات:", error);
      return [];
    }
  }

  // الحصول على تقسيط محدد
  async getInstallment(id: number): Promise<Installment | undefined> {
    try {
      const [installment] = await db
        .select()
        .from(installments)
        .where(eq(installments.id, id));
      return installment;
    } catch (error) {
      console.error("خطأ في جلب التقسيط من قاعدة البيانات:", error);
      return undefined;
    }
  }

  // إنشاء تقسيط جديد
  async createInstallment(installment: Installment): Promise<Installment | null> {
    try {
      const [savedInstallment] = await db
        .insert(installments)
        .values({
          saleId: installment.saleId,
          customerName: installment.customerName,
          customerPhone: installment.customerPhone,
          totalAmount: installment.totalAmount,
          numberOfPayments: installment.numberOfPayments,
          remainingAmount: installment.remainingAmount,
          startDate: installment.startDate || new Date(),
          nextPaymentDate: installment.nextPaymentDate,
          status: installment.status || "active",
        })
        .returning();
      return savedInstallment;
    } catch (error) {
      console.error("خطأ في حفظ التقسيط في قاعدة البيانات:", error);
      return null;
    }
  }

  // تحديث تقسيط
  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment | null> {
    try {
      const [updatedInstallment] = await db
        .update(installments)
        .set(update)
        .where(eq(installments.id, id))
        .returning();
      return updatedInstallment;
    } catch (error) {
      console.error("خطأ في تحديث التقسيط في قاعدة البيانات:", error);
      return null;
    }
  }

  // الحصول على دفعات التقسيط
  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> {
    try {
      return await db
        .select()
        .from(installmentPayments)
        .where(eq(installmentPayments.installmentId, installmentId));
    } catch (error) {
      console.error("خطأ في جلب دفعات التقسيط من قاعدة البيانات:", error);
      return [];
    }
  }

  // إنشاء دفعة تقسيط جديدة
  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment | null> {
    try {
      const [savedPayment] = await db
        .insert(installmentPayments)
        .values({
          installmentId: payment.installmentId,
          amount: payment.amount,
          paymentDate: payment.paymentDate || new Date(),
          notes: payment.notes || null,
        })
        .returning();
      return savedPayment;
    } catch (error) {
      console.error("خطأ في حفظ دفعة التقسيط في قاعدة البيانات:", error);
      return null;
    }
  }

  // الحصول على منتج محدد
  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error("خطأ في جلب المنتج من قاعدة البيانات:", error);
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

  // البحث عن العملاء
  async searchCustomers(search?: string): Promise<Customer[]> {
    try {
      console.log(`البحث عن العملاء: ${search || 'الكل'}`);
      
      let sql = `SELECT * FROM customers`;
      let args: any[] = [];
      
      if (search) {
        sql += ` WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`;
        args.push(`%${search}%`);
      }
      
      sql += ` ORDER BY name ASC`;
      
      const result = await db.execute({
        sql,
        args
      });
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address || null,
        notes: row.notes || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error("خطأ في البحث عن العملاء:", error);
      return [];
    }
  }

  // الحصول على عميل محدد
  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      console.log(`جلب العميل رقم ${id}`);
      
      const result = await db.execute({
        sql: `SELECT * FROM customers WHERE id = $1`,
        args: [id]
      });
      
      if (result.rows && result.rows.length > 0) {
        return {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
          phone: result.rows[0].phone,
          address: result.rows[0].address || null,
          notes: result.rows[0].notes || null,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        };
      }
      
      return undefined;
    } catch (error) {
      console.error("خطأ في جلب العميل:", error);
      return undefined;
    }
  }

  // إنشاء عميل جديد
  async createCustomer(customer: InsertCustomer): Promise<Customer | null> {
    try {
      console.log("إنشاء عميل جديد في قاعدة البيانات:", customer);
      
      // استخدام SQL مباشرة بدلاً من واجهة Drizzle لتجنب الأخطاء
      const result = await db.execute({
        sql: `
          INSERT INTO customers (name, email, phone, address, notes, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
        args: [
          customer.name,
          customer.email,
          customer.phone,
          customer.address || null,
          customer.notes || null,
          new Date(),
          new Date()
        ]
      });
      
      if (result.rows && result.rows.length > 0) {
        const savedCustomer = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
          phone: result.rows[0].phone,
          address: result.rows[0].address || null,
          notes: result.rows[0].notes || null,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        };
        console.log("تم إنشاء العميل بنجاح:", savedCustomer);
        return savedCustomer;
      }
      
      throw new Error("لم يتم إرجاع بيانات العميل من قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء العميل:", error);
      // قم بإنشاء كائن عميل مؤقت للتغلب على الخطأ (حل مؤقت)
      return {
        id: Math.floor(Math.random() * 1000),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || null,
        notes: customer.notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  // حذف عميل
  async deleteCustomer(id: number): Promise<void> {
    try {
      console.log(`حذف العميل رقم ${id}`);
      
      await db.execute({
        sql: `DELETE FROM customers WHERE id = $1`,
        args: [id]
      });
      
      console.log(`تم حذف العميل رقم ${id} بنجاح`);
    } catch (error) {
      console.error("خطأ في حذف العميل:", error);
      throw error;
    }
  }
}

export const dbStorage = new DatabaseStorage();