import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { usersTable, meetingsTable } from "./schema";

const pool = new Pool({
  connectionString: process.env.NEXT_DATABASE_URL,
});

export const db = drizzle(pool);

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
export type Meeting = InferSelectModel<typeof meetingsTable>;
export type NewMeeting = InferInsertModel<typeof meetingsTable>;
