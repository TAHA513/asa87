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
      success: true, 
      message: "تم تعطيل إعدادات المظهر" 
    });
  });

  // مسار الحصول على إعدادات المظهر
  app.get("/api/settings", async (req, res) => {
    try {
      const themeFilePath = path.join(process.cwd(), "theme.json");
      let theme;
      
      try {
        const themeData = await fs.readFile(themeFilePath, 'utf8');
        theme = JSON.parse(themeData);
      } catch (error) {
        // إذا لم يتم العثور على الملف، إرجاع إعدادات افتراضية
        theme = {
          variant: "modern",
          appearance: "light",
          fontStyle: "cairo",
          fontSize: "medium",
          primary: "#4c7afa",
          radius: 0.5
        };
        
        // إنشاء ملف theme.json بالإعدادات الافتراضية
        await fs.writeFile(themeFilePath, JSON.stringify(theme, null, 2));
      }
      
      res.json(theme);
    } catch (error) {
      console.error("خطأ في قراءة إعدادات المظهر:", error);
      res.status(500).json({ message: "فشل في قراءة إعدادات المظهر" });
    }
  });

  // المسارات الأخرى يمكن إضافتها هنا

  return server;
}