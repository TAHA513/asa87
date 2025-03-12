import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import * as bcrypt from "@node-rs/bcrypt";
import { storage } from "./storage";
import { type User } from "@shared/schema";

// تحديث تعريف المستخدم في Express
declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  // تكوين إعدادات الجلسة
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
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

      const user = await storage.getUserByUsername(username);
      console.log("نتيجة البحث عن المستخدم:", user ? "تم العثور على المستخدم" : "لم يتم العثور على المستخدم");

      if (!user) {
        return done(null, false, { message: "اسم المستخدم غير موجود" });
      }

      if (!user.isActive) {
        return done(null, false, { message: "الحساب غير نشط" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: "كلمة المرور غير صحيحة" });
      }

      return done(null, user);
    } catch (error) {
      console.error("خطأ في عملية المصادقة:", error);
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    if (!user || typeof user.id !== 'number') {
      return done(new Error('معرف المستخدم مفقود أو غير صالح'));
    }
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
  app.post("/api/auth/register", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 12);
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

  app.post("/api/auth/login", (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
    }

    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
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