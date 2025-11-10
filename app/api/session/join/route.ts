import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";

// Your existing libs
import { db } from "@/lib/db/db";
import redis from "@/lib/redis";
import { meetingsTable } from "@/lib/db/schema";
import { verifyToken } from "@/lib/jwt";

// --- Types ---
interface JwtPayload {
  id: number; // You used 'id' in your JWT, not 'userId'
  iat: number;
  exp: number;
}
// ---------------

export async function POST(req: Request) {
  try {
    // --- 1. SECURELY GET USER ---
    const cookieStore = cookies();
    const tokenCookie = (await cookieStore).get("jwt_token");
    if (!tokenCookie) {
      return new NextResponse("Unauthorized: No token", { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value) as JwtPayload;
    if (!payload) {
      return new NextResponse("Unauthorized: Invalid token", { status: 401 });
    }
    const userId = payload.id; // Use 'id' to match your JWT

    // --- 2. GET MEETING ID FROM CLIENT ---
    const { meetingId } = await req.json();
    if (!meetingId) {
      return new NextResponse("Bad Request: Missing meetingId", {
        status: 400,
      });
    }

    // --- 3. CHECK OWNERSHIP IN POSTGRES ---
    // This is the core security check!
    const meeting = await db.query.meetingsTable.findFirst({
      where: and(
        eq(meetingsTable.id, meetingId),
        eq(meetingsTable.userId, userId) // Check if this user owns this meeting
      ),
      columns: { id: true },
    });

    if (!meeting) {
      // If no match, it's not their meeting.
      return new NextResponse("Forbidden: You do not own this meeting", {
        status: 403,
      });
    }

    // --- 4. GET CHAT HISTORY FROM REDIS ---
    // The user is valid, so let's get their chat log.
    const redisKey = `meeting:${meetingId}`;
    const cacheString = await redis.get(redisKey);
    if (!cacheString) {
      return new NextResponse("Not Found: Meeting data has expired", {
        status: 404,
      });
    }

    const cacheData = JSON.parse(cacheString);

    // --- 5. SEND BACK THE HISTORY ---
    return NextResponse.json({
      timestamps: cacheData.timestamps, // Send the full chat log
    });
  } catch (error) {
    console.error("[SESSION_JOIN_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
