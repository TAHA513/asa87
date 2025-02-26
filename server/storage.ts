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
  // لا نحتاج إلى تخزين البيانات في الذاكرة المؤقتة بعد الآن
  // سنستخدم قاعدة البيانات فقط
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
      // تنفيذ وظيفة تحديث المستخدم في dbStorage
      // يمكن إضافتها في ملف db-storage.ts
      throw new Error("وظيفة تحديث المستخدم غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث المستخدم في قاعدة البيانات:", error);
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
    try {
      return await dbStorage.getInstallments();
    } catch (error) {
      console.error("خطأ في جلب التقسيطات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getInstallment(id: number): Promise<Installment | undefined> {
    try {
      return await dbStorage.getInstallment(id);
    } catch (error) {
      console.error("خطأ في جلب التقسيط من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createInstallment(installment: Installment): Promise<Installment> {
    try {
      const savedInstallment = await dbStorage.createInstallment(installment);
      if (savedInstallment) {
        return savedInstallment;
      }
      throw new Error("فشل في حفظ التقسيط في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء التقسيط في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateInstallment(id: number, update: Partial<Installment>): Promise<Installment> {
    try {
      const updatedInstallment = await dbStorage.updateInstallment(id, update);
      if (updatedInstallment) {
        this.installments.set(id, updatedInstallment);
        return updatedInstallment;
      }
      // احتياطي: استخدام التخزين المؤقت إذا فشل التحديث في قاعدة البيانات
      const installment = this.installments.get(id);
      if (!installment) throw new Error("التقسيط غير موجود");
      const localUpdatedInstallment = { ...installment, ...update };
      this.installments.set(id, localUpdatedInstallment);
      return localUpdatedInstallment;
    } catch (error) {
      console.error("خطأ في تحديث التقسيط في قاعدة البيانات:", error);
      const installment = this.installments.get(id);
      if (!installment) throw new Error("التقسيط غير موجود");
      const updatedInstallment = { ...installment, ...update };
      this.installments.set(id, updatedInstallment);
      return updatedInstallment;
    }
  }

  async getInstallmentPayments(installmentId: number): Promise<InstallmentPayment[]> {
    try {
      const payments = await dbStorage.getInstallmentPayments(installmentId);
      // تحديث الذاكرة المؤقتة بالبيانات من قاعدة البيانات
      payments.forEach(payment => {
        this.installmentPayments.set(payment.id, payment);
      });
      return payments;
    } catch (error) {
      console.error("خطأ في جلب دفعات التقسيط من قاعدة البيانات:", error);
      return Array.from(this.installmentPayments.values()).filter(
        (payment) => payment.installmentId === installmentId
      );
    }
  }

  async createInstallmentPayment(payment: InstallmentPayment): Promise<InstallmentPayment> {
    try {
      const savedPayment = await dbStorage.createInstallmentPayment(payment);
      if (savedPayment) {
        this.installmentPayments.set(savedPayment.id, savedPayment);
        
        // تحديث بيانات التقسيط بعد إضافة دفعة
        const installment = await this.getInstallment(payment.installmentId);
        if (installment) {
          const remainingAmount = Number(installment.remainingAmount) - Number(payment.amount);
          await this.updateInstallment(installment.id, {
            remainingAmount: remainingAmount.toString(),
            status: remainingAmount <= 0 ? "completed" : "active",
          });
        }
        
        return savedPayment;
      }
      
      // احتياطي: استخدام التخزين المؤقت إذا فشل التخزين في قاعدة البيانات
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
    } catch (error) {
      console.error("خطأ في إنشاء دفعة التقسيط في قاعدة البيانات:", error);
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
  }

  async getCampaigns(): Promise<Campaign[]> {
    try {
      // يجب تنفيذ وظيفة للحصول على الحملات من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب الحملات من قاعدة البيانات:", error);
      return [];
    }
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    try {
      // يجب تنفيذ وظيفة للحصول على الحملة من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return undefined;
    } catch (error) {
      console.error("خطأ في جلب الحملة من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    try {
      // يجب تنفيذ وظيفة لإنشاء حملة في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة إنشاء الحملة غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء الحملة في قاعدة البيانات:", error);
      throw error;
    }
  }

  async updateCampaign(id: number, update: Partial<Campaign>): Promise<Campaign> {
    try {
      // يجب تنفيذ وظيفة لتحديث الحملة في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة تحديث الحملة غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في تحديث الحملة في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics[]> {
    try {
      // يجب تنفيذ وظيفة للحصول على تحليلات الحملة من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب تحليلات الحملة من قاعدة البيانات:", error);
      return [];
    }
  }

  async createCampaignAnalytics(analytics: InsertCampaignAnalytics): Promise<CampaignAnalytics> {
    try {
      // يجب تنفيذ وظيفة لإنشاء تحليلات الحملة في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة إنشاء تحليلات الحملة غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء تحليلات الحملة في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    try {
      // يجب تنفيذ وظيفة للحصول على حسابات وسائل التواصل الاجتماعي من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب حسابات وسائل التواصل الاجتماعي من قاعدة البيانات:", error);
      return [];
    }
  }

  async createSocialMediaAccount(account: SocialMediaAccount): Promise<SocialMediaAccount> {
    try {
      // يجب تنفيذ وظيفة لإنشاء حساب وسائل التواصل الاجتماعي في قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة إنشاء حساب وسائل التواصل الاجتماعي غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء حساب وسائل التواصل الاجتماعي في قاعدة البيانات:", error);
      throw error;
    }
  }

  async deleteSocialMediaAccount(id: number): Promise<void> {
    try {
      // يجب تنفيذ وظيفة لحذف حساب وسائل التواصل الاجتماعي من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      throw new Error("وظيفة حذف حساب وسائل التواصل الاجتماعي غير منفذة في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في حذف حساب وسائل التواصل الاجتماعي من قاعدة البيانات:", error);
      throw error;
    }
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
    return this.expenseCategories.get(id);
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    try {
      const newCategory = await dbStorage.createExpenseCategory({
        name: category.name,
        description: category.description || null,
        budgetAmount: category.budgetAmount || null,
        userId: category.userId,
      });
      return newCategory;
    } catch (error) {
      console.error("خطأ في إنشاء فئة المصروفات:", error);
      throw error;
    }
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

  async getSuppliers(userId: number): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(
      (supplier) => supplier.userId === userId
    );
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentId++;
    const newSupplier: Supplier = {
      ...supplier,
      id,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, update: Partial<Supplier>): Promise<Supplier> {
    const supplier = this.suppliers.get(id);
    if (!supplier) throw new Error("المورد غير موجود");
    const updatedSupplier = { ...supplier, ...update, updatedAt: new Date() };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<void> {
    this.suppliers.delete(id);
  }

  async getSupplierTransactions(supplierId: number): Promise<SupplierTransaction[]> {
    return Array.from(this.supplierTransactions.values()).filter(
      (transaction) => transaction.supplierId === supplierId
    );
  }

  async createSupplierTransaction(transaction: InsertSupplierTransaction): Promise<SupplierTransaction> {
    const id = this.currentId++;
    const newTransaction: SupplierTransaction = {
      ...transaction,
      id,
      createdAt: new Date(),
    };
    this.supplierTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async searchCustomers(search?: string): Promise<Customer[]> {
    try {
      return await dbStorage.searchCustomers(search);
    } catch (error) {
      console.error("خطأ في البحث عن العملاء في قاعدة البيانات:", error);
      return [];
    }
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      return await dbStorage.getCustomer(id);
    } catch (error) {
      console.error("خطأ في جلب العميل من قاعدة البيانات:", error);
      return undefined;
    }
  }

  async getCustomerSales(customerId: number): Promise<Sale[]> {
    try {
      // يجب تنفيذ وظيفة للحصول على مبيعات العميل من قاعدة البيانات
      // تحتاج إلى إضافة هذه الوظيفة في db-storage.ts
      return [];
    } catch (error) {
      console.error("خطأ في جلب مبيعات العميل من قاعدة البيانات:", error);
      return [];
    }
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    try {
      const dbCustomer = await dbStorage.createCustomer(insertCustomer);
      if (dbCustomer) {
        return dbCustomer;
      }
      throw new Error("فشل في إنشاء العميل في قاعدة البيانات");
    } catch (error) {
      console.error("خطأ في إنشاء العميل في قاعدة البيانات:", error);
      throw error;
    }
  }

  async getCustomerAppointments(customerId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.customerId === customerId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId++;
    const newAppointment: Appointment = {
      id,
      customerId: appointment.customerId,
      title: appointment.title,
      description: appointment.description || null,
      date: appointment.date,
      duration: appointment.duration,
      status: appointment.status || "scheduled",
      notes: appointment.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error("الموعد غير موجود");
    const updatedAppointment = {
      ...appointment,
      ...update,
      updatedAt: new Date()
    };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    this.appointments.delete(id);
  }

  async deleteCustomer(id: number): Promise<void> {
    try {
      await dbStorage.deleteCustomer(id);
      this.customers.delete(id);
    } catch (error) {
      console.error("خطأ في حذف العميل من قاعدة البيانات:", error);
      // حذف العميل من الذاكرة المؤقتة على الأقل
      this.customers.delete(id);
    }
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