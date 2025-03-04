import {
  systemActivities, activityReports,
  type SystemActivity, type ActivityReport,
  type InsertSystemActivity, type InsertActivityReport
} from "@shared/schema";
import {
  users, products, sales, exchangeRates, fileStorage,
  installments, installmentPayments, marketingCampaigns,
  campaignAnalytics, socialMediaAccounts, apiKeys,
  inventoryTransactions, expenseCategories, expenses,
  suppliers, supplierTransactions, customers, appointments,
  invoices, userSettings,
  type User, type Product, type Sale, type ExchangeRate,
  type FileStorage, type Installment, type InstallmentPayment,
  type Campaign, type InsertCampaign, type CampaignAnalytics,
  type InsertCampaignAnalytics, type SocialMediaAccount,
  type ApiKey, type InsertApiKey, type InventoryTransaction,
  type InsertInventoryTransaction, type ExpenseCategory,
  type InsertExpenseCategory, type Expense, type InsertExpense,
  type Supplier, type InsertSupplier, type SupplierTransaction,
  type InsertSupplierTransaction, type Customer, type InsertCustomer,
  type Appointment, type InsertAppointment, type Invoice,
  type InsertInvoice, type UserSettings, type InsertUserSettings,
  type InsertUser, type InsertFileStorage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like, SQL, gte, lte, and, sql, lt, gt } from "drizzle-orm";
import { caching } from "./cache";

const CACHE_TTL = 5 * 60; // 5 minutes cache

export interface IStorage {
  // ...existing methods...

  // Add appointments methods
  getAppointments(): Promise<Appointment[]>;
  getCustomerAppointments(customerId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private cache: typeof caching;

  constructor() {
    this.cache = caching;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role as "admin" | "staff",
        permissions: insertUser.permissions || [],
      })
      .returning();
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...update,
        role: update.role as "admin" | "staff",
        permissions: update.permissions || [],
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: Product): Promise<Product> {
    try {
      const [newProduct] = await db
        .insert(products)
        .values({
          name: product.name,
          description: product.description,
          productCode: product.productCode,
          barcode: product.barcode,
          productType: product.productType,
          quantity: product.quantity,
          minQuantity: product.minQuantity,
          productionDate: product.productionDate,
          expiryDate: product.expiryDate,
          costPrice: product.costPrice.toString(),
          priceIqd: product.priceIqd.toString(),
          categoryId: product.categoryId,
          isWeightBased: product.isWeightBased,
          enableDirectWeighing: product.enableDirectWeighing,
          stock: product.stock,
          imageUrl: product.imageUrl,
          thumbnailUrl: product.thumbnailUrl
        })
        .returning();
      return newProduct;
    } catch (error) {
      console.error("خطأ في إنشاء المنتج:", error);
      throw new Error("فشل في إنشاء المنتج. تأكد من صحة البيانات المدخلة وعدم تكرار رمز المنتج أو الباركود");
    }
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    try {
      if (update.stock !== undefined && update.stock < 0) {
        throw new Error("لا يمكن أن يكون المخزون أقل من صفر");
      }

      const [product] = await db
        .update(products)
        .set({
          ...update,
          priceIqd: update.priceIqd?.toString(),
          updatedAt: new Date()
        })
        .where(eq(products.id, id))
        .returning();

      // تسجيل تغيير المخزون إذا تم تحديثه
      if (update.stock !== undefined) {
        await db.insert(inventoryTransactions).values({
          productId: id,
          type: "adjustment",
          quantity: update.stock,
          reason: "تحديث يدوي",
          userId: 1, // يجب تحديث هذا ليأخذ معرف المستخدم الحالي
          date: new Date()
        });
      }

      return product;
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      throw new Error("فشل في تحديث المنتج. تأكد من صحة البيانات وتوفر المخزون الكافي");
    }
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getSales(): Promise<Sale[]> {
    return db.select().from(sales);
  }

  async createSale(sale: {
    productId: number;
    quantity: number;
    priceIqd: string;
    discount: string;
    userId: number;
    isInstallment: boolean;
    date: Date;
    customerName?: string;
  }): Promise<Sale> {
    try {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, sale.productId));

      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      if (product.stock < sale.quantity) {
        throw new Error(`المخزون غير كافٍ. المتوفر: ${product.stock}`);
      }

      let customerId: number;
      if (sale.customerName) {
        const [customer] = await db
          .insert(customers)
          .values({
            name: sale.customerName,
            createdAt: new Date()
          })
          .returning();
        customerId = customer.id;
      } else {
        const [defaultCustomer] = await db
          .select()
          .from(customers)
          .where(eq(customers.name, "عميل نقدي"));

        if (defaultCustomer) {
          customerId = defaultCustomer.id;
        } else {
          const [newDefaultCustomer] = await db
            .insert(customers)
            .values({
              name: "عميل نقدي",
              createdAt: new Date()
            })
            .returning();
          customerId = newDefaultCustomer.id;
        }
      }

      const [updatedProduct] = await db
        .update(products)
        .set({ stock: product.stock - sale.quantity })
        .where(eq(products.id, sale.productId))
        .returning();

      const [newSale] = await db
        .insert(sales)
        .values({
          productId: sale.productId,
          customerId,
          quantity: sale.quantity,
          priceIqd: sale.priceIqd,
          discount: sale.discount,
          finalPriceIqd: (Number(sale.priceIqd) - Number(sale.discount)).toString(),
          userId: sale.userId,
          isInstallment: sale.isInstallment,
          date: sale.date
        })
        .returning();

      await db.insert(inventoryTransactions).values({
        productId: sale.productId,
        type: "out",
        quantity: sale.quantity,
        reason: "sale",
        reference: `SALE-${newSale.id}`,
        userId: sale.userId,
        date: new Date()
      });

      return newSale;
    } catch (error) {
      console.error("خطأ في إنشاء عملية البيع:", error);
      throw new Error("فشل في إنشاء عملية البيع. " + (error as Error).message);
    }
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
      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          ...update,
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id))
        .returning();

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
      .where(
        or(
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

  async saveUserSettings(userId: number, settings: Omit<InsertUserSettings, "userId">): Promise<UserSettings> {
    // Delete old settings
    await db
      .delete(userSettings)
      .where(eq(userSettings.userId, userId));

    // Insert new settings
    const [newSettings] = await db
      .insert(userSettings)
      .values({
        userId,
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return newSettings;
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


  async logSystemActivity(activity: InsertSystemActivity): Promise<SystemActivity> {
    const [newActivity] = await db
      .insert(systemActivities)
      .values({
        userId: activity.userId,
        activityType: activity.activityType,
        entityType: activity.entityType,
        entityId: activity.entityId,
        action: activity.action,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
      })
      .returning();
    return newActivity;
  }

  async getSystemActivities(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: number;
    activityType?: string;
    entityType?: string;
  }): Promise<SystemActivity[]> {
    let query = db.select().from(systemActivities);

    if (filters.startDate) {
      query = query.where(gte(systemActivities.timestamp, filters.startDate));
    }
    if (filters.endDate) {
      query = query.where(lte(systemActivities.timestamp, filters.endDate));
    }
    if (filters.userId) {
      query = query.where(eq(systemActivities.userId, filters.userId));
    }
    if (filters.activityType) {
      query = query.where(eq(systemActivities.activityType, filters.activityType));
    }
    if (filters.entityType) {
      query = query.where(eq(systemActivities.entityType, filters.entityType));
    }

    return query.orderBy(desc(systemActivities.timestamp));
  }

  async generateActivityReport(report: InsertActivityReport): Promise<ActivityReport> {
    const activities = await this.getSystemActivities({
      startDate: report.dateRange.startDate,
      endDate: report.dateRange.endDate,
      ...(report.filters || {})
    });

    // Process activities based on report type
    let processedData: any = {};
    switch (report.reportType) {
      case "daily":
        processedData = this.processDailyReport(activities);
        break;
      case "weekly":
        processedData = this.processWeeklyReport(activities);
        break;
      case "monthly":
        processedData = this.processMonthlyReport(activities);
        break;
    }

    const [newReport] = await db
      .insert(activityReports)
      .values({
        ...report,
        data: processedData,
      })
      .returning();

    return newReport;
  }

  private processDailyReport(activities: SystemActivity[]) {
    const dailyActivities = activities.reduce((acc: any, activity) => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          total: 0,
          byType: {},
          byUser: {},
        };
      }
      acc[date].total++;
      acc[date].byType[activity.activityType] = (acc[date].byType[activity.activityType] || 0) + 1;
      acc[date].byUser[activity.userId] = (acc[date].byUser[activity.userId] || 0) + 1;
      return acc;
    }, {});

    return {
      type: 'daily',
      data: dailyActivities,
    };
  }

  private processWeeklyReport(activities: SystemActivity[]) {
    const weeklyActivities = activities.reduce((acc: any, activity) => {
      const date = new Date(activity.timestamp);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
      if (!acc[weekStart]) {
        acc[weekStart] = {
          total: 0,
          byType: {},
          byUser: {},
        };
      }
      acc[weekStart].total++;
      acc[weekStart].byType[activity.activityType] = (acc[weekStart].byType[activity.activityType] || 0) + 1;
      acc[weekStart].byUser[activity.userId] = (acc[weekStart].byUser[activity.userId] || 0) + 1;
      return acc;
    }, {});

    return {
      type: 'weekly',
      data: weeklyActivities,
    };
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

  async getActivityReport(id: number): Promise<ActivityReport | undefined> {
    const [report] = await db
      .select()
      .from(activityReports)
      .where(eq(activityReports.id, id));
    return report;
  }

  async getActivityReports(userId: number): Promise<ActivityReport[]> {
    return db
      .select()
      .from(activityReports)
      .where(eq(activityReports.generatedBy, userId))
      .orderBy(desc(activityReports.createdAt));
  }

  async getDetailedSalesReport(dateRange: { start: Date; end: Date }, page = 1, pageSize = 50) {
    console.log("Generating detailed sales report for:", dateRange);

    const cacheKey = `sales_report:${dateRange.start.toISOString()}_${dateRange.end.toISOString()}_${page}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log("Returning cached sales report");
      return JSON.parse(cached);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    //// Get total count first
    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(sales)
      .where(
        and(
          gte(sales.date, dateRange.start),
          lte(sales.date, dateRange.end)
        )
      );

    // Get paginated sales records with JOIN
    const saleRecords = await db
      .select({
        id: sales.id,
        productId: sales.productId,
        quantity: sales.quantity,
        priceIqd: sales.priceIqd,
        date: sales.date,
        productName: products.name,
      })
      .from(sales)
      .leftJoin(products, eq(sales.productId, products.id))
      .where(
        and(
          gte(sales.date, dateRange.start),
          lte(sales.date, dateRange.end)
        )
      )
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(sales.date));

    console.log(`Found ${saleRecords.length} sales records for page ${page}`);

    // Process sales data efficiently
    const { productSales, dailyStats } = this.processSalesData(saleRecords);

    const report = {
      totalRecords: count,
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      totalSales: count,
      totalRevenue: saleRecords.reduce((sum, sale) => sum + Number(sale.priceIqd), 0).toString(),
      productsSold: Object.entries(productSales).map(([productId, data]) => ({
        productId: Number(productId),
        name: data.name || 'منتج محذوف',
        quantity: data.quantity,
        revenue: data.revenue.toString(),
      })),
      dailyStats: Object.entries(dailyStats).map(([date, data]) => ({
        date,
        sales: data.sales,
        revenue: data.revenue.toString(),
      })),
    };

    // Cache the report
    await this.cache.set(cacheKey, JSON.stringify(report), CACHE_TTL);
    console.log("Successfully generated and cached sales report");

    return report;
  }

  private processSalesData(saleRecords: any[]) {
    const productSales: Record<number, {
      name: string;
      quantity: number;
      revenue: number;
    }> = {};

    const dailyStats: Record<string, {
      sales: number;
      revenue: number;
    }> = {};

    for (const sale of saleRecords) {
      // Process product sales
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = {
          name: sale.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[sale.productId].quantity += sale.quantity;
      productSales[sale.productId].revenue += Number(sale.priceIqd);

      // Process daily stats
      const date = new Date(sale.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          sales: 0,
          revenue: 0,
        };
      }
      dailyStats[date].sales++;
      dailyStats[date].revenue += Number(sale.priceIqd);
    }

    return { productSales, dailyStats };
  }

  // Similar optimizations for other report methods...
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
  async getInventoryReport(dateRange: { start: Date; end: Date }) {
    const [productsCount] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(products);

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
      );

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
      .orderBy(desc(inventoryTransactions.date));

    return {
      totalProducts: productsCount.count,
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
  }

  async getFinancialReport(dateRange: { start: Date; end: Date }) {
    const sales = await db
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

    const expenses = await db
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

    const expensesByCategory = expenses.reduce((acc: any, expense) => {
      const categoryName = categoryMap[expense.categoryId] || 'أخرى';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += Number(expense.amount);
      return acc;
    }, {});

    const dailyStats = expenses.reduce((acc: any, expense) => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          revenue: '0',
          expenses: '0',
        };
      }
      acc[date].expenses = (Number(acc[date].expenses) + Number(expense.amount)).toString();
      return acc;
    }, {});

    sales.forEach(sale => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          revenue: '0',
          expenses: '0',
        };
      }
      dailyStats[date].revenue = sale.amount;
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

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
      dailyBalance: Object.entries(dailyStats).map(([date, data]: [string, any]) => ({
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

}

export const storage = new DatabaseStorage();