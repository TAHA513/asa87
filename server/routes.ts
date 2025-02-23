import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertProductSchema, insertSaleSchema, insertExchangeRateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", async (req, res) => {
    const product = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  });

  // Sales
  app.get("/api/sales", async (_req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });

  app.post("/api/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const sale = await storage.createSale({
      ...req.body,
      userId: req.user!.id,
    });

    // Update product stock
    const product = await storage.getProduct(sale.productId);
    if (product) {
      await storage.updateProduct(product.id, {
        ...product,
        stock: product.stock - sale.quantity
      });
    }

    res.status(201).json(sale);
  });

  // Exchange Rates  
  app.get("/api/exchange-rate", async (_req, res) => {
    try {
      const rate = await storage.getCurrentExchangeRate();
      res.json(rate);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب سعر الصرف" });
    }
  });

  app.post("/api/exchange-rate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول لتحديث سعر الصرف" });
    }

    try {
      const rate = Number(req.body.usdToIqd);
      if (isNaN(rate) || rate <= 0) {
        return res.status(400).json({ message: "سعر الصرف يجب أن يكون رقماً موجباً" });
      }

      const updatedRate = await storage.setExchangeRate(rate);
      res.status(201).json(updatedRate);
    } catch (error) {
      res.status(500).json({ message: "فشل في تحديث سعر الصرف" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}