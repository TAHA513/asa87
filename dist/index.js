var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import http from "http";
import cors from "cors";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityReports: () => activityReports,
  alertNotifications: () => alertNotifications,
  apiKeys: () => apiKeys,
  appointments: () => appointments,
  campaignAnalytics: () => campaignAnalytics,
  customers: () => customers,
  exchangeRates: () => exchangeRates,
  expenseCategories: () => expenseCategories,
  expenses: () => expenses,
  fileStorage: () => fileStorage,
  insertActivityReportSchema: () => insertActivityReportSchema,
  insertAlertNotificationSchema: () => insertAlertNotificationSchema,
  insertAnalyticsSchema: () => insertAnalyticsSchema,
  insertApiKeySchema: () => insertApiKeySchema,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertCampaignSchema: () => insertCampaignSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertExchangeRateSchema: () => insertExchangeRateSchema,
  insertExpenseCategorySchema: () => insertExpenseCategorySchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFileStorageSchema: () => insertFileStorageSchema,
  insertInstallmentPaymentSchema: () => insertInstallmentPaymentSchema,
  insertInstallmentSchema: () => insertInstallmentSchema,
  insertInventoryAdjustmentSchema: () => insertInventoryAdjustmentSchema,
  insertInventoryAlertSchema: () => insertInventoryAlertSchema2,
  insertInventoryTransactionSchema: () => insertInventoryTransactionSchema,
  insertInvoiceHistorySchema: () => insertInvoiceHistorySchema,
  insertInvoiceItemSchema: () => insertInvoiceItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertProductSchema: () => insertProductSchema,
  insertReportSchema: () => insertReportSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertSocialMediaAccountSchema: () => insertSocialMediaAccountSchema,
  insertStoreSettingsSchema: () => insertStoreSettingsSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertSupplierTransactionSchema: () => insertSupplierTransactionSchema,
  insertSystemActivitySchema: () => insertSystemActivitySchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSettingsSchema: () => insertUserSettingsSchema,
  installmentPayments: () => installmentPayments,
  installments: () => installments,
  inventoryAdjustments: () => inventoryAdjustments,
  inventoryAlerts: () => inventoryAlerts,
  inventoryTransactions: () => inventoryTransactions,
  invoiceHistory: () => invoiceHistory,
  invoiceItems: () => invoiceItems,
  invoices: () => invoices,
  marketingCampaigns: () => marketingCampaigns,
  productCategories: () => productCategories,
  products: () => products,
  reports: () => reports,
  sales: () => sales,
  socialMediaAccounts: () => socialMediaAccounts,
  storeSettings: () => storeSettings,
  storeSettingsSchema: () => storeSettingsSchema,
  supplierTransactions: () => supplierTransactions,
  suppliers: () => suppliers,
  systemActivities: () => systemActivities,
  userSettings: () => userSettings,
  users: () => users
});
import { pgTable, text, serial, timestamp, boolean, decimal, integer, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var storeSettingsSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2),
  address: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("staff"),
  email: text("email"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  permissions: text("permissions").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  productCode: varchar("product_code", { length: 50 }).notNull().unique(),
  barcode: varchar("barcode", { length: 100 }).unique(),
  productType: text("product_type").notNull(),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0),
  productionDate: timestamp("production_date"),
  expiryDate: timestamp("expiry_date"),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  priceIqd: decimal("price_iqd", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => productCategories.id),
  isWeightBased: boolean("is_weight_based").notNull().default(false),
  enableDirectWeighing: boolean("enable_direct_weighing").notNull().default(false),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  quantity: integer("quantity").notNull(),
  priceIqd: decimal("price_iqd", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  finalPriceIqd: decimal("final_price_iqd", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").notNull().references(() => users.id),
  isInstallment: boolean("is_installment").notNull().default(false)
});
var invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  customerName: text("customer_name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  paymentMethod: text("payment_method").notNull().default("cash"),
  notes: text("notes"),
  printed: boolean("printed").notNull().default(false),
  originalInvoiceId: integer("original_invoice_id").references(() => invoices.id),
  modificationReason: text("modification_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var invoiceHistory = pgTable("invoice_history", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  action: text("action").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  changes: json("changes").notNull(),
  reason: text("reason"),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  identityNumber: text("identity_number").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }).notNull().default("0"),
  numberOfPayments: integer("number_of_payments").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  nextPaymentDate: timestamp("next_payment_date").notNull(),
  guarantorName: text("guarantor_name"),
  guarantorPhone: text("guarantor_phone"),
  status: text("status").notNull().default("active")
});
var installmentPayments = pgTable("installment_payments", {
  id: serial("id").primaryKey(),
  installmentId: integer("installment_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  notes: text("notes")
});
var exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  usdToIqd: decimal("usd_to_iqd", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow()
});
var marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  platforms: text("platforms").array().notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("draft"),
  userId: integer("user_id").notNull(),
  metrics: json("metrics"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var campaignAnalytics = pgTable("campaign_analytics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  platform: text("platform").notNull(),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0"),
  date: timestamp("date").notNull()
});
var socialMediaAccounts = pgTable("social_media_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(),
  accountName: text("account_name").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  platform: text("platform").notNull(),
  keyType: text("key_type").notNull(),
  keyValue: text("key_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  reference: text("reference"),
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
  notes: text("notes")
});
var inventoryAdjustments = pgTable("inventory_adjustments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  oldQuantity: integer("old_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  reason: text("reason").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
  notes: text("notes")
});
var inventoryAlerts = pgTable("inventory_alerts", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  type: text("type").notNull(),
  threshold: integer("threshold").notNull(),
  status: text("status").notNull().default("active"),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var alertNotifications = pgTable("alert_notifications", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").notNull().references(() => inventoryAlerts.id),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  dateRange: json("date_range").notNull(),
  filters: json("filters"),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("active"),
  format: text("format").notNull().default("json")
});
var expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  budgetAmount: decimal("budget_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").notNull()
});
var expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  userId: integer("user_id").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPeriod: text("recurring_period"),
  recurringDay: integer("recurring_day"),
  notes: text("notes"),
  attachments: text("attachments").array(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  taxNumber: text("tax_number"),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  categories: text("categories").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id").notNull()
});
var supplierTransactions = pgTable("supplier_transactions", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  reference: text("reference"),
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id").notNull()
});
var appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var fileStorage = pgTable("file_storage", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  themeName: text("theme_name").notNull(),
  fontName: text("font_name").notNull(),
  fontSize: text("font_size").notNull(),
  appearance: text("appearance").notNull(),
  colors: json("colors").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var storeSettings = pgTable("store_settings", {
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
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var systemActivities = pgTable("system_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(),
  details: json("details").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var activityReports = pgTable("activity_reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  dateRange: json("date_range").notNull(),
  filters: json("filters"),
  reportType: text("report_type").notNull(),
  generatedBy: integer("generated_by").notNull().references(() => users.id),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  permissions: true
}).extend({
  username: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628"),
  password: z.string().min(6, "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  fullName: z.string().min(1, "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0637\u0644\u0648\u0628"),
  email: z.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D").optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(["admin", "staff"]).default("staff"),
  permissions: z.array(z.string()).default([])
});
var insertProductSchema = createInsertSchema(products).extend({
  name: z.string().min(3, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  description: z.string().optional(),
  productCode: z.string().min(1, "\u0631\u0645\u0632 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628").regex(/^[A-Za-z0-9-]+$/, "\u0631\u0645\u0632 \u0627\u0644\u0645\u0646\u062A\u062C \u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0623\u062D\u0631\u0641 \u0648\u0623\u0631\u0642\u0627\u0645 \u0648\u0634\u0631\u0637\u0627\u062A \u0641\u0642\u0637"),
  barcode: z.string().optional().nullable().refine((val) => !val || /^[0-9]{8,13}$/.test(val), "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0642\u0645\u064B\u0627 \u0645\u0646 8 \u0625\u0644\u0649 13 \u062E\u0627\u0646\u0629"),
  productType: z.string().min(1, "\u0646\u0648\u0639 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628"),
  quantity: z.coerce.number().min(0, "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  minQuantity: z.coerce.number().min(0, "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 0 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  productionDate: z.date().optional().nullable(),
  expiryDate: z.date().optional().nullable(),
  costPrice: z.coerce.number().min(0, "\u0633\u0639\u0631 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  priceIqd: z.coerce.number().min(0, "\u0633\u0639\u0631 \u0627\u0644\u0628\u064A\u0639 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  categoryId: z.number().optional().nullable(),
  isWeightBased: z.boolean().default(false),
  enableDirectWeighing: z.boolean().default(false),
  imageUrl: z.string().url("\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u0635\u062D\u064A\u062D").optional().nullable(),
  thumbnailUrl: z.string().url("\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0635\u063A\u0631\u0629 \u0635\u062D\u064A\u062D").optional().nullable()
});
var insertSaleSchema = createInsertSchema(sales).pick({
  productId: true,
  customerId: true,
  quantity: true,
  priceIqd: true,
  discount: true,
  isInstallment: true
}).extend({
  productId: z.number().min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646\u062A\u062C"),
  customerId: z.number().min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0639\u0645\u064A\u0644"),
  quantity: z.number().min(1, "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 1 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  priceIqd: z.number().min(0, "\u0627\u0644\u0633\u0639\u0631 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  discount: z.number().min(0, "\u0627\u0644\u062E\u0635\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 0 \u0623\u0648 \u0623\u0643\u062B\u0631"),
  isInstallment: z.boolean().default(false)
});
var insertExchangeRateSchema = createInsertSchema(exchangeRates).pick({
  usdToIqd: true
});
var insertInstallmentSchema = createInsertSchema(installments).extend({
  customerName: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0637\u0644\u0648\u0628"),
  customerPhone: z.string().min(1, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0637\u0644\u0648\u0628"),
  identityNumber: z.string().min(1, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 \u0645\u0637\u0644\u0648\u0628"),
  totalAmount: z.number().min(0, "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  downPayment: z.number().min(0, "\u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0623\u0648 \u0623\u0643\u062B\u0631"),
  numberOfPayments: z.number().min(1, "\u0639\u062F\u062F \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 1 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  nextPaymentDate: z.date(),
  guarantorName: z.string().optional(),
  guarantorPhone: z.string().optional()
});
var insertInstallmentPaymentSchema = createInsertSchema(installmentPayments).extend({
  amount: z.number().min(0, "\u0645\u0628\u0644\u063A \u0627\u0644\u062F\u0641\u0639\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  notes: z.string().optional()
});
var insertCampaignSchema = createInsertSchema(marketingCampaigns).extend({
  platforms: z.array(z.string()).min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646\u0635\u0629 \u0648\u0627\u062D\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  budget: z.number().min(0, "\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  startDate: z.date(),
  endDate: z.date().optional()
});
var insertAnalyticsSchema = createInsertSchema(campaignAnalytics).extend({
  date: z.date(),
  platform: z.string(),
  impressions: z.number().min(0),
  clicks: z.number().min(0),
  conversions: z.number().min(0),
  spend: z.number().min(0)
});
var insertSocialMediaAccountSchema = createInsertSchema(socialMediaAccounts).extend({
  platform: z.enum(["facebook", "instagram", "twitter", "linkedin", "snapchat", "tiktok"]),
  accountName: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0637\u0644\u0648\u0628"),
  accessToken: z.string().min(1, "\u0631\u0645\u0632 \u0627\u0644\u0648\u0635\u0648\u0644 \u0645\u0637\u0644\u0648\u0628"),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional()
});
var insertApiKeySchema = createInsertSchema(apiKeys);
var insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).extend({
  type: z.enum(["in", "out"]),
  quantity: z.number().min(1, "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 1 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  reason: z.enum(["sale", "return", "adjustment", "purchase"]),
  reference: z.string().optional(),
  notes: z.string().optional()
});
var insertInventoryAdjustmentSchema = createInsertSchema(inventoryAdjustments).extend({
  oldQuantity: z.number().min(0, "\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0642\u062F\u064A\u0645\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  newQuantity: z.number().min(0, "\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  reason: z.string().min(1, "\u0633\u0628\u0628 \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0645\u0637\u0644\u0648\u0628"),
  notes: z.string().optional()
});
var insertInventoryAlertSchema2 = createInsertSchema(inventoryAlerts).extend({
  type: z.enum(["low_stock", "inactive", "high_demand"]),
  threshold: z.number().min(0, "\u0642\u064A\u0645\u0629 \u0627\u0644\u062D\u062F \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0623\u0648 \u0623\u0643\u062B\u0631"),
  status: z.enum(["active", "inactive"]).default("active")
});
var insertAlertNotificationSchema = createInsertSchema(alertNotifications).extend({
  message: z.string().min(1, "\u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0629")
});
var insertReportSchema = createInsertSchema(reports).extend({
  type: z.enum(["sales", "inventory", "marketing", "financial"]),
  title: z.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0645\u0637\u0644\u0648\u0628"),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }),
  filters: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()),
  format: z.enum(["json", "csv", "pdf"]).default("json")
});
var insertSupplierSchema = createInsertSchema(suppliers).extend({
  name: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0631\u062F \u0645\u0637\u0644\u0648\u0628"),
  contactPerson: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0634\u062E\u0635 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0645\u0637\u0644\u0648\u0628"),
  phone: z.string().min(1, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0637\u0644\u0648\u0628"),
  email: z.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D").optional().nullable(),
  categories: z.array(z.string()).min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0641\u0626\u0629 \u0648\u0627\u062D\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644")
});
var insertSupplierTransactionSchema = createInsertSchema(supplierTransactions).extend({
  amount: z.number().min(0, "\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  date: z.date(),
  type: z.enum(["payment", "refund", "advance", "other"]),
  status: z.enum(["pending", "completed", "cancelled"]).default("completed"),
  attachments: z.array(z.string()).optional()
});
var insertCustomerSchema = createInsertSchema(customers).extend({
  name: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0637\u0644\u0648\u0628"),
  phone: z.string().optional(),
  email: z.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D").optional().nullable()
});
var insertAppointmentSchema = createInsertSchema(appointments).extend({
  title: z.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0648\u0639\u062F \u0645\u0637\u0644\u0648\u0628"),
  description: z.string().optional().nullable(),
  customerId: z.number().int().positive("\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0639\u0645\u064A\u0644").optional().nullable(),
  date: z.coerce.date(),
  duration: z.coerce.number().int().min(1, "\u0645\u062F\u0629 \u0627\u0644\u0645\u0648\u0639\u062F \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 1 \u062F\u0642\u064A\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
  notes: z.string().optional().nullable()
});
var insertFileStorageSchema = createInsertSchema(fileStorage).extend({
  filename: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641 \u0645\u0637\u0644\u0648\u0628"),
  contentType: z.string().min(1, "\u0646\u0648\u0639 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0645\u0637\u0644\u0648\u0628"),
  size: z.number().min(0, "\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  data: z.string().min(1, "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0644\u0641 \u0645\u0637\u0644\u0648\u0628"),
  userId: z.number().min(1, "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628")
});
var insertInvoiceSchema = createInsertSchema(invoices).extend({
  saleId: z.number().min(1, "\u0645\u0639\u0631\u0641 \u0627\u0644\u0628\u064A\u0639 \u0645\u0637\u0644\u0648\u0628"),
  invoiceNumber: z.string().min(1, "\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628"),
  customerName: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0637\u0644\u0648\u0628"),
  totalAmount: z.coerce.number().min(0, "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  discountAmount: z.coerce.number().min(0, "\u0642\u064A\u0645\u0629 \u0627\u0644\u062E\u0635\u0645 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0623\u0648 \u0623\u0643\u062B\u0631"),
  finalAmount: z.coerce.number().min(0, "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  status: z.enum(["active", "modified", "cancelled"]).default("active"),
  paymentMethod: z.enum(["cash", "card", "transfer"]).default("cash"),
  notes: z.string().optional(),
  originalInvoiceId: z.number().optional(),
  modificationReason: z.string().optional()
});
var insertInvoiceItemSchema = createInsertSchema(invoiceItems).extend({
  invoiceId: z.number().min(1, "\u0645\u0639\u0631\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628"),
  productId: z.number().min(1, "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628"),
  quantity: z.coerce.number().min(1e-3, "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  unitPrice: z.coerce.number().min(0, "\u0633\u0639\u0631 \u0627\u0644\u0648\u062D\u062F\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  discount: z.coerce.number().min(0, "\u0642\u064A\u0645\u0629 \u0627\u0644\u062E\u0635\u0645 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0623\u0648 \u0623\u0643\u062B\u0631"),
  totalPrice: z.coerce.number().min(0, "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 0")
});
var insertInvoiceHistorySchema = createInsertSchema(invoiceHistory).extend({
  invoiceId: z.number().min(1, "\u0645\u0639\u0631\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628"),
  action: z.enum(["create", "modify", "cancel"]),
  changes: z.record(z.unknown()),
  reason: z.string().optional()
});
var insertSystemActivitySchema = createInsertSchema(systemActivities).extend({
  details: z.record(z.unknown()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});
var insertActivityReportSchema = createInsertSchema(activityReports).extend({
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date()
  }),
  filters: z.record(z.unknown()).optional(),
  reportType: z.enum(["daily", "weekly", "monthly"]),
  data: z.record(z.unknown())
});
var insertExpenseCategorySchema = createInsertSchema(expenseCategories).extend({
  name: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0641\u0626\u0629 \u0645\u0637\u0644\u0648\u0628"),
  description: z.string().optional().nullable(),
  budgetAmount: z.coerce.number().min(0, "\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644").optional().nullable()
});
var insertExpenseSchema = createInsertSchema(expenses).extend({
  amount: z.coerce.number().min(0, "\u0627\u0644\u0645\u0628\u0644\u063A\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646\u0623\u0643\u0628\u0631 \u0645\u0646 0"),
  description: z.string().min(1, "\u0627\u0644\u0648\u0635\u0641 \u0645\u0637\u0644\u0648\u0628"),
  date: z.coerce.date(),
  categoryId: z.coerce.number().min(1, "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0641\u0626\u0629"),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(["monthly", "weekly", "yearly"]).optional(),
  recurringDay: z.coerce.number().min(1).max(31).optional(),
  attachments: z.array(z.string()).optional()
});
var insertUserSettingsSchema = createInsertSchema(userSettings).extend({
  themeName: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062B\u064A\u0645 \u0645\u0637\u0644\u0648\u0628"),
  fontName: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062E\u0637 \u0645\u0637\u0644\u0648\u0628"),
  fontSize: z.enum(["small", "medium", "large", "xlarge"]),
  appearance: z.enum(["light", "dark", "system"]),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string()
  })
});
var insertStoreSettingsSchema = createInsertSchema(storeSettings).extend({
  storeName: z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0645\u062A\u062C\u0631 \u0645\u0637\u0644\u0648\u0628"),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D").optional(),
  taxNumber: z.string().optional(),
  logoUrl: z.string().optional(),
  receiptNotes: z.string().optional(),
  enableLogo: z.boolean().default(true)
});

// server/db.ts
import { sql } from "drizzle-orm";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error("\u064A\u062C\u0628 \u062A\u0639\u064A\u064A\u0646 DATABASE_URL \u0641\u064A \u0645\u062A\u063A\u064A\u0631\u0627\u062A \u0627\u0644\u0628\u064A\u0626\u0629");
}
console.log("\u0625\u0639\u062F\u0627\u062F \u0627\u062A\u0635\u0627\u0644 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A...");
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 2e4,
  // 20 ثانية للاتصال
  max: 20,
  // زيادة عدد الاتصالات
  idleTimeoutMillis: 12e4,
  // زيادة وقت الخمول
  keepAlive: true,
  allowExitOnIdle: false
});
var db = drizzle(pool, { schema: schema_exports });
async function connectWithRetry(maxRetries = 10, delay = 3e3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      console.log("\u0645\u062D\u0627\u0648\u0644\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A...");
      await pool.query("SELECT 1");
      console.log("\u2705 \u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D");
      return true;
    } catch (err) {
      retries++;
      console.error(`\u274C \u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A (\u0645\u062D\u0627\u0648\u0644\u0629 ${retries}/${maxRetries}):`, err);
      if (retries >= maxRetries) {
        console.error("\u26A0\uFE0F \u0641\u0634\u0644\u062A \u062C\u0645\u064A\u0639 \u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A");
        return false;
      }
      console.log(`\u23F1\uFE0F \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 ${delay}ms \u0642\u0628\u0644 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}
connectWithRetry();
pool.on("error", (err) => {
  console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u062A\u0635\u0627\u0644 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A:", err);
  connectWithRetry(5, 2e3);
});
var pingInterval = setInterval(() => {
  pool.query("SELECT 1").then(() => {
  }).catch((err) => {
    console.warn("\u0641\u0634\u0644 ping \u0644\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u060C \u0645\u062D\u0627\u0648\u0644\u0629 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644:", err);
    connectWithRetry(3, 1e3);
  });
}, 2e4);
pool.on("connect", (client) => {
  client.on("error", (err) => {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0639\u0645\u064A\u0644 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A:", err);
  });
});
process.on("SIGTERM", async () => {
  clearInterval(pingInterval);
  console.log("\u0625\u063A\u0644\u0627\u0642 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A...");
  await pool.end();
  console.log("\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A");
});
process.on("SIGINT", async () => {
  clearInterval(pingInterval);
  console.log("\u0625\u063A\u0644\u0627\u0642 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0633\u0628\u0628 SIGINT...");
  await pool.end();
  console.log("\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A");
  process.exit(0);
});

// server/initialize-database.ts
import * as bcrypt from "@node-rs/bcrypt";
import { sql as sql2 } from "drizzle-orm";
async function initializeDatabase() {
  try {
    console.log("\u062C\u0627\u0631\u064A \u062A\u0647\u064A\u0626\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A...");
    const testQuery = await db.execute(sql2`SELECT 1`);
    if (!testQuery) {
      throw new Error("\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A");
    }
    console.log("\u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D");
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log("\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A...");
      const defaultUserData = {
        username: "admin",
        password: await bcrypt.hash("admin123", 10),
        fullName: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
        role: "admin",
        isActive: true,
        permissions: ["all"],
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      await db.insert(users).values(defaultUserData);
      console.log("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A \u0628\u0646\u062C\u0627\u062D");
    }
    const categories = await db.select().from(productCategories);
    if (categories.length === 0) {
      console.log("\u0625\u0636\u0627\u0641\u0629 \u0641\u0626\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629...");
      const defaultCategories = [
        { name: "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", description: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629" },
        { name: "\u0627\u0644\u0623\u062B\u0627\u062B", description: "\u0623\u062B\u0627\u062B \u0627\u0644\u0645\u0646\u0632\u0644 \u0648\u0627\u0644\u0645\u0643\u062A\u0628" },
        { name: "\u0627\u0644\u0645\u0644\u0627\u0628\u0633", description: "\u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0627\u0644\u0623\u0632\u064A\u0627\u0621" },
        { name: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629", description: "\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0637\u0628\u062E \u0648\u0627\u0644\u0645\u0646\u0632\u0644" },
        { name: "\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A", description: "\u0642\u0637\u0639 \u063A\u064A\u0627\u0631 \u0648\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u0631\u0627\u062A" }
      ];
      await db.insert(productCategories).values(defaultCategories);
      console.log("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0641\u0626\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629 \u0628\u0646\u062C\u0627\u062D");
    }
    try {
      await db.select().from(inventoryAlerts).limit(1);
    } catch (error) {
      console.log("\u0625\u0646\u0634\u0627\u0621 \u062C\u062F\u0648\u0644 \u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646...");
      await db.execute(sql2`
        CREATE TABLE IF NOT EXISTS inventory_alerts (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          type TEXT NOT NULL,
          threshold INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          last_triggered TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062C\u062F\u0648\u0644 \u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0628\u0646\u062C\u0627\u062D");
    }
    try {
      await db.select().from(alertNotifications).limit(1);
    } catch (error) {
      console.log("\u0625\u0646\u0634\u0627\u0621 \u062C\u062F\u0648\u0644 \u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A...");
      await db.execute(sql2`
        CREATE TABLE IF NOT EXISTS alert_notifications (
          id SERIAL PRIMARY KEY,
          alert_id INTEGER NOT NULL REFERENCES inventory_alerts(id),
          message TEXT NOT NULL,
          read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062C\u062F\u0648\u0644 \u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0628\u0646\u062C\u0627\u062D");
    }
    console.log("\u0627\u0643\u062A\u0645\u0644\u062A \u0639\u0645\u0644\u064A\u0629 \u062A\u0647\u064A\u0626\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D");
  } catch (error) {
    console.error("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0647\u064A\u0626\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A:", error);
    throw error;
  }
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as bcrypt2 from "@node-rs/bcrypt";
import session from "express-session";
import createMemoryStore from "memorystore";

// server/storage.ts
import { eq, and, gte } from "drizzle-orm";
var storage = {
  // User authentication methods
  async getUserByUsername(username) {
    try {
      const results = await db.select().from(users).where(eq(users.username, username));
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw new Error("Database error retrieving user.");
    }
  },
  async getUser(id) {
    try {
      const results = await db.select().from(users).where(eq(users.id, id));
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error getting user by id:", error);
      throw new Error("Database error retrieving user.");
    }
  },
  async createUser(userData) {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Database error creating user.");
    }
  },
  // Fix the getProductSales method to use the correct column name
  async getProductSales(productId, since) {
    try {
      const sales2 = await db.select().from(sales).where(and(
        eq(sales.productId, productId),
        gte(sales.date, since)
      ));
      return sales2;
    } catch (error) {
      console.error("Error getting product sales:", error);
      return [];
    }
  },
  // Make sure other methods are properly implemented...
  async getProducts() {
    try {
      return await db.select().from(products);
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  },
  async getProduct(id) {
    try {
      const results = await db.select().from(products).where(eq(products.id, id));
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error getting product:", error);
      return null;
    }
  },
  async getInventoryAlerts() {
    try {
      return await db.select().from(inventoryAlerts);
    } catch (error) {
      console.error("Error getting inventory alerts:", error);
      return [];
    }
  },
  async createAlertNotification(data) {
    try {
      const result = await db.insert(alertNotifications).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating alert notification:", error);
      throw new Error("Database error creating alert notification.");
    }
  }
  // Add other necessary methods...
};

// server/auth.ts
import { eq as eq2 } from "drizzle-orm";
async function setupAuth(app) {
  try {
    passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          console.log(`\u0645\u062D\u0627\u0648\u0644\u0629 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${username}`);
          const user = await storage.getUser(username);
          if (!user) {
            console.log(`\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F: ${username}`);
            return done(null, false, { message: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" });
          }
          if (!user.isActive) {
            console.log(`\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0646\u0634\u0637 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${username}`);
            return done(null, false, { message: "\u0627\u0644\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0646\u0634\u0637" });
          }
          const passwordMatch = await bcrypt2.compare(password, user.password);
          if (!passwordMatch) {
            console.log(`\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${username}`);
            return done(null, false, { message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
          }
          console.log(`\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0628\u0646\u062C\u0627\u062D \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${username}`);
          return done(null, user);
        } catch (error) {
          console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629:", error);
          return done(error);
        }
      })
    );
    passport.serializeUser((user, done) => {
      console.log(`\u062A\u0633\u0644\u0633\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0645\u0639\u0631\u0641: ${user.id}`);
      done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
      try {
        console.log(`\u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0645\u0639\u0631\u0641: ${id}`);
        const user = await storage.getUserById(id);
        if (!user) {
          console.log(`\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0645\u0639\u0631\u0641: ${id}`);
          return done(null, false);
        }
        done(null, user);
      } catch (error) {
        console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645:", error);
        done(error);
      }
    });
    const MemoryStore = createMemoryStore(session);
    const sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // تنظيف الجلسات المنتهية كل 24 ساعة
    });
    app.use(session({
      secret: process.env.SESSION_SECRET || "HGtsdcMKdhZP4HX6WLMnK4TbdZQcP2Gm",
      resave: true,
      // حفظ الجلسة حتى لو لم تتغير
      saveUninitialized: false,
      store: sessionStore,
      rolling: true,
      // تجديد وقت انتهاء الصلاحية مع كل طلب
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        // 7 أيام
        sameSite: "lax",
        httpOnly: true
      }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.post("/api/auth/login", (req, res, next) => {
      console.log("\u0645\u062D\u0627\u0648\u0644\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644...");
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644:", err);
          return res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" });
        }
        if (!user) {
          console.log("\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644:", info?.message);
          return res.status(401).json({ message: info?.message || "\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" });
        }
        console.log("\u0628\u062F\u0621 \u062C\u0644\u0633\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644...");
        req.logIn(user, async (err2) => {
          if (err2) {
            console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0639\u062F \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629:", err2);
            return res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" });
          }
          console.log("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0646\u0627\u062C\u062D\u060C \u062A\u062D\u062F\u064A\u062B \u0648\u0642\u062A \u0622\u062E\u0631 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644...");
          try {
            await db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, user.id));
            console.log("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0648\u0642\u062A \u0622\u062E\u0631 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0628\u0646\u062C\u0627\u062D.");
          } catch (error) {
            console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0648\u0642\u062A \u0622\u062E\u0631 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644:", error);
          }
          req.session.touch();
          const { password, ...userWithoutPassword } = user;
          console.log("\u0625\u0631\u0633\u0627\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0644\u0639\u0645\u064A\u0644.");
          return res.json(userWithoutPassword);
        });
      })(req, res, next);
    });
    app.post("/api/auth/logout", (req, res) => {
      console.log("\u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C...");
      req.logout((err) => {
        if (err) {
          console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C:", err);
          return res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" });
        }
        req.session.destroy((err2) => {
          if (err2) {
            console.error("\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u062C\u0644\u0633\u0629:", err2);
            return res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" });
          }
          res.clearCookie("connect.sid");
          console.log("\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0648\u062D\u0630\u0641 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D.");
          res.json({ message: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0628\u0646\u062C\u0627\u062D" });
        });
      });
    });
    app.get("/api/auth/user", (req, res) => {
      console.log("\u0637\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u062D\u0627\u0644\u064A...");
      if (!req.isAuthenticated()) {
        console.log("\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647 - \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0627\u0644\u062F\u062E\u0648\u0644.");
        return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
      }
      if (req.session) {
        req.session.touch();
      }
      const { password, ...userWithoutPassword } = req.user;
      console.log(`\u0625\u0631\u0633\u0627\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${userWithoutPassword.username}`);
      res.json(userWithoutPassword);
    });
    app.get("/api/auth/check", (req, res) => {
      console.log(`\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629: ${req.isAuthenticated()}`);
      if (req.isAuthenticated() && req.session) {
        req.session.touch();
      }
      res.json({ authenticated: req.isAuthenticated() });
    });
    app.use("/api/protected", (req, res, next) => {
      if (req.isAuthenticated()) {
        if (req.session) {
          req.session.touch();
        }
        return next();
      }
      res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631" });
    });
    const checkRole = (role) => {
      return (req, res, next) => {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631" });
        }
        const user = req.user;
        if (user.role !== role && user.role !== "admin") {
          return res.status(403).json({ message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631" });
        }
        if (req.session) {
          req.session.touch();
        }
        next();
      };
    };
    app.locals.checkRole = checkRole;
    console.log("\u2705 \u062A\u0645 \u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0628\u0646\u062C\u0627\u062D");
  } catch (error) {
    console.error("\u274C \u0641\u0634\u0644 \u0641\u064A \u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629:", error);
    throw error;
  }
}

// server/routes.ts
import { createServer } from "http";
import { z as z2 } from "zod";
import fs from "fs/promises";
import path from "path";
function mockPlatformStats() {
  return {
    impressions: Math.floor(Math.random() * 1e4),
    engagements: Math.floor(Math.random() * 1e3),
    spend: Math.floor(Math.random() * 500)
  };
}
async function fetchFacebookStats() {
  return mockPlatformStats();
}
async function fetchTwitterStats() {
  return mockPlatformStats();
}
async function fetchInstagramStats() {
  return mockPlatformStats();
}
async function fetchTikTokStats() {
  return mockPlatformStats();
}
async function fetchSnapchatStats() {
  return mockPlatformStats();
}
async function fetchLinkedInStats() {
  return mockPlatformStats();
}
async function checkInventoryLevels() {
  try {
    const products2 = await storage.getProducts();
    const alerts = await storage.getInventoryAlerts();
    for (const product of products2) {
      const lowStockAlert = alerts.find(
        (a) => a.productId === product.id && a.type === "low_stock" && a.status === "active"
      );
      if (lowStockAlert && product.stock <= lowStockAlert.threshold) {
        await storage.createAlertNotification({
          alertId: lowStockAlert.id,
          message: `\u0627\u0644\u0645\u0646\u062A\u062C ${product.name} \u0648\u0635\u0644 \u0644\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 (${product.stock} \u0642\u0637\u0639\u0629 \u0645\u062A\u0628\u0642\u064A\u0629)`
        });
      }
      const inactiveAlert = alerts.find(
        (a) => a.productId === product.id && a.type === "inactive" && a.status === "active"
      );
      if (inactiveAlert) {
        const sales2 = await storage.getProductSales(product.id, new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3));
        if (sales2.length === 0) {
          await storage.createAlertNotification({
            alertId: inactiveAlert.id,
            message: `\u0627\u0644\u0645\u0646\u062A\u062C ${product.name} \u0644\u0645 \u064A\u062A\u0645 \u0628\u064A\u0639\u0647 \u062E\u0644\u0627\u0644 \u0622\u062E\u0631 30 \u064A\u0648\u0645`
          });
        }
      }
      const highDemandAlert = alerts.find(
        (a) => a.productId === product.id && a.type === "high_demand" && a.status === "active"
      );
      if (highDemandAlert) {
        const sales2 = await storage.getProductSales(product.id, new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3));
        if (sales2.length >= highDemandAlert.threshold) {
          await storage.createAlertNotification({
            alertId: highDemandAlert.id,
            message: `\u0627\u0644\u0645\u0646\u062A\u062C ${product.name} \u0639\u0644\u064A\u0647 \u0637\u0644\u0628 \u0645\u0631\u062A\u0641\u0639 (${sales2.length} \u0645\u0628\u064A\u0639\u0627\u062A \u0641\u064A \u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645)`
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking inventory levels:", error);
  }
}
async function registerRoutes(app) {
  console.log("Starting to register routes...");
  app.get("/api/products", async (_req, res) => {
    const products2 = await storage.getProducts();
    res.json(products2);
  });
  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      let imageUrl = null;
      let thumbnailUrl = null;
      if (req.files && req.files.image) {
        const file = req.files.image;
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(process.cwd(), "uploads", fileName);
        await fs.mkdir(path.join(process.cwd(), "uploads"), { recursive: true });
        await fs.writeFile(filePath, file.data);
        imageUrl = `/uploads/${fileName}`;
        thumbnailUrl = `/uploads/${fileName}`;
      }
      const product = await storage.createProduct({
        ...req.body,
        imageUrl,
        thumbnailUrl
      });
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0646\u062A\u062C" });
    }
  });
  app.patch("/api/products/:id", async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });
  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      await storage.deleteProduct(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C" });
    }
  });
  app.get("/api/sales", async (_req, res) => {
    const sales2 = await storage.getSales();
    res.json(sales2);
  });
  app.post("/api/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const sale = await storage.createSale({
        ...req.body,
        userId: req.user.id,
        date: /* @__PURE__ */ new Date()
      });
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
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0628\u064A\u0639" });
    }
  });
  app.get("/api/exchange-rate", async (_req, res) => {
    try {
      const rate = await storage.getCurrentExchangeRate();
      res.json(rate);
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0633\u0639\u0631 \u0627\u0644\u0635\u0631\u0641" });
    }
  });
  app.post("/api/exchange-rate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u062A\u062D\u062F\u064A\u062B \u0633\u0639\u0631 \u0627\u0644\u0635\u0631\u0641" });
    }
    try {
      console.log("Updating exchange rate with:", req.body);
      const rate = Number(req.body.usdToIqd);
      if (isNaN(rate) || rate <= 0) {
        return res.status(400).json({ message: "\u0633\u0639\u0631 \u0627\u0644\u0635\u0631\u0641 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0642\u0645\u0627\u064B \u0645\u0648\u062C\u0628\u0627\u064B" });
      }
      const updatedRate = await storage.setExchangeRate(rate);
      console.log("Exchange rate updated to:", updatedRate);
      res.status(201).json(updatedRate);
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0633\u0639\u0631 \u0627\u0644\u0635\u0631\u0641" });
    }
  });
  app.post("/api/theme", async (req, res) => {
    try {
      const themeSchema2 = z2.object({
        primary: z2.string(),
        variant: z2.enum(["professional", "vibrant", "tint", "modern", "classic", "futuristic", "elegant", "natural"]),
        appearance: z2.enum(["light", "dark", "system"]),
        fontStyle: z2.enum([
          "traditional",
          "modern",
          "minimal",
          "digital",
          "elegant",
          "kufi",
          "naskh",
          "ruqaa",
          "thuluth",
          "contemporary",
          "noto-kufi",
          // نوتو كوفي
          "cairo",
          // القاهرة
          "tajawal",
          // طجوال
          "amiri"
          // أميري
        ]),
        radius: z2.number(),
        fontSize: z2.enum(["small", "medium", "large", "xlarge"])
        //Added fontSize
      });
      const theme = themeSchema2.parse(req.body);
      await fs.writeFile(
        path.join(process.cwd(), "theme.json"),
        JSON.stringify(theme, null, 2)
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0638\u0647\u0631" });
    }
  });
  app.get("/api/installments", async (_req, res) => {
    const installments2 = await storage.getInstallments();
    res.json(installments2);
  });
  app.get("/api/installments/:id", async (req, res) => {
    const installment = await storage.getInstallment(Number(req.params.id));
    if (!installment) {
      return res.status(404).json({ message: "\u0627\u0644\u062A\u0642\u0633\u064A\u0637 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    res.json(installment);
  });
  app.post("/api/installments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const installment = await storage.createInstallment({
        ...req.body,
        startDate: /* @__PURE__ */ new Date(),
        status: "active"
      });
      res.status(201).json(installment);
    } catch (error) {
      console.error("Error creating installment:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0633\u064A\u0637" });
    }
  });
  app.get("/api/installments/:id/payments", async (req, res) => {
    const payments = await storage.getInstallmentPayments(Number(req.params.id));
    res.json(payments);
  });
  app.post("/api/installments/:id/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const payment = await storage.createInstallmentPayment({
        ...req.body,
        installmentId: Number(req.params.id),
        paymentDate: /* @__PURE__ */ new Date()
      });
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062F\u0641\u0639\u0629" });
    }
  });
  app.get("/api/marketing/campaigns", async (_req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });
  app.get("/api/marketing/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign) {
      return res.status(404).json({ message: "\u0627\u0644\u062D\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    res.json(campaign);
  });
  app.post("/api/marketing/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const campaign = await storage.createCampaign({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0645\u0644\u0629" });
    }
  });
  app.get("/api/marketing/campaigns/:id/analytics", async (req, res) => {
    const analytics = await storage.getCampaignAnalytics(Number(req.params.id));
    res.json(analytics);
  });
  app.post("/api/marketing/campaigns/:id/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const analytics = await storage.createCampaignAnalytics({
        ...req.body,
        campaignId: Number(req.params.id)
      });
      res.status(201).json(analytics);
    } catch (error) {
      console.error("Error creating analytics:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A" });
    }
  });
  app.get("/api/analytics/sales", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const sales2 = await storage.getAnalyticsSales();
      res.json(sales2);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A" });
    }
  });
  app.get("/api/analytics/customers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const customers2 = await storage.getAnalyticsCustomers();
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621" });
    }
  });
  app.get("/api/analytics/products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const products2 = await storage.getAnalyticsProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching product analytics:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" });
    }
  });
  app.get("/api/marketing/social-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      return res.json([]);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A" });
    }
  });
  app.get("/api/marketing/social-auth/:platform", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    const { platform } = req.params;
    try {
      const mockAccount = {
        id: Date.now(),
        userId: req.user.id,
        platform,
        accountName: `${req.user.username}_${platform}`,
        accessToken: `mock_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
        // 7 days from now
        createdAt: /* @__PURE__ */ new Date()
      };
      await storage.createSocialMediaAccount(mockAccount);
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
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629" });
    }
  });
  app.delete("/api/marketing/social-accounts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      await storage.deleteSocialMediaAccount(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting social account:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0644\u063A\u0627\u0621 \u0631\u0628\u0637 \u0627\u0644\u062D\u0633\u0627\u0628" });
    }
  });
  app.get("/api/marketing/social-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      try {
        const apiKeys2 = await storage.getApiKeys(req.user.id);
        const accounts = await storage.getSocialMediaAccounts(req.user.id);
        if (!apiKeys2 || !accounts.length) {
          return res.json({
            impressions: 0,
            engagement: 0,
            spend: 0
          });
        }
        let totalImpressions = 0;
        let totalEngagements = 0;
        let totalSpend = 0;
        for (const account of accounts) {
          const platformKeys = apiKeys2[account.platform];
          if (!platformKeys) continue;
          try {
            let platformStats;
            switch (account.platform) {
              case "facebook":
                platformStats = await fetchFacebookStats();
                break;
              case "twitter":
                platformStats = await fetchTwitterStats();
                break;
              case "instagram":
                platformStats = await fetchInstagramStats();
                break;
              case "tiktok":
                platformStats = await fetchTikTokStats();
                break;
              case "snapchat":
                platformStats = await fetchSnapchatStats();
                break;
              case "linkedin":
                platformStats = await fetchLinkedInStats();
                break;
            }
            if (platformStats) {
              totalImpressions += platformStats.impressions;
              totalEngagements += platformStats.engagements;
              totalSpend += platformStats.spend;
              try {
                await storage.createCampaignAnalytics({
                  campaignId: 0,
                  // General platform analytics
                  platform: account.platform,
                  impressions: platformStats.impressions,
                  clicks: platformStats.engagements,
                  conversions: 0,
                  spend: platformStats.spend,
                  date: /* @__PURE__ */ new Date()
                });
              } catch (analyticsError) {
                console.error("Error saving campaign analytics:", analyticsError);
              }
            }
          } catch (error) {
            console.error(`Error fetching ${account.platform} stats:`, error);
          }
        }
        const engagement = totalImpressions > 0 ? totalEngagements / totalImpressions : 0;
        res.json({
          impressions: totalImpressions,
          engagement,
          spend: totalSpend
        });
      } catch (dbError) {
        console.error("Database error in social stats:", dbError);
        return res.json({
          impressions: Math.floor(Math.random() * 5e3),
          engagement: Math.random() * 0.1,
          spend: Math.floor(Math.random() * 1e3)
        });
      }
    } catch (error) {
      console.error("Error fetching social media stats:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A" });
    }
  });
  app.get("/api/marketing/platform-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      return res.json([]);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0635\u0627\u062A" });
    }
  });
  app.get("/api/marketing/historical-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const timeRange = req.query.range || "30d";
      let startDate = /* @__PURE__ */ new Date();
      const now = /* @__PURE__ */ new Date();
      switch (timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }
      const stats = await storage.getHistoricalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching historical stats:", error);
      res.json({
        sales: [],
        expenses: [],
        appointments: []
      });
    }
  });
  app.get("/api/marketing/historical-stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const timeRange = req.query.range || "30d";
      const now = /* @__PURE__ */ new Date();
      let startDate = /* @__PURE__ */ new Date();
      switch (timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }
      const analytics = await storage.getCampaignAnalytics(0);
      const filteredAnalytics = analytics.filter((a) => new Date(a.date) >= startDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const dailyStats = filteredAnalytics.reduce((acc, curr) => {
        const date = new Date(curr.date).toISOString().split("T")[0];
        const existingDay = acc.find((d) => d.date === date);
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
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629" });
    }
  });
  app.post("/api/settings/api-keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const apiKeysSchema = z2.object({
        facebook: z2.object({
          appId: z2.string().min(1, "App ID \u0645\u0637\u0644\u0648\u0628"),
          appSecret: z2.string().min(1, "App Secret \u0645\u0637\u0644\u0648\u0628")
        }),
        twitter: z2.object({
          apiKey: z2.string().min(1, "API Key \u0645\u0637\u0644\u0648\u0628"),
          apiSecret: z2.string().min(1, "API Secret \u0645\u0637\u0644\u0648\u0628")
        }),
        tiktok: z2.object({
          clientKey: z2.string().min(1, "Client Key \u0645\u0637\u0644\u0648\u0628"),
          clientSecret: z2.string().min(1, "Client Secret \u0645\u0637\u0644\u0648\u0628")
        }),
        snapchat: z2.object({
          clientId: z2.string().min(1, "Client ID \u0645\u0637\u0644\u0648\u0628"),
          clientSecret: z2.string().min(1, "Client Secret \u0645\u0637\u0644\u0648\u0628")
        }),
        linkedin: z2.object({
          clientId: z2.string().min(1, "Client ID \u0645\u0637\u0644\u0648\u0628"),
          clientSecret: z2.string().min(1, "Client Secret \u0645\u0637\u0644\u0648\u0628")
        })
      });
      const apiKeys2 = apiKeysSchema.parse(req.body);
      await storage.setApiKeys(req.user.id, apiKeys2);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating API keys:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0645\u0641\u0627\u062A\u064A\u062D API" });
    }
  });
  app.get("/api/settings/api-keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const apiKeys2 = await storage.getApiKeys(req.user.id);
      res.json(apiKeys2);
    } catch (error) {
      console.error("Error getting API keys:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0641\u0627\u062A\u064A\u062D API" });
    }
  });
  app.post("/api/settings/api-keys/migrate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      await storage.migrateLocalStorageToDb(req.user.id, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error migrating API keys:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u0631\u062D\u064A\u0644 \u0645\u0641\u0627\u062A\u064A\u062D API" });
    }
  });
  app.get("/api/inventory/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const transactions = await storage.getInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646" });
    }
  });
  app.post("/api/inventory/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const transaction = await storage.createInventoryTransaction({
        ...req.body,
        userId: req.user.id,
        date: /* @__PURE__ */ new Date()
      });
      const product = await storage.getProduct(transaction.productId);
      if (product) {
        const stockChange = transaction.type === "in" ? transaction.quantity : -transaction.quantity;
        await storage.updateProduct(product.id, {
          ...product,
          stock: product.stock + stockChange
        });
      }
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646" });
    }
  });
  app.get("/api/expenses/categories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      try {
        const categories = await storage.getExpenseCategories(req.user.id);
        res.json(categories);
      } catch (dbError) {
        console.error("Error fetching expense categories:", dbError);
        res.json([]);
      }
    } catch (error) {
      console.error("Error in expense categories endpoint:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0641\u0626\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A" });
    }
  });
  app.post("/api/expenses/categories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log("Received category data:", req.body);
      const validatedData = insertExpenseCategorySchema.parse({
        name: req.body.name,
        description: req.body.description,
        budgetAmount: req.body.budgetAmount ? Number(req.body.budgetAmount) : null
      });
      const category = await storage.createExpenseCategory({
        ...validatedData,
        userId: req.user.id
      });
      console.log("Created category:", category);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating expense category:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0641\u0626\u0629 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A" });
      }
    }
  });
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const expenses2 = await storage.getExpenses(req.user.id);
      res.json(expenses2);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A" });
    }
  });
  app.post("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({
        ...validatedData,
        userId: req.user.id
      });
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0635\u0631\u0648\u0641" });
      }
    }
  });
  app.get("/api/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      try {
        const suppliers2 = await storage.getSuppliers(req.user.id);
        res.json(suppliers2);
      } catch (dbError) {
        console.error("Error fetching suppliers:", dbError);
        res.json([]);
      }
    } catch (error) {
      console.error("Error in suppliers endpoint:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646" });
    }
  });
  app.post("/api/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier({
        ...validatedData,
        userId: req.user.id
      });
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0648\u0631\u062F" });
      }
    }
  });
  app.patch("/api/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const supplier = await storage.getSupplier(Number(req.params.id));
      if (!supplier || supplier.userId !== req.user.id) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0648\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const updatedSupplier = await storage.updateSupplier(supplier.id, req.body);
      res.json(updatedSupplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0648\u0631\u062F" });
    }
  });
  app.delete("/api/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const supplier = await storage.getSupplier(Number(req.params.id));
      if (!supplier || supplier.userId !== req.user.id) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0648\u0631\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      await storage.deleteSupplier(supplier.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0648\u0631\u062F" });
    }
  });
  app.get("/api/suppliers/:id/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const transactions = await storage.getSupplierTransactions(Number(req.params.id));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching supplier transactions:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0627\u0644\u0645\u0648\u0631\u062F" });
    }
  });
  app.post("/api/suppliers/:id/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const validatedData = insertSupplierTransactionSchema.parse(req.body);
      const transaction = await storage.createSupplierTransaction({
        ...validatedData,
        supplierId: Number(req.params.id),
        userId: req.user.id
      });
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating supplier transaction:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 \u0627\u0644\u0645\u0648\u0631\u062F" });
      }
    }
  });
  app.get("/api/customers", async (req, res) => {
    try {
      const search = req.query.search;
      const customers2 = await storage.searchCustomers(search);
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621" });
    }
  });
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(Number(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "\u0627\u0644\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0645\u064A\u0644" });
    }
  });
  app.get("/api/customers/:id/sales", async (req, res) => {
    try {
      const sales2 = await storage.getCustomerSales(Number(req.params.id));
      res.json(sales2);
    } catch (error) {
      console.error("Error fetching customer sales:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0639\u0645\u064A\u0644" });
    }
  });
  app.post("/api/customers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
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
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0639\u0645\u064A\u0644" });
      }
    }
  });
  app.delete("/api/customers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const customerId = Number(req.params.id);
      await storage.deleteCustomer(customerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0639\u0645\u064A\u0644" });
    }
  });
  app.get("/api/customers/:id/appointments", async (req, res) => {
    try {
      const appointments2 = await storage.getCustomerAppointments(Number(req.params.id));
      res.json(appointments2);
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F" });
    }
  });
  app.post("/api/customers/:id/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment({
        ...validatedData,
        customerId: Number(req.params.id)
      });
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0648\u0639\u062F" });
      }
    }
  });
  app.patch("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const oldAppointment = await storage.getAppointment(Number(req.params.id));
      if (!oldAppointment) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0648\u0639\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const updatedAppointment = await storage.updateAppointment(
        Number(req.params.id),
        {
          ...req.body,
          updatedAt: /* @__PURE__ */ new Date()
        }
      );
      if (req.body.status && oldAppointment.status !== req.body.status) {
        await storage.logSystemActivity({
          userId: req.user.id,
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
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0648\u0639\u062F" });
    }
  });
  app.delete("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log("Deleting appointment:", req.params.id);
      await storage.deleteAppointment(Number(req.params.id));
      console.log("Successfully deleted appointment:", req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0648\u0639\u062F" });
    }
  });
  app.get("/api/appointments/:id/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log(`Fetching activities for appointment: ${req.params.id}`);
      const activities = await storage.getAppointmentActivities(Number(req.params.id));
      console.log("Retrieved activities:", activities);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching appointment activities:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0633\u062C\u0644 \u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0648\u0639\u062F" });
    }
  });
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log("Fetching activities for entity type:", req.query.entityType);
      const activities = await storage.getSystemActivities({
        entityType: req.query.entityType
      });
      console.log("Retrieved activities:", activities);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0633\u062C\u0644 \u0627\u0644\u062D\u0631\u0643\u0627\u062A" });
    }
  });
  app.post("/api/files", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const file = await storage.saveFile({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(file);
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u0645\u0644\u0641" });
    }
  });
  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getFileById(Number(req.params.id));
      if (!file) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0644\u0641" });
    }
  });
  app.get("/api/files/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const files = await storage.getUserFiles(req.user.id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching user files:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
  app.delete("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      await storage.deleteFile(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0644\u0641" });
    }
  });
  const themeSchema = z2.object({
    primary: z2.string(),
    variant: z2.enum([
      "modern",
      // العصري
      "classic",
      // الكلاسيكي
      "elegant",
      // الأنيق
      "vibrant",
      // النابض بالحياة
      "natural"
      // الطبيعي
    ]),
    appearance: z2.enum(["light", "dark", "system"]),
    fontStyle: z2.enum([
      "noto-kufi",
      // نوتو كوفي
      "cairo",
      // القاهرة
      "tajawal",
      // طجوال
      "amiri"
      // أميري
    ]),
    fontSize: z2.enum(["small", "medium", "large", "xlarge"]),
    radius: z2.number()
  });
  app.get("/api/settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const settings = await storage.getUserSettings(req.user.id);
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
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0638\u0647\u0631" });
    }
  });
  app.get("/api/store-settings", async (req, res) => {
    try {
      console.log("\u062C\u0627\u0631\u064A \u062C\u0644\u0628 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631...");
      try {
        const tableExists = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'store_settings'
          );
        `);
        if (!tableExists.rows?.[0]?.exists) {
          console.log("\u062C\u062F\u0648\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u060C \u0633\u064A\u062A\u0645 \u0625\u0646\u0634\u0627\u0624\u0647");
          await db.execute(sql`
            CREATE TABLE IF NOT EXISTS store_settings (
              id SERIAL PRIMARY KEY,
              store_name VARCHAR(255) NOT NULL,
              store_address TEXT,
              store_phone VARCHAR(255),
              store_email VARCHAR(255),
              tax_number VARCHAR(255),
              logo_url TEXT,
              receipt_notes TEXT,
              enable_logo BOOLEAN NOT NULL DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await db.execute(sql`
            INSERT INTO store_settings 
            (store_name, store_address, store_phone, receipt_notes, enable_logo) 
            VALUES ('نظام SAS للإدارة', 'العراق', '07xxxxxxxxx', 'شكراً لتعاملكم معنا', true);
          `);
          console.log("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062C\u062F\u0648\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0648\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629");
        }
      } catch (tableError) {
        console.error("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062C\u062F\u0648\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631:", tableError);
      }
      const result = await db.execute(sql`
        SELECT * FROM store_settings ORDER BY id DESC LIMIT 1;
      `);
      if (result.rows && result.rows.length > 0) {
        const settings = {
          id: result.rows[0].id,
          storeName: result.rows[0].store_name,
          storeAddress: result.rows[0].store_address,
          storePhone: result.rows[0].store_phone,
          storeEmail: result.rows[0].store_email,
          taxNumber: result.rows[0].tax_number,
          logoUrl: result.rows[0].logo_url,
          receiptNotes: result.rows[0].receipt_notes,
          enableLogo: result.rows[0].enable_logo,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        };
        console.log("\u062A\u0645 \u062C\u0644\u0628 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0628\u0646\u062C\u0627\u062D:", settings);
        return res.json(settings);
      } else {
        console.log("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631\u060C \u0625\u0631\u062C\u0627\u0639 \u0627\u0644\u0642\u064A\u0645 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629");
        return res.json({
          storeName: "\u0646\u0638\u0627\u0645 SAS \u0644\u0644\u0625\u062F\u0627\u0631\u0629",
          storeAddress: "\u0627\u0644\u0639\u0631\u0627\u0642",
          storePhone: "07xxxxxxxxx",
          storeEmail: "",
          taxNumber: "",
          logoUrl: "",
          receiptNotes: "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643\u0645 \u0645\u0639\u0646\u0627",
          enableLogo: true
        });
      }
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631" });
    }
  });
  app.post("/api/store-settings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log("\u062C\u0627\u0631\u064A \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631...", req.body);
      let logoUrl = req.body.logoUrl;
      if (req.files && req.files.logo) {
        const file = req.files.logo;
        const fileName = `store-logo-${Date.now()}-${file.name}`;
        const filePath = path.join(process.cwd(), "uploads", fileName);
        await fs.mkdir(path.join(process.cwd(), "uploads"), { recursive: true });
        await fs.writeFile(filePath, file.data);
        logoUrl = `/uploads/${fileName}`;
        console.log("\u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u0634\u0639\u0627\u0631:", logoUrl);
      }
      const existingSettings = await db.execute(sql`
        SELECT id FROM store_settings ORDER BY id DESC LIMIT 1;
      `);
      let result;
      if (existingSettings.rows && existingSettings.rows.length > 0) {
        result = await db.execute(sql`
          UPDATE store_settings
          SET 
            store_name = ${req.body.storeName || "\u0646\u0638\u0627\u0645 SAS \u0644\u0644\u0625\u062F\u0627\u0631\u0629"},
            store_address = ${req.body.storeAddress || ""},
            store_phone = ${req.body.storePhone || ""},
            store_email = ${req.body.storeEmail || null},
            tax_number = ${req.body.taxNumber || null},
            logo_url = ${logoUrl || null},
            receipt_notes = ${req.body.receiptNotes || "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643\u0645 \u0645\u0639\u0646\u0627"},
            enable_logo = ${req.body.enableLogo === false ? false : true},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existingSettings.rows[0].id}
          RETURNING *;
        `);
      } else {
        result = await db.execute(sql`
          INSERT INTO store_settings
          (store_name, store_address, store_phone, store_email, tax_number, logo_url, receipt_notes, enable_logo)
          VALUES (
            ${req.body.storeName || "\u0646\u0638\u0627\u0645 SAS \u0644\u0644\u0625\u062F\u0627\u0631\u0629"},
            ${req.body.storeAddress || ""},
            ${req.body.storePhone || ""},
            ${req.body.storeEmail || null},
            ${req.body.taxNumber || null},
            ${logoUrl || null},
            ${req.body.receiptNotes || "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643\u0645 \u0645\u0639\u0646\u0627"},
            ${req.body.enableLogo === false ? false : true}
          )
          RETURNING *;
        `);
      }
      if (result.rows && result.rows.length > 0) {
        const settings = {
          id: result.rows[0].id,
          storeName: result.rows[0].store_name,
          storeAddress: result.rows[0].store_address,
          storePhone: result.rows[0].store_phone,
          storeEmail: result.rows[0].store_email,
          taxNumber: result.rows[0].tax_number,
          logoUrl: result.rows[0].logo_url,
          receiptNotes: result.rows[0].receipt_notes,
          enableLogo: result.rows[0].enable_logo,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        };
        console.log("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0628\u0646\u062C\u0627\u062D:", settings);
        res.json(settings);
      } else {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631");
      }
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631" });
    }
  });
  app.post("/api/settings", async (req, res) => {
    try {
      const themeSchema2 = z2.object({
        primary: z2.string(),
        variant: z2.enum(["professional", "vibrant", "tint", "modern", "classic", "futuristic", "elegant", "natural"]),
        appearance: z2.enum(["light", "dark", "system"]),
        fontStyle: z2.enum([
          "traditional",
          "modern",
          "minimal",
          "digital",
          "elegant",
          "kufi",
          "naskh",
          "ruqaa",
          "thuluth",
          "contemporary",
          "noto-kufi",
          "cairo",
          "tajawal",
          "amiri"
        ]),
        fontSize: z2.enum(["small", "medium", "large", "xlarge"]),
        radius: z2.number()
      });
      const theme = themeSchema2.parse(req.body);
      const userSettings2 = {
        userId: Number(req.user.id),
        // التأكد من أن المعرف رقم
        themeName: theme.variant,
        fontName: theme.fontStyle,
        fontSize: theme.fontSize,
        appearance: theme.appearance,
        colors: {
          primary: theme.primary,
          secondary: `color-mix(in srgb, ${theme.primary} 80%, ${theme.appearance === "dark" ? "white" : "black"})`,
          accent: `color-mix(in srgb, ${theme.primary} 60%, ${theme.appearance === "dark" ? "black" : "white"})`
        }
      };
      await storage.saveUserSettings(Number(req.user.id), userSettings2);
      await fs.writeFile(
        path.join(process.cwd(), "theme.json"),
        JSON.stringify(theme, null, 2)
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0638\u0647\u0631" });
    }
  });
  app.get("/api/inventory/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const alerts = await storage.getInventoryAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A" });
    }
  });
  app.post("/api/inventory/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const validatedData = insertInventoryAlertSchema.parse(req.body);
      const alert = await storage.createInventoryAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating inventory alert:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629", errors: error.errors });
      } else {
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0646\u0628\u064A\u0647" });
      }
    }
  });
  app.patch("/api/inventory/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const alert = await storage.updateInventoryAlert(Number(req.params.id), req.body);
      res.json(alert);
    } catch (error) {
      console.error("Error updating inventory alert:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0646\u0628\u064A\u0647" });
    }
  });
  app.delete("/api/inventory/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      await storage.deleteInventoryAlert(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting inventory alert:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u062A\u0646\u0628\u064A\u0647" });
    }
  });
  app.get("/api/inventory/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const notifications = await storage.getAlertNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching alert notifications:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A" });
    }
  });
  app.patch("/api/inventory/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const notification = await storage.markNotificationAsRead(Number(req.params.id));
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0631" });
    }
  });
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log("Fetching appointments...");
      const appointments2 = await storage.getAppointments();
      console.log("Fetched appointments:", appointments2);
      res.json(appointments2);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F" });
    }
  });
  app.get("/api/product-recommendations", async (req, res) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId) : null;
      const customerId = req.query.customerId ? parseInt(req.query.customerId) : null;
      const salesData = await storage.getSales();
      const productsData = await storage.getProducts();
      const relatedProducts = [];
      const customerPreferences = [];
      if (productId) {
        const productSales = salesData.filter((sale) => sale.productId === productId);
        const customerIds = [...new Set(productSales.map((sale) => sale.customerId))];
        for (const custId of customerIds) {
          if (!custId) continue;
          const customerSales = salesData.filter((sale) => sale.customerId === custId && sale.productId !== productId);
          for (const sale of customerSales) {
            const product = productsData.find((p) => p.id === sale.productId);
            if (product) {
              relatedProducts.push({
                id: product.id,
                name: product.name,
                price: product.priceIqd,
                relevanceScore: 0.8,
                // قيمة مبدئية
                reason: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0630\u064A\u0646 \u0627\u0634\u062A\u0631\u0648\u0627 \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0634\u062A\u0631\u0648\u0627 \u0623\u064A\u0636\u064B\u0627"
              });
            }
          }
        }
      }
      if (customerId) {
        const customerSales = salesData.filter((sale) => sale.customerId === customerId);
        const purchasedProductIds = customerSales.map((sale) => sale.productId);
        const purchasedProducts = productsData.filter((p) => purchasedProductIds.includes(p.id));
        for (const product of productsData) {
          if (!purchasedProductIds.includes(product.id)) {
            const similarProducts = purchasedProducts.filter((p) => {
              const priceDiff = Math.abs(p.priceIqd - product.priceIqd);
              const percentDiff = priceDiff / p.priceIqd;
              return percentDiff < 0.3;
            });
            if (similarProducts.length > 0) {
              customerPreferences.push({
                id: product.id,
                name: product.name,
                price: product.priceIqd,
                relevanceScore: 0.7,
                reason: "\u0627\u0633\u062A\u0646\u0627\u062F\u064B\u0627 \u0625\u0644\u0649 \u0645\u0634\u062A\u0631\u064A\u0627\u062A\u0643 \u0627\u0644\u0633\u0627\u0628\u0642\u0629"
              });
            }
          }
        }
      }
      const uniqueRelatedProducts = Array.from(
        new Map(relatedProducts.map((item) => [item.id, item])).values()
      );
      const uniqueCustomerPrefs = Array.from(
        new Map(customerPreferences.map((item) => [item.id, item])).values()
      );
      const recommendations = {
        relatedProducts: uniqueRelatedProducts.slice(0, 5),
        customerPreferences: uniqueCustomerPrefs.slice(0, 5)
      };
      res.status(200).json(recommendations);
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0644\u064A\u0644 \u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A:", error);
      res.status(500).json({
        message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A"
      });
    }
  });
  app.get("/api/sales-analytics", async (req, res) => {
    try {
      const salesData = await storage.getSales();
      const sales2 = salesData.sales || [];
      const salesByDate = sales2.reduce((acc, sale) => {
        const date = new Date(sale.date).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += sale.totalPrice;
        return acc;
      }, {});
      const dailyAverage = Object.values(salesByDate).length ? Object.values(salesByDate).reduce((sum, val) => sum + val, 0) / Object.values(salesByDate).length : 0;
      const productSales = {};
      sales2.forEach((sale) => {
        (sale.items || []).forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = 0;
          }
          productSales[item.productId] += item.quantity;
        });
      });
      const topProducts = Object.entries(productSales).map(([productId, count]) => ({ productId: parseInt(productId), count })).sort((a, b) => b.count - a.count).slice(0, 5);
      const growthRate = 1 + (Math.random() * 0.1 + 0.05);
      const nextWeekForecast = dailyAverage * 7 * growthRate;
      const relatedProductsMap = {};
      sales2.forEach((sale) => {
        const items = sale.items || [];
        for (let i = 0; i < items.length; i++) {
          for (let j = 0; j < items.length; j++) {
            if (i !== j) {
              const productA = items[i].productId;
              const productB = items[j].productId;
              if (!relatedProductsMap[productA]) {
                relatedProductsMap[productA] = {};
              }
              if (!relatedProductsMap[productA][productB]) {
                relatedProductsMap[productA][productB] = 0;
              }
              relatedProductsMap[productA][productB]++;
            }
          }
        }
      });
      const relatedProducts = {};
      Object.keys(relatedProductsMap).forEach((productId) => {
        relatedProducts[productId] = Object.entries(relatedProductsMap[productId]).map(([relatedId, count]) => ({ productId: parseInt(relatedId), count })).sort((a, b) => b.count - a.count).slice(0, 3);
      });
      res.status(200).json({
        dailyAverageSales: dailyAverage,
        topSellingProducts: topProducts,
        forecastNextWeek: nextWeekForecast,
        relatedProducts
      });
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A:", error);
      res.status(500).json({
        message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  });
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log("Creating appointment with data:", req.body);
      const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        status: "scheduled"
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
        res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0648\u0639\u062F" });
      }
    }
  });
  app.patch("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const oldAppointment = await storage.getAppointment(Number(req.params.id));
      if (!oldAppointment) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0648\u0639\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const updatedAppointment = await storage.updateAppointment(
        Number(req.params.id),
        {
          ...req.body,
          updatedAt: /* @__PURE__ */ new Date()
        }
      );
      if (req.body.status && oldAppointment.status !== req.body.status) {
        await storage.logSystemActivity({
          userId: req.user.id,
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
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0648\u0639\u062F" });
    }
  });
  app.delete("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      console.log("Deleting appointment:", req.params.id);
      await storage.deleteAppointment(Number(req.params.id));
      console.log("Successfully deleted appointment:", req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0648\u0639\u062F" });
    }
  });
  app.post("/api/reports/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const { startDate, endDate, type, filters } = req.body;
      const report = await storage.generateActivityReport({
        name: `\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A - ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-IQ")}`,
        description: `\u062A\u0642\u0631\u064A\u0631 \u062A\u0641\u0635\u064A\u0644\u064A \u0644\u0644\u0646\u0634\u0627\u0637\u0627\u062A \u0645\u0646 ${new Date(startDate).toLocaleDateString("ar-IQ")} \u0625\u0644\u0649 ${new Date(endDate).toLocaleDateString("ar-IQ")}`,
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        reportType: type,
        filters,
        generatedBy: req.user.id,
        data: {}
      });
      res.json(report);
    } catch (error) {
      console.error("Error generating activity report:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" });
    }
  });
  app.get("/api/reports/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const report = await storage.getActivityReport(Number(req.params.id));
      if (!report) {
        return res.status(404).json({ message: "\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching activity report:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" });
    }
  });
  app.get("/api/reports/sales", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const { startDate, endDate, page = "1", pageSize = "50" } = req.query;
      const report = await storage.getDetailedSalesReport(
        {
          start: new Date(startDate),
          end: new Date(endDate)
        },
        req.user.id,
        Number(page),
        Number(pageSize)
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A" });
    }
  });
  app.get("/api/reports/inventory", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getInventoryReport({
        start: new Date(startDate),
        end: new Date(endDate)
      });
      res.json(report);
    } catch (error) {
      console.error("Error generating inventory report:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0648\u0646" });
    }
  });
  app.get("/api/reports/financial", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getFinancialReport({
        start: new Date(startDate),
        end: new Date(endDate)
      });
      res.json(report);
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A" });
    }
  });
  app.get("/api/reports/user-activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const { startDate, endDate } = req.query;
      const report = await storage.getUserActivityReport({
        start: new Date(startDate),
        end: new Date(endDate)
      });
      res.json(report);
    } catch (error) {
      console.error("Error generating user activity report:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" });
    }
  });
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const reports2 = await storage.getUserReports(req.user.id, req.query.type);
      res.json(reports2);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631" });
    }
  });
  app.get("/api/reports/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ message: "\u0645\u0639\u0631\u0641 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" });
      }
      const report = await storage.getReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      if (report.userId !== req.user.id) {
        return res.status(403).json({ message: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0647\u0630\u0627 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" });
    }
  });
  app.get("/api/reports/appointments", async (req, res) => {
    console.log("Received appointments report request");
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        console.log("Missing date parameters:", { startDate, endDate });
        return res.status(400).json({
          message: "\u064A\u062C\u0628 \u062A\u062D\u062F\u064A\u062F \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0648\u0627\u0644\u0646\u0647\u0627\u064A\u0629"
        });
      }
      console.log("Generating report for date range:", { startDate, endDate });
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          message: "\u0635\u064A\u063A\u0629 \u0627\u0644\u062A\u0627\u0631\u064A\u062E \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629"
        });
      }
      const report = await storage.getAppointmentsReport({
        start,
        end
      }, req.user.id);
      console.log("Report generated successfully, size:", JSON.stringify(report).length);
      res.json(report);
    } catch (error) {
      console.error("Error in appointments report endpoint:", error);
      res.status(500).json({
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F",
        error: error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"
      });
    }
  });
  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        search: req.query.search,
        startDate: req.query.startDate ? new Date(req.query.startDate) : void 0,
        endDate: req.query.endDate ? new Date(req.query.endDate) : void 0,
        status: req.query.status
      };
      console.log("Fetching invoices with filters:", filters);
      const sales2 = await storage.getSales();
      const formattedInvoices = sales2.slice((page - 1) * limit, page * limit).map((sale) => ({
        id: sale.id,
        invoiceNumber: `INV-${sale.id}`,
        customerName: sale.customerName || "\u0632\u0628\u0648\u0646 \u0646\u0642\u062F\u064A",
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
          total: sales2.length,
          page,
          limit,
          pages: Math.ceil(sales2.length / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631" });
    }
  });
  app.get("/api/invoices/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" });
      }
      const sale = await storage.getSale(id);
      if (!sale) {
        return res.status(404).json({ message: "\u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      const invoice = {
        id: sale.id,
        invoiceNumber: `INV-${sale.id}`,
        customerName: sale.customerName || "\u0632\u0628\u0648\u0646 \u0646\u0642\u062F\u064A",
        totalAmount: Number(sale.finalPriceIqd),
        status: "active",
        createdAt: sale.date,
        items: [{
          id: 1,
          productId: sale.productId,
          quantity: sale.quantity,
          unitPrice: Number(sale.priceIqd),
          totalPrice: Number(sale.finalPriceIqd),
          productName: "\u0627\u0644\u0645\u0646\u062A\u062C"
          // سيتم إضافة اسم المنتج لاحقاً
        }]
      };
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629" });
    }
  });
  app.post("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    }
    try {
      const invoice = await storage.createInvoice({
        ...req.body,
        userId: req.user.id,
        date: /* @__PURE__ */ new Date()
      });
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629" });
    }
  });
  app.get("/api/system/db-status", async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT 1 as connected`);
      if (result && result.rows && result.rows.length > 0) {
        const tablesResult = await db.execute(sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `);
        res.json({
          status: "\u0645\u062A\u0635\u0644",
          tables: tablesResult.rows.map((row) => row.table_name),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        res.status(500).json({ status: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644", message: "\u0641\u0634\u0644 \u0627\u0644\u0627\u0633\u062A\u0639\u0644\u0627\u0645 \u0627\u0644\u0628\u0633\u064A\u0637" });
      }
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A:", error);
      res.status(500).json({ status: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644", message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" });
    }
  });
  app.get("/api/system/session-test", (req, res) => {
    if (!req.session) {
      return res.status(500).json({ status: "\u0641\u0634\u0644", message: "\u0627\u0644\u062C\u0644\u0633\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    if (!req.session.visits) {
      req.session.visits = 0;
    }
    req.session.visits++;
    req.session.lastVisit = (/* @__PURE__ */ new Date()).toISOString();
    res.json({
      status: "\u0646\u062C\u0627\u062D",
      authenticated: req.isAuthenticated(),
      session: {
        id: req.sessionID,
        visits: req.session.visits,
        lastVisit: req.session.lastVisit,
        cookie: req.session.cookie
      }
    });
  });
  app.use((req, res) => {
    console.log(`\u0645\u0633\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F: ${req.method} ${req.originalUrl}`);
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F", path: req.originalUrl });
    }
    res.sendFile(path.join(process.cwd(), "client/dist/index.html"));
  });
  app.use((err, req, res, next) => {
    console.error("\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0627\u0644\u062C:", err);
    res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645", error: process.env.NODE_ENV === "development" ? err.message : void 0 });
  });
  const httpServer = createServer(app);
  setInterval(checkInventoryLevels, 60 * 60 * 1e3);
  console.log("\u2705 \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0628\u0646\u062C\u0627\u062D");
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  server: {
    port: 3e3,
    strictPort: true,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path3.join(process.cwd(), "client/dist");
  try {
    if (!fs2.existsSync(distPath)) {
      console.warn(`\u062A\u062D\u0630\u064A\u0631: \u0645\u062C\u0644\u062F dist \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F: ${distPath}`);
      console.warn("\u0642\u062F \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0628\u0646\u0627\u0621 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0623\u0648\u0644\u0627\u064B \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 'npm run build'");
    }
  } catch (err) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0648\u062C\u0648\u062F \u0645\u062C\u0644\u062F dist:", err);
  }
  app.use(express.static(distPath));
  app.use("/uploads", express.static(path3.join(process.cwd(), "uploads")));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path3.join(distPath, "index.html"));
  });
}

// server/index.ts
import path4 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import fs3 from "fs/promises";
dotenv.config();
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path4.dirname(__filename3);
var isDev = process.env.NODE_ENV !== "production";
var PORT = 5e3;
async function startServer() {
  try {
    const app = express2();
    const server = http.createServer(app);
    app.use(express2.json());
    app.use(cors({
      origin: true,
      credentials: true
    }));
    app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: path4.join(__dirname3, "../tmp")
    }));
    console.log("\u062C\u0627\u0631\u064A \u062A\u0647\u064A\u0626\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A...");
    await initializeDatabase();
    console.log("\u0627\u0643\u062A\u0645\u0644\u062A \u0639\u0645\u0644\u064A\u0629 \u062A\u0647\u064A\u0626\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D");
    await setupAuth(app);
    await registerRoutes(app);
    app.use((err, req, res, next) => {
      console.error("\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0627\u0644\u062C:", err);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645" });
    });
    if (isDev) {
      console.log("\u0625\u0639\u062F\u0627\u062F Vite \u0641\u064A \u0648\u0636\u0639 \u0627\u0644\u062A\u0637\u0648\u064A\u0631...");
      await setupVite(app, server);
    } else {
      console.log("\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u062B\u0627\u0628\u062A\u0629 \u0641\u064A \u0648\u0636\u0639 \u0627\u0644\u0625\u0646\u062A\u0627\u062C...");
      serveStatic(app);
    }
    const uploadsDir = path4.join(process.cwd(), "uploads");
    try {
      await fs3.mkdir(uploadsDir, { recursive: true });
      console.log(`\u062A\u0645 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0648\u062C\u0648\u062F \u0645\u062C\u0644\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u0627\u062A: ${uploadsDir}`);
    } catch (err) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0645\u062C\u0644\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u0627\u062A:", err);
    }
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`\u0627\u0644\u062E\u0627\u062F\u0645 \u064A\u0639\u0645\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0641\u0630 ${PORT} \u0641\u064A \u0648\u0636\u0639 ${isDev ? "\u0627\u0644\u062A\u0637\u0648\u064A\u0631" : "\u0627\u0644\u0625\u0646\u062A\u0627\u062C"}`);
    });
  } catch (error) {
    console.error("\u0641\u0634\u0644 \u0628\u062F\u0621 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u062E\u0627\u062F\u0645:", error);
    process.exit(1);
  }
}
process.on("uncaughtException", (err) => {
  console.error("\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("\u0648\u0639\u062F \u0645\u0631\u0641\u0648\u0636 \u063A\u064A\u0631 \u0645\u0639\u0627\u0644\u062C:", reason);
});
startServer().catch((error) => {
  console.error("\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639:", error);
  process.exit(1);
});
