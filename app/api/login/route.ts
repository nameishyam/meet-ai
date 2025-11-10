import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { getUserByEmail } from "@/lib/db/user";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const headers = { "Content-Type": "application/json" };
  try {
    const { email, password } = await req.json();
    const userData = await getUserByEmail(email);
    if (userData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers }
      );
    }
    const validPassword = await bcrypt.compare(password, userData[0].password);
    if (!validPassword) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers }
      );
    }
    const token = signToken(
      {
        id: userData[0].id,
        name: userData[0].name,
        email: userData[0].email,
      },
      "24h"
    );
    (await cookies()).set("jwt_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });
    const user = {
      id: userData[0].id,
      name: userData[0].name,
      email: userData[0].email,
    };
    return new Response(JSON.stringify({ token, user }), {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers,
    });
  }
}
