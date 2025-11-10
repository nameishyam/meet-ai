import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { usersTable, meetingsTable } from "@/lib/db/schema";

declare global {
  var dbPool: Pool | undefined;
}

const connectionString = process.env.NEXT_DATABASE_URL;
if (!connectionString) {
  throw new Error("NEXT_DATABASE_URL environment variable is not set");
}

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({ connectionString });
} else {
  if (!global.dbPool) {
    global.dbPool = new Pool({ connectionString });
  }
  pool = global.dbPool;
}

export const db = drizzle(pool, { schema });

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
export type Meeting = InferSelectModel<typeof meetingsTable>;
export type NewMeeting = InferInsertModel<typeof meetingsTable>;
