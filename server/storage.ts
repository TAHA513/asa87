import { User, Product, Sale, ExchangeRate, InsertUser, Installment, InstallmentPayment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { addMonths } from "date-fns";

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
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private sales: Map<number, Sale>;
  private exchangeRates: Map<number, ExchangeRate>;
  private installments: Map<number, Installment>;
  private installmentPayments: Map<number, InstallmentPayment>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.sales = new Map();
    this.exchangeRates = new Map();
    this.installments = new Map();
    this.installmentPayments = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.setExchangeRate(1300);
  }

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
}

export const storage = new MemStorage();