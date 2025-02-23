import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
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
});

export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  usdToIqd: decimal("usd_to_iqd", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;