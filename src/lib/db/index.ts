import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.LOCAL_DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/alm_voting";

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { logger: true });

export type Database = typeof db;
export * from "./schema";
export { schema };
