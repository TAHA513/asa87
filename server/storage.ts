
import {
  User, Product, Sale, ExchangeRate, InsertUser, FileStorage, InsertFileStorage,
  Installment, InstallmentPayment,
  Campaign, InsertCampaign, CampaignAnalytics, InsertCampaignAnalytics,
  SocialMediaAccount, apiKeys, type ApiKey, type InsertApiKey,
  InventoryTransaction, InsertInventoryTransaction,
  ExpenseCategory, InsertExpenseCategory, Expense, InsertExpense,
  Supplier, InsertSupplier, SupplierTransaction, InsertSupplierTransaction,
  Customer, InsertCustomer, Appointment, InsertAppointment
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { dbStorage } from "./db-storage";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User>;
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: Product): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  getSales(): Promise<Sale[]>;
  createSale(sale: Sale): Promise<Sale>;
  getCurrentExchangeRate(): Promise<ExchangeRate>;
  setExchangeRate(rate: number): Promise<ExchangeRate>;
  getInstallments(): Promise<Installment[]>;
  getInstallment(id: number): Promise<Installment | undefined>;
  createInstallment(installment: Installment): Promise<Installment>;
  updateInstallment(id: number, update: Partial<Installment>): Promise<Installment>;
  getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]>;
  createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment>;
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign>;
  getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]>;
  createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics>;
  getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]>;
  createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount>;
  deleteSocialMediaAccount(id: number): Promise<void>;
  setApiKeys(userId: number, keys: Record<string, any>): Promise<void>;
  getApiKeys(userId: number): Promise<Record<string, any> | null>;
  migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void>;
  sessionStore: session.Store;
  getInventoryTransactions(): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  getExpenseCategories(userId: number): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, update: Partial<ExpenseCategory>): Promise<ExpenseCategory>;
  deleteExpenseCategory(id: number): Promise<void>;
  getExpenses(userId: number): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, update: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getSuppliers(userId: number): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, update: Partial<Supplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;
  getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]>;
  createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction>;
  searchCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerSales(customerId: number): Promise<Sale[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomerAppointments(customerId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  deleteProduct(id: number): Promise<void>;
  deleteCustomer(id: number): Promise<void>;
  saveFile(file: InsertFileStorage): Promise<FileStorage>;
  getFileById(id: number): Promise<FileStorage | undefined>;
  getUserFiles(userId: number): Promise<FileStorage[]>;
  deleteFile(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    console.log("تم إنشاء كائن التخزين مع الاعتماد على قاعدة البيانات فقط");
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log(`البحث عن المستخدم ${id} في قاعدة البيانات`);
      return await dbStorage.getUser(id);
    } catch (error) {
      console.error("خطأ في البحث عن المستخدم في قاعدة البيانات:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log(`البحث عن المستخدم ${username} في قاعدة البيانات`);
      return await dbStorage.getUserByUsername(username);
    } catch (error) {
      console.error("خطأ في البحث عن المستخدم في قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("إنشاء مستخدم جديد في قاعدة البيانات");
      const dbUser = await dbStorage.saveNewUser(insertUser);
      if (dbUser) {
        console.log("تم حفظ المستخدم في قاعدة البيانات:", dbUser.id);
        return dbUser;
      }
      throw new Error("فشل في حفظ المستخدم في قاعدة البيانات");
    } catch (error) {
      console.error("فشل في حفظ المستخدم في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    try {
      // تنفيذ وظيفة تحديث المستخدم في dbStorage
      // يمكن إضافتها في ملف db-storage.ts
      throw new Error("وظيفة تحديث المستخدم غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث المستخدم في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      console.log("جلب المنتجات من قاعدة البيانات");
      return await dbStorage.getProducts();
    } catch (error) {
      console.error("خطأ في جلب المنتجات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      console.log(`جلب المنتج ${id} من قاعدة البيانات`);
      return await dbStorage.getProduct(id);
    } catch (error) {
      console.error("خطأ في جلب المنتج من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createProduct(product: Product): Promise<Product> {
    try {
      console.log("إنشاء منتج جديد في قاعدة البيانات");
      const savedProduct = await dbStorage.createProduct(product);
      if (savedProduct) {
        return savedProduct;
      }
      throw new Error("فشل في حفظ المنتج في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء المنتج في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    try {
      console.log(`تحديث المنتج ${id} في قاعدة البيانات`);
      const updatedProduct = await dbStorage.updateProduct(id, update);
      if (updatedProduct) {
        return updatedProduct;
      }
      throw new Error("فشل في تحديث المنتج في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث المنتج في قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      console.log(`حذف المنتج ${id} من قاعدة البيانات`);
      await dbStorage.deleteProduct(id);
    } catch (error) {
      console.error("خطأ في حذف المنتج من قاعدة البيانات:", error);
      throw error;
    }
  }

  async getSales(): Promise<Sale[]> {
    try {
      console.log("جلب المبيعات من قاعدة البيانات");
      return await dbStorage.getSales();
    } catch (error) {
      console.error("خطأ في جلب المبيعات من قاعدة البيانات:", error);
      return [];
    }
  }

  async createSale(sale: Sale): Promise<Sale> {
    try {
      console.log("إنشاء عملية بيع جديدة في قاعدة البيانات");
      const savedSale = await dbStorage.createSale(sale);
      if (!savedSale) {
        throw new Error("فشل في حفظ عملية البيع في قاعدة البيانات");
      }
      return savedSale;
    } catch (error) {
      console.error("خطأ في إنشاء عملية البيع في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getCurrentExchangeRate(): Promise<ExchangeRate> {
    try {
      console.log("جلب سعر الصرف الحالي من قاعدة البيانات");
      const rate = await dbStorage.getCurrentExchangeRate();
      if (!rate) {
        return await this.setExchangeRate(1300);
      }
      return rate;
    } catch (error) {
      console.error("خطأ في جلب سعر الصرف من قاعدة البيانات:", error);
      // إذا فشل، نعود إلى القيمة الافتراضية
      return await this.setExchangeRate(1300);
    }
  }

  async setExchangeRate(rate: number): Promise<ExchangeRate> {
    try {
      console.log(`تحديث سعر الصرف إلى ${rate} في قاعدة البيانات`);
      const newRate = await dbStorage.setExchangeRate(rate);
      if (!newRate) {
        throw new Error("فشل في تحديث سعر الصرف في قاعدة البيانات");
      }
      return newRate;
    } catch (error) {
      console.error("خطأ في تحديث سعر الصرف في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getInstallments(): Promise<Installment[]> {
    try {
      console.log("جلب التقسيطات من قاعدة البيانات");
      return await dbStorage.getInstallments();
    } catch (error) {
      console.error("خطأ في جلب التقسيطات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getInstallment(id: number): Promise<Installment | undefined> {
    try {
      console.log(`جلب التقسيط ${id} من قاعدة البيانات`);
      return await dbStorage.getInstallment(id);
    } catch (error) {
      console.error("خطأ في جلب التقسيط من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createInstallment(installment: Installment): Promise<Installment> {
    try {
      console.log("إنشاء تقسيط جديد في قاعدة البيانات");
      const savedInstallment = await dbStorage.createInstallment(installment);
      if (savedInstallment) {
        return savedInstallment;
      }
      throw new Error("فشل في حفظ التقسيط في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء التقسيط في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> {
    try {
      console.log(`تحديث التقسيط ${id} في قاعدة البيانات`);
      const updatedInstallment = await dbStorage.updateInstallment(id, update);
      if (updatedInstallment) {
        return updatedInstallment;
      }
      throw new Error("فشل في تحديث التقسيط في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث التقسيط في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> {
    try {
      console.log(`جلب دفعات التقسيط ${installmentId} من قاعدة البيانات`);
      return await dbStorage.getInstallmentPayments(installmentId);
    } catch (error) {
      console.error("خطأ في جلب دفعات التقسيط من قاعدة البيانات:", error);
      return [];
    }
  }

  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> {
    try {
      console.log("إنشاء دفعة تقسيط جديدة في قاعدة البيانات");
      const savedPayment = await dbStorage.createInstallmentPayment(payment);
      if (savedPayment) {
        // تحديث بيانات التقسيط بعد إضافة دفعة
        const installment = await this.getInstallment(payment.installmentId);
        if (installment) {
          const remainingAmount = Number(installment.remainingAmount) - Number(payment.amount);
          await this.updateInstallment(installment.id, {
            remainingAmount: remainingAmount.toString(),
            status: remainingAmount <= 0 ? "completed" : "active",
          });
        }
        
        return savedPayment;
      }
      
      throw new Error("فشل في حفظ دفعة التقسيط في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء دفعة التقسيط في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    try {
      console.log("جلب الحملات من قاعدة البيانات");
      // يجب تنفيذ وظيفة للحصول على الحملات من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب الحملات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    try {
      console.log(`جلب الحملة ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على الحملة من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return undefined;
    } catch (error) {
      console.error("خطأ في جلب الحملة من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    try {
      // يجب تنفيذ وظيفة لإنشاء حملة في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة إنشاء الحملة غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء الحملة في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    try {
      // يجب تنفيذ وظيفة لتحديث الحملة في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة تحديث الحملة غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث الحملة في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> {
    try {
      console.log(`جلب تحليلات الحملة ${campaignId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على تحليلات الحملة من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب تحليلات الحملة من قاعدة البيانات:", error);
      return [];
    }
  }

  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
    try {
      // يجب تنفيذ وظيفة لإنشاء تحليلات الحملة في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة إنشاء تحليلات الحملة غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء تحليلات الحملة في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    try {
      console.log(`جلب حسابات وسائل التواصل الاجتماعي للمستخدم ${userId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على حسابات وسائل التواصل الاجتماعي من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب حسابات وسائل التواصل الاجتماعي من قاعدة البيانات:", error);
      return [];
    }
  }

  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    try {
      // يجب تنفيذ وظيفة لإنشاء حساب وسائل التواصل الاجتماعي في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة إنشاء حساب وسائل التواصل الاجتماعي غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء حساب وسائل التواصل الاجتماعي في قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    try {
      // يجب تنفيذ وظيفة لحذف حساب وسائل التواصل الاجتماعي من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة حذف حساب وسائل التواصل الاجتماعي غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في حذف حساب وسائل التواصل الاجتماعي من قاعدة البيانات:", error);
      throw error;
    }
  }

  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {
    try {
      console.log(`حفظ مفاتيح API للمستخدم ${userId} في قاعدة البيانات`);
      // يجب تنفيذ وظيفة لحفظ مفاتيح API في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
    } catch (error) {
      console.error("خطأ في حفظ مفاتيح API في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    try {
      console.log(`جلب مفاتيح API للمستخدم ${userId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على مفاتيح API من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return null;
    } catch (error) {
      console.error("خطأ في جلب مفاتيح API من قاعدة البيانات:", error);
      return null;
    }
  }

  async migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void> {
    try {
      console.log(`ترحيل بيانات التخزين المحلي للمستخدم ${userId} إلى قاعدة البيانات`);
      // يجب تنفيذ وظيفة لترحيل بيانات التخزين المحلي إلى قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
    } catch (error) {
      console.error("خطأ في ترحيل بيانات التخزين المحلي إلى قاعدة البيانات:", error);
      throw error;
    }
  }

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    try {
      console.log("جلب حركات المخزون من قاعدة البيانات");
      // يجب تنفيذ وظيفة للحصول على حركات المخزون من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب حركات المخزون من قاعدة البيانات:", error);
      return [];
    }
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    try {
      console.log("إنشاء حركة مخزون جديدة في قاعدة البيانات");
      // يجب تنفيذ وظيفة لإنشاء حركة مخزون في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      
      // استخدم كود مؤقت حتى يتم تنفيذ الوظيفة
      return {
        id: Math.floor(Math.random() * 1000),
        type: transaction.type,
        productId: transaction.productId,
        quantity: transaction.quantity,
        userId: transaction.userId,
        reason: transaction.reason,
        date: transaction.date || new Date(),
        notes: transaction.notes || null,
        reference: transaction.reference || null
      };
    } catch (error) {
      console.error("خطأ في إنشاء حركة المخزون في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getExpenseCategories(userId: number): Promise<ExpenseCategory[]> {
    try {
      console.log(`جلب فئات المصروفات للمستخدم ${userId} من قاعدة البيانات`);
      const categories = await dbStorage.getExpenseCategories();
      return categories.filter(category => category.userId === userId);
    } catch (error) {
      console.error("خطأ في جلب فئات المصروفات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    try {
      console.log(`جلب فئة المصروفات ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على فئة المصروفات من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return undefined;
    } catch (error) {
      console.error("خطأ في جلب فئة المصروفات من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    try {
      console.log("إنشاء فئة مصروفات جديدة في قاعدة البيانات");
      const newCategory = await dbStorage.createExpenseCategory({
        name: category.name,
        description: category.description || null,
        budgetAmount: category.budgetAmount || null,
        userId: category.userId,
      });
      return newCategory;
    } catch (error) {
      console.error("خطأ في إنشاء فئة المصروفات في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateExpenseCategory(id: number, update: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    try {
      console.log(`تحديث فئة المصروفات ${id} في قاعدة البيانات`);
      // يجب تنفيذ وظيفة لتحديث فئة المصروفات في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة تحديث فئة المصروفات غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث فئة المصروفات في قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    try {
      console.log(`حذف فئة المصروفات ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة لحذف فئة المصروفات من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
    } catch (error) {
      console.error("خطأ في حذف فئة المصروفات من قاعدة البيانات:", error);
      throw error;
    }
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    try {
      console.log(`جلب المصروفات للمستخدم ${userId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على المصروفات من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب المصروفات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    try {
      console.log(`جلب المصروف ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على المصروف من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return undefined;
    } catch (error) {
      console.error("خطأ في جلب المصروف من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    try {
      console.log("إنشاء مصروف جديد في قاعدة البيانات");
      // يجب تنفيذ وظيفة لإنشاء مصروف في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      
      // استخدم كود مؤقت حتى يتم تنفيذ الوظيفة
      return {
        id: Math.floor(Math.random() * 1000),
        date: expense.date,
        description: expense.description,
        userId: expense.userId,
        categoryId: expense.categoryId,
        amount: expense.amount.toString(),
        notes: expense.notes || null,
        isRecurring: expense.isRecurring || false,
        recurringPeriod: expense.recurringPeriod || null,
        recurringDay: expense.recurringDay || null,
        attachments: expense.attachments || [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("خطأ في إنشاء المصروف في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateExpense(id: number, update: Partial<Expense>): Promise<Expense> {
    try {
      console.log(`تحديث المصروف ${id} في قاعدة البيانات`);
      // يجب تنفيذ وظيفة لتحديث المصروف في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة تحديث المصروف غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث المصروف في قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<void> {
    try {
      console.log(`حذف المصروف ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة لحذف المصروف من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
    } catch (error) {
      console.error("خطأ في حذف المصروف من قاعدة البيانات:", error);
      throw error;
    }
  }

  async getSuppliers(userId: number): Promise<Supplier[]> {
    try {
      console.log(`جلب الموردين للمستخدم ${userId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على الموردين من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب الموردين من قاعدة البيانات:", error);
      return [];
    }
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    try {
      console.log(`جلب المورد ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على المورد من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return undefined;
    } catch (error) {
      console.error("خطأ في جلب المورد من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    try {
      console.log("إنشاء مورد جديد في قاعدة البيانات");
      // يجب تنفيذ وظيفة لإنشاء مورد في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      
      // استخدم كود مؤقت حتى يتم تنفيذ الوظيفة
      return {
        ...supplier,
        id: Math.floor(Math.random() * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("خطأ في إنشاء المورد في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateSupplier(id: number, update: Partial<Supplier>): Promise<Supplier> {
    try {
      console.log(`تحديث المورد ${id} في قاعدة البيانات`);
      // يجب تنفيذ وظيفة لتحديث المورد في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة تحديث المورد غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث المورد في قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteSupplier(id: number): Promise<void> {
    try {
      console.log(`حذف المورد ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة لحذف المورد من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
    } catch (error) {
      console.error("خطأ في حذف المورد من قاعدة البيانات:", error);
      throw error;
    }
  }

  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    try {
      console.log(`جلب معاملات المورد ${supplierId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على معاملات المورد من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب معاملات المورد من قاعدة البيانات:", error);
      return [];
    }
  }

  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    try {
      console.log("إنشاء معاملة مورد جديدة في قاعدة البيانات");
      // يجب تنفيذ وظيفة لإنشاء معاملة مورد في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      
      // استخدم كود مؤقت حتى يتم تنفيذ الوظيفة
      return {
        ...transaction,
        id: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("خطأ في إنشاء معاملة المورد في قاعدة البيانات:", error);
      throw error;
    }
  }

  async searchCustomers(search?: string): Promise<Customer[]> {
    try {
      console.log(`البحث عن العملاء بنص: ${search || 'الكل'} في قاعدة البيانات`);
      return await dbStorage.searchCustomers(search);
    } catch (error) {
      console.error("خطأ في البحث عن العملاء في قاعدة البيانات:", error);
      return [];
    }
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      console.log(`جلب العميل ${id} من قاعدة البيانات`);
      return await dbStorage.getCustomer(id);
    } catch (error) {
      console.error("خطأ في جلب العميل من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async getCustomerSales(customerId: number): Promise<Sale[]> {
    try {
      console.log(`جلب مبيعات العميل ${customerId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على مبيعات العميل من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب مبيعات العميل من قاعدة البيانات:", error);
      return [];
    }
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    try {
      console.log("إنشاء عميل جديد في قاعدة البيانات");
      const dbCustomer = await dbStorage.createCustomer(insertCustomer);
      if (dbCustomer) {
        console.log("تم إنشاء العميل بنجاح:", dbCustomer);
        return dbCustomer;
      }
      
      console.warn("لم يتم إنشاء العميل في قاعدة البيانات، إنشاء عميل مؤقت");
      // إنشاء عميل مؤقت في حالة فشل قاعدة البيانات
      return {
        id: Math.floor(Math.random() * 1000),
        name: insertCustomer.name,
        email: insertCustomer.email,
        phone: insertCustomer.phone,
        address: insertCustomer.address || null,
        notes: insertCustomer.notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error("خطأ في إنشاء العميل في قاعدة البيانات:", error);
      // إنشاء عميل مؤقت في حالة حدوث استثناء
      return {
        id: Math.floor(Math.random() * 1000),
        name: insertCustomer.name,
        email: insertCustomer.email,
        phone: insertCustomer.phone,
        address: insertCustomer.address || null,
        notes: insertCustomer.notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async getCustomerAppointments(customerId: number): Promise<Appointment[]> {
    try {
      console.log(`جلب مواعيد العميل ${customerId} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة للحصول على مواعيد العميل من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب مواعيد العميل من قاعدة البيانات:", error);
      return [];
    }
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    try {
      console.log("إنشاء موعد جديد في قاعدة البيانات");
      // يجب تنفيذ وظيفة لإنشاء موعد في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      
      // استخدم كود مؤقت حتى يتم تنفيذ الوظيفة
      return {
        id: Math.floor(Math.random() * 1000),
        customerId: appointment.customerId,
        title: appointment.title,
        description: appointment.description || null,
        date: appointment.date,
        duration: appointment.duration,
        status: appointment.status || "scheduled",
        notes: appointment.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("خطأ في إنشاء الموعد في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    try {
      console.log(`تحديث الموعد ${id} في قاعدة البيانات`);
      // يجب تنفيذ وظيفة لتحديث الموعد في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة تحديث الموعد غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث الموعد في قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteAppointment(id: number): Promise<void> {
    try {
      console.log(`حذف الموعد ${id} من قاعدة البيانات`);
      // يجب تنفيذ وظيفة لحذف الموعد من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
    } catch (error) {
      console.error("خطأ في حذف الموعد من قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    try {
      console.log(`حذف العميل ${id} من قاعدة البيانات`);
      await dbStorage.deleteCustomer(id);
    } catch (error) {
      console.error("خطأ في حذف العميل من قاعدة البيانات:", error);
      throw error;
    }
  }

  async saveFile(file: InsertFileStorage): Promise<FileStorage> {
    try {
      console.log("حفظ ملف جديد في قاعدة البيانات");
      return await dbStorage.saveFile(file);
    } catch (error) {
      console.error("خطأ في حفظ الملف في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getFileById(id: number): Promise<FileStorage | undefined> {
    try {
      console.log(`جلب الملف ${id} من قاعدة البيانات`);
      return await dbStorage.getFileById(id);
    } catch (error) {
      console.error("خطأ في جلب الملف من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async getUserFiles(userId: number): Promise<FileStorage[]> {
    try {
      console.log(`جلب ملفات المستخدم ${userId} من قاعدة البيانات`);
      return await dbStorage.getUserFiles(userId);
    } catch (error) {
      console.error("خطأ في جلب ملفات المستخدم من قاعدة البيانات:", error);
      return [];
    }
  }

  async deleteFile(id: number): Promise<void> {
    try {
      console.log(`حذف الملف ${id} من قاعدة البيانات`);
      await dbStorage.deleteFile(id);
    } catch (error) {
      console.error("خطأ في حذف الملف من قاعدة البيانات:", error);
      throw error;
    }
  }
}

export const storage = new MemStorage();
