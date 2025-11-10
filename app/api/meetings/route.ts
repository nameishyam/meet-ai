import { getMettingsByUserId } from "@/lib/db/meetings";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId parameter" }), {
      status: 400,
    });
  }

  const meetings = await getMettingsByUserId(Number(userId));
  return new Response(JSON.stringify(meetings), { status: 200 });
}
