import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or NEON_DATABASE_URL is required");
}

const isNeonDatabase = /neon\.tech|aws\.neon\.tech/i.test(databaseUrl);

const poolConfig: PoolConfig = {
  connectionString: databaseUrl,
  ssl: isNeonDatabase ? { rejectUnauthorized: false } : undefined,
};

const globalForDb = globalThis as typeof globalThis & {
  __rupiyaDbPool?: Pool;
};

export const pool = globalForDb.__rupiyaDbPool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__rupiyaDbPool = pool;
}

export const db = drizzle(pool);
export const databaseProviderLabel = isNeonDatabase ? "Neon PostgreSQL" : "PostgreSQL";
