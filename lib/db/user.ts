import { db, NewUser, User } from "@/lib/db/db";
import { usersTable } from "./schema";
import { eq } from "drizzle-orm";

type UpdateUserInput = {
  id: number;
  name?: string;
  email?: string;
  password?: string;
};

export async function createUser(userData: NewUser) {
  const [newUser] = await db.insert(usersTable).values(userData).returning();
  return newUser;
}

export async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  return user;
}

export async function updateUser(input: UpdateUserInput): Promise<User | null> {
  const { id, name, email, password } = input;
  const updates: Partial<NewUser> = {};
  if (typeof name === "string" && name.trim() !== "")
    updates.name = name.trim();
  if (typeof email === "string" && email.trim() !== "")
    updates.email = email.trim().toLowerCase();
  if (typeof password === "string" && password.trim() !== "")
    updates.password = password.trim();
  try {
    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();
    return updated ?? null;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === "23505"
    ) {
      throw new Error("Email already in use");
    }
    throw new Error(
      "Error updating user: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}
