import type { Express } from "express";
import { db } from "./db";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertProductSchema,
  insertSaleSchema,
  insertCategorySchema,
  insertCustomerSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express) {
  console.log("بدء تسجيل المسارات...");

  // نقطة نهاية الصحة
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // المنتجات
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("خطأ في جلب المنتجات:", error);
      res.status(500).json({ message: "فشل في جلب المنتجات" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      res.status(201).json(product);
    } catch (error) {
      console.error("خطأ في إنشاء المنتج:", error);
      res.status(500).json({ message: "فشل في إنشاء المنتج" });
    }
  });

  // المبيعات
  app.get("/api/sales", async (_req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      console.error("خطأ في جلب المبيعات:", error);
      res.status(500).json({ message: "فشل في جلب المبيعات" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const sale = await storage.createSale({
        ...req.body,
        createdAt: new Date()
      });
      res.status(201).json(sale);
    } catch (error) {
      console.error("خطأ في إنشاء عملية البيع:", error);
      res.status(500).json({ message: "فشل في إنشاء عملية البيع" });
    }
  });

  // العملاء
  app.get("/api/customers", async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("خطأ في جلب العملاء:", error);
      res.status(500).json({ message: "فشل في جلب العملاء" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await storage.createCustomer({
        ...req.body,
        createdAt: new Date()
      });
      res.status(201).json(customer);
    } catch (error) {
      console.error("خطأ في إنشاء العميل:", error);
      res.status(500).json({ message: "فشل في إنشاء العميل" });
    }
  });

  console.log("تم تسجيل المسارات بنجاح");
  return app;
}