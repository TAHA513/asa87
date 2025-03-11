import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import * as bcrypt from "@node-rs/bcrypt";
import { storage } from "./storage";
import { type User } from "@shared/schema";
import MemoryStore from "memorystore";
import jwt from 'jsonwebtoken'; // Added import for JWT

const MemoryStoreSession = MemoryStore(session);

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // تكوين إعدادات الجلسة
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000 // تنظيف الجلسات المنتهية كل 24 ساعة
  });

  // إعداد الجلسات
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
      sameSite: 'lax'
    }
  }));

  // تهيئة Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // إعداد استراتيجية تسجيل الدخول
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      console.log(`محاولة تسجيل دخول للمستخدم: ${username}`);

      // تحسين معالجة أخطاء قاعدة البيانات
      let user;
      try {
        user = await storage.getUserByUsername(username);
        console.log("نتيجة البحث عن المستخدم:", user ? "تم العثور على المستخدم" : "لم يتم العثور على المستخدم");
      } catch (dbError) {
        console.error("خطأ في قاعدة البيانات عند البحث عن المستخدم:", dbError);
        return done(null, false, { message: "حدث خطأ في قاعدة البيانات" });
      }

      if (!user) {
        console.log(`لم يتم العثور على المستخدم: ${username}`);
        return done(null, false, { message: "اسم المستخدم غير موجود" });
      }

      if (!user.isActive) {
        console.log(`حساب المستخدم غير نشط: ${username}`);
        return done(null, false, { message: "الحساب غير نشط" });
      }

      let isValidPassword = false;
      try {
        isValidPassword = await comparePasswords(password, user.password);
      } catch (passwordError) {
        console.error("خطأ في التحقق من كلمة المرور:", passwordError);
        return done(null, false, { message: "حدث خطأ أثناء التحقق من كلمة المرور" });
      }

      if (!isValidPassword) {
        console.log(`كلمة المرور غير صحيحة للمستخدم: ${username}`);
        return done(null, false, { message: "كلمة المرور غير صحيحة" });
      }

      console.log(`تم تسجيل دخول المستخدم بنجاح: ${username}`);
      return done(null, user);
    } catch (error) {
      console.error("خطأ في عملية المصادقة:", error);
      return done(null, false, { message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  }));

  // تسجيل وفك تشفير معرف المستخدم في الجلسة
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user || !user.isActive) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // نقاط النهاية للمصادقة
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      // محاولة الاتصال بقاعدة البيانات والتحقق من بيانات المستخدم
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const isPasswordValid = await comparePasswords(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // تحديث وقت آخر تسجيل دخول
      const updatedUser = {
        ...user,
        lastLoginAt: new Date()
      };

      // إذا كان req.session موجودًا
      if (req.session) {
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
      }

      // إنشاء رمز JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          role: user.role
        },
        process.env.SESSION_SECRET || "default-secret-key",
        { expiresIn: "7d" }
      );

      // إرسال البيانات باستثناء كلمة المرور
      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({
        message: "تم تسجيل الدخول بنجاح",
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("خطأ أثناء تسجيل الدخول:", error);
      // تحسين رسالة الخطأ لتكون أكثر وضوحًا
      return res.status(500).json({ 
        message: "حدث خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى لاحقًا.",
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        isActive: true,
        role: "staff"
      });

      req.login(user, (err) => {
        if (err) {
          console.error("خطأ في تسجيل الدخول بعد التسجيل:", err);
          return res.status(500).json({ message: "فشل في تسجيل الدخول بعد إنشاء الحساب" });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("خطأ في التسجيل:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("خطأ في تسجيل الخروج:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("خطأ في إنهاء الجلسة:", err);
          return res.status(500).json({ message: "حدث خطأ أثناء إنهاء الجلسة" });
        }

        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}