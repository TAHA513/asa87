
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function runMigrations() {
  console.log("بدء تهجير قاعدة البيانات...");
  
  try {
    // تحقق مما إذا كان عمود 'format' موجودًا في جدول 'reports'
    const checkFormatColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reports' AND column_name = 'format'
    `);
    
    if (checkFormatColumn.rows.length === 0) {
      console.log("إضافة عمود 'format' إلى جدول 'reports'...");
      await db.execute(sql`
        ALTER TABLE reports 
        ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'json' NOT NULL
      `);
      console.log("تم إضافة عمود 'format' بنجاح.");
    } else {
      console.log("عمود 'format' موجود بالفعل في جدول 'reports'.");
    }
    
    // إضافة المزيد من عمليات التهجير حسب الحاجة هنا
    
    console.log("تم إكمال تهجير قاعدة البيانات بنجاح.");
  } catch (error) {
    console.error("خطأ أثناء تهجير قاعدة البيانات:", error);
    throw new Error("فشل في تهجير قاعدة البيانات");
  }
}
