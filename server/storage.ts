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
  invoices, invoiceItems, userSettings, reports,
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
  type Report, type InsertReport, type InvoiceItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like, SQL, gte, lte, and, sql } from "drizzle-orm";
import { caching } from "./cache";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
  getUserReports(userId: number, type?: string): Promise<any>;
  getAppointmentsReport(dateRange: { start: Date; end: Date }, userId: number): Promise<any>;
  getInvoices(filters?: {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<Invoice[]>;
}

export class DatabaseStorage implements IStorage {
  private cache: typeof caching;

  constructor() {
    this.cache = caching;
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("فشل في إنشاء المستخدم");
    }
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


      const [newSale] = await db
        .insert(sales)
        .values({
          productId: sale.productId,
          customerId: sale.customerName,
          quantity: sale.quantity,
          priceIqd: sale.priceIqd,
          discount: sale.discount,
          finalPriceIqd: (Number(sale.priceIqd) - Number(sale.discount)).toString(),
          userId: sale.userId,
          isInstallment: sale.isInstallment,
          date: sale.date
        })
        .returning();

      await db
        .update(products)
        .set({ stock: product.stock - sale.quantity })
        .where(eq(products.id, sale.productId));

      return newSale;
    } catch (error) {
      console.error("خطأ في إنشاء عملية البيع:", error);
      throw new Error("فشل في إنشاء عملية البيع. " + (error as Error).message);
    }
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
    //Implementation for saveReport
    return {} as Report;
  }

  async getReport(id: number): Promise<Report | undefined> {
    //Implementation for getReport
    return {} as Report;
  }
  async getUserReports(userId: number, type?: string): Promise<any> {
    //Implementation for getUserReports
    return [];
  }
  async getAppointmentsReport(dateRange: { start: Date; end: Date }, userId: number): Promise<any> {
    //Implementation for getAppointmentsReport
    return [];
  }
  async getInvoices(filters?: {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<Invoice[]> {
    //Implementation for getInvoices
    return [];
  }
}

// تصدير كائن storage
const storage = new DatabaseStorage();
export { storage };