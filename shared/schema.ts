import { pgTable, text, serial, timestamp, boolean, decimal, integer, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// جدول المستخدمين
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// جدول الفئات
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول المنتجات
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  productCode: varchar("product_code", { length: 50 }),
  barcode: varchar("barcode", { length: 100 }),
  categoryId: integer("category_id").references(() => categories.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  minQuantity: integer("min_quantity").default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// جدول العملاء
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول المبيعات
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  userId: integer("user_id").references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  priceIqd: text("price_iqd").notNull(),
  priceUsd: text("price_usd"),
  discount: text("discount").default("0"),
  finalPriceIqd: text("final_price_iqd").notNull(),
  finalPriceUsd: text("final_price_usd"),
  notes: text("notes"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity"),
});

// جدول تفاصيل المبيعات
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceIqd: text("price_iqd").notNull(),
  priceUsd: text("price_usd"),
  totalIqd: text("total_iqd").notNull(),
  totalUsd: text("total_usd"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول أسعار الصرف
export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  usdToIqd: text("usd_to_iqd").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

// جدول التقسيط
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id),
  customerId: integer("customer_id").references(() => customers.id),
  userId: integer("user_id").references(() => users.id),
  totalAmount: text("total_amount").notNull(),
  downPayment: text("down_payment"),
  remainingAmount: text("remaining_amount").notNull(),
  installmentCount: integer("installment_count").notNull(),
  installmentAmount: text("installment_amount").notNull(),
  startDate: timestamp("start_date").notNull(),
  nextDueDate: timestamp("next_due_date"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// جدول مدفوعات التقسيط
export const installmentPayments = pgTable("installment_payments", {
  id: serial("id").primaryKey(),
  installmentId: integer("installment_id").references(() => installments.id),
  amount: text("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول الحملات التسويقية
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  platforms: jsonb("platforms").notNull(),
  budget: text("budget").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("planned"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// جدول تحليلات الحملات
export const campaignAnalytics = pgTable("campaign_analytics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id),
  date: timestamp("date").notNull(),
  platform: text("platform").notNull(),
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  conversions: integer("conversions"),
  spend: text("spend").notNull(),
  revenue: text("revenue"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول حسابات التواصل الاجتماعي
export const socialMediaAccounts = pgTable("social_media_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  platform: text("platform").notNull(),
  accountName: text("account_name").notNull(),
  accountUrl: text("account_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول مفاتيح API
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  platform: text("platform").notNull(),
  keyType: text("key_type").notNull(),
  keyValue: text("key_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول معاملات المخزون
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  type: text("type").notNull(), // "in" or "out"
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(), // "sale", "return", "adjustment", "purchase"
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول فئات المصروفات
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  budgetAmount: text("budget_amount"),
  userId: integer("user_id").references(() => users.id),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول المصروفات
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  date: timestamp("date").notNull(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  userId: integer("user_id").references(() => users.id),
  isRecurring: boolean("is_recurring").default(false),
  recurringPeriod: text("recurring_period"), // "monthly", "weekly", "yearly"
  recurringDay: integer("recurring_day"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول الموردين
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  categories: jsonb("categories").default([]),
  balance: text("balance").default("0"),
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// جدول معاملات الموردين
export const supplierTransactions = pgTable("supplier_transactions", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // "payment", "refund", "advance", "other"
  amount: text("amount").notNull(),
  description: text("description"),
  status: text("status").notNull().default("completed"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول المواعيد
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // in minutes
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "cancelled", "no-show"
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// جدول تخزين الملفات
export const fileStorage = pgTable("file_storage", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  path: text("path").notNull(),
  userId: integer("user_id").references(() => users.id),
  entityType: text("entity_type"), // e.g., "product", "customer", "invoice"
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول الفواتير
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  date: timestamp("date").notNull(),
  dueDate: timestamp("due_date"),
  totalAmount: text("total_amount").notNull(),
  status: text("status").notNull().default("issued"), // "issued", "paid", "partial", "void"
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  printed: boolean("printed").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// جدول عناصر الفاتورة
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  amount: text("amount").notNull(),
  productId: integer("product_id").references(() => products.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول إعدادات المستخدم
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  themeName: text("theme_name").default("light"),
  fontName: text("font_name").default("system"),
  fontSize: text("font_size").default("medium"),
  appearance: text("appearance").default("auto"),
  colors: jsonb("colors").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// جدول التقارير المحفوظة
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "sales", "inventory", "expenses", "appointments"
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  filters: jsonb("filters").default({}),
  data: jsonb("data").notNull(),
  userId: integer("user_id").references(() => users.id),
  format: text("format").default("json"), // "json", "pdf", "excel"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول نشاطات النظام
export const systemActivities = pgTable("system_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  activityType: text("activity_type").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  action: text("action").notNull(),
  details: jsonb("details").default({}),
});

// مخططات الإدخال باستخدام Zod
export const insertUserSchema = createInsertSchema(users).extend({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
});

export const insertCategorySchema = createInsertSchema(categories).extend({
  name: z.string().min(2, "اسم الفئة يجب أن يكون حرفين على الأقل"),
});

export const insertProductSchema = createInsertSchema(products).extend({
  name: z.string().min(2, "اسم المنتج يجب أن يكون حرفين على الأقل"),
  sku: z.string().min(3, "رمز المنتج يجب أن يكون 3 أحرف على الأقل"),
  price: z.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
  cost: z.number().min(0, "التكلفة يجب أن تكون 0 أو أكثر"),
});

export const insertCustomerSchema = createInsertSchema(customers).extend({
  name: z.string().min(2, "اسم العميل يجب أن يكون حرفين على الأقل"),
  phone: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
});

export const insertSaleSchema = createInsertSchema(sales).extend({
  customerId: z.number().int().positive("يجب اختيار عميل"),
});

export const insertSaleItemSchema = createInsertSchema(saleItems).extend({
  quantity: z.number().int().positive("الكمية يجب أن تكون أكبر من 0"),
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);
export const insertExpenseSchema = createInsertSchema(expenses);
export const insertSupplierSchema = createInsertSchema(suppliers);
export const insertSupplierTransactionSchema = createInsertSchema(supplierTransactions);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertFileStorageSchema = createInsertSchema(fileStorage);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems);
export const insertUserSettingsSchema = createInsertSchema(userSettings);
export const insertReportSchema = createInsertSchema(reports);
export const insertApiKeySchema = createInsertSchema(apiKeys);
export const insertCampaignSchema = createInsertSchema(marketingCampaigns);
export const insertCampaignAnalyticsSchema = createInsertSchema(campaignAnalytics);
export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions);

// تصدير الأنواع
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;

export type ExchangeRate = typeof exchangeRates.$inferSelect;

export type Installment = typeof installments.$inferSelect;
export type InstallmentPayment = typeof installmentPayments.$inferSelect;

export type Campaign = typeof marketingCampaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignAnalytics = typeof campaignAnalytics.$inferSelect;
export type InsertCampaignAnalytics = z.infer<typeof insertCampaignAnalyticsSchema>;

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type SupplierTransaction = typeof supplierTransactions.$inferSelect;
export type InsertSupplierTransaction = z.infer<typeof insertSupplierTransactionSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type FileStorage = typeof fileStorage.$inferSelect;
export type InsertFileStorage = z.infer<typeof insertFileStorageSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type SystemActivity = typeof systemActivities.$inferSelect;

// Export the schema as a collective object for Drizzle
export const schema = {
  users,
  categories,
  products,
  customers,
  sales,
  saleItems,
  exchangeRates,
  installments,
  installmentPayments,
  marketingCampaigns,
  campaignAnalytics,
  socialMediaAccounts,
  apiKeys,
  inventoryTransactions,
  expenseCategories,
  expenses,
  suppliers,
  supplierTransactions,
  appointments,
  fileStorage,
  invoices,
  invoiceItems,
  userSettings,
  reports,
  systemActivities
};