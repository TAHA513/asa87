import type { Express } from "express";
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
import { insertAppointmentSchema } from "@shared/schema"; // Added import

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
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
  app.get("/api/sales", async (_req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });

  app.post("/api/sales", async (req, res) => {
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
  app.get("/api/exchange-rate", async (_req, res) => {
    try {
      const rate = await storage.getCurrentExchangeRate();
      res.json(rate);
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      res.status(500).json({ message: "فشل في جلب سعر الصرف" });
    }
  });

  app.post("/api/exchange-rate", async (req, res) => {
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
  app.post("/api/theme", async (req, res) => {
    try {
      // التحقق من صحة البيانات
      const themeSchema = z.object({
        primary: z.string(),
        variant: z.enum(["professional", "vibrant", "tint", "modern", "classic", "futuristic"]),
        appearance: z.enum(["light", "dark", "system"]),
        fontStyle: z.enum(["traditional", "modern", "minimal"]).optional(),
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
  app.get("/api/installments", async (_req, res) => {
    const installments = await storage.getInstallments();
    res.json(installments);
  });

  app.get("/api/installments/:id", async (req, res) => {
    const installment = await storage.getInstallment(Number(req.params.id));
    if (!installment) {
      return res.status(404).json({ message: "التقسيط غير موجود" });
    }
    res.json(installment);
  });

  app.post("/api/installments", async (req, res) => {
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

  app.get("/api/installments/:id/payments", async (req, res) => {
    const payments = await storage.getInstallmentPayments(Number(req.params.id));
    res.json(payments);
  });

  app.post("/api/installments/:id/payments", async (req, res) => {
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
  app.get("/api/marketing/campaigns", async (_req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.get("/api/marketing/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign) {
      return res.status(404).json({ message: "الحملة غير موجودة" });
    }
    res.json(campaign);
  });

  app.post("/api/marketing/campaigns", async (req, res) => {
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

  app.get("/api/marketing/campaigns/:id/analytics", async (req, res) => {
    const analytics = await storage.getCampaignAnalytics(Number(req.params.id));
    res.json(analytics);
  });

  app.post("/api/marketing/campaigns/:id/analytics", async (req, res) => {
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
  app.get("/api/marketing/social-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }
    const accounts = await storage.getSocialMediaAccounts(req.user!.id);
    res.json(accounts);
  });

  app.get("/api/marketing/social-auth/:platform", async (req, res) => {
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

  app.delete("/api/marketing/social-accounts/:id", async (req, res) => {
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

  // Get aggregated social media statistics from all connected platforms
  app.get("/api/marketing/social-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      // Get user's API keys and social media accounts
      const apiKeys = await storage.getApiKeys(req.user!.id);
      const accounts = await storage.getSocialMediaAccounts(req.user!.id);

      if (!apiKeys || !accounts.length) {
        return res.json({
          impressions: 0,
          engagement: 0,
          spend: 0
        });
      }

      let totalImpressions = 0;
      let totalEngagements = 0;
      let totalSpend = 0;

      // Fetch data from each connected platform
      for (const account of accounts) {
        const platformKeys = apiKeys[account.platform];
        if (!platformKeys) continue;

        try {
          let platformStats;
          switch (account.platform) {
            case 'facebook':
              platformStats = await fetchFacebookStats(account, platformKeys);
              break;
            case 'twitter':
              platformStats = await fetchTwitterStats(account, platformKeys);
              break;
            case 'instagram':
              platformStats = await fetchInstagramStats(account, platformKeys);
              break;
            case 'tiktok':
              platformStats = await fetchTikTokStats(account, platformKeys);
              break;
            case 'snapchat':
              platformStats = await fetchSnapchatStats(account, platformKeys);
              break;
            case 'linkedin':
              platformStats = await fetchLinkedInStats(account, platformKeys);
              break;
          }

          if (platformStats) {
            totalImpressions += platformStats.impressions;
            totalEngagements += platformStats.engagements;
            totalSpend += platformStats.spend;

            // Save analytics to database
            await storage.createCampaignAnalytics({
              campaignId: 0, // General platform analytics
              platform: account.platform,
              impressions: platformStats.impressions,
              clicks: platformStats.engagements,
              conversions: 0,
              spend: platformStats.spend.toString(),
              date: new Date()
            });
          }
        } catch (error) {
          console.error(`Error fetching ${account.platform} stats:`, error);
          // Continue with other platforms if one fails
        }
      }

      // Calculate engagement rate
      const engagement = totalImpressions > 0 ?
        totalEngagements / totalImpressions : 0;

      res.json({
        impressions: totalImpressions,
        engagement,
        spend: totalSpend
      });

    } catch (error) {
      console.error("Error fetching social media stats:", error);
      res.status(500).json({ message: "فشل في جلب إحصائيات وسائل التواصل الاجتماعي" });
    }
  });

  // Get platform-specific statistics
  app.get("/api/marketing/platform-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const apiKeys = await storage.getApiKeys(req.user!.id);
      const accounts = await storage.getSocialMediaAccounts(req.user!.id);

      if (!apiKeys || !accounts.length) {
        return res.json([]);
      }

      const platformStats = [];
      const platformColors = {
        facebook: '#1877F2',
        twitter: '#1DA1F2',
        instagram: '#E4405F',
        tiktok: '#000000',
        snapchat: '#FFFC00',
        linkedin: '#0A66C2'
      };

      for (const account of accounts) {
        const platformKeys = apiKeys[account.platform];
        if (!platformKeys) continue;

        try {
          let stats;
          switch (account.platform) {
            case 'facebook':
              stats = await fetchFacebookStats(account, platformKeys);
              break;
            case 'twitter':
              stats = await fetchTwitterStats(account, platformKeys);
              break;
            case 'instagram':
              stats = await fetchInstagramStats(account, platformKeys);
              break;
            case 'tiktok':
              stats = await fetchTikTokStats(account, platformKeys);
              break;
            case 'snapchat':
              stats = await fetchSnapchatStats(account, platformKeys);
              break;
            case 'linkedin':
              stats = await fetchLinkedInStats(account, platformKeys);
              break;
          }

          if (stats) {
            platformStats.push({
              platform: account.platform,
              name: account.accountName,
              color: platformColors[account.platform as keyof typeof platformColors],
              ...stats
            });
          }
        } catch (error) {
          console.error(`Error fetching ${account.platform} stats:`, error);
        }
      }

      res.json(platformStats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "فشل في جلب إحصائيات المنصات" });
    }
  });

  // Get historical analytics data
  app.get("/api/marketing/historical-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const timeRange = req.query.range || '30d'; // Default to last 30 days
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Fetch analytics from database
      const analytics = await storage.getCampaignAnalytics(0); // 0 for general platform analytics
      const filteredAnalytics = analytics
        .filter(a => new Date(a.date) >= startDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Group by date
      const dailyStats = filteredAnalytics.reduce((acc: any[], curr) => {
        const date = new Date(curr.date).toISOString().split('T')[0];
        const existingDay = acc.find(d => d.date === date);

        if (existingDay) {
          existingDay.impressions += curr.impressions;
          existingDay.engagements += curr.clicks;
          existingDay.spend += Number(curr.spend);
          existingDay[curr.platform] = curr.impressions;
        } else {
          acc.push({
            date,
            impressions: curr.impressions,
            engagements: curr.clicks,
            spend: Number(curr.spend),
            [curr.platform]: curr.impressions
          });
        }

        return acc;
      }, []);

      res.json(dailyStats);
    } catch (error) {
      console.error("Error fetching historical stats:", error);
      res.status(500).json({ message: "فشل في جلب البيانات التاريخية" });
    }
  });

  // API Key routes
  app.post("/api/settings/api-keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      // Schema for single platform update
      const platformSchema = z.object({
        platform: z.string(),
        trackingMethod: z.enum(['api', 'pixel']),
        pixelId: z.string().optional(),
        pixelConfiguration: z.any().optional(),
      });

      console.log("Received API key update:", req.body);
      const data = platformSchema.parse(req.body);

      // Get existing API keys
      const existingKeys = await storage.getApiKeys(req.user!.id) || {};

      // Update only the specified platform
      const updatedKeys = {
        ...existingKeys,
        [data.platform]: {
          trackingMethod: data.trackingMethod,
          ...(data.trackingMethod === 'pixel' ? {
            pixelId: data.pixelId,
            pixelConfiguration: data.pixelConfiguration
          } : {})
        }
      };

      console.log("Updating API keys for platform:", data.platform);
      await storage.setApiKeys(req.user!.id, updatedKeys);

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating API keys:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "بيانات غير صالحة", errors: error.errors });
      } else {
        res.status(500).json({ message: "فشل في تحديث مفاتيح API" });
      }
    }
  });

  app.get("/api/settings/api-keys", async (req, res) => {
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

  app.post("/api/settings/api-keys/migrate", async (req, res) => {
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
  app.get("/api/inventory/transactions", async (req, res) => {
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

  app.post("/api/inventory/transactions", async (req, res) => {
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
  app.get("/api/expenses/categories", async (req, res) => {
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

  app.post("/api/expenses/categories", async (req, res) => {
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
  app.get("/api/expenses", async (req, res) => {
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

  app.post("/api/expenses", async (req, res) => {
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
  app.get("/api/suppliers", async (req, res) => {
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

  app.post("/api/suppliers", async (req, res) => {
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

  app.patch("/api/suppliers/:id", async (req, res) => {
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

  app.delete("/api/suppliers/:id", async (req, res) => {
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

  app.get("/api/suppliers/:id/transactions", async (req, res) => {
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

  app.post("/api/suppliers/:id/transactions", async (req, res) => {
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
  app.get("/api/customers", async (req, res) => {
    try {
      const search = req.query.search as string;
      const customers = await storage.searchCustomers(search);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "فشل في جلب قائمة العملاء" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
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

  app.get("/api/customers/:id/sales", async (req, res) => {
    try {      const sales = await storage.getCustomerSales(Number(req.params.id));
      res.json(sales);
    } catch (error) {
      console.error("Error fetching customer sales:", error);
      res.status(500).json({ message: "فشل في جلب مشتريات العميل" });
    }
  });

  app.post("/api/customers", async (req, res) => {
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
  app.delete("/api/customers/:id", async (req, res) => {
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
  app.get("/api/customers/:id/appointments", async (req, res) => {
    try {
      const appointments = await storage.getCustomerAppointments(Number(req.params.id));
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      res.status(500).json({ message: "فشل في جلب المواعيد" });
    }
  });

  app.post("/api/customers/:id/appointments", async (req, res) => {
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

  app.patch("/api/appointments/:id", async (req, res) => {
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

  app.delete("/api/appointments/:id", async (req, res) => {
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
  app.post("/api/files", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const file = await storage.saveFile({        ...req.body,
        userId: req.user!.id,
      });
      res.status(201).json(file);
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ message: "فشل في حفظ الملف" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
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

  app.get("/api/files/user", async (req, res) => {
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

  app.delete("/api/files/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions to fetch stats from different platforms
async function fetchFacebookStats(account: any, keys: any) {
  if (keys.trackingMethod === 'pixel') {
    return getPixelData('facebook', keys.pixelId, keys.pixelConfiguration);
  }

  try {
    // Fetch data from Facebook Graph API
    const { accessToken } = account;
    const { appId, appSecret } = keys;

    console.log(`Fetching Facebook stats for account: ${account.accountName}`);

    // TODO: Implement real Facebook API calls with proper error handling
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  } catch (error) {
    console.error('Error fetching Facebook stats:', error);
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  }
}

async function fetchTwitterStats(account: any, keys: any) {
  if (keys.trackingMethod === 'pixel') {
    return getPixelData('twitter', keys.pixelId, keys.pixelConfiguration);
  }

  try {
    const { accessToken } = account;
    const { apiKey, apiSecret } = keys;

    console.log(`Fetching Twitter stats for account: ${account.accountName}`);

    // TODO: Implement real Twitter API calls with proper error handling
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  } catch (error) {
    console.error('Error fetching Twitter stats:', error);
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  }
}

async function fetchInstagramStats(account: any, keys: any) {
  if (keys.trackingMethod === 'pixel') {
    return getPixelData('instagram', keys.pixelId, keys.pixelConfiguration);
  }

  try {
    const { accessToken } = account;
    const { appId, appSecret } = keys;

    console.log(`Fetching Instagram stats for account: ${account.accountName}`);

    // TODO: Implement real Instagram API calls with proper error handling
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  } catch (error) {
    console.error('Error fetching Instagram stats:', error);
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  }
}

async function fetchTikTokStats(account: any, keys: any) {
  if (keys.trackingMethod === 'pixel') {
    return getPixelData('tiktok', keys.pixelId, keys.pixelConfiguration);
  }

  try {
    const { accessToken } = account;
    const { clientKey, clientSecret } = keys;

    console.log(`Fetching TikTok stats for account: ${account.accountName}`);

    // TODO: Implement real TikTok API calls with proper error handling
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  } catch (error) {
    console.error('Error fetching TikTok stats:', error);
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  }
}

async function fetchSnapchatStats(account: any, keys: any) {
  if (keys.trackingMethod === 'pixel') {
    return getPixelData('snapchat', keys.pixelId, keys.pixelConfiguration);
  }

  try {
    const { accessToken } = account;
    const { clientId, clientSecret } = keys;

    console.log(`Fetching Snapchat stats for account: ${account.accountName}`);

    // TODO: Implement real Snapchat API calls with proper error handling
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  } catch (error) {
    console.error('Error fetching Snapchat stats:', error);
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  }
}

async function fetchLinkedInStats(account: any, keys: any) {
  if (keys.trackingMethod === 'pixel') {
    return getPixelData('linkedin', keys.pixelId, keys.pixelConfiguration);
  }

  try {
    const { accessToken } = account;
    const { clientId, clientSecret } = keys;

    console.log(`Fetching LinkedIn stats for account: ${account.accountName}`);

    // TODO: Implement real LinkedIn API calls with proper error handling
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  } catch (error) {
    console.error('Error fetching LinkedIn stats:', error);
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  }
}

// Helper function to get platform-specific pixel data
async function getPixelData(platform: string, pixelId: string, pixelConfig: any) {
  try {
    console.log(`Fetching pixel data for ${platform}, pixel ID: ${pixelId}`);

    // TODO: Implement real pixel data fetching with proper error handling
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  } catch (error) {
    console.error(`Error fetching pixel data for ${platform}:`, error);
    return {
      impressions: 0,
      engagements: 0,
      spend: 0
    };
  }
}