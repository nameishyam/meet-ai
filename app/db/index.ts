import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle(process.env.NEXT_DATABASE_URL!);
