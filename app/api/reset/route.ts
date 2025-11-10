import { getUserByEmail, updateUser } from "@/lib/db/user";
import { sendMailServices } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const headers = { "Content-Type": "application/json" };
  try {
    const { email, newPassword } = await req.json();
    const existingUser = await getUserByEmail(email);
    if (!existingUser || existingUser.length === 0) {
      return new Response(
        JSON.stringify({ error: "No user found with this email" }),
        { status: 404, headers }
      );
    }
    const user = existingUser[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const response = await updateUser({
      id: user.id,
      password: hashedPassword,
    });
    if (!response) {
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        { status: 500, headers }
      );
    }
    await sendMailServices(
      email,
      "Password Reset Successful",
      `Hello ${user.name},\n\nYour password has been successfully reset.`
    );
    return new Response(
      JSON.stringify({ message: "Password reset successful" }),
      { status: 200, headers }
    );
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers,
    });
  }
}
