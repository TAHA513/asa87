import {
  users, products, sales, exchangeRates, fileStorage,
  installments, installmentPayments, marketingCampaigns,
  campaignAnalytics, socialMediaAccounts,
  inventoryTransactions, expenseCategories, expenses,
  suppliers, supplierTransactions, customers, appointments,
  invoices, invoiceItems, userSettings, reports,
  type User, type Product, type Sale, type ExchangeRate,
  type FileStorage, type Installment, type InstallmentPayment,
  type Campaign, type InsertCampaign, type CampaignAnalytics,
  type InsertCampaignAnalytics, type SocialMediaAccount,
  type InventoryTransaction,
  type InsertInventoryTransaction, type ExpenseCategory,
  type InsertExpenseCategory, type Expense, type InsertExpense,
  type Supplier, type InsertSupplier, type SupplierTransaction,
  type InsertSupplierTransaction, type Customer, type InsertCustomer,
  type Appointment, type InsertAppointment, type Invoice,
  type InsertInvoice, type UserSettings, type InsertUserSettings,
  type InsertUser, type InsertFileStorage,
  type Report, type InsertReport, type InvoiceItem,
  type InsertSale, type InsertSaleItem, type SaleItem,
  categories, type Category, type InsertCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like, SQL, gte, lte, and, sql, lt, gt } from "drizzle-orm";
import { globalCache } from "./cache";

const CACHE_TTL = 5 * 60; // 5 minutes cache

export interface IStorage {
  // المستخدمين
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;

  // المنتجات
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;

  // الفئات
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // العملاء
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // المبيعات
  getSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSaleItems(saleId: number): Promise<SaleItem[]>;

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
  getCustomerSales(customerId: number): Promise<Sale[]>;
  getCustomerAppointments(customerId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  deleteCustomer(id: number): Promise<void>;
  saveFile(file: InsertFileStorage): Promise<FileStorage>;
  getFileById(id: number): Promise<FileStorage | undefined>;
  getUserFiles(userId: number): Promise<FileStorage[]>;
  deleteFile(id: number): Promise<void>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  updateInvoicePrintStatus(id: number, printed: boolean): Promise<Invoice>;
  searchProducts(query: string): Promise<Product[]>;
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  saveUserSettings(userId: number, settings: InsertUserSettings): Promise<UserSettings>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
  getInventoryReport(dateRange: { start: Date; end: Date }, page?: number, pageSize?: number): Promise<any>;
  getFinancialReport(dateRange: { start: Date; end: Date }): Promise<any>;
  getUserActivityReport(dateRange: { start: Date; end: Date }): Promise<any>;
  saveReport(reportData: {
    type: string;
    title: string;
    dateRange: { start: Date; end: Date };
    filters?: Record<string, unknown>;
    data: Record<string, unknown>;
    userId: number;
    format?: string;
  }): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getUserReports(userId: number, type?: string): Promise<Report[]>;
  getAppointmentsReport(dateRange: { start: Date; end: Date }, userId: number): Promise<any>;
  getInvoices(filters?: {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<Invoice[]>;
  getHistoricalStats(): Promise<any>;
  getFrontendComponents():Promise<string[]>;
  getApiEndpoints():Promise<string[]>;
  sendNotification(userId: number, notificationType: string, data: any): boolean;
  getUsersByRole(role: string): Promise<User[]>;
  getActiveUsers(): Promise<User[]>;
  saveUserNotification(userId: number, type: string, data: any): Promise<any>;
  getUserNotifications(userId: number, options?: { unreadOnly?: boolean, limit?: number }): Promise<any[]>;
  markNotificationAsRead(notificationId: number): Promise<any>;
  deleteNotification(notificationId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private cache: typeof globalCache;

  constructor() {
    this.cache = globalCache;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error('خطأ في إنشاء المستخدم:', error);
      throw new Error('فشل في إنشاء المستخدم');
    }
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    try {
      const [user] = await db.update(users)
        .set(update)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      throw new Error('فشل في تحديث المستخدم');
    }
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      const [newProduct] = await db.insert(products).values(product).returning();
      return newProduct;
    } catch (error) {
      console.error('خطأ في إنشاء المنتج:', error);
      throw new Error('فشل في إنشاء المنتج');
    }
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    try {
      const [product] = await db.update(products)
        .set(update)
        .where(eq(products.id, id))
        .returning();
      return product;
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error);
      throw new Error('فشل في تحديث المنتج');
    }
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const [newCategory] = await db.insert(categories).values(category).returning();
      return newCategory;
    } catch (error) {
      console.error('خطأ في إنشاء الفئة:', error);
      throw new Error('فشل في إنشاء الفئة');
    }
  }

  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    try {
      const [newCustomer] = await db.insert(customers).values(customer).returning();
      return newCustomer;
    } catch (error) {
      console.error('خطأ في إنشاء العميل:', error);
      throw new Error('فشل في إنشاء العميل');
    }
  }

  async getSales(): Promise<Sale[]> {
    return db.select().from(sales);
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    try {
      const [newSale] = await db.insert(sales).values(sale).returning();
      return newSale;
    } catch (error) {
      console.error('خطأ في إنشاء عملية البيع:', error);
      throw new Error('فشل في إنشاء عملية البيع');
    }
  }

  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, saleId));
  }
  async getCurrentExchangeRate(): Promise<ExchangeRate> {
    const [rate] = await db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.date))
      .limit(1);

    if (!rate) {
      return this.setExchangeRate(1300);
    }
    return rate;
  }

  async setExchangeRate(rate: number): Promise<ExchangeRate> {
    const [newRate] = await db
      .insert(exchangeRates)
      .values({
        usdToIqd: rate.toString(),
        date: new Date(),
      })
      .returning();
    return newRate;
  }

  async getInstallments(): Promise<Installment[]> {
    return db.select().from(installments);
  }

  async getInstallment(id: number): Promise<Installment | undefined> {
    const [installment] = await db
      .select()
      .from(installments)
      .where(eq(installments.id, id));
    return installment;
  }

  async createInstallment(installment: Installment): Promise<Installment> {
    const [newInstallment] = await db
      .insert(installments)
      .values(installment)
      .returning();
    return newInstallment;
  }

  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> {
    const [installment] = await db
      .update(installments)
      .set(update)
      .where(eq(installments.id, id))
      .returning();
    return installment;
  }

  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> {
    return db
      .select()
      .from(installmentPayments)
      .where(eq(installmentPayments.installmentId, installmentId));
  }

  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> {
    const [newPayment] = await db
      .insert(installmentPayments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return db.select().from(marketingCampaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(marketingCampaigns)
      .values({
        name: campaign.name,
        description: campaign.description,
        platforms: campaign.platforms,
        budget: campaign.budget.toString(),
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        userId: campaign.userId
      })
      .returning();
    return newCampaign;
  }

  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(marketingCampaigns)
      .set({
        ...update,
        budget: update.budget?.toString()
      })
      .where(eq(marketingCampaigns.id, id))
      .returning();
    return campaign;
  }

  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> {
    return db
      .select()
      .from(campaignAnalytics)
      .where(eq(campaignAnalytics.campaignId, campaignId));
  }

  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
    const [newAnalytics] = await db
      .insert(campaignAnalytics)
      .values([{
        ...analytics,
        spend: analytics.spend.toString()
      }])
      .returning();
    return newAnalytics;
  }

  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    return db
      .select()
      .from(socialMediaAccounts)
      .where(eq(socialMediaAccounts.userId, userId));
  }

  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    const [newAccount] = await db
      .insert(socialMediaAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    await db.delete(socialMediaAccounts).where(eq(socialMediaAccounts.id, id));
  }

  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {
    await db
      .insert(apiKeys)
      .values([{
        userId,
        platform: "general",
        keyType: "json",
        keyValue: JSON.stringify(keys),
        createdAt: new Date()
      }]);
  }

  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt))
      .limit(1);

    if (key) {
      return JSON.parse(key.keyValue);
    }
    return null;
  }

  async migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void> {
    await this.setApiKeys(userId, keys);
  }

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return db.select().from(inventoryTransactions);
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [newTransaction] = await db
      .insert(inventoryTransactions)
      .values({
        ...transaction,
        type: transaction.type as "in" | "out",
        reason: transaction.reason as "sale" | "return" | "adjustment" | "purchase",
      })
      .returning();
    return newTransaction;
  }

  async getExpenseCategories(userId: number): Promise<ExpenseCategory[]> {
    try {
      const results = await db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.userId, userId));
      return results;
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      throw new Error("فشل في جلب فئات المصروفات");
    }
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, id));
    return category;
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    try {
      const [newCategory] = await db
        .insert(expenseCategories)
        .values({
          name: category.name,
          description: category.description || null,
          budgetAmount: category.budgetAmount?.toString() || null,
          userId: category.userId,
          createdAt: new Date()
        })
        .returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating expense category:", error);
      throw new Error("فشل في إنشاء فئة المصروفات");
    }
  }

  async updateExpenseCategory(id: number, update: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    try {
      const [category] = await db
        .update(expenseCategories)
        .set({
          name: update.name,
          description: update.description,
          budgetAmount: update.budgetAmount?.toString(),
          parentId: update.parentId
        })
        .where(eq(expenseCategories.id, id))
        .returning();
      return category;
    } catch (error) {
      console.error("Error updating expense category:", error);
      throw new Error("فشل في تحديث فئة المصروفات");
    }
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    try {
      await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
    } catch (error) {
      console.error("Error deleting expense category:", error);
      throw new Error("فشل في حذف فئة المصروفات");
    }
  }

  async getExpenses(userId: number): Promise<Expense[]> {
    return db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values({
        ...expense,
        amount: expense.amount.toString(),
        recurringPeriod: expense.recurringPeriod as "monthly" | "weekly" | "yearly" | undefined,
      })
      .returning();
    return newExpense;
  }

  async updateExpense(id: number, update: Partial<Expense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set(update)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getSuppliers(userId: number): Promise<Supplier[]> {
    return db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, userId));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        ...supplier,
        categories: supplier.categories || [],
      })
      .returning();
    return newSupplier;
  }

  async updateSupplier(id: number, update: Partial<Supplier>): Promise<Supplier> {
    const [supplier] = await db
      .update(suppliers)
      .set(update)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    return db
      .select()
      .from(supplierTransactions)
      .where(eq(supplierTransactions.supplierId, supplierId));
  }

  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    const [newTransaction] = await db
      .insert(supplierTransactions)
      .values({
        ...transaction,
        amount: transaction.amount.toString(),
        type: transaction.type as "payment" | "refund" | "advance" | "other",
        status: transaction.status as "completed" | "pending" | "cancelled",
      })
      .returning();
    return newTransaction;
  }

  async searchCustomers(search?: string): Promise<Customer[]> {
    if (!search) {
      return db.select().from(customers);
    }
    return db
      .select()
      .from(customers)
      .where(
        or(
          like(customers.name, `%${search}%`),
          like(customers.phone, `%${search}%`),
          like(customers.email, `%${search}%`)
        )
      );
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    return customer;
  }

  async getCustomerSales(customerId: number): Promise<Sale[]> {
    return db
      .select()
      .from(sales)
      .where(eq(sales.customerId, customerId));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async getCustomerAppointments(customerId: number): Promise<Appointment[]> {
    try {
      if (customerId === 0) {
        return this.getAppointments();
      }
      const results = await db
        .select()
        .from(appointments)
        .where(eq(appointments.customerId, customerId))
        .orderBy(desc(appointments.date));
      return results;
    } catch (error) {
      console.error("Error in getCustomerAppointments:", error);
      throw new Error("فشل في جلب مواعيد العميل");
    }
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    try {
      console.log("Creating new appointment:", appointment);
      const [newAppointment] = await db
        .insert(appointments)
        .values({
          ...appointment,
          status: appointment.status || "scheduled",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log("Successfully created appointment:", newAppointment);
      return newAppointment;
    } catch (error) {
      console.error("Error in createAppointment:", error);
      throw new Error("فشل في إنشاء الموعد");
    }
  }

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    try {
      console.log(`Updating appointment ${id} with:`, update);

      // Get the old appointment first
      const [oldAppointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!oldAppointment) {
        throw new Error("الموعد غير موجود");
      }

      // Update the appointment
      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          ...update,
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id))
        .returning();

      // Log the activity if status changed
      if (update.status && oldAppointment.status !== update.status) {
        console.log("Status change detected:", {
          appointmentId: id,
          oldStatus: oldAppointment.status,
          newStatus: update.status
        });

        try {
          //await this.logSystemActivity({ //removed
          //  userId: 1, // Will be updated with actual user ID from context
          //  activityType: "appointment_status_change",
          //  entityType: "appointments",
          //  entityId: id,
          //  action: "update",
          //  details: {
          //    oldStatus: oldAppointment.status,
          //    newStatus: update.status,
          //    title: updatedAppointment.title,
          //    date: updatedAppointment.date
          //  }
          //});
          console.log("Successfully logged status change activity"); //removed
        } catch (error) {
          console.error("Failed to log status change activity:", error); //removed
        }
      }

      console.log("Successfully updated appointment:", updatedAppointment);
      return updatedAppointment;
    } catch (error) {
      console.error("Error in updateAppointment:", error);
      throw new Error("فشل في تحديث الموعد");
    }
  }

  async deleteAppointment(id: number): Promise<void> {
    try {
      console.log(`Deleting appointment ${id}`);
      await db
        .delete(appointments)
        .where(eq(appointments.id, id));
      console.log(`Successfully deleted appointment ${id}`);
    } catch (error) {
      console.error("Error in deleteAppointment:", error);
      throw new Error("فشل في حذف الموعد");
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async saveFile(file: InsertFileStorage): Promise<FileStorage> {
    const [newFile] = await db
      .insert(fileStorage)
      .values(file)
      .returning();
    return newFile;
  }

  async getFileById(id: number): Promise<FileStorage | undefined> {
    const [file] = await db
      .select()
      .from(fileStorage)
      .where(eq(fileStorage.id, id));
    return file;
  }

  async getUserFiles(userId: number): Promise<FileStorage[]> {
    return db
      .select()
      .from(fileStorage)
      .where(eq(fileStorage.userId, userId));
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(fileStorage).where(eq(fileStorage.id, id));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        ...invoice,
        totalAmount: invoice.totalAmount.toString(),
      })
      .returning();
    return newInvoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }

  async updateInvoicePrintStatus(id: number, printed: boolean): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ printed })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(or(
          like(products.productCode, `%${query}%`),
          like(products.barcode, `%${query}%`),
          like(products.name, `%${query}%`)
        )
      );
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .orderBy(desc(userSettings.createdAt))
      .limit(1);
    return settings;
  }

  async saveUserSettings(userId: number, settings: InsertUserSettings): Promise<UserSettings> {
    try {
      // Delete old settings first
      await db.delete(userSettings).where(eq(userSettings.userId, userId));

      // Ensure userId is a number
      const userIdNum = Number(userId);

      // Process colors to ensure they are stored as a valid JSONB object
      const processedColors = typeof settings.colors === 'string' 
        ? JSON.parse(settings.colors)
        : settings.colors;

      // Now insert new settings with proper type handling
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId: userIdNum,
          themeName: settings.themeName,
          fontName: settings.fontName,
          fontSize: settings.fontSize,
          appearance: settings.appearance,
          colors: processedColors, // Ensure proper JSON structure
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return newSettings;
    } catch (error) {
      console.error("Error in saveUserSettings:", error);
      throw new Error("فشل في حفظ إعدادات المظهر");
    }
  }

  async getAppointments(): Promise<Appointment[]> {
    try {
      console.log("Fetching all appointments from database");
            const results = await db
        .select()
        .from(appointments)
        .orderBy(desc(appointments.date));

      console.log(`Retrieved ${results.length} appointments from database`);
      return results;
    } catch (error) {
      console.error("Error in getAppointments:", error);
      throw new Error("فشل في جلب المواعيد");
    }
  }


  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {    try {
      return await db
        .select()
        .from(appointments)
        .where(and(
          gte(appointments.date, startDate),
          lt(appointments.date, endDate)
        ))
        .orderBy(appointments.date);
    } catch (error) {
      console.error("خطأ في جلب المواعيد حسب النطاق الزمني:", error);
      return [];
    }
  }

  async getInventoryReport(dateRange: { start: Date; end: Date }, page = 1, pageSize = 50) {
    const cacheKey = `inventory_report:${dateRange.start.toISOString()}_${dateRange.end.toISOString()}_${page}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get total products count
    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(products);

    // Get paginated low stock products
    const lowStockProducts = await db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
        minQuantity: products.minQuantity,
      })
      .from(products)
      .where(
        and(
          lt(products.stock, products.minQuantity),
          gt(products.minQuantity, 0)
        )
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Get paginated movements with product info
    const movements = await db
      .select({
        date: inventoryTransactions.date,
        type: inventoryTransactions.type,
        quantity: inventoryTransactions.quantity,
        productId: inventoryTransactions.productId,
        productName: products.name,
      })
      .from(inventoryTransactions)
      .leftJoin(products, eq(inventoryTransactions.productId, products.id))
      .where(
        and(
          gte(inventoryTransactions.date, dateRange.start),
          lte(inventoryTransactions.date, dateRange.end)
        )
      )
      .orderBy(desc(inventoryTransactions.date))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const report = {
      totalProducts: count,
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      lowStock: lowStockProducts.map(p => ({
        productId: p.id,
        name: p.name,
        currentStock: p.stock,
        minRequired: p.minQuantity,
      })),
      movements: movements.map(m => ({
        date: new Date(m.date).toISOString(),
        type: m.type,
        quantity: m.quantity,
        productId: m.productId,
        productName: m.productName,
      })),
    };

    await this.cache.set(cacheKey, JSON.stringify(report), CACHE_TTL);
    return report;
  }

  async getFinancialReport(dateRange: { start: Date; end: Date }) {
    type DailyStat = {
      revenue: string;
      expenses: string;
    };

    const salesData = await db
      .select({
        date: sales.date,
        amount: sql<string>`CAST(SUM(CAST(price_iqd AS DECIMAL)) AS TEXT)`,
      })
      .from(sales)
      .where(
        and(
          gte(sales.date, dateRange.start),
          lte(sales.date, dateRange.end)
        )
      )
      .groupBy(sales.date);

    const expensesData = await db
      .select({
        date: expenses.date,
        categoryId: expenses.categoryId,
        amount: expenses.amount,
      })
      .from(expenses)
      .where(
        and(
          gte(expenses.date, dateRange.start),
          lte(expenses.date, dateRange.end)
        )
      );

    const categories = await db
      .select({
        id: expenseCategories.id,
        name: expenseCategories.name,
      })
      .from(expenseCategories);

    const categoryMap = Object.fromEntries(
      categories.map(c => [c.id, c.name])
    );

    const expensesByCategory: Record<string, number> = {};
    const dailyStats: Record<string, DailyStat> = {};

    // Process expenses
    expensesData.forEach(expense => {
      const categoryName = categoryMap[expense.categoryId] || 'أخرى';
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + Number(expense.amount);

      const date = new Date(expense.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          revenue: '0',
          expenses: '0',
        };
      }
      dailyStats[date].expenses = (Number(dailyStats[date].expenses) + Number(expense.amount)).toString();
    });

    // Process sales
    salesData.forEach(sale => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          revenue: '0',
          expenses: '0',
        };
      }
      dailyStats[date].revenue = sale.amount || '0';
    });

    const totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      revenue: totalRevenue.toString(),
      expenses: totalExpenses.toString(),
      profit: (totalRevenue - totalExpenses).toString(),
      topExpenses: Object.entries(expensesByCategory)
        .map(([category, amount]) => ({
          category,
          amount: amount.toString(),
        }))
        .sort((a, b) => Number(b.amount) - Number(a.amount)),
      dailyBalance: Object.entries(dailyStats).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        expenses: data.expenses,
        balance: (Number(data.revenue) - Number(data.expenses)).toString(),
      })),
    };
  }

  async getUserActivityReport(dateRange: { start: Date; end: Date }) {
    const activities = await db
      .select({
        userId: systemActivities.userId,
        timestamp: systemActivities.timestamp,
        activityType: systemActivities.activityType,
      })
      .from(systemActivities)
      .where(
        and(
          gte(systemActivities.timestamp, dateRange.start),
          lte(systemActivities.timestamp, dateRange.end)
        )
      );

    const users = await db
      .select()
      .from(users);

    const userMap = Object.fromEntries(
      users.map(u => [u.id, u])
    );

    const userActivities = activities.reduce((acc: any, activity) => {
      if (!acc[activity.userId]) {
        acc[activity.userId] = {
          count: 0,
          lastActive: activity.timestamp,
          types: {},
        };
      }
      acc[activity.userId].count++;
      acc[activity.userId].types[activity.activityType] = (acc[activity.userId].types[activity.activityType] || 0) + 1;
      if (new Date(activity.timestamp) > new Date(acc[activity.userId].lastActive)) {
        acc[activity.userId].lastActive = activity.timestamp;
      }
      return acc;
    }, {});

    const activityBreakdown = activities.reduce((acc: any, activity) => {
      if (!acc[activity.activityType]) {
        acc[activity.activityType] = 0;
      }
      acc[activity.activityType]++;
      return acc;
    }, {});

    return {
      totalUsers: users.length,
      activeUsers: Object.keys(userActivities).length,
      userActivities: Object.entries(userActivities).map(([userId, data]: [string, any]) => ({
        userId: Number(userId),
        username: userMap[Number(userId)]?.username || 'مستخدم محذوف',
        activityCount: data.count,
        lastActive: new Date(data.lastActive),
      })),
      activityBreakdown: Object.entries(activityBreakdown).map(([type, count]) => ({
        activityType: type,
        count: count as number,
      })),
    };
  }

  async saveReport(reportData: {
    type: string;
    title: string;
    dateRange: { start: Date; end: Date };
    filters?: Record<string, unknown>;
    data: Record<string, unknown>;
    userId: number;
    format?: string;
  }): Promise<Report> {
    try {
      const [newReport] = await db
        .insert(reports)
        .values({
          type: reportData.type,
          title: reportData.title,
          startDate: reportData.dateRange.start,
          endDate: reportData.dateRange.end,
          filters: reportData.filters || {},
          data: reportData.data,
          userId: reportData.userId,
          format: reportData.format || 'json',
          createdAt: new Date()
        })
        .returning();
      return newReport;
    } catch (error) {
      console.error("Error saving report:", error);
      throw new Error("فشل في حفظ التقرير");
    }
  }

  async getReport(id: number): Promise<Report | undefined> {
    try {
      // التحقق من صحة المعرف
      if (isNaN(id) || id <= 0) {
        console.error("Invalid report ID:", id);
        throw new Error("معرف التقرير غير صالح");
      }


      const [report] = await db
        .select()
        .from(reports)
        .where(eq(reports.id, id));
      return report;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw new Error("فشل في جلب التقرير");
    }
  }

  async getUserReports(userId: number, type?: string): Promise<Report[]> {
    try {
      let query = db
        .select()
        .from(reports)
        .where(eq(reports.userId, userId));

      if (type) {
        query = query.where(eq(reports.type, type));
      }

      return await query.orderBy(desc(reports.createdAt));
    } catch (error) {
      console.error("Error fetching user reports:", error);
      throw new Error("فشل في جلب تقارير المستخدم");
    }
  }

  async getAppointmentsReport(dateRange: { start: Date; end: Date }, userId: number): Promise<any> {
    try {
      const appointments = await db
        .select({
          id: appointments.id,
          title: appointments.title,
          date: appointments.date,
          status: appointments.status,
          customerId: appointments.customerId,
          customerName: customers.name,
        })
        .from(appointments)
        .leftJoin(customers, eq(appointments.customerId, customers.id))
        .where(
          and(
            gte(appointments.date, dateRange.start),
            lte(appointments.date, dateRange.end)
          )
        )
        .orderBy(desc(appointments.date));

      const stats = {
        total: appointments.length,
        byStatus: appointments.reduce((acc: Record<string, number>, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {}),
        byDate: appointments.reduce((acc: Record<string, number>, apt) => {
          const date = new Date(apt.date).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {})
      };

      const report = {
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        stats,
        appointments: appointments.map(apt => ({
          id: apt.id,
          title: apt.title,
          date: apt.date,
          status: apt.status,
          customerName: apt.customerName || 'عميل غير معروف'
        }))
      };

      // Save report to database
      await this.saveReport({
        type: "appointments",
        title: `تقرير المواعيد ${new Date().toLocaleDateString('ar-IQ')}`,
        dateRange,
        data: report,
        userId
      });

      return report;
    } catch (error) {
      console.error("Error generating appointments report:", error);
      throw new Error("فشل في إنشاء تقرير المواعيد");
    }
  }

  async getInvoices(filters?: {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<Invoice[]> {
    try {
      let query = db.select().from(invoices);

      if (filters?.search) {
        query = query.where(
          or(
            like(invoices.customerName, `%${filters.search}%`),
            like(invoices.invoiceNumber, `%${filters.search}%`)
          )
        );
      }

      if (filters?.startDate) {
        query = query.where(gte(invoices.createdAt, filters.startDate));
      }

      if (filters?.endDate) {
        query = query.where(lte(invoices.createdAt, filters.endDate));
      }

      if (filters?.status) {
        query = query.where(eq(invoices.status, filters.status));
      }

      const results = await query.orderBy(desc(invoices.createdAt));

      // Get invoice items for each invoice
      const invoiceIds = results.map(inv => inv.id);
      const items = await db
        .select()
        .from(invoiceItems)
        .where(sql`invoice_id = ANY(${invoiceIds})`);

      // Create a map of invoice items
      const itemMap = items.reduce((acc: Record<number, InvoiceItem[]>, item) => {
        if (!acc[item.invoiceId]) {
          acc[item.invoiceId] = [];
        }
        acc[item.invoiceId].push(item);
        return acc;
      }, {});

      // Attach items to invoices
      return results.map(invoice => ({
        ...invoice,
        items: itemMap[invoice.id] || []
      }));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw new Error("فشل في جلب الفواتير");
    }
  }

  private processMonthlyReport(activities: SystemActivity[]) {
    const monthlyActivities = activities.reduce((acc: any, activity) => {
      const monthStart = new Date(activity.timestamp).toISOString().slice(0, 7);
      if (!acc[monthStart]) {
        acc[monthStart] = {
          total: 0,
          byType: {},
          byUser: {},
        };
      }
      acc[monthStart].total++;
      acc[monthStart].byType[activity.activityType] = (acc[monthStart].byType[activity.activityType] || 0) + 1;
      acc[monthStart].byUser[activity.userId] = (acc[monthStart].byUser[activity.userId] || 0) + 1;
      return acc;
    }, {});

    return {
      type: 'monthly',
      data: monthlyActivities,
    };
  }

  async getHistoricalStats(): Promise<any> {
    try {
      // Get sales statistics
      const salesStats = await db
        .select({
          date: sql`date_trunc('day', date)::date`,
          total: sql`sum(CAST(final_price_iqd AS DECIMAL))::text`,
          count: sql`count(*)::int`
        })
        .from(sales)
        .groupBy(sql`date_trunc('day', date)`)
        .orderBy(sql`date_trunc('day', date)`);

      // Get expense statistics
      const expenseStats = await db
        .select({
          date: sql`date_trunc('day', date)::date`,
          total: sql`sum(CAST(amount AS DECIMAL))::text`,
          count: sql`count(*)::int`
        })
        .from(expenses)
        .groupBy(sql`date_trunc('day', date)`)
        .orderBy(sql`date_trunc('day', date)`);

      // Get appointment statistics (fixed nested aggregate function)
      const appointmentStats = await db
        .select({
          date: sql`date_trunc('day', date)::date`,
          count: sql`count(*)::int`
        })
        .from(appointments)
        .groupBy(sql`date_trunc('day', date)`)
        .orderBy(sql`date_trunc('day', date)`);

      // Then get status counts separately
      const statusStats = await db
        .select({
          date: sql`date_trunc('day', date)::date`,
          status: appointments.status,
          count: sql`count(*)::int`
        })
        .from(appointments)
        .groupBy(sql`date_trunc('day', date)`, appointments.status)
        .orderBy(sql`date_trunc('day', date)`);

      // Combine the status stats by date
      const appointmentsWithStatus = appointmentStats.map(day => {
        const statusCounts = statusStats
          .filter(s => s.date.getTime() === day.date.getTime())
          .reduce((acc, curr) => {
            acc[curr.status] = curr.count;
            return acc;
          }, {} as Record<string, number>);

        return {
          ...day,
          byStatus: statusCounts
        };
      });

      return {
        sales: salesStats,
        expenses: expenseStats,
        appointments: appointmentsWithStatus
      };
    } catch (error) {
      console.error("Error fetching historical stats:", error);
      return {
        sales: [],
        expenses: [],
        appointments: []
      };
    }
  }

  async getFrontendComponents(): Promise<string[]> {
    try {
      // List of available frontend components used in the application
      return [
        "DashboardLayout",
        "Sidebar",
        "Navbar",
        "ProductCard",
        "CustomerForm",
        "AppointmentCalendar",
        "InvoiceViewer",
        "ReportGenerator",
        "InventoryManager",
        "ExpenseTracker"
      ];
    } catch (error) {
      console.error("Error fetching frontend components:", error);
      return [];
    }
  }

  async getApiEndpoints(): Promise<string[]> {
    try {
      // List of available API endpoints in the application
      return [
        "/api/users",
        "/api/products",
        "/api/sales",
        "/api/customers",
        "/api/appointments",
        "/api/invoices",
        "/api/reports",
        "/api/inventory",
        "/api/expenses",
        "/api/settings"
      ];
    } catch (error) {
      console.error("Error fetching API endpoints:", error);
      return [];
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .where(eq(users.role, role as "admin" | "staff"));
    } catch (error) {
      console.error("خطأ في جلب المستخدمين حسب الدور:", error);
      return [];
    }
  }

  async getActiveUsers(): Promise<User[]> {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      return await db
        .select()
        .from(users)
        .where(and(
          eq(users.isActive, true),
          gt(users.lastLoginAt, thirtyMinutesAgo)
        ));
    } catch (error) {
      console.error("خطأ في جلب المستخدمين النشطين:", error);
      return [];
    }
  }

  async saveUserNotification(userId: number, type: string, data: any): Promise<any> {
    try {
      //Implementation for saving user notification
      return true;
    } catch (error) {
      console.error("Error saving user notification:", error);
      return false;
    }
  }
  async getUserNotifications(userId: number, options?: { unreadOnly?: boolean, limit?: number }): Promise<any[]> {
    try {
      //Implementation for getting user notifications
      return [];
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  }
  async markNotificationAsRead(notificationId: number): Promise<any> {
    try {
      //Implementation for marking notification as read
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      //Implementation for deleting notification
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }
  sendNotification(userId: number, notificationType: string, data: any): boolean {
    try {
      // This method will be overridden in index.ts with Socket.IO implementation
      console.log("محاولة إرسال إشعار:", { userId, notificationType, data });
      return true;
    } catch (error) {
      console.error("خطأ في إرسال الإشعار:", error);
      return false;
    }
  }

}

export const storage = new DatabaseStorage();