
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  users, products, sales, exchangeRates, expenseCategories, fileStorage,
  installments, installmentPayments, campaigns, campaignAnalytics,
  socialMediaAccounts, apiKeys, inventoryTransactions, expenses,
  suppliers, supplierTransactions, customers, appointments
} from "@shared/schema";
import type { 
  User, InsertUser, Product, Sale, ExchangeRate, ExpenseCategory, 
  FileStorage, InsertFileStorage, Installment, InsertInstallment,
  InstallmentPayment, InsertInstallmentPayment, Campaign, 
  InsertCampaign, CampaignAnalytics, InsertCampaignAnalytics,
  SocialMediaAccount, InsertSocialMediaAccount, ApiKey, InsertApiKey,
  InventoryTransaction, InsertInventoryTransaction, Expense, InsertExpense,
  Supplier, InsertSupplier, SupplierTransaction, InsertSupplierTransaction,
  Customer, InsertCustomer, Appointment, InsertAppointment
} from "@shared/schema";

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

  // تحديث المستخدم
  async updateUser(id: number, update: Partial<User>): Promise<User> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...update,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("خطأ في تحديث المستخدم:", error);
      throw error;
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

  // الحصول على منتج محدد
  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error("خطأ في جلب المنتج:", error);
      return undefined;
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

  // تحديث منتج
  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    try {
      const [updatedProduct] = await db
        .update(products)
        .set(update)
        .where(eq(products.id, id))
        .returning();
      return updatedProduct;
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      throw error;
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

  // إضافة تقسيط جديد
  async createInstallment(installment: Installment): Promise<Installment> {
    try {
      const [savedInstallment] = await db
        .insert(installments)
        .values(installment)
        .returning();
      return savedInstallment;
    } catch (error) {
      console.error("خطأ في حفظ التقسيط:", error);
      throw error;
    }
  }

  // الحصول على جميع التقسيطات
  async getInstallments(): Promise<Installment[]> {
    try {
      return await db.select().from(installments);
    } catch (error) {
      console.error("خطأ في جلب التقسيطات:", error);
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
      console.error("خطأ في جلب التقسيط:", error);
      return undefined;
    }
  }

  // تحديث تقسيط
  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> {
    try {
      const [updatedInstallment] = await db
        .update(installments)
        .set(update)
        .where(eq(installments.id, id))
        .returning();
      return updatedInstallment;
    } catch (error) {
      console.error("خطأ في تحديث التقسيط:", error);
      throw error;
    }
  }

  // إضافة دفعة تقسيط
  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> {
    try {
      const [savedPayment] = await db
        .insert(installmentPayments)
        .values(payment)
        .returning();
      return savedPayment;
    } catch (error) {
      console.error("خطأ في حفظ دفعة التقسيط:", error);
      throw error;
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
      console.error("خطأ في جلب دفعات التقسيط:", error);
      return [];
    }
  }

  // إضافة حملة تسويقية
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    try {
      const [savedCampaign] = await db
        .insert(campaigns)
        .values({
          ...campaign,
          status: "draft",
          createdAt: new Date()
        })
        .returning();
      return savedCampaign;
    } catch (error) {
      console.error("خطأ في إنشاء الحملة:", error);
      throw error;
    }
  }

  // الحصول على جميع الحملات
  async getCampaigns(): Promise<Campaign[]> {
    try {
      return await db.select().from(campaigns);
    } catch (error) {
      console.error("خطأ في جلب الحملات:", error);
      return [];
    }
  }

  // الحصول على حملة محددة
  async getCampaign(id: number): Promise<Campaign | undefined> {
    try {
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, id));
      return campaign;
    } catch (error) {
      console.error("خطأ في جلب الحملة:", error);
      return undefined;
    }
  }

  // تحديث حملة
  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    try {
      const [updatedCampaign] = await db
        .update(campaigns)
        .set(update)
        .where(eq(campaigns.id, id))
        .returning();
      return updatedCampaign;
    } catch (error) {
      console.error("خطأ في تحديث الحملة:", error);
      throw error;
    }
  }

  // إضافة تحليلات للحملة
  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
    try {
      const [savedAnalytics] = await db
        .insert(campaignAnalytics)
        .values(analytics)
        .returning();
      return savedAnalytics;
    } catch (error) {
      console.error("خطأ في إضافة تحليلات الحملة:", error);
      throw error;
    }
  }

  // الحصول على تحليلات الحملة
  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> {
    try {
      return await db
        .select()
        .from(campaignAnalytics)
        .where(eq(campaignAnalytics.campaignId, campaignId));
    } catch (error) {
      console.error("خطأ في جلب تحليلات الحملة:", error);
      return [];
    }
  }

  // إضافة حساب وسائل التواصل الاجتماعي
  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    try {
      const [savedAccount] = await db
        .insert(socialMediaAccounts)
        .values(account)
        .returning();
      return savedAccount;
    } catch (error) {
      console.error("خطأ في إضافة حساب وسائل التواصل:", error);
      throw error;
    }
  }

  // الحصول على حسابات وسائل التواصل الاجتماعي
  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    try {
      return await db
        .select()
        .from(socialMediaAccounts)
        .where(eq(socialMediaAccounts.userId, userId));
    } catch (error) {
      console.error("خطأ في جلب حسابات وسائل التواصل:", error);
      return [];
    }
  }

  // حذف حساب وسائل التواصل الاجتماعي
  async deleteSocialMediaAccount(id: number): Promise<void> {
    try {
      await db
        .delete(socialMediaAccounts)
        .where(eq(socialMediaAccounts.id, id));
    } catch (error) {
      console.error("خطأ في حذف حساب وسائل التواصل:", error);
      throw error;
    }
  }

  // إضافة مفاتيح API
  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {
    try {
      // نحتاج إلى التحقق إذا كان هناك مفاتيح موجودة بالفعل
      const existingKeys = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.userId, userId));

      if (existingKeys.length > 0) {
        await db
          .update(apiKeys)
          .set({ keys: JSON.stringify(keys) })
          .where(eq(apiKeys.userId, userId));
      } else {
        await db
          .insert(apiKeys)
          .values({
            userId,
            keys: JSON.stringify(keys),
            createdAt: new Date()
          });
      }
    } catch (error) {
      console.error("خطأ في حفظ مفاتيح API:", error);
      throw error;
    }
  }

  // الحصول على مفاتيح API
  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    try {
      const [keyRecord] = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.userId, userId));

      if (keyRecord && keyRecord.keys) {
        return JSON.parse(keyRecord.keys as string);
      }
      return null;
    } catch (error) {
      console.error("خطأ في جلب مفاتيح API:", error);
      return null;
    }
  }

  // نقل البيانات من التخزين المحلي إلى قاعدة البيانات
  async migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void> {
    return this.setApiKeys(userId, keys);
  }

  // إضافة حركة مخزون
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    try {
      const [savedTransaction] = await db
        .insert(inventoryTransactions)
        .values(transaction)
        .returning();
      return savedTransaction;
    } catch (error) {
      console.error("خطأ في إضافة حركة المخزون:", error);
      throw error;
    }
  }

  // الحصول على حركات المخزون
  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    try {
      return await db.select().from(inventoryTransactions);
    } catch (error) {
      console.error("خطأ في جلب حركات المخزون:", error);
      return [];
    }
  }

  // إضافة مصروف
  async createExpense(expense: InsertExpense): Promise<Expense> {
    try {
      const [savedExpense] = await db
        .insert(expenses)
        .values({
          ...expense,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "active"
        })
        .returning();
      return savedExpense;
    } catch (error) {
      console.error("خطأ في إضافة المصروف:", error);
      throw error;
    }
  }

  // الحصول على المصروفات
  async getExpenses(userId: number): Promise<Expense[]> {
    try {
      return await db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, userId));
    } catch (error) {
      console.error("خطأ في جلب المصروفات:", error);
      return [];
    }
  }

  // الحصول على مصروف محدد
  async getExpense(id: number): Promise<Expense | undefined> {
    try {
      const [expense] = await db
        .select()
        .from(expenses)
        .where(eq(expenses.id, id));
      return expense;
    } catch (error) {
      console.error("خطأ في جلب المصروف:", error);
      return undefined;
    }
  }

  // تحديث مصروف
  async updateExpense(id: number, update: Partial<Expense>): Promise<Expense> {
    try {
      const [updatedExpense] = await db
        .update(expenses)
        .set({
          ...update,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, id))
        .returning();
      return updatedExpense;
    } catch (error) {
      console.error("خطأ في تحديث المصروف:", error);
      throw error;
    }
  }

  // حذف مصروف
  async deleteExpense(id: number): Promise<void> {
    try {
      await db
        .delete(expenses)
        .where(eq(expenses.id, id));
    } catch (error) {
      console.error("خطأ في حذف المصروف:", error);
      throw error;
    }
  }

  // إضافة مورّد
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    try {
      const [savedSupplier] = await db
        .insert(suppliers)
        .values({
          ...supplier,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return savedSupplier;
    } catch (error) {
      console.error("خطأ في إضافة المورّد:", error);
      throw error;
    }
  }

  // الحصول على الموردين
  async getSuppliers(userId: number): Promise<Supplier[]> {
    try {
      return await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.userId, userId));
    } catch (error) {
      console.error("خطأ في جلب الموردين:", error);
      return [];
    }
  }

  // الحصول على مورّد محدد
  async getSupplier(id: number): Promise<Supplier | undefined> {
    try {
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, id));
      return supplier;
    } catch (error) {
      console.error("خطأ في جلب المورّد:", error);
      return undefined;
    }
  }

  // تحديث مورّد
  async updateSupplier(id: number, update: Partial<Supplier>): Promise<Supplier> {
    try {
      const [updatedSupplier] = await db
        .update(suppliers)
        .set({
          ...update,
          updatedAt: new Date()
        })
        .where(eq(suppliers.id, id))
        .returning();
      return updatedSupplier;
    } catch (error) {
      console.error("خطأ في تحديث المورّد:", error);
      throw error;
    }
  }

  // حذف مورّد
  async deleteSupplier(id: number): Promise<void> {
    try {
      await db
        .delete(suppliers)
        .where(eq(suppliers.id, id));
    } catch (error) {
      console.error("خطأ في حذف المورّد:", error);
      throw error;
    }
  }

  // إضافة معاملة مورّد
  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    try {
      const [savedTransaction] = await db
        .insert(supplierTransactions)
        .values({
          ...transaction,
          createdAt: new Date()
        })
        .returning();
      return savedTransaction;
    } catch (error) {
      console.error("خطأ في إضافة معاملة المورّد:", error);
      throw error;
    }
  }

  // الحصول على معاملات المورّد
  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    try {
      return await db
        .select()
        .from(supplierTransactions)
        .where(eq(supplierTransactions.supplierId, supplierId));
    } catch (error) {
      console.error("خطأ في جلب معاملات المورّد:", error);
      return [];
    }
  }

  // إضافة عميل
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    try {
      const [savedCustomer] = await db
        .insert(customers)
        .values({
          ...customer,
          createdAt: new Date()
        })
        .returning();
      return savedCustomer;
    } catch (error) {
      console.error("خطأ في إضافة العميل:", error);
      throw error;
    }
  }

  // البحث عن العملاء
  async searchCustomers(search?: string): Promise<Customer[]> {
    try {
      // هنا نحتاج تنفيذ البحث بطريقة مناسبة
      // في حالة عدم تنفيذها، نعيد جميع العملاء
      const allCustomers = await db.select().from(customers);
      if (!search) return allCustomers;

      const searchLower = search.toLowerCase();
      return allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error("خطأ في البحث عن العملاء:", error);
      return [];
    }
  }

  // الحصول على عميل محدد
  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, id));
      return customer;
    } catch (error) {
      console.error("خطأ في جلب العميل:", error);
      return undefined;
    }
  }

  // الحصول على مبيعات العميل
  async getCustomerSales(customerId: number): Promise<Sale[]> {
    try {
      return await db
        .select()
        .from(sales)
        .where(eq(sales.customerId, customerId));
    } catch (error) {
      console.error("خطأ في جلب مبيعات العميل:", error);
      return [];
    }
  }

  // حذف عميل
  async deleteCustomer(id: number): Promise<void> {
    try {
      await db
        .delete(customers)
        .where(eq(customers.id, id));
    } catch (error) {
      console.error("خطأ في حذف العميل:", error);
      throw error;
    }
  }

  // إضافة موعد
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    try {
      const [savedAppointment] = await db
        .insert(appointments)
        .values({
          ...appointment,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return savedAppointment;
    } catch (error) {
      console.error("خطأ في إضافة الموعد:", error);
      throw error;
    }
  }

  // الحصول على مواعيد العميل
  async getCustomerAppointments(customerId: number): Promise<Appointment[]> {
    try {
      return await db
        .select()
        .from(appointments)
        .where(eq(appointments.customerId, customerId))
        .orderBy(desc(appointments.date));
    } catch (error) {
      console.error("خطأ في جلب مواعيد العميل:", error);
      return [];
    }
  }

  // تحديث موعد
  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    try {
      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          ...update,
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id))
        .returning();
      return updatedAppointment;
    } catch (error) {
      console.error("خطأ في تحديث الموعد:", error);
      throw error;
    }
  }

  // حذف موعد
  async deleteAppointment(id: number): Promise<void> {
    try {
      await db
        .delete(appointments)
        .where(eq(appointments.id, id));
    } catch (error) {
      console.error("خطأ في حذف الموعد:", error);
      throw error;
    }
  }
}

export const dbStorage = new DatabaseStorage();
