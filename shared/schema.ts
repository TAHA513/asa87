import { pgTable, text, serial, timestamp, boolean, decimal, integer, varchar } from "drizzle-orm/pg-core";
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
  categoryId: integer("category_id").references(() => categories.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
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
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  finalTotal: decimal("final_total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// جدول تفاصيل المبيعات
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  total: z.number().min(0, "المجموع يجب أن يكون 0 أو أكثر"),
  discount: z.number().min(0, "الخصم يجب أن يكون 0 أو أكثر"),
  finalTotal: z.number().min(0, "المجموع النهائي يجب أن يكون 0 أو أكثر"),
});

export const insertSaleItemSchema = createInsertSchema(saleItems).extend({
  quantity: z.number().int().positive("الكمية يجب أن تكون أكبر من 0"),
  price: z.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
  total: z.number().min(0, "المجموع يجب أن يكون 0 أو أكثر"),
});

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

// Export the schema as a collective object for Drizzle
export const schema = {
  users,
  categories,
  products,
  customers,
  sales,
  saleItems,
};