import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Validate database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create connection pool with proper error handling
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 20
});

// Configure drizzle with proper typing
export const db = drizzle(pool, { schema });

// Test connection on startup
pool.connect().then(() => {
  console.log("Successfully connected to database");
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});