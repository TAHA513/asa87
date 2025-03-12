
import { db } from "./db";
import { PostgresSessionStore } from "./auth";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

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
      const results = await db.select().from(schema.marketingCampaigns);
      return results;
    } catch (error) {
      console.error("Error in getCampaigns:", error);
      return [];
    }
  },

  async getProducts() {
    try {
      const results = await db.select().from(schema.products);
      return results;
    } catch (error) {
      console.error("Error in getProducts:", error);
      return [];
    }
  },

  async getCustomers() {
    try {
      const results = await db.select().from(schema.customers);
      return results;
    } catch (error) {
      console.error("Error in getCustomers:", error);
      return [];
    }
  },

  async getAppointments() {
    try {
      const results = await db.select().from(schema.appointments);
      return results;
    } catch (error) {
      console.error("Error in getAppointments:", error);
      return [];
    }
  },

  async getInvoices() {
    try {
      const results = await db.select().from(schema.invoices);
      return results;
    } catch (error) {
      console.error("Error in getInvoices:", error);
      return [];
    }
  },

  async getExpenses() {
    try {
      const results = await db.select().from(schema.expenses);
      return results;
    } catch (error) {
      console.error("Error in getExpenses:", error);
      return [];
    }
  },

  async getInventoryTransactions() {
    try {
      const results = await db.select().from(schema.inventoryTransactions);
      return results;
    } catch (error) {
      console.error("Error in getInventoryTransactions:", error);
      return [];
    }
  },

  async getSuppliers() {
    try {
      const results = await db.select().from(schema.suppliers);
      return results;
    } catch (error) {
      console.error("Error in getSuppliers:", error);
      return [];
    }
  },

  async getInventoryAlerts() {
    try {
      const results = await db.select().from(schema.inventoryAlerts);
      return results;
    } catch (error) {
      console.error("Error in getInventoryAlerts:", error);
      return [];
    }
  },

  sessionStore: new PostgresSessionStore({
    conObject: {
      connectionString: process.env.DATABASE_URL,
    }
  })
};
