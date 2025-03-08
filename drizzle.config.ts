import { defineConfig } from "drizzle-kit";

// تم نقل متغير DATABASE_URL إلى أداة Secrets
// يرجى التأكد من إضافة المتغير هناك

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
