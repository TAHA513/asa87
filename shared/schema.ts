import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  email: text("email"),
  role: text("role").notNull(),
  permissions: text("permissions").array(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// System Activities
export const systemActivities = pgTable("system_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(),
  details: jsonb("details").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSystemActivitySchema = createInsertSchema(systemActivities);
export const selectSystemActivitySchema = createSelectSchema(systemActivities);
export type SystemActivity = z.infer<typeof selectSystemActivitySchema>;
export type InsertSystemActivity = z.infer<typeof insertSystemActivitySchema>;

// Activity Reports
export const activityReports = pgTable("activity_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reportType: text("report_type").notNull(),
  dateRange: jsonb("date_range").notNull(),
  filters: jsonb("filters"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivityReportSchema = createInsertSchema(activityReports);
export const selectActivityReportSchema = createSelectSchema(activityReports);
export type ActivityReport = z.infer<typeof selectActivityReportSchema>;
export type InsertActivityReport = z.infer<typeof insertActivityReportSchema>;

// Marketing Campaigns
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  platforms: text("platforms").array(),
  budget: text("budget").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(marketingCampaigns);
export const selectCampaignSchema = createSelectSchema(marketingCampaigns);
export type Campaign = z.infer<typeof selectCampaignSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

// Campaign Analytics
export const campaignAnalytics = pgTable("campaign_analytics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => marketingCampaigns.id),
  platform: text("platform").notNull(),
  date: timestamp("date").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  conversions: integer("conversions"),
  spend: text("spend").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnalyticsSchema = createInsertSchema(campaignAnalytics);
export const selectAnalyticsSchema = createSelectSchema(campaignAnalytics);
export type CampaignAnalytics = z.infer<typeof selectAnalyticsSchema>;
export type InsertCampaignAnalytics = z.infer<typeof insertAnalyticsSchema>;

// Social Media Accounts
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

export const insertSocialMediaAccountSchema = createInsertSchema(socialMediaAccounts);
export const selectSocialMediaAccountSchema = createSelectSchema(socialMediaAccounts);
export type SocialMediaAccount = z.infer<typeof selectSocialMediaAccountSchema>;
export type InsertSocialMediaAccount = z.infer<typeof insertSocialMediaAccountSchema>;

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(),
  keyType: text("key_type").notNull(),
  keyValue: text("key_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys);
export const selectApiKeySchema = createSelectSchema(apiKeys);
export type ApiKey = z.infer<typeof selectApiKeySchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments);
export const selectAppointmentSchema = createSelectSchema(appointments);
export type Appointment = z.infer<typeof selectAppointmentSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  loyaltyPoints: integer("loyalty_points").default(0),
  lastVisit: timestamp("last_visit"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);
export type Customer = z.infer<typeof selectCustomerSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// Store Settings
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull(),
  storeAddress: text("store_address"),
  storePhone: text("store_phone"),
  storeEmail: text("store_email"),
  taxNumber: text("tax_number"),
  logoUrl: text("logo_url"),
  receiptNotes: text("receipt_notes"),
  enableLogo: boolean("enable_logo").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStoreSettingsSchema = createInsertSchema(storeSettings);
export const selectStoreSettingsSchema = createSelectSchema(storeSettings);
export type StoreSettings = z.infer<typeof selectStoreSettingsSchema>;
export type InsertStoreSettings = z.infer<typeof insertStoreSettingsSchema>;

// Exchange Rates
export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  usdToIqd: text("usd_to_iqd").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates);
export const selectExchangeRateSchema = createSelectSchema(exchangeRates);
export type ExchangeRate = z.infer<typeof selectExchangeRateSchema>;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;

// Sales
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  customerId: integer("customer_id"),
  quantity: integer("quantity").notNull(),
  priceIqd: text("price_iqd").notNull(),
  discount: text("discount").default("0"),
  finalPriceIqd: text("final_price_iqd").notNull(),
  userId: integer("user_id").notNull(),
  isInstallment: boolean("is_installment").default(false),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSaleSchema = createInsertSchema(sales);
export const selectSaleSchema = createSelectSchema(sales);
export type Sale = z.infer<typeof selectSaleSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  productCode: text("product_code").unique(),
  barcode: text("barcode").unique(),
  productType: text("product_type"),
  quantity: integer("quantity"),
  minQuantity: integer("min_quantity").default(0),
  productionDate: timestamp("production_date"),
  expiryDate: timestamp("expiry_date"),
  costPrice: text("cost_price"),
  priceIqd: text("price_iqd").notNull(),
  categoryId: integer("category_id"),
  isWeightBased: boolean("is_weight_based").default(false),
  enableDirectWeighing: boolean("enable_direct_weighing").default(false),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Reports table for storing various reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  filters: jsonb("filters"),
  data: jsonb("data").notNull(),
  userId: integer("user_id").notNull(),
  format: text("format").default("json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports);
export const selectReportSchema = createSelectSchema(reports);
export type Report = z.infer<typeof selectReportSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Additional tables schemas would go here...