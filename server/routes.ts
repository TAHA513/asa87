import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
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
  insertAppointmentSchema,
  type Customer,
} from "@shared/schema";

// Helper functions for platform stats
function mockPlatformStats() {
  return {
    impressions: Math.floor(Math.random() * 10000),
    engagements: Math.floor(Math.random() * 1000),
    spend: Math.floor(Math.random() * 500)
  };
}

async function fetchFacebookStats() { return mockPlatformStats(); }
async function fetchTwitterStats() { return mockPlatformStats(); }
async function fetchInstagramStats() { return mockPlatformStats(); }
async function fetchTikTokStats() { return mockPlatformStats(); }
async function fetchSnapchatStats() { return mockPlatformStats(); }
async function fetchLinkedInStats() { return mockPlatformStats(); }

// Inventory check function
async function checkInventoryLevels() {
  try {
    const products = await storage.getProducts();
    const alerts = await storage.getInventoryAlerts();

    for (const product of products) {
      // Check low stock alerts
      const lowStockAlert = alerts.find(
        a => a.productId === product.id && a.type === "low_stock" && a.status === "active"
      );

      if (lowStockAlert && product.stock <= lowStockAlert.threshold) {
        await storage.createAlertNotification({
          alertId: lowStockAlert.id,
          message: `المنتج ${product.name} وصل للحد الأدنى (${product.stock} قطعة متبقية)`,
        });
      }

      // Check inactive products (no sales in last 30 days)
      const inactiveAlert = alerts.find(
        a => a.productId === product.id && a.type === "inactive" && a.status === "active"
      );

      if (inactiveAlert) {
        const sales = await storage.getProductSales(product.id, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        if (sales.length === 0) {
          await storage.createAlertNotification({
            alertId: inactiveAlert.id,
            message: `المنتج ${product.name} لم يتم بيعه خلال آخر 30 يوم`,
          });
        }
      }

      // Check high demand products
      const highDemandAlert = alerts.find(
        a => a.productId === product.id && a.type === "high_demand" && a.status === "active"
      );

      if (highDemandAlert) {
        const sales = await storage.getProductSales(product.id, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        if (sales.length >= highDemandAlert.threshold) {
          await storage.createAlertNotification({
            alertId: highDemandAlert.id,
            message: `المنتج ${product.name} عليه طلب مرتفع (${sales.length} مبيعات في آخر 7 أيام)`,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking inventory levels:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Starting to register routes...");

  setupAuth(app);

  // Products routes
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      // Handle file upload if present
      let imageUrl = null;
      let thumbnailUrl = null;

      if (req.files && req.files.image) {
        const file = req.files.image;
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(process.cwd(), "uploads", fileName);

        // Create uploads directory if it doesn't exist
        await fs.mkdir(path.join(process.cwd(), "uploads"), { recursive: true });

        // Save the file
        await fs.writeFile(filePath, file.data);

        // Set the URLs
        imageUrl = `/uploads/${fileName}`;
        thumbnailUrl = `/uploads/${fileName}`; // For now, use same image as thumbnail
      }

      const product = await storage.createProduct({
        ...req.body,
        imageUrl,
        thumbnailUrl
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "فشل في إنشاء المنتج" });
    }
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
      // قائمة القيم الصالحة المقبولة
      const ALLOWED_VARIANTS = ["professional", "vibrant", "tint", "modern", "classic", "futuristic", "elegant", "natural"];
      const ALLOWED_APPEARANCES = ["light", "dark", "system"];
      const ALLOWED_FONT_STYLES = ["noto-kufi", "cairo", "tajawal"];
      const ALLOWED_FONT_SIZES = ["small", "medium", "large", "xlarge"];

      // استخراج البيانات مع التحقق البسيط
      const theme = {
        primary: req.body.primary || "hsl(215.3 98.9% 27.8%)",
        variant: ALLOWED_VARIANTS.includes(req.body.variant) ? req.body.variant : "professional",
        appearance: ALLOWED_APPEARANCES.includes(req.body.appearance) ? req.body.appearance : "light",
        fontStyle: ALLOWED_FONT_STYLES.includes(req.body.fontStyle) ? req.body.fontStyle : "noto-kufi",
        fontSize: ALLOWED_FONT_SIZES.includes(req.body.fontSize) ? req.body.fontSize : "medium",
        radius: typeof req.body.radius === 'number' ? req.body.radius : 0.5
      };

      console.log("تم التحقق من بيانات الثيم بنجاح:", theme);

      // حفظ الثيم في ملف theme.json
      await fs.writeFile(
        path.join(process.cwd(), "theme.json"),
        JSON.stringify(theme, null, 2)
      );
      console.log("تم حفظ الثيم في ملف theme.json بنجاح");

      res.json({ success: true, theme });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ 
        message: "فشل في تحديث المظهر", 
        error: error instanceof Error ? error.message : "خطأ غير معروف"
      });
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

  // Analytics Routes
  app.get("/api/analytics/sales", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const sales = await storage.getAnalyticsSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "فشل في جلب تحليلات المبيعات" });
    }
  });

  app.get("/api/analytics/customers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const customers = await storage.getAnalyticsCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "فشل في جلب تحليلات العملاء" });
    }
  });

  app.get("/api/analytics/products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const products = await storage.getAnalyticsProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching product analytics:", error);
      res.status(500).json({ message: "فشل في جلب تحليلات المنتجات" });
    }
  });

  // Social Media Auth Routes
  app.get("/api/marketing/social-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      // Return empty accounts if table doesn't exist yet
      return res.json([]);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({ message: "فشل في جلب حسابات التواصل الاجتماعي" });
    }
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
      // Return mock data if database tables aren't ready
      try {
        // Try to get user's API keys and social media accounts
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
                platformStats = await fetchFacebookStats();
                break;
              case 'twitter':
                platformStats = await fetchTwitterStats();
                break;
              case 'instagram':
                platformStats = await fetchInstagramStats();
                break;
              case 'tiktok':
                platformStats = await fetchTikTokStats();
                break;
              case 'snapchat':
                platformStats = await fetchSnapchatStats();
                break;
              case 'linkedin':
                platformStats = await fetchLinkedInStats();
                break;
            }

            if (platformStats) {
              totalImpressions += platformStats.impressions;
              totalEngagements += platformStats.engagements;
              totalSpend += platformStats.spend;

              try {
                // Save analytics to database
                await storage.createCampaignAnalytics({
                  campaignId: 0, // General platform analytics
                  platform: account.platform,
                  impressions: platformStats.impressions,
                  clicks: platformStats.engagements,
                  conversions: 0,
                  spend: platformStats.spend,
                  date: new Date()
                });
              } catch (analyticsError) {
                console.error("Error saving campaign analytics:", analyticsError);
                // Continue without saving analytics
              }
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
      } catch (dbError) {
        console.error("Database error in social stats:", dbError);
        // Return mock data if database tables don't exist yet
        return res.json({
          impressions: Math.floor(Math.random() * 5000),
          engagement: Math.random() * 0.1,
          spend: Math.floor(Math.random() * 1000)
        });
      }
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
      // Return empty stats if tables don't exist yet
      return res.json([]);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "فشل في جلب إحصائيات المنصات" });
    }
  });

  app.get("/api/marketing/historical-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const timeRange = req.query.range || '30d';
      let startDate = new Date();
      const now = new Date();

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

      // Get basic stats that don't depend on marketing tables
      const stats = await storage.getHistoricalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching historical stats:", error);
      // Return empty stats on error
      res.json({
        sales: [],
        expenses: [],
        appointments: []
      });
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
      try {
        const categories = await storage.getExpenseCategories(req.user!.id);
        res.json(categories);
      } catch (dbError) {
        console.error("Error fetching expense categories:", dbError);
        // Return empty array if table doesn't exist yet
        res.json([]);
      }
    } catch (error) {
      console.error("Error in expense categories endpoint:", error);
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
      res.json(expense);
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
      try {
        const suppliers = await storage.getSuppliers(req.user!.id);
        res.json(suppliers);
      } catch (dbError) {
        console.error("Error fetching suppliers:", dbError);
        // Return empty array if table doesn't exist yet
        res.json([]);
      }
    } catch (error) {
      console.error("Error in suppliers endpoint:", error);
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
    try {
      const sales = await storage.getCustomerSales(Number(req.params.id));
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
      const oldAppointment = await storage.getAppointment(Number(req.params.id));
      if (!oldAppointment) {
        return res.status(404).json({ message: "الموعد غير موجود" });
      }

      const updatedAppointment = await storage.updateAppointment(
        Number(req.params.id),
        {
          ...req.body,
          updatedAt: new Date()
        }
      );

      // Log the activity specifically for status changes
      if (req.body.status && oldAppointment.status !== req.body.status) {
        await storage.logSystemActivity({
          userId: req.user!.id,
          activityType: "appointment_status_change",
          entityType: "appointments",
          entityId: updatedAppointment.id,
          action: "update",
          details: {
            oldStatus: oldAppointment.status,
            newStatus: req.body.status,
            title: updatedAppointment.title,
            date: updatedAppointment.date
          }
        });
        console.log(`Logged activity for appointment ${updatedAppointment.id} status change from ${oldAppointment.status} to ${req.body.status}`);
      }

      res.json(updatedAppointment);
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
      console.log("Deleting appointment:", req.params.id);
      await storage.deleteAppointment(Number(req.params.id));
      console.log("Successfully deleted appointment:", req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "فشل في حذف الموعد" });
    }
  });

  // Add after existing appointment routes
  app.get("/api/appointments/:id/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      console.log(`Fetching activities for appointment: ${req.params.id}`);
      const activities = await storage.getAppointmentActivities(Number(req.params.id));
      console.log("Retrieved activities:", activities);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching appointment activities:", error);
      res.status(500).json({ message: "فشل في جلب سجل حركات الموعد" });
    }
  });

  // Add after existing appointment routes
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      console.log("Fetching activities for entity type:", req.query.entityType);
      const activities = await storage.getSystemActivities({
        entityType: req.query.entityType as string
      });
      console.log("Retrieved activities:", activities);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "فشل في جلب سجل الحركات" });
    }
  });

  // File Storage Routes
  app.post("/api/files", async (req, res) => {
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

  // إضافة المسارات الجديدة للإعدادات
  const themeSchema = z.object({
    primary: z.string(),
    variant: z.enum([
      "professional", // المهني
      "vibrant", // النابض بالحياة
      "tint", // الرمادي
      "modern", // العصري
      "classic", // الكلاسيكي
      "futuristic", // المستقبلي
      "elegant", // الأنيق
      "natural", // الطبيعي
    ]),
    appearance: z.enum(["light", "dark", "system"]),
    fontStyle: z.enum([
      "noto-kufi", // نوتو كوفي
      "cairo", // القاهرة
      "tajawal", // طجوال
    ]),
    fontSize: z.enum(["small", "medium", "large", "xlarge"]),
    radius: z.number(),
  });

  app.get("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const settings = await storage.getUserSettings((req.user as any).id);
      res.json(settings || {
        themeName: "modern",
        fontName: "noto-kufi",
        fontSize: "medium",
        appearance: "system",
        colors: {
          primary: "#2563eb",
          secondary: "#16a34a",
          accent: "#db2777"
        }
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "فشل في جلب إعدادات المظهر" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      // التحقق من صحة البيانات
      const themeSchema = z.object({
        primary: z.string(),
        variant: z.enum([
          "professional", "vibrant", "tint", "modern", 
          "classic", "futuristic", "elegant", "natural"
        ]),
        appearance: z.enum(["light", "dark", "system"]),
        fontStyle: z.enum([
          "noto-kufi",
          "cairo",
          "tajawal",
        ]),
        fontSize: z.enum(["small", "medium", "large", "xlarge"]),
        radius: z.number(),
      });

      const theme = themeSchema.parse(req.body);
      console.log("تم استلام إعدادات جديدة:", theme);

      // تحويل البيانات إلى الشكل المطلوب لقاعدة البيانات
      const userSettings = {
        userId: req.user!.id,
        themeName: theme.variant,
        fontName: theme.fontStyle,
        fontSize: theme.fontSize,
        appearance: theme.appearance,
        colors: {
          primary: theme.primary,
          secondary: theme.appearance === 'dark' 
            ? `color-mix(in srgb, ${theme.primary} 80%, white)` 
            : `color-mix(in srgb, ${theme.primary} 80%, black)`,
          accent: theme.appearance === 'dark'
            ? `color-mix(in srgb, ${theme.primary} 60%, black)`
            : `color-mix(in srgb, ${theme.primary} 60%, white)`
        }
      };

      // الحفظ بالتسلسل الصحيح - أولا في قاعدة البيانات
      const savedSettings = await storage.saveUserSettings(req.user!.id, userSettings);
      console.log("تم حفظ الإعدادات في قاعدة البيانات:", savedSettings);

      // ثم الحفظ في ملف theme.json
      await fs.writeFile(
        path.join(process.cwd(), "theme.json"),
        JSON.stringify(theme, null, 2)
      );
      console.log("تم حفظ الثيم في ملف theme.json");

      // إرسال الاستجابة بنجاح
      res.json({ 
        success: true,
        settings: userSettings
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      // تخطي محاولة الحفظ في ملف السمات إذا فشل التحقق من صحة البيانات
      res.status(400).json({ 
        message: "فشل في حفظ إعدادات المظهر", 
        error: error instanceof Error ? error.message : "خطأ غير معروف" 
      });
    }
  });

  // Inventory Alerts Routes
  app.get("/api/inventory/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const alerts = await storage.getInventoryAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
      res.status(500).json({ message: "فشل في جلب التنبيهات" });
    }
  });

  app.post("/api/inventory/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const validatedData = insertInventoryAlertSchema.parse(req.body);
      const alert = await storage.createInventoryAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating inventory alert:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "بيانات غير صالحة", errors: error.errors });
      } else {
        res.status(500).json({ message: "فشل في إنشاء التنبيه" });
      }
    }
  });

  app.patch("/api/inventory/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const alert = await storage.updateInventoryAlert(Number(req.params.id), req.body);
      res.json(alert);
    } catch (error) {
      console.error("Error updating inventory alert:", error);
      res.status(500).json({ message: "فشل في تحديث التنبيه" });
    }
  });

  app.delete("/api/inventory/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      await storage.deleteInventoryAlert(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting inventory alert:", error);
      res.status(500).json({ message: "فشل في حذف التنبيه" });
    }
  });

  app.get("/api/inventory/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const notifications = await storage.getAlertNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching alert notifications:", error);
      res.status(500).json({ message: "فشل في جلب الإشعارات" });
    }
  });

  app.patch("/api/inventory/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const notification = await storage.markNotificationAsRead(Number(req.params.id));
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "فشل في تحديث حالة الإشعار" });
    }
  });

  // إضافة مسارات جديدة للمواعيد بعد مسارات العملاء
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      console.log("Fetching appointments...");
      const appointments = await storage.getAppointments(); // Changed from getCustomerAppointments
      console.log("Fetched appointments:", appointments);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "فشل في جلب المواعيد" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      console.log("Creating appointment with data:", req.body);
      const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        status: 'scheduled'
      });

      console.log("Validated appointment data:", validatedData);
      const appointment = await storage.createAppointment(validatedData);
      console.log("Created appointment:", appointment);
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
      const oldAppointment = await storage.getAppointment(Number(req.params.id));
      if (!oldAppointment) {
        return res.status(404).json({ message: "الموعد غير موجود" });
      }

      const updatedAppointment = await storage.updateAppointment(
        Number(req.params.id),
        {
          ...req.body,
          updatedAt: new Date()
        }
      );

      // Log the activity specifically for status changes
      if (req.body.status && oldAppointment.status !== req.body.status) {
        await storage.logSystemActivity({
          userId: req.user!.id,
          activityType: "appointment_status_change",
          entityType: "appointments",
          entityId: updatedAppointment.id,
          action: "update",
          details: {
            oldStatus: oldAppointment.status,
            newStatus: req.body.status,
            title: updatedAppointment.title,
            date: updatedAppointment.date
          }
        });
        console.log(`Logged activity for appointment ${updatedAppointment.id} status change from ${oldAppointment.status} to ${req.body.status}`);
      }

      res.json(updatedAppointment);
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
      console.log("Deleting appointment:", req.params.id);
      await storage.deleteAppointment(Number(req.params.id));
      console.log("Successfully deleted appointment:", req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "فشل في حذف الموعد" });
    }
  });

  // Add after existing report routes
  app.post("/api/reports/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const { startDate, endDate, type, filters } = req.body;

      const report = await storage.generateActivityReport({
        name: `تقرير النشاطات - ${new Date().toLocaleDateString('ar-IQ')}`,
        description: `تقرير تفصيلي للنشاطات من ${new Date(startDate).toLocaleDateString('ar-IQ')} إلى ${new Date(endDate).toLocaleDateString('ar-IQ')}`,
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        reportType: type,
        filters,
        generatedBy: req.user!.id,
        data: {}
      });

      res.json(report);
    } catch (error) {
      console.error("Error generating activity report:", error);
      res.status(500).json({ message: "فشل في إنشاء التقرير" });
    }
  });

  app.get("/api/reports/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const report = await storage.getActivityReport(Number(req.params.id));
      if (!report) {
        return res.status(404).json({ message: "التقرير غير موجود" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching activity report:", error);
      res.status(500).json({ message: "فشل في جلب التقرير" });
    }
  });

  // Add detailed reports endpoints
  app.get("/api/reports/sales", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const { startDate, endDate, page = "1", pageSize = "50" } = req.query;
      const report = await storage.getDetailedSalesReport({
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      },
        req.user!.id,
        Number(page),
        Number(pageSize)
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ message: "فشل في إنشاء تقرير المبيعات" });
    }
  });

  app.get("/api/reports/inventory", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getInventoryReport({
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      });
      res.json(report);
    } catch (error) {
      console.error("Error generating inventory report:", error);
      res.status(500).json({ message: "فشل في إنشاء تقرير المخزون" });
    }
  });

  app.get("/api/reports/financial", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getFinancialReport({
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      });
      res.json(report);
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "فشل في إنشاء التقرير المالي" });
    }
  });

  app.get("/api/reports/user-activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getUserActivityReport({
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      });
      res.json(report);
    } catch (error) {
      console.error("Error generating user activity report:", error);
      res.status(500).json({ message: "فشل في إنشاء تقرير نشاط المستخدمين" });
    }
  });
  // Add after existing report routes
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const reports = await storage.getUserReports(req.user!.id, req.query.type as string);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "فشل في جلب التقارير" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const reportId = parseInt(req.params.id);

      // التحقق من صحة معرف التقرير
      if (isNaN(reportId)) {
        return res.status(400).json({ message: "معرف التقرير غير صالح" });
      }

      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "التقرير غير موجود" });
      }
      if (report.userId !== req.user!.id) {
        return res.status(403).json({ message: "غير مصرح بالوصول لهذا التقرير" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "فشل في جلب التقرير" });
    }
  });

  // Add appointment reports endpoint
  app.get("/api/reports/appointments", async (req, res) => {
    console.log("Received appointments report request");

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        console.log("Missing date parameters:", { startDate, endDate });
        return res.status(400).json({
          message: "يجب تحديد تاريخ البداية والنهاية"
        });
      }

      console.log("Generating report for date range:", { startDate, endDate });

      // التحقق من صحة التواريخ
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          message: "صيغة التاريخ غير صحيحة"
        });
      }

      const report = await storage.getAppointmentsReport({
        start,
        end
      }, req.user!.id);

      console.log("Report generated successfully, size:", JSON.stringify(report).length);
      res.json(report);

    } catch (error) {
      console.error("Error in appointments report endpoint:", error);
      res.status(500).json({
        message: "فشل في إنشاء تقرير المواعيد",
        error: error instanceof Error ? error.message : "خطأ غير معروف"
      });
    }
  });

  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        search: req.query.search as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        status: req.query.status as string,
      };

      console.log("Fetching invoices with filters:", filters);
      const sales = await storage.getSales();

      // تحويل المبيعات إلى فواتير مع تحسين الأداء
      const formattedInvoices = sales
        .slice((page - 1) * limit, page * limit)
        .map(sale => ({
          id: sale.id,
          invoiceNumber: `INV-${sale.id}`,
          customerName: sale.customerName || "زبون نقدي",
          totalAmount: Number(sale.finalPriceIqd),
          status: "active",
          createdAt: sale.date,
          items: [{
            id: 1,
            productId: sale.productId,
            quantity: sale.quantity,
            unitPrice: Number(sale.priceIqd),
            totalPrice: Number(sale.finalPriceIqd)
          }]
        }));

      console.log(`Retrieved ${formattedInvoices.length} invoices`);
      res.json({
        data: formattedInvoices,
        pagination: {
          total: sales.length,
          page,
          limit,
          pages: Math.ceil(sales.length / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "فشل في جلب الفواتير" });
    }
  });

  // تعريف نقطة نهاية جديدة لجلب تفاصيل فاتورة واحدة
  app.get("/api/invoices/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف الفاتورة غير صالح" });
      }

      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "الفاتورة غير موجودة" });
      }

      // تحويل بيانات البيع إلى تنسيق الفاتورة
      const invoice = {
        id: sale.id,
        invoiceNumber: `INV-${sale.id}`,
        customerName: sale.customerName || "زبون نقدي",
        totalAmount: Number(sale.finalPriceIqd),
        status: "active",
        createdAt: sale.date,
        items: [{
          id: 1,
          productId: sale.productId,
          quantity: sale.quantity,
          unitPrice: Number(sale.priceIqd),
          totalPrice: Number(sale.finalPriceIqd),
          productName: "المنتج" // سيتم إضافة اسم المنتج لاحقاً
        }]
      };

      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "فشل في جلب تفاصيل الفاتورة" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    try {
      const invoice = await storage.createInvoice({
        ...req.body,
        userId: req.user!.id,
        date: new Date()
      });


      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "فشل في إنشاء الفاتورة" });
    }
  });

  const httpServer = createServer(app);

  // Start inventory check timer
  setInterval(checkInventoryLevels, 60 * 60 * 1000);

  console.log("All routes registered successfully");
  return httpServer;
}