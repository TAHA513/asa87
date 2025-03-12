
import { defineConfig } from "drizzle-kit";

// تم نقل متغير DATABASE_URL إلى أداة Secrets في Replit
// يرجى التأكد من إضافة المتغير هناك:
// 1. انتقل إلى قائمة Tools
// 2. اختر Secrets
// 3. أضف متغير DATABASE_URL مع رابط قاعدة البيانات الخاص بك
// 4. أضف متغير SESSION_SECRET مع مفتاح آمن

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
