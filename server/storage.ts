import { db, sql } from './db';
import * as schema from '../shared/schema';
import * as bcrypt from '@node-rs/bcrypt';
import { eq, and, gt, lt, desc, gte, lte, asc } from 'drizzle-orm';

// Implement storage methods
export const storage = {
  // Other methods...

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
      return [];
    }
  },

  // Make sure other methods are properly implemented...
  async getProducts() {
    return await db.select().from(schema.products);
  },

  async getProduct(id: number) {
    const results = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return results.length > 0 ? results[0] : null;
  },

  async getInventoryAlerts() {
    return await db.select().from(schema.inventoryAlerts);
  },

  async createAlertNotification(data: schema.InsertAlertNotification) {
    const result = await db.insert(schema.alertNotifications).values(data).returning();
    return result[0];
  },

  // Add other necessary methods...
};

// Remove duplicate import since the storage object is already defined above
export {
  storage
};