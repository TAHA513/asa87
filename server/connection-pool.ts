
import pg from 'pg';
const { Pool } = pg;
import { schema } from '../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// Connection states tracking
interface ConnectionState {
  lastUsed: number;
  isHealthy: boolean;
  consecutiveErrors: number;
}

class EnhancedConnectionPool {
  private pool: Pool;
  private connectionStates: Map<string, ConnectionState> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectBackoff = 1000; // Start with 1 second
  private maxReconnectBackoff = 30000; // Max 30 seconds
  private _isConnected = false;

  constructor() {
    // Create the pool with optimal settings
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      max: 15, // Increased for better concurrency
      min: 2,
      idleTimeoutMillis: 60000,
      keepAlive: true,
      allowExitOnIdle: false,
      statement_timeout: 30000,
      query_timeout: 30000
    });

    // Set up event handlers
    this.setupEventHandlers();
    
    // Start health checks
    this.startHealthChecks();
  }

  private setupEventHandlers() {
    // Handle pool-level errors
    this.pool.on('error', (err, client) => {
      console.error('Unexpected database pool error:', err);
      
      // Mark connection as unhealthy
      if (client) {
        const clientId = (client as any).processID;
        if (clientId && this.connectionStates.has(clientId)) {
          const state = this.connectionStates.get(clientId)!;
          state.isHealthy = false;
          state.consecutiveErrors++;
        }
      }
    });
    
    // Track new connections
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
    
    // Track removed connections
    this.pool.on('remove', (client) => {
      const clientId = (client as any).processID;
      if (clientId) {
        this.connectionStates.delete(clientId);
      }
    });
  }

  private startHealthChecks() {
    // Check connection health every 15 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkPoolHealth();
    }, 15000);
  }

  private async checkPoolHealth() {
    try {
      // Quick connection test
      await this.pool.query('SELECT 1');
      this._isConnected = true;
      this.reconnectBackoff = 1000; // Reset backoff on success
    } catch (err) {
      console.warn('Database health check failed:', err);
      this._isConnected = false;
      
      // If we're disconnected, try to reconnect with exponential backoff
      setTimeout(() => {
        this.attemptReconnect();
      }, this.reconnectBackoff);
      
      // Increase backoff for next attempt
      this.reconnectBackoff = Math.min(this.reconnectBackoff * 2, this.maxReconnectBackoff);
    }
  }

  private async attemptReconnect() {
    try {
      // Get a client and release it immediately as a connection test
      const client = await this.pool.connect();
      client.release();
      console.log('Successfully reconnected to database');
      this._isConnected = true;
    } catch (err) {
      console.error('Database reconnection attempt failed:', err);
    }
  }

  // Execute query with retries and error handling
  async executeQuery(queryFn: Function): Promise<any> {
    const MAX_RETRIES = 3;
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        // Update last used time for this connection
        const result = await queryFn();
        return result;
      } catch (error: any) {
        retries++;
        
        // These errors might be recoverable with a retry
        if (
          error.code === '08006' ||   // connection terminated
          error.code === '08001' ||   // unable to connect
          error.code === '08004' ||   // rejected connection
          error.code === 'ECONNRESET' ||
          error.code === 'EPIPE'
        ) {
          console.log(`Database connection error (${error.code}), retry attempt ${retries}/${MAX_RETRIES}`);
          
          if (retries < MAX_RETRIES) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
            continue;
          }
        }
        
        // For other errors or if we've exceeded retries
        throw error;
      }
    }
    
    throw new Error(`Failed after ${MAX_RETRIES} attempts`);
  }

  // Clean up resources
  async close() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    await this.pool.end();
  }

  // Get the underlying pool
  getPool() {
    return this.pool;
  }

  // Get drizzle instance
  getDrizzle() {
    return drizzle(this.pool, { schema });
  }

  // Get connected status
  getConnectionStatus() {
    return this._isConnected;
  }
}

// Export a singleton instance
export const connectionPool = new EnhancedConnectionPool();
export const db = connectionPool.getDrizzle();
export { sql };
export const executeQuery = (fn: Function) => connectionPool.executeQuery(fn);
