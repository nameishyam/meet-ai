import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import redis from "@/lib/redis";
import { verifyToken } from "@/lib/jwt";

import { getResponseFromModel, buildPrompt } from "@/lib/llm";
import { JwtPayload, MeetingCache } from "@/lib/types";

const chatRequestSchema = z.object({
  meetingId: z.number(),
  message: z.string().min(1),
});

const SUMMARIZATION_THRESHOLD = 10;
const CHAT_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";
const SUMMARY_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("jwt_token");
    if (!tokenCookie) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const payload = verifyToken(tokenCookie.value) as JwtPayload;
    if (!payload) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse("Bad Request", { status: 400 });
    }
    const { meetingId, message } = validation.data;
    const redisKey = `meeting:${meetingId}`;

    const cacheString = await redis.get(redisKey);
    if (!cacheString) {
      return new NextResponse("Not Found: Session expired", { status: 404 });
    }
    const cacheData: MeetingCache = JSON.parse(cacheString);

    cacheData.timestamps.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });

    if (cacheData.timestamps.length > SUMMARIZATION_THRESHOLD) {
      const summaryPrompt =
        buildPrompt(cacheData.summary, cacheData.timestamps) +
        "\n\nSystem: Summarize the story so far. Keep all key facts.";

      const newSummary = await getResponseFromModel(
        SUMMARY_MODEL,
        summaryPrompt
      );

      cacheData.summary = newSummary;
      cacheData.timestamps = [];
    }

    const chatPrompt = buildPrompt(cacheData.summary, cacheData.timestamps);
    const aiResponse = await getResponseFromModel(CHAT_MODEL, chatPrompt);

    cacheData.timestamps.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    await redis.set(redisKey, JSON.stringify(cacheData), "EX", 3600);

    return NextResponse.json({
      aiResponse: aiResponse,
    });
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
