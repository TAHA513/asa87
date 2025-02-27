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
  private users: Map<number, User> = new Map();
  private products: Map<number, Product> = new Map();
  private sales: Map<number, Sale> = new Map();
  private exchangeRates: Map<number, ExchangeRate> = new Map();
  private installments: Map<number, Installment> = new Map();
  private installmentPayments: Map<number, InstallmentPayment> = new Map();
  private campaigns: Map<number, Campaign> = new Map();
  private campaignAnalytics: Map<number, CampaignAnalytics> = new Map();
  private socialMediaAccounts: Map<number, SocialMediaAccount> = new Map();
  private apiKeys: Map<number, Record<string, any>> = new Map();
  private inventoryTransactions: Map<number, InventoryTransaction> = new Map();
  private expenseCategories: Map<number, ExpenseCategory> = new Map();
  private expenses: Map<number, Expense> = new Map();
  private suppliers: Map<number, Supplier> = new Map();
  private supplierTransactions: Map<number, SupplierTransaction> = new Map();
  private customers: Map<number, Customer> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private files: Map<number, FileStorage> = new Map();
  private currentId: number = 1;
  sessionStore: session.Store;

  constructor() {
    this.clearAllData();
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  private clearAllData() {
    this.users.clear();
    this.products.clear();
    this.sales.clear();
    this.exchangeRates.clear();
    this.installments.clear();
    this.installmentPayments.clear();
    this.campaigns.clear();
    this.campaignAnalytics.clear();
    this.socialMediaAccounts.clear();
    this.apiKeys.clear();
    this.inventoryTransactions.clear();
    this.expenseCategories.clear();
    this.expenses.clear();
    this.suppliers.clear();
    this.supplierTransactions.clear();
    this.customers.clear();
    this.appointments.clear();
    this.files.clear();
    this.currentId = 1;
  }

  async migrateAllDataToDatabase(): Promise<void> {
    try {
      for (const user of this.users.values()) {
        try {
          await dbStorage.saveNewUser({
            username: user.username,
            password: user.password,
            fullName: user.fullName,
            role: user.role,
            email: user.email,
            phone: user.phone,
            permissions: user.permissions,
          });
        } catch (error) {
          console.error("خطأ في ترحيل بيانات المستخدم:", error);
        }
      }

      for (const installment of this.installments.values()) {
        try {
          await dbStorage.createInstallment(installment);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات التقسيط:", error);
        }
      }

      for (const payment of this.installmentPayments.values()) {
        try {
          await dbStorage.createInstallmentPayment(payment);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات دفعات التقسيط:", error);
        }
      }

      for (const campaign of this.campaigns.values()) {
        try {
          await dbStorage.createCampaign({
            name: campaign.name,
            description: campaign.description,
            platforms: campaign.platforms,
            budget: Number(campaign.budget),
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            userId: campaign.userId,
          });
        } catch (error) {
          console.error("خطأ في ترحيل بيانات الحملات:", error);
        }
      }

      for (const analytics of this.campaignAnalytics.values()) {
        try {
          await dbStorage.createCampaignAnalytics({
            campaignId: analytics.campaignId,
            platform: analytics.platform,
            impressions: analytics.impressions,
            clicks: analytics.clicks,
            conversions: analytics.conversions,
            spend: Number(analytics.spend),
            date: analytics.date,
          });
        } catch (error) {
          console.error("خطأ في ترحيل بيانات تحليلات الحملات:", error);
        }
      }

      for (const account of this.socialMediaAccounts.values()) {
        try {
          await dbStorage.createSocialMediaAccount(account);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات حسابات التواصل الاجتماعي:", error);
        }
      }

      for (const [userId, keys] of this.apiKeys.entries()) {
        try {
          await dbStorage.setApiKeys(userId, keys);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات مفاتيح API:", error);
        }
      }

      for (const transaction of this.inventoryTransactions.values()) {
        try {
          await dbStorage.createInventoryTransaction(transaction);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات حركات المخزون:", error);
        }
      }

      for (const expense of this.expenses.values()) {
        try {
          await dbStorage.createExpense(expense);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات المصروفات:", error);
        }
      }

      for (const supplier of this.suppliers.values()) {
        try {
          await dbStorage.createSupplier(supplier);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات الموردين:", error);
        }
      }

      for (const transaction of this.supplierTransactions.values()) {
        try {
          await dbStorage.createSupplierTransaction(transaction);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات معاملات الموردين:", error);
        }
      }

      for (const appointment of this.appointments.values()) {
        try {
          await dbStorage.createAppointment(appointment);
        } catch (error) {
          console.error("خطأ في ترحيل بيانات المواعيد:", error);
        }
      }

      console.log("تم ترحيل جميع البيانات بنجاح إلى قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في عملية ترحيل البيانات:", error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return dbStorage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return dbStorage.getUserByUsername(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return dbStorage.saveNewUser(insertUser);
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    return dbStorage.updateUser(id, update);
  }

  async getProducts(): Promise<Product[]> {
    return dbStorage.getProducts();
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return dbStorage.getProduct(id);
  }

  async createProduct(product: Product): Promise<Product> {
    return dbStorage.createProduct(product);
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    return dbStorage.updateProduct(id, update);
  }

  async deleteProduct(id: number): Promise<void> {
    return dbStorage.deleteProduct(id);
  }

  async getSales(): Promise<Sale[]> {
    return dbStorage.getSales();
  }

  async createSale(sale: Sale): Promise<Sale> {
    return dbStorage.createSale(sale);
  }

  async getCurrentExchangeRate(): Promise<ExchangeRate> {
    const rate = await dbStorage.getCurrentExchangeRate();
    if (!rate) {
      return await this.setExchangeRate(1300);
    }
    return rate;
  }

  async setExchangeRate(rate: number): Promise<ExchangeRate> {
    return dbStorage.setExchangeRate(rate);
  }

  async getInstallments(): Promise<Installment[]> {
    return dbStorage.getInstallments();
  }

  async getInstallment(id: number): Promise<Installment | undefined> {
    return dbStorage.getInstallment(id);
  }

  async createInstallment(installment: Installment): Promise<Installment> {
    return dbStorage.createInstallment(installment);
  }

  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> {
    return dbStorage.updateInstallment(id, update);
  }

  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> {
    return dbStorage.getInstallmentPayments(installmentId);
  }

  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> {
    return dbStorage.createInstallmentPayment(payment);
  }

  async getCampaigns(): Promise<Campaign[]> {
    return dbStorage.getCampaigns();
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return dbStorage.getCampaign(id);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    return dbStorage.createCampaign(campaign);
  }

  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    return dbStorage.updateCampaign(id, update);
  }

  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> {
    return dbStorage.getCampaignAnalytics(campaignId);
  }

  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
    return dbStorage.createCampaignAnalytics(analytics);
  }

  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    return dbStorage.getSocialMediaAccounts(userId);
  }

  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    return dbStorage.createSocialMediaAccount(account);
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    return dbStorage.deleteSocialMediaAccount(id);
  }

  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {
    return dbStorage.setApiKeys(userId, keys);
  }

  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    return dbStorage.getApiKeys(userId);
  }

  async migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void> {
    //This is a placeholder, a real implementation would move data from local storage to the database.
  }

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return dbStorage.getInventoryTransactions();
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    return dbStorage.createInventoryTransaction(transaction);
  }

  async getExpenseCategories(userId: number): Promise<ExpenseCategory[]> {
    return dbStorage.getExpenseCategories(userId);
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    return dbStorage.getExpenseCategory(id);
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    return dbStorage.createExpenseCategory(category);
  }

  async updateExpenseCategory(id: number, update: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    return dbStorage.updateExpenseCategory(id, update);
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    return dbStorage.deleteExpenseCategory(id);
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    return dbStorage.getExpenses(userId);
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return dbStorage.getExpense(id);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    return dbStorage.createExpense(expense);
  }

  async updateExpense(id: number, update: Partial<Expense>): Promise<Expense> {
    return dbStorage.updateExpense(id, update);
  }

  async deleteExpense(id: number): Promise<void> {
    return dbStorage.deleteExpense(id);
  }

  async getSuppliers(userId: number): Promise<Supplier[]> {
    return dbStorage.getSuppliers(userId);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return dbStorage.getSupplier(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    return dbStorage.createSupplier(supplier);
  }

  async updateSupplier(id: number, update: Partial<Supplier>): Promise<Supplier> {
    return dbStorage.updateSupplier(id, update);
  }

  async deleteSupplier(id: number): Promise<void> {
    return dbStorage.deleteSupplier(id);
  }

  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    return dbStorage.getSupplierTransactions(supplierId);
  }

  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    return dbStorage.createSupplierTransaction(transaction);
  }

  async searchCustomers(search?: string): Promise<Customer[]> {
    return dbStorage.searchCustomers(search);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return dbStorage.getCustomer(id);
  }

  async getCustomerSales(customerId: number): Promise<Sale[]> {
    return dbStorage.getCustomerSales(customerId);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    return dbStorage.createCustomer(insertCustomer);
  }

  async getCustomerAppointments(customerId: number): Promise<Appointment[]> {
    return dbStorage.getCustomerAppointments(customerId);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    return dbStorage.createAppointment(appointment);
  }

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    return dbStorage.updateAppointment(id, update);
  }

  async deleteAppointment(id: number): Promise<void> {
    return dbStorage.deleteAppointment(id);
  }

  async deleteCustomer(id: number): Promise<void> {
    return dbStorage.deleteCustomer(id);
  }

  async saveFile(file: InsertFileStorage): Promise<FileStorage> {
    return dbStorage.saveFile(file);
  }

  async getFileById(id: number): Promise<FileStorage | undefined> {
    return dbStorage.getFileById(id);
  }

  async getUserFiles(userId: number): Promise<FileStorage[]> {
    return dbStorage.getUserFiles(userId);
  }

  async deleteFile(id: number): Promise<void> {
    return dbStorage.deleteFile(id);
  }
}

export const storage = dbStorage;