import { integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const meetingsTable = pgTable("meetings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  level: integer().notNull(),
  role: varchar({ length: 100 }).notNull(),
  startTime: varchar({ length: 100 }).notNull(),
  endTime: varchar({ length: 100 }).notNull(),
  instructions: varchar({ length: 1000 }).notNull(),
  summary: text().notNull(),
  timestamps: json().notNull(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
});
