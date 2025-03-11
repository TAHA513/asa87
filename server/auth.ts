
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import type { User } from '../shared/schema.js';

// تصدير الوظيفة الأساسية التي تقوم بإعداد المصادقة
export default function setupAuth(app: express.Application) {
  // إعداد passport
  app.use(passport.initialize());
  app.use(passport.session());

  // تكوين استراتيجية المصادقة المحلية
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // البحث عن المستخدم بواسطة البريد الإلكتروني
          const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

          // التحقق من وجود المستخدم
          if (!user) {
            return done(null, false, { message: 'البريد الإلكتروني غير مسجل' });
          }

          // التحقق من كلمة المرور
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return done(null, false, { message: 'كلمة المرور غير صحيحة' });
          }

          // إرجاع المستخدم في حالة نجاح المصادقة
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // تسجيل معلومات المستخدم في الجلسة
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // استرجاع معلومات المستخدم من الجلسة
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // تسجيل الدخول
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: Error, user: User, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // إخفاء كلمة المرور قبل إرسال البيانات للعميل
        const { password, ...userWithoutPassword } = user;
        return res.json({
          message: 'تم تسجيل الدخول بنجاح',
          user: userWithoutPassword,
        });
      });
    })(req, res, next);
  });

  // تسجيل الخروج
  app.post("/api/auth/logout", (req, res) => {
    req.logout(err => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          message: "فشل في تسجيل الخروج",
        });
      }

      // تدمير الجلسة بشكل كامل
      req.session.destroy(err => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({
            message: "فشل في إنهاء الجلسة",
          });
        }

        // مسح ملفات تعريف الارتباط
        res.clearCookie('app.session');
        res.json({ message: "تم تسجيل الخروج بنجاح" });
      });
    });
  });

  // إضافة نقطة نهاية للتحقق من حالة الجلسة
  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      // عدم إرجاع كلمة المرور
      const { password, ...userInfo } = req.user as User;
      res.json({
        authenticated: true,
        user: userInfo
      });
    } else {
      res.json({
        authenticated: false
      });
    }
  });
}
