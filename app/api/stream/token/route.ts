// app/api/stream/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_STREAM_API_KEY!;
    const apiSecret = process.env.NEXT_STREAM_API_SECRET!;

    // Create Stream client (you can use StreamChat for token generation)
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    // Generate user token
    const token = serverClient.createToken(userId);

    return NextResponse.json({
      token,
      apiKey,
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
