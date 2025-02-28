import {
  User, Product, Sale, ExchangeRate, InsertUser, FileStorage, InsertFileStorage,
  Installment, InstallmentPayment,
  Campaign, InsertCampaign, CampaignAnalytics, InsertCampaignAnalytics,
  SocialMediaAccount, apiKeys, type ApiKey, type InsertApiKey,
  InventoryTransaction, InsertInventoryTransaction,
  ExpenseCategory, InsertExpenseCategory, Expense, InsertExpense,
  Supplier, InsertSupplier, SupplierTransaction, InsertSupplierTransaction,
  Customer, InsertCustomer, Appointment, InsertAppointment,
  Invoice, InsertInvoice,
  sales, customers, users, products, expenses, suppliers, supplierTransactions, 
  appointments, inventoryTransactions, invoices
} from "@shared/schema";
import { db } from "./db";
import { eq, or, like } from "drizzle-orm";
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
    return dbStorage.getProducts();
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return dbStorage.getProduct(id);
  }

  async createProduct(product: Product): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(update)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    return dbStorage.deleteProduct(id);
  }

  async getSales(): Promise<Sale[]> {
    return dbStorage.getSales();
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
      // First ensure default customer exists
      const [defaultCustomer] = await db
        .select()
        .from(customers)
        .where(eq(customers.name, "عميل نقدي"));

      let customerId: number;

      if (sale.customerName) {
        // Create new customer with provided name
        const [newCustomer] = await db
          .insert(customers)
          .values({
            name: sale.customerName,
            createdAt: new Date(),
          })
          .returning();
        customerId = newCustomer.id;
      } else {
        if (defaultCustomer) {
          customerId = defaultCustomer.id;
        } else {
          // Create default customer if it doesn't exist
          const [newDefaultCustomer] = await db
            .insert(customers)
            .values({
              name: "عميل نقدي",
              createdAt: new Date(),
            })
            .returning();
          customerId = newDefaultCustomer.id;
        }
      }

      // Now create the sale with the customer ID
      const [newSale] = await db
        .insert(sales)
        .values({
          productId: sale.productId,
          customerId: customerId,
          quantity: sale.quantity,
          priceIqd: sale.priceIqd,
          userId: sale.userId || 1,
          isInstallment: sale.isInstallment,
          date: sale.date,
        })
        .returning();

      return newSale;
    } catch (error) {
      console.error("خطأ في حفظ عملية البيع في قاعدة البيانات:", error);
      throw error;
    }
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
    const [newExpense] = await db
      .insert(expenses)
      .values({
        ...expense,
        amount: Number(expense.amount),
        recurringPeriod: expense.recurringPeriod as "monthly" | "weekly" | "yearly" | undefined,
      })
      .returning();
    return newExpense;
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
    return dbStorage.updateSupplier(id, update);
  }

  async deleteSupplier(id: number): Promise<void> {
    return dbStorage.deleteSupplier(id);
  }

  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    return dbStorage.getSupplierTransactions(supplierId);
  }

  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    const [newTransaction] = await db
      .insert(supplierTransactions)
      .values({
        ...transaction,
        type: transaction.type as "payment" | "refund" | "advance" | "other",
        status: transaction.status as "completed" | "pending" | "cancelled",
      })
      .returning();
    return newTransaction;
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

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values([invoice])
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
}

export const storage = new DatabaseStorage();