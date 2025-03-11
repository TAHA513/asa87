import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as bcrypt from "@node-rs/bcrypt";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { users } from "@shared/schema";
import { storage } from "./storage";
import { eq } from "drizzle-orm";

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  role: string;
  isActive: boolean;
  permissions: string[];
}

export async function setupAuth(app: express.Application) {
  try {
    // إعداد استراتيجية المصادقة المحلية
    passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          console.log(`محاولة تسجيل دخول للمستخدم: ${username}`);
          const user = await storage.getUser(username);

          if (!user) {
            console.log(`المستخدم غير موجود: ${username}`);
            return done(null, false, { message: "اسم المستخدم غير صحيح" });
          }

          if (!user.isActive) {
            console.log(`حساب غير نشط للمستخدم: ${username}`);
            return done(null, false, { message: "الحساب غير نشط" });
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            console.log(`كلمة مرور غير صحيحة للمستخدم: ${username}`);
            return done(null, false, { message: "كلمة المرور غير صحيحة" });
          }

          console.log(`تم التحقق بنجاح للمستخدم: ${username}`);
          return done(null, user);
        } catch (error) {
          console.error("خطأ في المصادقة:", error);
          return done(error);
        }
      })
    );

    // تسلسل وإلغاء تسلسل المستخدم
    passport.serializeUser((user: any, done) => {
      console.log(`تسلسل المستخدم بالمعرف: ${user.id}`);
      done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        console.log(`استرجاع بيانات المستخدم بالمعرف: ${id}`);
        const user = await storage.getUserById(id);
        if (!user) {
          console.log(`لم يتم العثور على مستخدم بالمعرف: ${id}`);
          return done(null, false);
        }
        done(null, user);
      } catch (error) {
        console.error("خطأ في استرجاع بيانات المستخدم:", error);
        done(error);
      }
    });

    // إعداد مخزن الجلسات
    const MemoryStore = createMemoryStore(session);
    const sessionStore = new MemoryStore({
      checkPeriod: 86400000 // تنظيف الجلسات المنتهية كل 24 ساعة
    });

    // إعداد الجلسات
    app.use(session({
      secret: process.env.SESSION_SECRET || 'HGtsdcMKdhZP4HX6WLMnK4TbdZQcP2Gm',
      resave: true, // حفظ الجلسة حتى لو لم تتغير
      saveUninitialized: false,
      store: sessionStore,
      rolling: true, // تجديد وقت انتهاء الصلاحية مع كل طلب
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
        sameSite: 'lax',
        httpOnly: true
      }
    }));

    // إعداد Passport.js
    app.use(passport.initialize());
    app.use(passport.session());

    // مسارات المصادقة
    app.post("/api/auth/login", (req, res, next) => {
      console.log("محاولة تسجيل الدخول...");

      passport.authenticate("local", (err, user, info) => {
        if (err) {
          console.error("خطأ في تسجيل الدخول:", err);
          return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
        }
        if (!user) {
          console.log("فشل تسجيل الدخول:", info?.message);
          return res.status(401).json({ message: info?.message || "فشل تسجيل الدخول" });
        }

        console.log("بدء جلسة تسجيل الدخول...");
        req.logIn(user, async (err) => {
          if (err) {
            console.error("خطأ في تسجيل الدخول بعد المصادقة:", err);
            return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
          }

          console.log("تسجيل الدخول ناجح، تحديث وقت آخر تسجيل دخول...");

          // تحديث وقت آخر تسجيل دخول
          try {
            await db.update(users)
              .set({ lastLoginAt: new Date() })
              .where(eq(users.id, user.id));

            console.log("تم تحديث وقت آخر تسجيل دخول بنجاح.");
          } catch (error) {
            console.error("خطأ في تحديث وقت آخر تسجيل دخول:", error);
            // نستمر حتى لو فشل تحديث وقت آخر تسجيل دخول
          }

          // إنشاء جلسة نشطة
          req.session.touch();

          // إرجاع بيانات المستخدم بدون كلمة المرور
          const { password, ...userWithoutPassword } = user;
          console.log("إرسال بيانات المستخدم للعميل.");
          return res.json(userWithoutPassword);
        });
      })(req, res, next);
    });

    app.post("/api/auth/logout", (req, res) => {
      console.log("طلب تسجيل الخروج...");
      req.logout((err) => {
        if (err) {
          console.error("خطأ في تسجيل الخروج:", err);
          return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
        }
        req.session.destroy((err) => {
          if (err) {
            console.error("خطأ في حذف الجلسة:", err);
            return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
          }
          res.clearCookie("connect.sid");
          console.log("تم تسجيل الخروج وحذف الجلسة بنجاح.");
          res.json({ message: "تم تسجيل الخروج بنجاح" });
        });
      });
    });

    app.get("/api/auth/user", (req, res) => {
      console.log("طلب بيانات المستخدم الحالي...");
      if (!req.isAuthenticated()) {
        console.log("طلب غير مصرح به - المستخدم غير مسجل الدخول.");
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      // تجديد الجلسة
      if (req.session) {
        req.session.touch();
      }

      const { password, ...userWithoutPassword } = req.user as User;
      console.log(`إرسال بيانات المستخدم: ${userWithoutPassword.username}`);
      res.json(userWithoutPassword);
    });

    // التحقق من المصادقة
    app.get("/api/auth/check", (req, res) => {
      console.log(`التحقق من حالة المصادقة: ${req.isAuthenticated()}`);
      // تجديد الجلسة
      if (req.isAuthenticated() && req.session) {
        req.session.touch();
      }
      res.json({ authenticated: req.isAuthenticated() });
    });

    // ميدلوير للتحقق من المصادقة
    app.use("/api/protected", (req, res, next) => {
      if (req.isAuthenticated()) {
        // تجديد الجلسة
        if (req.session) {
          req.session.touch();
        }
        return next();
      }
      res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذا المسار" });
    });

    // ميدلوير للتحقق من دور المستخدم
    const checkRole = (role: string) => {
      return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذا المسار" });
        }

        const user = req.user as User;
        if (user.role !== role && user.role !== "admin") {
          return res.status(403).json({ message: "ليس لديك صلاحية للوصول إلى هذا المسار" });
        }

        // تجديد الجلسة
        if (req.session) {
          req.session.touch();
        }

        next();
      };
    };

    // تصدير ميدلوير التحقق من الأدوار
    app.locals.checkRole = checkRole;

    console.log("✅ تم إعداد المصادقة بنجاح");
  } catch (error) {
    console.error("❌ فشل في إعداد المصادقة:", error);
    throw error;
  }
}