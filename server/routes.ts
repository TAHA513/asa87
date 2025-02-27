import type { Express } from "express";
import { Router } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertProductSchema,
  insertSaleSchema,
  insertInstallmentSchema,
  insertInstallmentPaymentSchema,
  insertInventoryTransactionSchema,
  insertExpenseCategorySchema,
  insertExpenseSchema,
  insertSupplierSchema,
  insertSupplierTransactionSchema,
  insertCustomerSchema,
  type Customer,
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { insertAppointmentSchema } from "@shared/schema";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const log = (message: string) => console.log(message);


export async function registerRoutes(app: any): Promise<Server> {
  const router = Router();
  app.use("/api", router);
  setupAuth(app);

  // Products
  router.get("/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  router.post("/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  router.patch("/products/:id", async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  router.delete("/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      await storage.deleteProduct(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "فشل في حذف المنتج" });
    }
  });


  // Sales
  router.get("/sales", async (_req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });

  router.post("/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const sale = await storage.createSale({
        ...req.body,
        userId: req.user!.id,
        date: new Date()
      });

      // Update product stock
      const product = await storage.getProduct(sale.productId);
      if (product) {
        await storage.updateProduct(product.id, {
          ...product,
          stock: product.stock - sale.quantity
        });
      }

      res.status(201).json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "فشل في إنشاء عملية البيع" });
    }
  });

  // Exchange Rates  
  router.get("/exchange-rate", async (_req, res) => {
    try {
      const rate = await storage.getCurrentExchangeRate();
      res.json(rate);
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      res.status(500).json({ message: "فشل في جلب سعر الصرف" });
    }
  });

  router.post("/exchange-rate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول لتحديث سعر الصرف" });
    }

    try {
      console.log("Updating exchange rate with:", req.body);
      const rate = Number(req.body.usdToIqd);
      if (isNaN(rate) || rate <= 0) {
        return res.status(400).json({ message: "سعر الصرف يجب أن يكون رقماً موجباً" });
      }

      const updatedRate = await storage.setExchangeRate(rate);
      console.log("Exchange rate updated to:", updatedRate);
      res.status(201).json(updatedRate);
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      res.status(500).json({ message: "فشل في تحديث سعر الصرف" });
    }
  });

  // Theme Settings
  router.post("/theme", async (req, res) => {
    try {
      // التحقق من صحة البيانات
      const themeSchema = z.object({
        primary: z.string(),
        variant: z.enum(["professional", "vibrant", "tint"]),
        appearance: z.enum(["light", "dark", "system"]),
        radius: z.number(),
      });

      const theme = themeSchema.parse(req.body);

      // حفظ الثيم في ملف theme.json
      await fs.writeFile(
        path.join(process.cwd(), "theme.json"),
        JSON.stringify(theme, null, 2)
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "فشل في تحديث المظهر" });
    }
  });

  // طرق التقسيط
  router.get("/installments", async (_req, res) => {
    const installments = await storage.getInstallments();
    res.json(installments);
  });

  router.get("/installments/:id", async (req, res) => {
    const installment = await storage.getInstallment(Number(req.params.id));
    if (!installment) {
      return res.status(404).json({ message: "التقسيط غير موجود" });
    }
    res.json(installment);
  });

  router.post("/installments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const installment = await storage.createInstallment({
        ...req.body,
        startDate: new Date(),
        status: "active"
      });

      res.status(201).json(installment);
    } catch (error) {
      console.error("Error creating installment:", error);
      res.status(500).json({ message: "فشل في إنشاء التقسيط" });
    }
  });

  router.get("/installments/:id/payments", async (req, res) => {
    const payments = await storage.getInstallmentPayments(Number(req.params.id));
    res.json(payments);
  });

  router.post("/installments/:id/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const payment = await storage.createInstallmentPayment({
        ...req.body,
        installmentId: Number(req.params.id),
        paymentDate: new Date()
      });

      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "فشل في إنشاء الدفعة" });
    }
  });

  // Marketing Campaign Routes
  router.get("/marketing/campaigns", async (_req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  router.get("/marketing/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign) {
      return res.status(404).json({ message: "الحملة غير موجودة" });
    }
    res.json(campaign);
  });

  router.post("/marketing/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const campaign = await storage.createCampaign({
        ...req.body,
        userId: req.user!.id,
      });

      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "فشل في إنشاء الحملة" });
    }
  });

  router.get("/marketing/campaigns/:id/analytics", async (req, res) => {
    const analytics = await storage.getCampaignAnalytics(Number(req.params.id));
    res.json(analytics);
  });

  router.post("/marketing/campaigns/:id/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const analytics = await storage.createCampaignAnalytics({
        ...req.body,
        campaignId: Number(req.params.id),
      });

      res.status(201).json(analytics);
    } catch (error) {
      console.error("Error creating analytics:", error);
      res.status(500).json({ message: "فشل في تسجيل التحليلات" });
    }
  });


  // Social Media Auth Routes
  router.get("/marketing/social-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }
    const accounts = await storage.getSocialMediaAccounts(req.user!.id);
    res.json(accounts);
  });

  router.get("/marketing/social-auth/:platform", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    const { platform } = req.params;

    try {
      // Mock social auth data with all required fields
      const mockAccount = {
        id: Date.now(),
        userId: req.user!.id,
        platform,
        accountName: `${req.user!.username}_${platform}`,
        accessToken: `mock_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date()
      };

      await storage.createSocialMediaAccount(mockAccount);

      // Return HTML that will post message to parent window and close
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'social-auth-success',
                platform: '${platform}',
                accountName: '${mockAccount.accountName}'
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error(`Error authenticating with ${platform}:`, error);
      res.status(500).json({ message: "فشل في عملية المصادقة" });
    }
  });

  router.delete("/marketing/social-accounts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      await storage.deleteSocialMediaAccount(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting social account:", error);
      res.status(500).json({ message: "فشل في إلغاء ربط الحساب" });
    }
  });

  // API Key routes
  router.post("/settings/api-keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      // التحقق من صحة البيانات
      const apiKeysSchema = z.object({
        facebook: z.object({
          appId: z.string().min(1, "App ID مطلوب"),
          appSecret: z.string().min(1, "App Secret مطلوب"),
        }),
        twitter: z.object({
          apiKey: z.string().min(1, "API Key مطلوب"),
          apiSecret: z.string().min(1, "API Secret مطلوب"),
        }),
        tiktok: z.object({
          clientKey: z.string().min(1, "Client Key مطلوب"),
          clientSecret: z.string().min(1, "Client Secret مطلوب"),
        }),
        snapchat: z.object({
          clientId: z.string().min(1, "Client ID مطلوب"),
          clientSecret: z.string().min(1, "Client Secret مطلوب"),
        }),
        linkedin: z.object({
          clientId: z.string().min(1, "Client ID مطلوب"),
          clientSecret: z.string().min(1, "Client Secret مطلوب"),
        }),
      });

      const apiKeys = apiKeysSchema.parse(req.body);

      // حفظ المفاتيح في قاعدة البيانات بشكل آمن
      await storage.setApiKeys(req.user!.id, apiKeys);

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating API keys:", error);
      res.status(500).json({ message: "فشل في تحديث مفاتيح API" });
    }
  });

  router.get("/settings/api-keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const apiKeys = await storage.getApiKeys(req.user!.id);
      res.json(apiKeys);
    } catch (error) {
      console.error("Error getting API keys:", error);
      res.status(500).json({ message: "فشل في جلب مفاتيح API" });
    }
  });

  router.post("/settings/api-keys/migrate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      await storage.migrateLocalStorageToDb(req.user!.id, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error migrating API keys:", error);
      res.status(500).json({ message: "فشل في ترحيل مفاتيح API" });
    }
  });

  // Inventory Transaction Routes
  router.get("/inventory/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const transactions = await storage.getInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ message: "فشل في جلب حركات المخزون" });
    }
  });

  router.post("/inventory/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const transaction = await storage.createInventoryTransaction({
        ...req.body,
        userId: req.user!.id,
        date: new Date()
      });

      // Update product stock
      const product = await storage.getProduct(transaction.productId);
      if (product) {
        const stockChange = transaction.type === 'in' ? transaction.quantity : -transaction.quantity;
        await storage.updateProduct(product.id, {
          ...product,
          stock: product.stock + stockChange
        });
      }

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      res.status(500).json({ message: "فشل في إنشاء حركة المخزون" });
    }
  });

  // Expense Categories Routes
  router.get("/expenses/categories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const categories = await storage.getExpenseCategories(req.user!.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      res.status(500).json({ message: "فشل في جلب فئات المصروفات" });
    }
  });

  router.post("/expenses/categories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      console.log("Received category data:", req.body); // للتأكد من البيانات المستلمة
      const validatedData = insertExpenseCategorySchema.parse({
        name: req.body.name,
        description: req.body.description,
        budgetAmount: req.body.budgetAmount ? Number(req.body.budgetAmount) : null,
      });

      const category = await storage.createExpenseCategory({
        ...validatedData,
        userId: req.user!.id,
      });

      console.log("Created category:", category); // للتأكد من نجاح العملية
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating expense category:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "فشل في إنشاء فئة المصروفات" });
      }
    }
  });

  // Expenses Routes
  router.get("/expenses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const expenses = await storage.getExpenses(req.user!.id);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "فشل في جلب المصروفات" });
    }
  });

  router.post("/expenses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "فشل في إنشاء المصروف" });
      }
    }
  });

  // Suppliers Routes
  router.get("/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const suppliers = await storage.getSuppliers(req.user!.id);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "فشل في جلب قائمة الموردين" });
    }
  });

  router.post("/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "فشل في إنشاء المورد" });
      }
    }
  });

  router.patch("/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const supplier = await storage.getSupplier(Number(req.params.id));
      if (!supplier || supplier.userId !== req.user!.id) {
        return res.status(404).json({ message: "المورد غير موجود" });
      }

      const updatedSupplier = await storage.updateSupplier(supplier.id, req.body);
      res.json(updatedSupplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "فشل في تحديث المورد" });
    }
  });

  router.delete("/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const supplier = await storage.getSupplier(Number(req.params.id));
      if (!supplier || supplier.userId !== req.user!.id) {
        return res.status(404).json({ message: "المورد غير موجود" });
      }
      await storage.deleteSupplier(supplier.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "فشل في حذف المورد" });
    }
  });

  router.get("/suppliers/:id/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const transactions = await storage.getSupplierTransactions(Number(req.params.id));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching supplier transactions:", error);
      res.status(500).json({ message: "فشل في جلب معاملات المورد" });
    }
  });

  router.post("/suppliers/:id/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const validatedData = insertSupplierTransactionSchema.parse(req.body);
      const transaction = await storage.createSupplierTransaction({
        ...validatedData,
        supplierId: Number(req.params.id),
        userId: req.user!.id,
      });
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating supplier transaction:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "فشل في إنشاء معاملة المورد" });
      }
    }
  });

  // Customer Routes
  router.get("/customers", async (req, res) => {
    try {
      const search = req.query.search as string;
      const customers = await storage.searchCustomers(search);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "فشل في جلب قائمة العملاء" });
    }
  });

  router.get("/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(Number(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "فشل في جلب بيانات العميل" });
    }
  });

  router.get("/customers/:id/sales", async (req, res) => {
    try {
      const sales = await storage.getCustomerSales(Number(req.params.id));
      res.json(sales);
    } catch (error) {
      console.error("Error fetching customer sales:", error);
      res.status(500).json({ message: "فشل في جلب مشتريات العميل" });
    }
  });

  router.post("/customers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "فشل في إنشاء العميل" });
      }
    }
  });

  // إضافة مسار حذف العميل
  router.delete("/customers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const customerId = Number(req.params.id);
      await storage.deleteCustomer(customerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "فشل في حذف العميل" });
    }
  });

  // Appointment Routes
  router.get("/customers/:id/appointments", async (req, res) => {
    try {
      const appointments = await storage.getCustomerAppointments(Number(req.params.id));
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      res.status(500).json({ message: "فشل في جلب المواعيد" });
    }
  });

  router.post("/customers/:id/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment({
        ...validatedData,
        customerId: Number(req.params.id),
      });
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "فشل في إنشاء الموعد" });
      }
    }
  });

  router.patch("/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const appointment = await storage.updateAppointment(Number(req.params.id), req.body);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "فشل في تحديث الموعد" });
    }
  });

  router.delete("/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      await storage.deleteAppointment(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "فشل في حذف الموعد" });
    }
  });

  // File Storage Routes
  router.post("/files", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const file = await storage.saveFile({
        ...req.body,
        userId: req.user!.id,
      });
      res.status(201).json(file);
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ message: "فشل في حفظ الملف" });
    }
  });

  router.get("/files/:id", async (req, res) => {
    try {
      const file = await storage.getFileById(Number(req.params.id));
      if (!file) {
        return res.status(404).json({ message: "الملف غير موجود" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "فشل في جلب الملف" });
    }
  });

  router.get("/files/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const files = await storage.getUserFiles(req.user!.id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching user files:", error);
      res.status(500).json({ message: "فشل في جلب ملفات المستخدم" });
    }
  });

  router.delete("/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      await storage.deleteFile(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "فشل في حذف الملف" });
    }
  });

  // AI Chat Routes
  router.post("/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "الرسالة مطلوبة" });
      }

      // Get Groq API key from environment
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ message: "مفتاح API غير مكوّن" });
      }

      // Call Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "أنت مساعد ذكي يساعد في إدارة المتجر وخدمة العملاء." },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error("Groq API error:", data.error);
        return res.status(500).json({ message: "خطأ في خدمة الذكاء الاصطناعي", error: data.error });
      }

      const aiResponse = data.choices[0].message.content;
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "فشل في معالجة طلب المحادثة الذكية" });
    }
  });

  // إضافة API للتحقق من مفتاح Groq
  router.get("/settings/api-keys", (_req, res) => {
    try {
      res.json({
        apiKeys: {
          groq: process.env.GROQ_API_KEY || ""
        }
      });
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "فشل في جلب مفاتيح API" });
    }
  });

  // API لتحديث مفتاح Groq
  router.post("/settings/api-keys", (req, res) => {
    try {
      const { groqApiKey } = req.body;
      // في حالة استخدام مشروع حقيقي، يجب تخزين المفتاح في قاعدة البيانات أو .env
      // هنا يتم إرجاع استجابة فقط للاختبار
      res.json({ success: true, message: "تم تحديث مفتاح API بنجاح" });
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: "فشل في تحديث مفتاح API" });
    }
  });

  // API لتعديل الكود باستخدام Groq
  router.post("/modify-code", async (req, res) => {
    try {
      const { request } = req.body;
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'; // تصحيح المسار

      if (!GROQ_API_KEY) {
        return res.status(400).json({ message: "مفتاح Groq API غير متوفر" });
      }

      console.log('🚀 جاري إرسال الطلب إلى Groq API...');
      
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model: "llama3-70b-8192", // استخدام النموذج الصحيح كما في الصورة
          messages: [
            { role: "system", content: "أنت مساعد برمجي محترف، قم بتحليل الطلب وتحسين الكود البرمجي مع الحفاظ على تنسيقه." },
            { role: "user", content: request }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('✅ تم استلام الرد من Groq API بنجاح');
      
      if (response.data.error) {
        console.error('❌ خطأ في استجابة Groq API:', response.data.error);
        return res.status(500).json({ message: "خطأ في خدمة الذكاء الاصطناعي", error: response.data.error });
      }

      const aiResponse = response.data.choices[0].message.content;
      res.json({ modifiedCode: aiResponse });
    } catch (error) {
      console.error('❌ خطأ في تعديل الكود:', error.response?.data || error.message || error);
      res.status(500).json({ message: "حدث خطأ أثناء تعديل الكود", error: error.message });
    }
  });

  const server = createServer(app);
  server.listen(5000, "0.0.0.0", () => {
    log(`🚀 الخادم يعمل على http://0.0.0.0:5000`);
  });

  return server;
}