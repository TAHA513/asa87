import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

export class DatabaseStorage {
  // سيتم استخدام هذا المخزن فقط للبيانات الجديدة
  async saveNewUser(user: any) {
    const [savedUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return savedUser;
  }

  // يمكن إضافة المزيد من الدوال لحفظ البيانات الجديدة حسب الحاجة
}

export const dbStorage = new DatabaseStorage();
