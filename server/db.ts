import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

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
  retry_strategy: (times: number) => {
    if (times < 5) {
      return Math.min(times * 100, 3000); // Exponential backoff
    }
    return false; // Stop retrying after 5 attempts
  }
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

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});