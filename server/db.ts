import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;
// Remove the unsupported patchWebsocketDanglingTimeout config
// Add proper connection retry logic instead

// Validate database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// استخدام متغير لتتبع حالة الاتصال
let isPoolEnded = false;

// Create connection pool with proper error handling and retry logic
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5 second timeout
  max: 20, // Maximum 20 clients in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  keepAlive: true, // Keep connections alive
  allowExitOnIdle: false // Prevent pool from ending when idle
});

// Wrap the pool object to prevent using it after it's been ended
const safePool = {
  query: async (...args) => {
    if (isPoolEnded) {
      throw new Error("Cannot use pool after it has been ended");
    }
    return pool.query(...args);
  },
  connect: async () => {
    if (isPoolEnded) {
      throw new Error("Cannot use pool after it has been ended");
    }
    return pool.connect();
  },
  end: async () => {
    isPoolEnded = true;
    return pool.end();
  }
};

// Configure drizzle with proper typing
export const db = drizzle(pool, { schema });

// Test connection on startup and handle errors gracefully
let connectionAttempts = 0;
const maxConnectionAttempts = 5;

const attemptConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to database");
    client.release(); // إعادة العميل إلى التجمع بعد الاختبار
    return true;
  } catch (err) {
    connectionAttempts++;
    console.error(`Database connection attempt ${connectionAttempts} failed:`, err);
    
    if (connectionAttempts < maxConnectionAttempts) {
      console.log(`Retrying in ${connectionAttempts * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, connectionAttempts * 2000));
      return attemptConnection();
    } else {
      console.error("Max connection attempts reached. Could not connect to database.");
      return false;
    }
  }
};

attemptConnection();

// Handle pool errors without crashing
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit, let the pool handle reconnection
});

// Keep connection alive with periodic ping - but only if the pool is not ended
const keepAlivePing = setInterval(() => {
  if (!isPoolEnded) {
    pool.query('SELECT 1')
      .catch(err => {
        console.warn('Keep-alive ping failed:', err);
      });
  } else {
    clearInterval(keepAlivePing);
  }
}, 60000); // Ping every minute

// Handle cleanup on application shutdown
process.on('SIGTERM', () => {
  if (!isPoolEnded) {
    console.log('Closing database pool...');
    isPoolEnded = true;
    pool.end().then(() => {
      console.log('Database pool closed.');
      process.exit(0);
    }).catch(err => {
      console.error('Error closing pool:', err);
      process.exit(1);
    });
  }
});

// Export sql for use in other files
export { sql };