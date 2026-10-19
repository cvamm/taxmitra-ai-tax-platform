import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

/**
 * Database access with a fail-safe when DATABASE_URL is not configured
 * (e.g. a demo deployment without a Postgres instance):
 * - With DATABASE_URL: normal pooled Postgres client.
 * - Without: a pool pointed at an unroutable address whose queries reject
 *   immediately. Every API route already wraps db calls in try/catch and
 *   falls back to static data, so the site stays fully functional instead
 *   of crashing the whole Node process.
 */
const globalForDb = globalThis as typeof globalThis & {
  __taxmitraPool?: Pool;
};

const pool: Pool = databaseUrl
  ? (globalForDb.__taxmitraPool ??
      new Pool({
        connectionString: databaseUrl,
        max: 10,
        idleTimeoutMillis: 30_000,
      }))
  : (() => {
      // Offline fallback: reject every query so callers' try/catch paths
      // kick in and the app degrades to static data instead of hanging.
      const p = new Pool({
        connectionString:
          "postgres://offline:offline@127.0.0.1:15432/offline",
        max: 1,
        connectionTimeoutMillis: 500,
      });
      p.query = (() =>
        Promise.reject(
          new Error("DATABASE_URL is not configured — running in static mode")
        )) as unknown as Pool["query"];
      return p;
    })();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__taxmitraPool = pool;
}

export { pool };
export const db = drizzle(pool as Pool);
