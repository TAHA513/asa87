import { User, Product, Sale, ExchangeRate, InsertUser, Installment, InstallmentPayment, Campaign, InsertCampaign, CampaignAnalytics, InsertCampaignAnalytics, SocialMediaAccount } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { addMonths } from "date-fns";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // الوظائف الحالية
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

  // وظائف التسويق
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign>;
  getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]>;
  createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics>;

  // وظائف حسابات التواصل الاجتماعي
  getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]>;
  createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount>;
  deleteSocialMediaAccount(id: number): Promise<void>;

  // وظائف مفاتيح API
  setApiKeys(userId: number, apiKeys: Record<string, any>): Promise<void>;
  getApiKeys(userId: number): Promise<Record<string, any> | null>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private sales: Map<number, Sale>;
  private exchangeRates: Map<number, ExchangeRate>;
  private installments: Map<number, Installment>;
  private installmentPayments: Map<number, InstallmentPayment>;
  private campaigns: Map<number, Campaign>;
  private campaignAnalytics: Map<number, CampaignAnalytics>;
  private socialMediaAccounts: Map<number, SocialMediaAccount>;
  private apiKeys: Map<number, Record<string, any>>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    // المتغيرات الحالية
    this.users = new Map();
    this.products = new Map();
    this.sales = new Map();
    this.exchangeRates = new Map();
    this.installments = new Map();
    this.installmentPayments = new Map();
    // متغيرات التسويق
    this.campaigns = new Map();
    this.campaignAnalytics = new Map();
    this.socialMediaAccounts = new Map();
    this.apiKeys = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.setExchangeRate(1300);
  }

  // الوظائف الحالية تبقى كما هي
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id, role: "staff" };
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
      date: new Date()
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

  async createInstallment(installment: Omit<Installment, "id">): Promise<Installment> {
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

  async createInstallmentPayment(payment: Omit<InstallmentPayment, "id">): Promise<InstallmentPayment> {
    const id = this.currentId++;
    const newPayment = { ...payment, id };
    this.installmentPayments.set(id, newPayment);
    const installment = await this.getInstallment(payment.installmentId);
    if (installment) {
      const remainingAmount = Number(installment.remainingAmount) - Number(payment.amount);
      await this.updateInstallment(installment.id, {
        remainingAmount: remainingAmount.toString(),
        status: remainingAmount <= 0 ? "completed" : "active"
      });
    }
    return newPayment;
  }

  // وظائف جديدة للتسويق
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
    return Array.from(this.campaignAnalytics.values())
      .filter(analytics => analytics.campaignId === campaignId);
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

  // وظائف حسابات التواصل الاجتماعي
  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    return Array.from(this.socialMediaAccounts.values())
      .filter(account => account.userId === userId);
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

  // وظائف مفاتيح API
  async setApiKeys(userId: number, apiKeys: Record<string, any>): Promise<void> {
    console.log("Saving API keys for user:", userId, apiKeys);
    this.apiKeys.set(userId, apiKeys);
  }

  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    console.log("Getting API keys for user:", userId);
    const keys = this.apiKeys.get(userId);
    console.log("Retrieved keys:", keys);
    return keys || null;
  }
}

export const storage = new MemStorage();