import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { sendMailServices } from "@/lib/email";
import { createUser } from "@/app/db/user";
export async function POST(req: Request) {
  const headers = { "Content-Type": "application/json" };
  try {
    const { name, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const res = await createUser({ name, email, password: hashedPassword });
      const token = signToken({ id: res.id, name: res.name });
      const info = sendMailServices(
        res.email,
        "Welcome to Meet AI!",
        `Hello ${res.name},\n\nThank you for signing up for Meet AI! We're excited to have you on board.\n\nBest regards,\nSyam Gowtham 😊`
      );
      return new Response(
        JSON.stringify({
          message: "User created successfully",
          token,
          user: { name: res.name, email: res.email },
          info,
        }),
        { status: 201, headers }
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: unknown }).code === "23505"
      ) {
        return new Response(JSON.stringify({ error: "Email already in use" }), {
          status: 400,
          headers,
        });
      }
      return new Response(
        JSON.stringify({
          error: `Error creating user: ${
            error instanceof Error ? error.message : String(error)
          }`,
        }),
        { status: 400, headers }
      );
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers,
    });
  }
}
