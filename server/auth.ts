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
  const salt = await bcrypt.genSalt(12); // زيادة قوة التشفير
  return bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev_secret_key",
    resave: true, // تم تغييره إلى true لضمان حفظ الجلسة
    saveUninitialized: true, // تم تغييره للتوافق مع بعض المتصفحات
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // prune expired entries every 24h
      stale: false // تجنب حذف الجلسات التي لا تزال مستخدمة
    }),
    cookie: {
      secure: false, // تعطيل secure للتطوير
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax', // تغيير إلى lax للتوافق مع التعامل مع الـ redirect
      path: '/'
    },
    name: 'sid',
    rolling: true // تحديث وقت انتهاء الصلاحية مع كل طلب
  };

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // تحسين أمان استراتيجية تسجيل الدخول
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`محاولة تسجيل دخول للمستخدم: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`المستخدم غير موجود: ${username}`);
          return done(null, false, { message: "اسم المستخدم غير موجود" });
        }

        if (!user.isActive) {
          console.log(`حساب غير نشط: ${username}`);
          return done(null, false, { message: "الحساب غير نشط" });
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          console.log(`كلمة مرور غير صحيحة للمستخدم: ${username}`);
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }

        // تحديث وقت آخر تسجيل دخول
        try {
          await storage.updateUser(user.id, {
            lastLoginAt: new Date()
          });
          console.log(`تم تسجيل دخول المستخدم بنجاح: ${username}`);
        } catch (updateErr) {
          console.error(`خطأ في تحديث وقت تسجيل الدخول: ${updateErr}`);
          // استمر حتى لو فشل تحديث وقت تسجيل الدخول
        }

        return done(null, user);
      } catch (err) {
        console.error(`خطأ غير متوقع في عملية المصادقة:`, err);
        return done(err);
      }
    })
  );

  passport.serializeUser((req: any, user: User, done: (err: any, id?: unknown) => void) => {
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
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({
            message: "فشل في تسجيل الدخول بعد إنشاء الحساب",
          });
        }
        // عدم إرجاع كلمة المرور في الاستجابة
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
      }
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log("طلب تسجيل دخول جديد:", req.body.username);
    
    // إعادة تعيين الجلسة القديمة لتجنب تسرب الجلسة
    req.session.regenerate((regErr) => {
      if (regErr) {
        console.error("خطأ في إعادة تعيين الجلسة:", regErr);
      }
      
      passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول", error: err.message });
        }

        if (!user) {
          console.log(`فشل تسجيل الدخول: ${info?.message || "سبب غير معروف"}`);
          return res.status(401).json({
            message: info?.message || "فشل تسجيل الدخول",
          });
        }

        // استخدام دالة محسنة للتسجيل
        req.login(user, { keepSessionInfo: false }, (loginErr) => {
          if (loginErr) {
            console.error("خطأ تسجيل دخول المستخدم:", loginErr);
            return res.status(500).json({
              message: "فشل في إنشاء جلسة المستخدم",
              error: loginErr.message
            });
          }
          
          // تخزين معلومات المستخدم الإضافية في الجلسة
          req.session.userId = user.id;
          req.session.loginTime = Date.now();
          
          // حفظ الجلسة بطريقة متزامنة
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("خطأ في حفظ الجلسة:", saveErr);
              return res.status(500).json({
                message: "فشل في حفظ جلسة المستخدم",
                error: saveErr.message
              });
            }
            
            console.log(`تم تسجيل دخول المستخدم بنجاح: ${user.username}, معرف الجلسة: ${req.sessionID}`);
            
            // عدم إرجاع كلمة المرور + إضافة معرف الجلسة للعميل
            const { password, ...userWithoutPassword } = user;
            res.json({
              ...userWithoutPassword,
              sessionId: req.sessionID,
              loginTime: req.session.loginTime
            });
          });
        });
      })(req, res, next);
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.sessionID;

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          message: "حدث خطأ أثناء تسجيل الخروج",
        });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
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
    // عدم إرجاع كلمة المرور في الاستجابة
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
}