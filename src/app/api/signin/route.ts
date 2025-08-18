import { NextResponse } from "next/server";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.authProvider === "GOOGLE") {
      return NextResponse.json({ message: "Account not available for password sign-in" }, { status: 401 });
    }
    if (!user.passwordHash) {
      return NextResponse.json({ message: "No password set for this account" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    // At this stage you could create a session manually, but we'll rely on NextAuth sessions elsewhere.
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}


