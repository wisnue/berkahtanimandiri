import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from './env';
import * as schema from '../db/schema';

// Create PostgreSQL connection pool
// Uses DATABASE_URL connection string (required for Supabase/cloud DBs)
export const pool = new Pool({
  connectionString: config.db.url,
  ssl: config.isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });

// Test database connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  await pool.end();
  console.log('Database connection pool closed');
}

export type Database = typeof db;
