import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { sendMailServices } from "@/lib/email";
import { createUser } from "@/lib/db/user";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const headers = { "Content-Type": "application/json" };
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400, headers }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await createUser({ name, email, password: hashedPassword });
    const token = signToken(
      {
        id: res.id,
        name: res.name,
        email: res.email,
      },
      "24h"
    );
    (await cookies()).set("jwt_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });
    await sendMailServices(
      res.email,
      "Welcome to Meet AI!",
      `Hello ${res.name},\n\nThank you for signing up for Meet AI! We're excited to have you on board.\n\nBest regards,\nSyam Gowtham 😊`
    );
    return new Response(
      JSON.stringify({
        token,
        user: { id: res.id, name: res.name, email: res.email },
      }),
      { status: 201, headers }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 409,
        headers,
      });
    }
    const errorMsg =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers,
    });
  }
}
