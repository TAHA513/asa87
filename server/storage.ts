import { 
  User, Product, Sale, ExchangeRate, InsertUser, Installment, InstallmentPayment, 
  Campaign, InsertCampaign, CampaignAnalytics, InsertCampaignAnalytics, 
  SocialMediaAccount, apiKeys, type ApiKey, type InsertApiKey, 
  InventoryTransaction, InsertInventoryTransaction,
  ExpenseCategory, InsertExpenseCategory, Expense, InsertExpense
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";

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
  private currentId: number = 1;
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    // Remove initial data loading
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: "staff",
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...update };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: Product): Promise<Product> {
    const id = this.currentId++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    const updatedProduct = { ...product, ...update };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async createSale(sale: Sale): Promise<Sale> {
    const id = this.currentId++;
    const newSale = { ...sale, id, date: new Date() };
    this.sales.set(id, newSale);
    return newSale;
  }

  async getCurrentExchangeRate(): Promise<ExchangeRate> {
    const rates = Array.from(this.exchangeRates.values());
    if (rates.length === 0) {
      return this.setExchangeRate(1300);
    }
    return rates[rates.length - 1];
  }

  async setExchangeRate(rate: number): Promise<ExchangeRate> {
    const id = this.currentId++;
    const exchangeRate: ExchangeRate = {
      id,
      usdToIqd: rate.toString(),
      date: new Date(),
    };
    this.exchangeRates.set(id, exchangeRate);
    console.log("Storage: Exchange rate updated to:", exchangeRate);
    return exchangeRate;
  }

  async getInstallments(): Promise<Installment[]> {
    return Array.from(this.installments.values());
  }

  async getInstallment(id: number): Promise<Installment | undefined> {
    return this.installments.get(id);
  }

  async createInstallment(installment: Installment): Promise<Installment> {
    const id = this.currentId++;
    const newInstallment = { ...installment, id };
    this.installments.set(id, newInstallment);
    return newInstallment;
  }

  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> {
    const installment = this.installments.get(id);
    if (!installment) throw new Error("التقسيط غير موجود");
    const updatedInstallment = { ...installment, ...update };
    this.installments.set(id, updatedInstallment);
    return updatedInstallment;
  }

  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> {
    return Array.from(this.installmentPayments.values()).filter(
      (payment) => payment.installmentId === installmentId
    );
  }

  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> {
    const id = this.currentId++;
    const newPayment = { ...payment, id };
    this.installmentPayments.set(id, newPayment);
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
    return Array.from(this.campaigns.values());
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentId++;
    const newCampaign: Campaign = {
      ...campaign,
      id,
      status: "draft",
      metrics: null,
      description: campaign.description || null,
      endDate: campaign.endDate || null,
      budget: campaign.budget.toString(),
      createdAt: new Date(),
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("الحملة غير موجودة");
    const updatedCampaign = { ...campaign, ...update };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> {
    return Array.from(this.campaignAnalytics.values()).filter(
      (analytics) => analytics.campaignId === campaignId
    );
  }

  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
    const id = this.currentId++;
    const newAnalytics: CampaignAnalytics = {
      ...analytics,
      id,
      spend: analytics.spend.toString(),
    };
    this.campaignAnalytics.set(id, newAnalytics);
    return newAnalytics;
  }

  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    return Array.from(this.socialMediaAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }

  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    const id = this.currentId++;
    const newAccount = { ...account, id };
    this.socialMediaAccounts.set(id, newAccount);
    return newAccount;
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    this.socialMediaAccounts.delete(id);
  }

  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {
    this.apiKeys.set(userId, keys);
  }

  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    return this.apiKeys.get(userId) || null;
  }

  async migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void> {
    //This is a placeholder, a real implementation would move data from local storage to the database.
  }

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values());
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const id = this.currentId++;
    const newTransaction: InventoryTransaction = {
      id,
      type: transaction.type,
      productId: transaction.productId,
      quantity: transaction.quantity,
      userId: transaction.userId,
      reason: transaction.reason,
      date: transaction.date || new Date(),
      notes: transaction.notes || null,
      reference: transaction.reference || null
    };
    this.inventoryTransactions.set(id, newTransaction);
    return newTransaction;
  }

  // Expense Categories
  async getExpenseCategories(userId: number): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategories.values())
      .filter(category => category.userId === userId);
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    return this.expenseCategories.get(id);
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = this.currentId++;
    const newCategory: ExpenseCategory = {
      id,
      name: category.name,
      description: category.description || null,
      userId: category.userId,
      parentId: category.parentId || null,
      budgetAmount: category.budgetAmount?.toString() || null,
      createdAt: new Date(),
    };
    this.expenseCategories.set(id, newCategory);
    return newCategory;
  }

  async updateExpenseCategory(id: number, update: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const category = this.expenseCategories.get(id);
    if (!category) throw new Error("فئة المصروفات غير موجودة");
    const updatedCategory = { 
      ...category,
      ...update,
      budgetAmount: update.budgetAmount?.toString() || category.budgetAmount
    };
    this.expenseCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    this.expenseCategories.delete(id);
  }

  // Expenses
  async getExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId);
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.currentId++;
    const newExpense: Expense = {
      id,
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
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  async updateExpense(id: number, update: Partial<Expense>): Promise<Expense> {
    const expense = this.expenses.get(id);
    if (!expense) throw new Error("المصروف غير موجود");
    const updatedExpense = {
      ...expense,
      ...update,
      amount: update.amount?.toString() || expense.amount,
      updatedAt: new Date(),
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<void> {
    this.expenses.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> { return undefined; }
  async getUserByUsername(username: string): Promise<User | undefined> { return undefined; }
  async createUser(insertUser: InsertUser): Promise<User> { 
    return { id: 1, ...insertUser, role: "staff" }; 
  }
  async updateUser(id: number, update: Partial<User>): Promise<User> { 
    throw new Error("Not implemented"); 
  }
  async getProducts(): Promise<Product[]> { return []; }
  async getProduct(id: number): Promise<Product | undefined> { return undefined; }
  async createProduct(product: Product): Promise<Product> { return product; }
  async updateProduct(id: number, product: Partial<Product>): Promise<Product> { return product as Product; }
  async getSales(): Promise<Sale[]> { return []; }
  async createSale(sale: Sale): Promise<Sale> { return sale; }
  async getCurrentExchangeRate(): Promise<ExchangeRate> { return {id:0, usdToIqd: "1", date: new Date()} as ExchangeRate; }
  async setExchangeRate(rate: number): Promise<ExchangeRate> { return {id:0, usdToIqd: rate.toString(), date: new Date()} as ExchangeRate; }
  async getInstallments(): Promise<Installment[]> { return []; }
  async getInstallment(id: number): Promise<Installment | undefined> { return undefined; }
  async createInstallment(installment: Installment): Promise<Installment> { return installment; }
  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> { return installment as Installment; }
  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> { return []; }
  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> { return payment; }
  async getCampaigns(): Promise<Campaign[]> { return []; }
  async getCampaign(id: number): Promise<Campaign | undefined> { return undefined; }
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> { return campaign as Campaign; }
  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> { return campaign as Campaign; }
  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> { return []; }
  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> { return analytics as CampaignAnalytics; }
  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> { return []; }
  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> { return account; }
  async deleteSocialMediaAccount(id: number): Promise<void> {}
  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {}
  async getApiKeys(userId: number): Promise<Record<string, any> | null> { return null; }
  async migrateLocalStorageToDb(userId: number, keys: Record<string, any>): Promise<void> {}
  async getInventoryTransactions(): Promise<InventoryTransaction[]> { return []; }
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> { return transaction as InventoryTransaction; }
  async getExpenseCategories(userId: number): Promise<ExpenseCategory[]> { return []; }
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> { return undefined; }
  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> { return category as ExpenseCategory; }
  async updateExpenseCategory(id: number, update: Partial<ExpenseCategory>): Promise<ExpenseCategory> { return category as ExpenseCategory; }
  async deleteExpenseCategory(id: number): Promise<void> {}
  async getExpenses(userId: number): Promise<Expense[]> { return []; }
  async getExpense(id: number): Promise<Expense | undefined> { return undefined; }
  async createExpense(expense: InsertExpense): Promise<Expense> { return expense as Expense; }
  async updateExpense(id: number, update: Partial<Expense>): Promise<Expense> { return expense as Expense; }
  async deleteExpense(id: number): Promise<void> {}
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();