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
  // نستخدم قاعدة بيانات فقط بدون تخزين محلي
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      return await dbStorage.getUser(id);
    } catch (error) {
      console.error("خطأ في البحث عن المستخدم في قاعدة البيانات:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await dbStorage.getUserByUsername(username);
    } catch (error) {
      console.error("خطأ في البحث عن المستخدم في قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
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
      // هنا نحتاج إلى إضافة دالة updateUser في dbStorage
      const user = await dbStorage.getUser(id);
      if (!user) throw new Error("User not found");
      
      // تنفيذ مؤقت حتى يتم تنفيذ الدالة في dbStorage
      return { ...user, ...update, updatedAt: new Date() };
    } catch (error) {
      console.error("خطأ في تحديث المستخدم:", error);
      throw error;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return await dbStorage.getProducts();
    } catch (error) {
      console.error("خطأ في جلب المنتجات:", error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      return await dbStorage.getProduct(id);
    } catch (error) {
      console.error("خطأ في جلب المنتج:", error);
      return undefined;
    }
  }

  async createProduct(product: Product): Promise<Product> {
    try {
      const savedProduct = await dbStorage.createProduct(product);
      if (savedProduct) {
        return savedProduct;
      }
      throw new Error("فشل في حفظ المنتج");
    } catch (error) {
      console.error("خطأ في إنشاء المنتج:", error);
      throw error;
    }
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    try {
      const updatedProduct = await dbStorage.updateProduct(id, update);
      if (updatedProduct) {
        return updatedProduct;
      }
      throw new Error("فشل في تحديث المنتج");
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await dbStorage.deleteProduct(id);
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
      throw error;
    }
  }

  async getSales(): Promise<Sale[]> {
    return await dbStorage.getSales();
  }

  async createSale(sale: Sale): Promise<Sale> {
    const savedSale = await dbStorage.createSale(sale);
    if (!savedSale) {
      throw new Error("فشل في حفظ عملية البيع");
    }
    return savedSale;
  }

  async getCurrentExchangeRate(): Promise<ExchangeRate> {
    const rate = await dbStorage.getCurrentExchangeRate();
    if (!rate) {
      return await this.setExchangeRate(1300);
    }
    return rate;
  }

  async setExchangeRate(rate: number): Promise<ExchangeRate> {
    const newRate = await dbStorage.setExchangeRate(rate);
    if (!newRate) {
      throw new Error("فشل في تحديث سعر الصرف");
    }
    return newRate;
  }

  async getInstallments(): Promise<Installment[]> {
    return await dbStorage.getInstallments();
  }

  async getInstallment(id: number): Promise<Installment | undefined> {
    return await dbStorage.getInstallment(id);
  }

  async createInstallment(installment: Installment): Promise<Installment> {
    return await dbStorage.createInstallment(installment);
  }

  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> {
    return await dbStorage.updateInstallment(id, update);
  }

  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> {
    return await dbStorage.getInstallmentPayments(installmentId);
  }

  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> {
    const newPayment = await dbStorage.createInstallmentPayment(payment);
    const installment = await this.getInstallment(payment.installmentId);
    if (installment) {
      const remainingAmount = Number(installment.remainingAmount) - Number(payment.amount);
      await this.updateInstallment(installment.id, {
        remainingAmount: remainingAmount.toString(),
        status: remainingAmount <= 0 ? "completed" : "active",
      });
    }
    return newPayment;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await dbStorage.getCampaigns();
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return await dbStorage.getCampaign(id);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    return await dbStorage.createCampaign(campaign);
  }

  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    return await dbStorage.updateCampaign(id, update);
  }

  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> {
    return await dbStorage.getCampaignAnalytics(campaignId);
  }

  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
    return await dbStorage.createCampaignAnalytics(analytics);
  }

  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    return await dbStorage.getSocialMediaAccounts(userId);
  }

  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    return await dbStorage.createSocialMediaAccount(account);
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    await dbStorage.deleteSocialMediaAccount(id);
  }

  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {
    await dbStorage.setApiKeys(userId, keys);
  }

  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    return await dbStorage.getApiKeys(userId);
  }

  async migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void> {
    await dbStorage.migrateLocalStorageToDb(userId, keys);
  }

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return await dbStorage.getInventoryTransactions();
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    return await dbStorage.createInventoryTransaction(transaction);
  }


  async getExpenseCategories(userId: number): Promise<ExpenseCategory[]> {
    try {
      const categories = await dbStorage.getExpenseCategories();
      return categories.filter(category => category.userId === userId);
    } catch (error) {
      console.error("خطأ في جلب فئات المصروفات:", error);
      return [];
    }
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    // استخدام الدالة من dbStorage عندما تصبح متاحة
    try {
      // يمكن استخدام getExpenseCategories ثم البحث عن الفئة بالمعرف
      const categories = await dbStorage.getExpenseCategories();
      return categories.find(category => category.id === id);
    } catch (error) {
      console.error("خطأ في جلب فئة المصروفات:", error);
      return undefined;
    }
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    try {
      return await dbStorage.createExpenseCategory({
        name: category.name,
        description: category.description || null,
        budgetAmount: category.budgetAmount || null,
        userId: category.userId,
      });
    } catch (error) {
      console.error("خطأ في إنشاء فئة المصروفات:", error);
      throw error;
    }
  }

  async updateExpenseCategory(id: number, update: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    try {
      // استخدام getExpenseCategory ثم تحديث الفئة
      const category = await this.getExpenseCategory(id);
      if (!category) throw new Error("فئة المصروفات غير موجودة");
      
      // تنفيذ مؤقت حتى إضافة الدالة في dbStorage
      return {
        ...category,
        ...update,
        budgetAmount: update.budgetAmount?.toString() || category.budgetAmount
      };
    } catch (error) {
      console.error("خطأ في تحديث فئة المصروفات:", error);
      throw error;
    }
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    try {
      // تنفيذ مؤقت حتى إضافة الدالة في dbStorage
      // await dbStorage.deleteExpenseCategory(id);
    } catch (error) {
      console.error("خطأ في حذف فئة المصروفات:", error);
      throw error;
    }
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    return await dbStorage.getExpenses(userId);
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return await dbStorage.getExpense(id);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    return await dbStorage.createExpense(expense);
  }

  async updateExpense(id: number, update: Partial<Expense>): Promise<Expense> {
    return await dbStorage.updateExpense(id, update);
  }

  async deleteExpense(id: number): Promise<void> {
    await dbStorage.deleteExpense(id);
  }

  async getSuppliers(userId: number): Promise<Supplier[]> {
    return await dbStorage.getSuppliers(userId);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return await dbStorage.getSupplier(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    return await dbStorage.createSupplier(supplier);
  }

  async updateSupplier(id: number, update: Partial<Supplier>): Promise<Supplier> {
    return await dbStorage.updateSupplier(id, update);
  }

  async deleteSupplier(id: number): Promise<void> {
    await dbStorage.deleteSupplier(id);
  }

  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    return await dbStorage.getSupplierTransactions(supplierId);
  }

  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    return await dbStorage.createSupplierTransaction(transaction);
  }

  async searchCustomers(search?: string): Promise<Customer[]> {
    return await dbStorage.searchCustomers(search);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return await dbStorage.getCustomer(id);
  }

  async getCustomerSales(customerId: number): Promise<Sale[]> {
    return await dbStorage.getCustomerSales(customerId);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    return await dbStorage.createCustomer(insertCustomer);
  }

  async getCustomerAppointments(customerId: number): Promise<Appointment[]> {
    return await dbStorage.getCustomerAppointments(customerId);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    return await dbStorage.createAppointment(appointment);
  }

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    return await dbStorage.updateAppointment(id, update);
  }

  async deleteAppointment(id: number): Promise<void> {
    await dbStorage.deleteAppointment(id);
  }

  async deleteCustomer(id: number): Promise<void> {
    await dbStorage.deleteCustomer(id);
  }

  async saveFile(file: InsertFileStorage): Promise<FileStorage> {
    try {
      return await dbStorage.saveFile(file);
    } catch (error) {
      console.error("خطأ في حفظ الملف:", error);
      throw error;
    }
  }

  async getFileById(id: number): Promise<FileStorage | undefined> {
    try {
      return await dbStorage.getFileById(id);
    } catch (error) {
      console.error("خطأ في جلب الملف:", error);
      return undefined;
    }
  }

  async getUserFiles(userId: number): Promise<FileStorage[]> {
    try {
      return await dbStorage.getUserFiles(userId);
    } catch (error) {
      console.error("خطأ في جلب ملفات المستخدم:", error);
      return [];
    }
  }

  async deleteFile(id: number): Promise<void> {
    try {
      await dbStorage.deleteFile(id);
    } catch (error) {
      console.error("خطأ في حذف الملف:", error);
      throw error;
    }
  }
}

export const storage = new MemStorage();