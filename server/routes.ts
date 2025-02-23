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
    const rate = await storage.getCurrentExchangeRate();
    res.json(rate);
  });

  app.post("/api/exchange-rate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const rate = await storage.setExchangeRate(req.body.usdToIqd);
    res.status(201).json(rate);
  });

  const httpServer = createServer(app);
  return httpServer;
}
