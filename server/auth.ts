import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, type User } from "@shared/schema";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  // تكوين الجلسات بشكل آمن
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // تنظيف الجلسات منتهية الصلاحية كل 24 ساعة
      ttl: 24 * 60 * 60 * 1000 // مدة صلاحية الجلسة 24 ساعة
    }),
    name: 'sid', // تغيير اسم ملف تعريف الارتباط الافتراضي
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    }
  };

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // تحسين استراتيجية تسجيل الدخول
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "اسم المستخدم غير موجود" });
        }

        if (!user.isActive) {
          return done(null, false, { message: "الحساب غير نشط" });
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }

        // تحديث وقت آخر تسجيل دخول
        await storage.updateUser(user.id, {
          ...user,
          lastLoginAt: new Date()
        });

        return done(null, user);
      } catch (err) {
        console.error("خطأ في عملية تسجيل الدخول:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      if (!user.isActive) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      console.error("خطأ في استعادة بيانات المستخدم:", err);
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        isActive: true,
        lastLoginAt: new Date()
      });

      req.login(user, (err) => {
        if (err) {
          console.error("خطأ في تسجيل الدخول بعد التسجيل:", err);
          return res.status(500).json({
            message: "فشل في تسجيل الدخول بعد إنشاء الحساب",
          });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("خطأ في التسجيل:", err);
      if (err instanceof Error) {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
      }
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("خطأ في تسجيل الدخول:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
      }

      if (!user) {
        return res.status(401).json({
          message: info?.message || "فشل تسجيل الدخول",
        });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("خطأ في إنشاء الجلسة:", err);
          return res.status(500).json({
            message: "فشل في إنشاء جلسة المستخدم",
          });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionID = req.sessionID;
    console.log(`تسجيل خروج المستخدم للجلسة: ${sessionID}`);

    req.logout((err) => {
      if (err) {
        console.error("خطأ في تسجيل الخروج:", err);
        return res.status(500).json({
          message: "حدث خطأ أثناء تسجيل الخروج",
        });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("خطأ في إنهاء الجلسة:", err);
          return res.status(500).json({
            message: "حدث خطأ أثناء إنهاء الجلسة",
          });
        }

        res.clearCookie('sid');
        res.json({ success: true });
      });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "يجب تسجيل الدخول أولاً",
      });
    }
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}