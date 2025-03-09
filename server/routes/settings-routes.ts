
import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// جلب إعدادات المظهر للمستخدم
router.get('/theme', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;
    const settings = await storage.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({ message: "لم يتم العثور على إعدادات للمستخدم" });
    }

    res.json(settings);
  } catch (error) {
    console.error("خطأ في جلب إعدادات المظهر:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب إعدادات المظهر" });
  }
});

// حفظ إعدادات المظهر للمستخدم
router.post('/theme', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }

    const userId = req.body.userId || req.user!.id;
    
    const settings = {
      userId,
      themeName: req.body.themeName,
      fontName: req.body.fontName,
      fontSize: req.body.fontSize,
      appearance: req.body.appearance,
      colors: req.body.colors
    };

    const savedSettings = await storage.saveUserSettings(userId, settings);
    
    res.json(savedSettings);
  } catch (error) {
    console.error("خطأ في حفظ إعدادات المظهر:", error);
    res.status(500).json({ message: "حدث خطأ أثناء حفظ إعدادات المظهر" });
  }
});

export default router;
