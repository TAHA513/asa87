import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceIqd: decimal("price_iqd", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceIqd: decimal("price_iqd").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
  isInstallment: boolean("is_installment").notNull().default(false),
});

export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  numberOfPayments: integer("number_of_payments").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  nextPaymentDate: timestamp("next_payment_date").notNull(),
  status: text("status").notNull().default("active"),
});

export const installmentPayments = pgTable("installment_payments", {
  id: serial("id").primaryKey(),
  installmentId: integer("installment_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  notes: text("notes"),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  usdToIqd: decimal("usd_to_iqd", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  platforms: text("platforms").array().notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("draft"),
  userId: integer("user_id").notNull(),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaignAnalytics = pgTable("campaign_analytics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  platform: text("platform").notNull(),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0"),
  date: timestamp("date").notNull(),
});

export const socialMediaAccounts = pgTable("social_media_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(),
  accountName: text("account_name").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(),
  keyType: text("key_type").notNull(),
  keyValue: text("key_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).extend({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  description: z.string().optional(),
  priceIqd: z.string().or(z.number()).transform(val => val.toString()),
  stock: z.number().min(0, "المخزون يجب أن يكون 0 على الأقل"),
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  productId: true,
  quantity: true,
}).extend({
  productId: z.number().min(1, "يجب اختيار منتج"),
  quantity: z.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).pick({
  usdToIqd: true,
});

export const insertInstallmentSchema = createInsertSchema(installments)
  .omit({ id: true })
  .extend({
    customerName: z.string().min(1, "اسم العميل مطلوب"),
    customerPhone: z.string().min(1, "رقم الهاتف مطلوب"),
    totalAmount: z.number().min(0, "المبلغ الإجمالي يجب أن يكون أكبر من 0"),
    numberOfPayments: z.number().min(1, "عدد الأقساط يجب أن يكون 1 على الأقل"),
    nextPaymentDate: z.date(),
  });

export const insertInstallmentPaymentSchema = createInsertSchema(installmentPayments)
  .omit({ id: true })
  .extend({
    amount: z.number().min(0, "مبلغ الدفعة يجب أن يكون أكبر من 0"),
    notes: z.string().optional(),
  });

export const insertCampaignSchema = createInsertSchema(marketingCampaigns)
  .omit({ id: true, createdAt: true, metrics: true })
  .extend({
    platforms: z.array(z.string()).min(1, "يجب اختيار منصة واحدة على الأقل"),
    budget: z.number().min(0, "الميزانية يجب أن تكون أكبر من 0"),
    startDate: z.date(),
    endDate: z.date().optional(),
  });

export const insertAnalyticsSchema = createInsertSchema(campaignAnalytics)
  .omit({ id: true })
  .extend({
    date: z.date(),
    platform: z.string(),
    impressions: z.number().min(0),
    clicks: z.number().min(0),
    conversions: z.number().min(0),
    spend: z.number().min(0),
  });

export const insertSocialMediaAccountSchema = createInsertSchema(socialMediaAccounts)
  .omit({ id: true, createdAt: true })
  .extend({
    platform: z.enum(["facebook", "instagram", "twitter", "linkedin", "snapchat", "tiktok"]),
    accountName: z.string().min(1, "اسم الحساب مطلوب"),
    accessToken: z.string().min(1, "رمز الوصول مطلوب"),
    refreshToken: z.string().optional(),
    expiresAt: z.date().optional(),
  });

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type Installment = typeof installments.$inferSelect;
export type InstallmentPayment = typeof installmentPayments.$inferSelect;
export type InsertInstallment = z.infer<typeof insertInstallmentSchema>;
export type InsertInstallmentPayment = z.infer<typeof insertInstallmentPaymentSchema>;
export type Campaign = typeof marketingCampaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type CampaignAnalytics = typeof campaignAnalytics.$inferSelect;
export type InsertCampaignAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = z.infer<typeof insertSocialMediaAccountSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;