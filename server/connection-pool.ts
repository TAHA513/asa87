
import pg from 'pg';
const { Pool } = pg;
import { schema } from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// تتبع حالة الاتصال
interface ConnectionState {
  lastUsed: number;
  isHealthy: boolean;
  consecutiveErrors: number;
}

class EnhancedConnectionPool {
  private pool: Pool;
  private connectionStates: Map<string, ConnectionState> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectBackoff = 1000; // البدء بثانية واحدة
  private maxReconnectBackoff = 30000; // الحد الأقصى 30 ثانية
  private _isConnected = false;

  constructor() {
    // إنشاء مجموعة الاتصالات مع إعدادات مثالية
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      max: 10, // عدد أمثل من العملاء
      min: 1,
      idleTimeoutMillis: 60000,
      keepAlive: true,
      allowExitOnIdle: false,
      statement_timeout: 30000,
      query_timeout: 30000
    });

    // إعداد معالجات الأحداث
    this.setupEventHandlers();
    
    // بدء فحوصات الصحة
    this.startHealthChecks();
  }

  private setupEventHandlers() {
    // معالجة أخطاء مجموعة الاتصال
    this.pool.on('error', (err, client) => {
      console.error('خطأ غير متوقع في مجموعة قواعد البيانات:', err);
      
      // تحديد الاتصال كغير صحي
      if (client) {
        const clientId = (client as any).processID;
        if (clientId && this.connectionStates.has(clientId)) {
          const state = this.connectionStates.get(clientId)!;
          state.isHealthy = false;
          state.consecutiveErrors++;
        }
      }
    });
    
    // تتبع الاتصالات الجديدة
    this.pool.on('connect', (client) => {
      const clientId = (client as any).processID;
      if (clientId) {
        this.connectionStates.set(clientId, {
          lastUsed: Date.now(),
          isHealthy: true,
          consecutiveErrors: 0
        });
      }
    });
    
    // تتبع الاتصالات المزالة
    this.pool.on('remove', (client) => {
      const clientId = (client as any).processID;
      if (clientId) {
        this.connectionStates.delete(clientId);
      }
    });
  }

  private startHealthChecks() {
    // فحص صحة الاتصال كل 15 ثانية
    this.healthCheckInterval = setInterval(() => {
      this.checkPoolHealth();
    }, 15000);
  }

  private async checkPoolHealth() {
    try {
      // اختبار اتصال سريع
      await this.pool.query('SELECT 1');
      this._isConnected = true;
      this.reconnectBackoff = 1000; // إعادة تعيين التراجع عند النجاح
    } catch (err) {
      console.warn('فشل فحص صحة قاعدة البيانات:', err);
      this._isConnected = false;
      
      // إذا كنا غير متصلين، حاول إعادة الاتصال مع تراجع أسي
      setTimeout(() => {
        this.attemptReconnect();
      }, this.reconnectBackoff);
      
      // زيادة التراجع للمحاولة التالية
      this.reconnectBackoff = Math.min(this.reconnectBackoff * 2, this.maxReconnectBackoff);
    }
  }

  private async attemptReconnect() {
    try {
      // الحصول على عميل وتحريره فورًا كاختبار اتصال
      const client = await this.pool.connect();
      client.release();
      console.log('تم إعادة الاتصال بقاعدة البيانات بنجاح');
      this._isConnected = true;
    } catch (err) {
      console.error('فشلت محاولة إعادة الاتصال بقاعدة البيانات:', err);
    }
  }

  // تنفيذ الاستعلام مع إعادة المحاولات والتعامل مع الأخطاء
  async executeQuery(queryFn: Function): Promise<any> {
    const MAX_RETRIES = 3;
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        // تحديث وقت آخر استخدام لهذا الاتصال
        const result = await queryFn();
        return result;
      } catch (error: any) {
        retries++;
        
        // قد تكون هذه الأخطاء قابلة للاسترداد مع إعادة المحاولة
        if (
          error.code === '08006' ||   // انقطاع الاتصال
          error.code === '08001' ||   // غير قادر على الاتصال
          error.code === '08004' ||   // رفض الاتصال
          error.code === 'ECONNRESET' ||
          error.code === 'EPIPE'
        ) {
          console.log(`خطأ في اتصال قاعدة البيانات (${error.code})، محاولة إعادة ${retries}/${MAX_RETRIES}`);
          
          if (retries < MAX_RETRIES) {
            // الانتظار قبل إعادة المحاولة (تراجع أسي)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
            continue;
          }
        }
        
        // للأخطاء الأخرى أو إذا تجاوزنا عدد المحاولات
        throw error;
      }
    }
    
    throw new Error(`فشل بعد ${MAX_RETRIES} محاولات`);
  }

  // تنظيف الموارد
  async close() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    await this.pool.end();
  }

  // الحصول على المجموعة الأساسية
  getPool() {
    return this.pool;
  }

  // الحصول على مثيل drizzle
  getDrizzle() {
    return drizzle(this.pool, { schema });
  }

  // الحصول على حالة الاتصال
  getConnectionStatus() {
    return this._isConnected;
  }
}

// تصدير مثيل مفرد
export const connectionPool = new EnhancedConnectionPool();
export const db = connectionPool.getDrizzle();
export { sql };
export const executeQuery = (fn: Function) => connectionPool.executeQuery(fn);
