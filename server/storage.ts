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
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, or, like, desc } from "drizzle-orm";
import { IStorage } from "./types";

export class DatabaseStorage implements IStorage {
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
          priceIqd: product.priceIqd.toString(),
          stock: product.stock
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
    userId: number;
    isInstallment: boolean;
    date: Date;
    customerName?: string;
  }): Promise<Sale> {
    try {
      // التحقق من توفر المخزون
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

      // إنشاء العميل أو استخدام العميل النقدي
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

      // تحديث المخزون
      const [updatedProduct] = await db
        .update(products)
        .set({ stock: product.stock - sale.quantity })
        .where(eq(products.id, sale.productId))
        .returning();

      // إنشاء عملية البيع
      const [newSale] = await db
        .insert(sales)
        .values({
          productId: sale.productId,
          customerId,
          quantity: sale.quantity,
          priceIqd: sale.priceIqd,
          userId: sale.userId,
          isInstallment: sale.isInstallment,
          date: sale.date
        })
        .returning();

      // تسجيل حركة المخزون
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
      .values([campaign])
      .returning();
    return newCampaign;
  }

  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(marketingCampaigns)
      .set(update)
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
          ...update,
          budgetAmount: update.budgetAmount?.toString(),
          updatedAt: new Date()
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
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.customerId, customerId));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values({
        ...appointment,
        status: appointment.status as "scheduled" | "completed" | "cancelled",
      })
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set(update)
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
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
}

export const storage = new DatabaseStorage();