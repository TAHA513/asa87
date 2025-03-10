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

// Keep connection alive with periodic ping
setInterval(() => {
  pool.query('SELECT 1')
    .catch(err => {
      console.warn('Keep-alive ping failed:', err);
    });
}, 60000); // Ping every minute

// Handle cleanup on application shutdown
process.on('SIGTERM', () => {
  console.log('Closing database pool...');
  pool.end().then(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});

// Export sql for use in other files
export { sql };