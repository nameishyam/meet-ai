import { db, NewMeeting } from "@/app/db/db";
import { meetingsTable } from "./schema";

export async function createMeeting(meetingData: NewMeeting) {
  const [newMeeting] = await db
    .insert(meetingsTable)
    .values(meetingData)
    .returning();
  return newMeeting;
}
