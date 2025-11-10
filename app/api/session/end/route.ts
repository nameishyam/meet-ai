import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";

import redis from "@/lib/redis";
import { db } from "@/lib/db/db";
import { meetingsTable } from "@/lib/db/schema";
import { verifyToken } from "@/lib/jwt";
// Import our new LLM functions
import { getResponseFromModel, buildPrompt } from "@/lib/llm";

// --- Types ---
interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}
const endRequestSchema = z.object({
  meetingId: z.number(),
});
const SUMMARY_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";
// ---------------

export async function POST(req: Request) {
  try {
    // 1. Verify user
    const tokenCookie = (await cookies()).get("jwt_token");
    if (!tokenCookie?.value) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const payload = verifyToken(tokenCookie.value) as JwtPayload;
    if (!payload) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Validate input
    const body = await req.json();
    const validation = endRequestSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse("Bad Request", { status: 400 });
    }
    const { meetingId } = validation.data;

    const redisKey = `meeting:${meetingId}`;

    // 3. Get final chat from Redis
    const cacheString = await redis.get(redisKey);
    if (!cacheString) {
      return NextResponse.json({ message: "Session already ended" });
    }
    const cacheData = JSON.parse(cacheString);

    // 4. --- GENERATE FINAL SUMMARY ---
    // Create a prompt for the *final* summary
    const finalSummaryPrompt =
      buildPrompt(cacheData.summary, cacheData.timestamps) +
      "\n\nSystem: Provide a concise final summary of the entire interview.";

    const finalSummary = await getResponseFromModel(
      SUMMARY_MODEL,
      finalSummaryPrompt
    );

    // 5. Save to Postgres
    await db
      .update(meetingsTable)
      .set({
        summary: finalSummary, // Save the NEW final summary
        timestamps: cacheData.timestamps, // Save the full chat log
        endTime: new Date().toISOString(),
      })
      .where(eq(meetingsTable.id, meetingId));

    // 6. Delete from Redis
    await redis.del(redisKey);

    return NextResponse.json({ message: "Meeting ended successfully" });
  } catch (error) {
    console.error("[SESSION_END_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
