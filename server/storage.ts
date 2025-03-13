import { neon } from '@neondatabase/serverless';
import { config } from './config';
import * as schema from '../shared/schema';
import * as bcrypt from '@node-rs/bcrypt';
import { eq, and, gt, lt, desc, gte, lte, asc, like, or } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';

// Clean the database URL by removing any quotes
const dbUrl = (config.database.url || '').replace(/['"]/g, '').trim();

// Initialize database connection
const db = neon(dbUrl);

const PostgresSessionStore = connectPg(session);

const sessionStore = new PostgresSessionStore({
  conObject: {
    connectionString: dbUrl,
  },
  createTableIfMissing: true,
});

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

  async getSale(id: number) {
    try {
      const results = await db.select()
        .from(schema.sales)
        .where(eq(schema.sales.id, id));
      return results[0];
    } catch (error) {
      console.error("Error in getSale:", error);
      return undefined;
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

  async getInstallment(id: number) {
    try {
      const results = await db.select()
        .from(schema.installments)
        .where(eq(schema.installments.id, id));
      return results[0];
    } catch (error) {
      console.error("Error in getInstallment:", error);
      return undefined;
    }
  },

  async getInstallmentPayments(installmentId: number) {
    try {
      const results = await db.select()
        .from(schema.installmentPayments)
        .where(eq(schema.installmentPayments.installmentId, installmentId));
      return results;
    } catch (error) {
      console.error("Error in getInstallmentPayments:", error);
      return [];
    }
  },

  async getCurrentExchangeRate() {
    try {
      const results = await db.select()
        .from(schema.exchangeRates)
        .orderBy(desc(schema.exchangeRates.date))
        .limit(1);
      return results[0] || { usdToIqd: 1460, date: new Date() };
    } catch (error) {
      console.error("Error in getCurrentExchangeRate:", error);
      // تأكد من إرجاع القيم الافتراضية بالشكل الصحيح
      return { id: 0, usdToIqd: 1460, date: new Date() };
    }
  },

  async setExchangeRate(rate: number) {
    try {
      const [result] = await db.insert(schema.exchangeRates)
        .values({ usdToIqd: rate, date: new Date() })
        .returning();
      return result;
    } catch (error) {
      console.error("Error setting exchange rate:", error);
      throw new Error("فشل في تحديث سعر الصرف");
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

  async getCampaign(id: number) {
    try {
      const results = await db.select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, id));
      return results[0];
    } catch (error) {
      console.error("Error in getCampaign:", error);
      return undefined;
    }
  },

  async createCampaign(campaign: any) {
    try {
      const [result] = await db.insert(schema.campaigns)
        .values(campaign)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw new Error("فشل في إنشاء الحملة");
    }
  },

  async getCampaignAnalytics(campaignId: number) {
    try {
      const results = await db.select()
        .from(schema.campaignAnalytics)
        .where(eq(schema.campaignAnalytics.campaignId, campaignId));
      return results;
    } catch (error) {
      console.error("Error in getCampaignAnalytics:", error);
      return [];
    }
  },

  async createCampaignAnalytics(analytics: any) {
    try {
      const [result] = await db.insert(schema.campaignAnalytics)
        .values(analytics)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating campaign analytics:", error);
      throw new Error("فشل في إنشاء تحليلات الحملة");
    }
  },
  
  sessionStore,

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
    try {
      return await db.select().from(schema.products);
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  },

  async getProduct(id: number) {
    try {
      const results = await db.select()
        .from(schema.products)
        .where(eq(schema.products.id, id));
      return results[0];
    } catch (error) {
      console.error("Error getting product:", error);
      return undefined;
    }
  },

  async createProduct(product: any) {
    try {
      const [result] = await db.insert(schema.products)
        .values(product)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("فشل في إنشاء المنتج");
    }
  },

  async updateProduct(id: number, product: any) {
    try {
      const [result] = await db.update(schema.products)
        .set(product)
        .where(eq(schema.products.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("فشل في تحديث المنتج");
    }
  },

  async deleteProduct(id: number) {
    try {
      await db.delete(schema.products)
        .where(eq(schema.products.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("فشل في حذف المنتج");
    }
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

  // Customer methods
  async getCustomers() {
    try {
      // التعامل مع الاستعلام بشكل آمن
      const customers = await db.select().from(schema.customers);
      return customers || [];
    } catch (error) {
      console.error("Error getting customers:", error);
      // التأكد من إرجاع مصفوفة فارغة دائماً في حالة الخطأ
      return [];
    }
  },

  async searchCustomers(search?: string) {
    try {
      if (!search) {
        return await db.select().from(schema.customers);
      }
      
      return await db.select()
        .from(schema.customers)
        .where(
          or(
            like(schema.customers.name, `%${search}%`),
            like(schema.customers.phone, `%${search}%`),
            like(schema.customers.email, `%${search}%`)
          )
        );
    } catch (error) {
      console.error("Error searching customers:", error);
      return [];
    }
  },

  async getCustomer(id: number) {
    try {
      const results = await db.select()
        .from(schema.customers)
        .where(eq(schema.customers.id, id));
      return results[0];
    } catch (error) {
      console.error("Error getting customer:", error);
      return undefined;
    }
  },

  async createCustomer(customer: any) {
    try {
      const [result] = await db.insert(schema.customers)
        .values(customer)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("فشل في إنشاء العميل");
    }
  },

  async deleteCustomer(id: number) {
    try {
      await db.delete(schema.customers)
        .where(eq(schema.customers.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw new Error("فشل في حذف العميل");
    }
  },

  async getCustomerSales(customerId: number) {
    try {
      return await db.select()
        .from(schema.sales)
        .where(eq(schema.sales.customerId, customerId));
    } catch (error) {
      console.error("Error getting customer sales:", error);
      return [];
    }
  },

  // Appointment methods
  async getAppointments() {
    try {
      // التعامل مع الاستعلام بشكل آمن
      const appointments = await db.select().from(schema.appointments);
      return appointments || [];
    } catch (error) {
      console.error("Error getting appointments:", error);
      // تفاصيل أكثر عن الخطأ لتسهيل التشخيص
      console.error("Original error details:", error instanceof Error ? error.message : String(error));
      return [];
    }
  },

  async getAppointment(id: number) {
    try {
      const results = await db.select()
        .from(schema.appointments)
        .where(eq(schema.appointments.id, id));
      return results[0];
    } catch (error) {
      console.error("Error getting appointment:", error);
      return undefined;
    }
  },

  async getCustomerAppointments(customerId: number) {
    try {
      return await db.select()
        .from(schema.appointments)
        .where(eq(schema.appointments.customerId, customerId));
    } catch (error) {
      console.error("Error getting customer appointments:", error);
      return [];
    }
  },

  async createAppointment(appointment: any) {
    try {
      const [result] = await db.insert(schema.appointments)
        .values(appointment)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw new Error("فشل في إنشاء الموعد");
    }
  },

  async updateAppointment(id: number, appointment: any) {
    try {
      const [result] = await db.update(schema.appointments)
        .set(appointment)
        .where(eq(schema.appointments.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw new Error("فشل في تحديث الموعد");
    }
  },

  async deleteAppointment(id: number) {
    try {
      await db.delete(schema.appointments)
        .where(eq(schema.appointments.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw new Error("فشل في حذف الموعد");
    }
  },

  // Activity logging methods
  async logSystemActivity(activity: any) {
    try {
      const [result] = await db.insert(schema.systemActivity)
        .values(activity)
        .returning();
      return result;
    } catch (error) {
      console.error("Error logging system activity:", error);
      // Don't throw here, just log the error
      return null;
    }
  },

  async getAppointmentActivities(appointmentId: number) {
    try {
      return await db.select()
        .from(schema.systemActivity)
        .where(and(
          eq(schema.systemActivity.entityType, 'appointments'),
          eq(schema.systemActivity.entityId, appointmentId)
        ))
        .orderBy(desc(schema.systemActivity.createdAt));
    } catch (error) {
      console.error("Error getting appointment activities:", error);
      return [];
    }
  },

  async getSystemActivities(filters: any = {}) {
    try {
      let query = db.select().from(schema.systemActivity);
      
      if (filters.entityType) {
        query = query.where(eq(schema.systemActivity.entityType, filters.entityType));
      }
      
      if (filters.entityId) {
        query = query.where(eq(schema.systemActivity.entityId, filters.entityId));
      }
      
      return await query.orderBy(desc(schema.systemActivity.createdAt));
    } catch (error) {
      console.error("Error getting system activities:", error);
      return [];
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

  async createInventoryAlert(alert: any) {
    try {
      const [result] = await db.insert(schema.inventoryAlerts)
        .values(alert)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating inventory alert:", error);
      throw new Error("فشل في إنشاء تنبيه المخزون");
    }
  },

  async updateInventoryAlert(id: number, alert: any) {
    try {
      const [result] = await db.update(schema.inventoryAlerts)
        .set(alert)
        .where(eq(schema.inventoryAlerts.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error updating inventory alert:", error);
      throw new Error("فشل في تحديث تنبيه المخزون");
    }
  },

  async deleteInventoryAlert(id: number) {
    try {
      await db.delete(schema.inventoryAlerts)
        .where(eq(schema.inventoryAlerts.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting inventory alert:", error);
      throw new Error("فشل في حذف تنبيه المخزون");
    }
  },

  async getAlertNotifications() {
    try {
      return await db.select().from(schema.alertNotifications)
        .orderBy(desc(schema.alertNotifications.createdAt));
    } catch (error) {
      console.error("Error getting alert notifications:", error);
      return [];
    }
  },

  async markNotificationAsRead(id: number) {
    try {
      const [result] = await db.update(schema.alertNotifications)
        .set({ isRead: true })
        .where(eq(schema.alertNotifications.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("فشل في تحديث حالة الإشعار");
    }
  },

  async createAlertNotification(data: schema.InsertAlertNotification) {
    try {
      const result = await db.insert(schema.alertNotifications)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating alert notification:", error);
      throw new Error("فشل في إنشاء إشعار");
    }
  },
};