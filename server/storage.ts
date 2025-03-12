import { db, sql } from './db';
import * as schema from '../shared/schema';
import * as bcrypt from '@node-rs/bcrypt';
import { eq, and, gt, lt, desc, gte, lte, asc } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';

const PostgresSessionStore = connectPg(session);

// Implement storage methods
export const storage = {
  async getSales() {
    try {
      return await db.select().from(schema.sales);
    } catch (error) {
      console.error("Error in getSales:", error);
      return [];
    }
  },

  async getInstallments() {
    try {
      const results = await db.select().from(schema.installments);
      return results;
    } catch (error) {
      console.error("Error in getInstallments:", error);
      return [];
    }
  },

  async getCampaigns() {
    try {
      const results = await db.select().from(schema.campaigns);
      return results;
    } catch (error) {
      console.error("Error in getCampaigns:", error);
      return [];
    }
  },
  sessionStore: new PostgresSessionStore({
    conObject: {
      connectionString: process.env.DATABASE_URL,
    },
    createTableIfMissing: true,
  }),

  // User related methods
  async getUser(id: number) {
    try {
      const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, id));
      return users[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  },

  async getUserByUsername(username: string) {
    try {
      const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, username));
      return users[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  },

  async createUser(user: schema.InsertUser) {
    try {
      const [newUser] = await db.insert(schema.users)
        .values(user)
        .returning();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  },

  // Product related methods
  async getProducts() {
    return await db.select().from(schema.products);
  },

  async getProduct(id: number) {
    const results = await db.select()
      .from(schema.products)
      .where(eq(schema.products.id, id));
    return results[0];
  },

  async getProductSales(productId: number, since: Date) {
    try {
      const sales = await db.select()
        .from(schema.sales)
        .where(and(
          eq(schema.sales.productId, productId),
          gte(schema.sales.date, since)
        ));
      return sales;
    } catch (error) {
      console.error("Error getting product sales:", error);
      return [];
    }
  },

  async getInventoryAlerts() {
    return await db.select().from(schema.inventoryAlerts);
  },

  async createAlertNotification(data: schema.InsertAlertNotification) {
    const result = await db.insert(schema.alertNotifications)
      .values(data)
      .returning();
    return result[0];
  },
};