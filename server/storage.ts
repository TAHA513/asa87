import { db, sql } from './db';
import * as schema from '../shared/schema';
import * as bcrypt from '@node-rs/bcrypt';
import { eq, and, gt, lt, desc, gte, lte, asc } from 'drizzle-orm';

// Implement storage methods
export const storage = {
  // User authentication methods
  async getUserByUsername(username: string) {
    try {
      const results = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, username));
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error getting user by username:", error);
      //More specific error handling could be added here, like checking for connection errors.
      throw new Error("Database error retrieving user."); 
    }
  },

  async getUser(id: number) {
    try {
      const results = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, id));
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error getting user by id:", error);
      //More specific error handling could be added here, like checking for connection errors.
      throw new Error("Database error retrieving user.");
    }
  },

  async createUser(userData) {
    try {
      const [user] = await db.insert(schema.users)
        .values(userData)
        .returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      //More specific error handling could be added here, like checking for unique constraint violations.
      throw new Error("Database error creating user.");
    }
  },

  // Fix the getProductSales method to use the correct column name
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
      // Return an empty array instead of throwing an error, to prevent the application from crashing.
      return [];
    }
  },

  // Make sure other methods are properly implemented...
  async getProducts() {
    try{
      return await db.select().from(schema.products);
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  },

  async getProduct(id: number) {
    try {
      const results = await db.select().from(schema.products).where(eq(schema.products.id, id));
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error getting product:", error);
      return null;
    }
  },

  async getInventoryAlerts() {
    try {
      return await db.select().from(schema.inventoryAlerts);
    } catch (error) {
      console.error("Error getting inventory alerts:", error);
      return [];
    }
  },

  async createAlertNotification(data: schema.InsertAlertNotification) {
    try {
      const result = await db.insert(schema.alertNotifications).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating alert notification:", error);
      throw new Error("Database error creating alert notification.");
    }
  },

  // Add other necessary methods...
};