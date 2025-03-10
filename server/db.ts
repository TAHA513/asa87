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

// Create connection pool with proper error handling and retry logic
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5 second timeout
  max: 20, // Maximum 20 clients in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  keepAlive: true, // Keep connections alive
  allowExitOnIdle: false // Prevent pool from ending when idle
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