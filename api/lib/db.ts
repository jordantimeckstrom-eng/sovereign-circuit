import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../shared/schema.js";

let pool: pg.Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
  }
  return drizzle(pool, { schema });
}
