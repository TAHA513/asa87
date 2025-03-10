import pg from 'pg';
const { Pool } = pg;
import { schema } from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

interface ConnectionState {
  lastUsed: number;
  isHealthy: boolean;
  consecutiveErrors: number;
}

class EnhancedConnectionPool {
  private pool: pg.Pool;
  private connectionStates: Map<string, ConnectionState> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectBackoff = 1000;
  private maxReconnectBackoff = 30000;
  private _isConnected = false;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      max: 10,
      min: 1,
      idleTimeoutMillis: 60000,
      keepAlive: true,
      allowExitOnIdle: false,
      statement_timeout: 30000,
      query_timeout: 30000
    });

    this.setupEventHandlers();
    this.startHealthChecks();
  }

  private setupEventHandlers() {
    this.pool.on('error', (err: Error, client: pg.PoolClient) => {
      console.error('خطأ غير متوقع في مجموعة قواعد البيانات:', err);

      if (client) {
        const clientId = (client as any).processID;
        if (clientId && this.connectionStates.has(clientId)) {
          const state = this.connectionStates.get(clientId)!;
          state.isHealthy = false;
          state.consecutiveErrors++;
        }
      }
    });

    this.pool.on('connect', (client: pg.PoolClient) => {
      const clientId = (client as any).processID;
      if (clientId) {
        this.connectionStates.set(clientId, {
          lastUsed: Date.now(),
          isHealthy: true,
          consecutiveErrors: 0
        });
      }
    });

    this.pool.on('remove', (client: pg.PoolClient) => {
      const clientId = (client as any).processID;
      if (clientId) {
        this.connectionStates.delete(clientId);
      }
    });
  }

  private startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.checkPoolHealth();
    }, 15000);
  }

  private async checkPoolHealth() {
    try {
      await this.pool.query('SELECT 1');
      this._isConnected = true;
      this.reconnectBackoff = 1000;
    } catch (err) {
      console.warn('فشل فحص صحة قاعدة البيانات:', err);
      this._isConnected = false;

      setTimeout(() => {
        this.attemptReconnect();
      }, this.reconnectBackoff);

      this.reconnectBackoff = Math.min(this.reconnectBackoff * 2, this.maxReconnectBackoff);
    }
  }

  private async attemptReconnect() {
    try {
      const client = await this.pool.connect();
      client.release();
      console.log('تم إعادة الاتصال بقاعدة البيانات بنجاح');
      this._isConnected = true;
    } catch (err) {
      console.error('فشلت محاولة إعادة الاتصال بقاعدة البيانات:', err);
    }
  }

  async executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const result = await queryFn();
        return result;
      } catch (error: any) {
        retries++;

        if (
          error.code === '08006' ||
          error.code === '08001' ||
          error.code === '08004' ||
          error.code === 'ECONNRESET' ||
          error.code === 'EPIPE'
        ) {
          console.log(`خطأ في اتصال قاعدة البيانات (${error.code})، محاولة إعادة ${retries}/${MAX_RETRIES}`);

          if (retries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
            continue;
          }
        }

        throw error;
      }
    }

    throw new Error(`فشل بعد ${MAX_RETRIES} محاولات`);
  }

  async close() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    await this.pool.end();
  }

  getPool(): pg.Pool {
    return this.pool;
  }

  getDrizzle() {
    return drizzle(this.pool, { schema });
  }

  getConnectionStatus(): boolean {
    return this._isConnected;
  }
}

export const connectionPool = new EnhancedConnectionPool();
export const db = connectionPool.getDrizzle();
export { sql };
export const executeQuery = <T>(fn: () => Promise<T>) => connectionPool.executeQuery(fn);