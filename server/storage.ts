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
      const results = await db.select().from(schema.sales);
      return results;
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

  async getStoreSettings() {
    try {
      // تحقق من وجود الجدول
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'store_settings'
        );
      `);
      
      if (!tableExists.rows?.[0]?.exists) {
        return null;
      }
      
      const results = await db.execute(sql`SELECT * FROM store_settings LIMIT 1`);
      return results.rows?.[0] || null;
    } catch (error) {
      console.error("Error getting store settings:", error);
      return null;
    }
  },

  async saveStoreSettings(settings: any) {
    try {
      // تحقق من وجود الجدول
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'store_settings'
        );
      `);
      
      if (!tableExists.rows?.[0]?.exists) {
        // إنشاء الجدول إذا لم يكن موجودًا
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS store_settings (
            id SERIAL PRIMARY KEY,
            store_name VARCHAR(255) NOT NULL,
            store_address TEXT,
            store_phone VARCHAR(255),
            store_email VARCHAR(255),
            store_logo TEXT,
            invoice_footer TEXT,
            tax_rate NUMERIC(5,2),
            currency VARCHAR(10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
      
      // تحقق إذا كان هناك إعدادات موجودة بالفعل
      const existingSettings = await db.execute(sql`SELECT id FROM store_settings LIMIT 1`);
      
      if (existingSettings.rows?.length) {
        // تحديث الإعدادات الحالية
        await db.execute(sql`
          UPDATE store_settings SET
            store_name = ${settings.storeName || ''},
            store_address = ${settings.storeAddress || ''},
            store_phone = ${settings.storePhone || ''},
            store_email = ${settings.storeEmail || ''},
            store_logo = ${settings.storeLogo || ''},
            invoice_footer = ${settings.invoiceFooter || ''},
            tax_rate = ${settings.taxRate || 0},
            currency = ${settings.currency || 'ر.س'},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existingSettings.rows[0].id}
        `);
        return { ...settings, id: existingSettings.rows[0].id };
      } else {
        // إنشاء إعدادات جديدة
        const result = await db.execute(sql`
          INSERT INTO store_settings (
            store_name, store_address, store_phone, store_email,
            store_logo, invoice_footer, tax_rate, currency
          ) VALUES (
            ${settings.storeName || ''},
            ${settings.storeAddress || ''},
            ${settings.storePhone || ''},
            ${settings.storeEmail || ''},
            ${settings.storeLogo || ''},
            ${settings.invoiceFooter || ''},
            ${settings.taxRate || 0},
            ${settings.currency || 'ر.س'}
          ) RETURNING id
        `);
        return { ...settings, id: result.rows?.[0]?.id };
      }
    } catch (error) {
      console.error("Error saving store settings:", error);
      throw new Error("فشل في حفظ إعدادات المتجر");
    }
  },
};