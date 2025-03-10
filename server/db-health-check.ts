
import { db, sql } from './db';

// وظيفة لفحص حالة قاعدة البيانات
export async function checkDatabaseHealth() {
  try {
    // التحقق من اتصال قاعدة البيانات
    const result = await db.execute(sql`SELECT 1`);
    
    // التحقق من وجود الجداول الرئيسية
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // الجداول الأساسية التي يجب أن تكون موجودة
    const criticalTables = ['users', 'products', 'customers', 'sales'];
    
    // التحقق من وجود الجداول الأساسية
    const existingTables = tablesResult.rows.map((row: any) => row.table_name);
    const missingTables = criticalTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn(`تحذير: الجداول التالية غير موجودة في قاعدة البيانات: ${missingTables.join(', ')}`);
      return {
        status: 'warning',
        message: `الاتصال بقاعدة البيانات يعمل ولكن هناك جداول مفقودة: ${missingTables.join(', ')}`,
        missingTables
      };
    }
    
    // فحص أداء قاعدة البيانات عن طريق قياس وقت الاستجابة
    const startTime = Date.now();
    await db.execute(sql`SELECT * FROM users LIMIT 1`);
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      message: 'قاعدة البيانات تعمل بشكل طبيعي',
      responseTime: `${responseTime}ms`,
      tables: existingTables
    };
  } catch (error) {
    console.error('خطأ في فحص حالة قاعدة البيانات:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'خطأ غير معروف في قاعدة البيانات',
      error: error
    };
  }
}

// إضافة مسار لفحص حالة قاعدة البيانات
export function setupDatabaseHealthRoute(app: any) {
  app.get('/api/system/db-health', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }
    
    try {
      const health = await checkDatabaseHealth();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'خطأ في فحص حالة قاعدة البيانات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });
}
