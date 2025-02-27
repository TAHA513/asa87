import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, type User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev_secret_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict',
      path: '/'
    },
    name: 'sid'
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Attempting login for user:", username);
        const user = await storage.getUserByUsername(username);

        if (!user) {
          console.log("User not found:", username);
          return done(null, false, { message: "اسم المستخدم غير موجود" });
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          console.log("Invalid password for user:", username);
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }

        console.log("Login successful for user:", username);
        return done(null, user);
      } catch (err) {
        console.error("Login error:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log("User not found during deserialization:", id);
        return done(null, false);
      }
      console.log("User deserialized successfully:", id);
      done(null, user);
    } catch (err) {
      console.error("Deserialization error:", err);
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration attempt:", req.body.username);
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        console.log("Username already exists:", validatedData.username);
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      console.log("User registered successfully:", user.id);

      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({
            message: "فشل في تسجيل الدخول بعد إنشاء الحساب",
          });
        }
        res.status(201).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          permissions: user.permissions,
          preferences: user.preferences
        });
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
    console.log("Login attempt:", req.body.username);

    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
      }

      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.status(401).json({
          message: info?.message || "فشل تسجيل الدخول",
        });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.status(500).json({
            message: "فشل في إنشاء جلسة المستخدم",
          });
        }
        console.log("Login successful:", user.id);
        res.json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          permissions: user.permissions,
          preferences: user.preferences
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    console.log("Logout attempt for user:", req.user?.id);
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
        console.log("Logout successful");
        res.json({ success: true });
      });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized access attempt to /api/auth/user");
      return res.status(401).json({
        message: "يجب تسجيل الدخول أولاً",
      });
    }
    console.log("Current user data retrieved:", req.user?.id);
    res.json(req.user);
  });
}