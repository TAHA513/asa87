import { db } from "./db";
import { eq } from "drizzle-orm";
import { apiKeys } from "@shared/schema";
import type { ApiKey } from "@shared/schema";

export class DatabaseStorage {
  // ... other methods ...

  async setApiKeys(userId: number, keys: Record<string, any>): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Delete existing keys
        await tx
          .delete(apiKeys)
          .where(eq(apiKeys.userId, userId));

        // Insert new keys
        const keyEntries = Object.entries(keys).map(([platform, value]) => ({
          userId,
          platform,
          keyType: 'api',
          keyValue: JSON.stringify(value),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        if (keyEntries.length > 0) {
          await tx.insert(apiKeys).values(keyEntries);
        }
      });

      console.log("Successfully stored API keys for user:", userId);
    } catch (error) {
      console.error("خطأ في حفظ مفاتيح API:", error);
      throw error;
    }
  }

  async getApiKeys(userId: number): Promise<Record<string, any> | null> {
    try {
      const userKeys = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.userId, userId));

      if (userKeys.length === 0) return null;

      const result = userKeys.reduce((acc, key) => ({
        ...acc,
        [key.platform]: JSON.parse(key.keyValue)
      }), {});

      console.log("Retrieved API keys for user:", userId);
      return result;
    } catch (error) {
      console.error("خطأ في جلب مفاتيح API:", error);
      return null;
    }
  }
}

export const dbStorage = new DatabaseStorage();