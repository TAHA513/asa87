import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
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
  priceUsd: decimal("price_usd").notNull(),
  priceIqd: decimal("price_iqd").notNull(),
  stock: integer("stock").notNull().default(0),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceUsd: decimal("price_usd").notNull(),
  priceIqd: decimal("price_iqd").notNull(),
  currency: text("currency").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  usdToIqd: decimal("usd_to_iqd").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  priceUsd: true,
  priceIqd: true,
  stock: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  productId: true,
  quantity: true,
  priceUsd: true,
  priceIqd: true,
  currency: true,
  userId: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).pick({
  usdToIqd: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
