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

// Create optimized connection pool with proper error handling and retry logic
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 second timeout for better reliability
  max: 10, // Optimal number of clients in pool
  min: 2, // Keep minimum 2 connections ready
  idleTimeoutMillis: 60000, // Keep connections longer (1 minute)
  keepAlive: true, // Keep connections alive
  allowExitOnIdle: false, // Prevent pool from ending when idle
  statement_timeout: 30000, // Timeout long-running queries after 30 seconds
  query_timeout: 30000, // Timeout long-running queries
  // Add automatic connection retries
  max_retries: 3,
  retry_as_transaction: false
});
</old_str>
<new_str>
// Create optimized connection pool with proper error handling and retry logic
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 second timeout for better reliability
  max: 10, // Optimal number of clients in pool
  min: 2, // Keep minimum 2 connections ready
  idleTimeoutMillis: 60000, // Keep connections longer (1 minute)
  keepAlive: true, // Keep connections alive
  allowExitOnIdle: false, // Prevent pool from ending when idle
  statement_timeout: 30000, // Timeout long-running queries after 30 seconds
  query_timeout: 30000 // Timeout long-running queries
});

// Configure drizzle with proper typing
export const db = drizzle(pool, { schema });

// Test connection on startup and handle errors gracefully
pool.connect()
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch(err => {
    console.error("Initial database connection failed:", err);
    // Don't exit process, let it retry
  });

// Handle pool errors without crashing
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit, let the pool handle reconnection
});

// Create a more resilient query wrapper with reconnection logic
const executeQuery = async (queryFn) => {
  const MAX_RETRIES = 3;
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      return await queryFn();
    } catch (error) {
      retries++;
      // Only retry on connection errors, not query errors
      if (
        error.code === '57P01' || // terminating connection due to administrator command
        error.code === '08003' || // connection does not exist
        error.code === '08006' || // connection failure
        error.code === '08001' || // connection rejected
        error.code === '08004'    // rejected connection
      ) {
        console.log(`Database connection error (${error.code}), retry attempt ${retries}/${MAX_RETRIES}`);
        
        if (retries < MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
          continue;
        }
      }
      throw error; // Rethrow if max retries reached or not a connection error
    }
  }
};

// Keep connection alive with periodic ping, but more robust
const pingInterval = 30000; // Ping every 30 seconds
let pingTimer = setInterval(async () => {
  try {
    await executeQuery(() => pool.query('SELECT 1'));
  } catch (err) {
    console.warn('Keep-alive ping failed:', err);
  }
}, pingInterval);

// Ensure ping timer is cleaned up on process exit
process.on('beforeExit', () => {
  clearInterval(pingTimer);
});

// Handle cleanup on application shutdown
process.on('SIGTERM', () => {
  console.log('Closing database pool...');
  pool.end().then(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});

// Export sql and executeQuery for use in other files
export { sql, executeQuery };