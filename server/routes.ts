import express from "express";
import http from "http";
import passport from "passport";
import { z } from "zod";
import { setupAuth } from "./auth";
import fs from "fs/promises";
import path from "path";
import { storage } from "./storage";

// وظيفة تسجيل جميع المسارات
export async function registerRoutes(app: express.Express) {
  const server = http.createServer(app);

  // تسجيل مسارات المصادقة
  setupAuth(app);
  
  // مسار الجلسة الحالية
  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user!;
      return res.json(userWithoutPassword);
    }
    return res.status(401).json({ message: "غير مصرح" });
  });

  app.post("/api/settings", async (req, res) => {
    // تم تعطيل حفظ إعدادات المظهر بناءً على طلب المستخدم
    res.status(200).json({ 
      success: false, 
      message: "تم تعطيل إعدادات المظهر" 
    });
  });

  // المسارات الأخرى يمكن إضافتها هنا

  return server;
}