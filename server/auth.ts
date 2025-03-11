import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import * as bcrypt from "@node-rs/bcrypt";
import { storage } from "./storage";
import { type User } from "@shared/schema";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // تكوين مخزن للجلسات مع تنظيف منتظم
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000 // تنظيف الجلسات المنتهية كل 24 ساعة
  });

  // إعداد الجلسات بشكل مبسط ومباشر
  app.use(session({
    secret: process.env.SESSION_SECRET || 'SAS-APP-SECRET-KEY-CHANGE-ME',
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  }));

  // تهيئة Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // إعداد استراتيجية تسجيل الدخول
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      console.log(`محاولة تسجيل دخول للمستخدم: ${username}`);

      // البحث عن المستخدم
      const user = await storage.getUserByUsername(username);

      if (!user) {
        console.log(`لم يتم العثور على المستخدم: ${username}`);
        return done(null, false, { message: "اسم المستخدم غير موجود" });
      }

      if (!user.isActive) {
        console.log(`حساب المستخدم غير نشط: ${username}`);
        return done(null, false, { message: "الحساب غير نشط" });
      }

      // التحقق من كلمة المرور
      const isValidPassword = await comparePasswords(password, user.password);

      if (!isValidPassword) {
        console.log(`كلمة المرور غير صحيحة للمستخدم: ${username}`);
        return done(null, false, { message: "كلمة المرور غير صحيحة" });
      }

      console.log(`تم تسجيل دخول المستخدم بنجاح: ${username}`);
      return done(null, user);
    } catch (error) {
      console.error("خطأ في عملية المصادقة:", error);
      return done(error);
    }
  }));

  // تخزين معرف المستخدم في الجلسة
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  // استرجاع بيانات المستخدم من المعرف
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
  app.post("/api/auth/login", (req, res, next) => {
    console.log("طلب تسجيل الدخول:", { username: req.body.username });

    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("خطأ في تسجيل الدخول:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
      }

      if (!user) {
        console.log("فشل تسجيل الدخول:", info?.message);
        return res.status(401).json({ message: info?.message || "فشل تسجيل الدخول" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("خطأ في إنشاء الجلسة:", loginErr);
          return res.status(500).json({ message: "فشل في إنشاء جلسة المستخدم" });
        }

        const { password, ...userWithoutPassword } = user;
        console.log("تم تسجيل الدخول بنجاح:", userWithoutPassword.username);
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
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