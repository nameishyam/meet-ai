import { db, NewMeeting } from "@/lib/db/db";
import { meetingsTable } from "./schema";
import { eq } from "drizzle-orm";

export async function createMeeting(meetingData: NewMeeting) {
  const [newMeeting] = await db
    .insert(meetingsTable)
    .values(meetingData)
    .returning({ id: meetingsTable.id });
  return newMeeting;
}

export async function getMettingsByUserId(userId: number) {
  const meetings = await db
    .select()
    .from(meetingsTable)
    .where(eq(meetingsTable.userId, userId));
  return meetings;
}
