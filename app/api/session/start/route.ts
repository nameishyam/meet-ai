import { createMeeting } from "@/lib/db/meetings";
import { verifyToken } from "@/lib/jwt";
import redis from "@/lib/redis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

export async function POST(req: Request) {
  const headers = { "Content-Type": "application/json" };
  try {
    const cookieStore = cookies();
    const tokenCookie = (await cookieStore).get("jwt_token");

    if (!tokenCookie) {
      return new NextResponse("Unauthorized: No token provided.", {
        status: 401,
      });
    }
    const payload = verifyToken(tokenCookie.value) as JwtPayload;

    if (!payload) {
      return new NextResponse("Unauthorized: Invalid or expired token.", {
        status: 401,
      });
    }

    const userId = payload.id;
    console.log(userId);
    const { role, level, instructions, ...values } = await req.json();

    if (values.userId !== userId) {
      return new NextResponse("Unauthorized: User ID mismatch.", {
        status: 401,
        headers,
      });
    }

    const sessionData = {
      role,
      level: parseInt(level, 10),
      instructions,
      userId,
      title: `Interview for ${role} position`,
      startTime: new Date().toISOString(),
      endTime: "",
      summary: "Interview in progress...",
      timestamps: {},
    };

    const meetingCreatedData = await createMeeting(sessionData);
    const meetingId = meetingCreatedData.id;
    const initialAiQuestion = `Welcome! I see you're here for the ${sessionData.role} position. To start, could you tell me a bit about yourself?`;

    const initialCacheData = {
      summary: `System: You are an interviewer for a ${sessionData.role} role. 
                Toughness: ${sessionData.level}. 
                Instructions: ${sessionData.instructions || "None"}.`,
      timestamps: [
        {
          role: "assistant",
          content: initialAiQuestion,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const redisKey = `meeting:${meetingId}`;

    await redis.setex(redisKey, 60 * 60, JSON.stringify(initialCacheData));

    return NextResponse.json({
      meetingId: meetingId,
      initialAiQuestion: initialAiQuestion,
    });
  } catch (err: unknown) {
    console.error("[SESSION_START_ERROR]:", err);
    const errorMsg =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers,
    });
  }
}
