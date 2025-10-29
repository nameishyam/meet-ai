import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { getUserByEmail } from "@/app/db/user";

export async function POST(req: Request) {
  const headers = { "Content-Type": "application/json" };
  try {
    const { email, password } = await req.json();
    const user = await getUserByEmail(email);
    if (user.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers }
      );
    }
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers }
      );
    }
    const token = signToken({
      name: user[0].name,
      email: user[0].email,
    });
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
