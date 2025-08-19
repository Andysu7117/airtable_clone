import { NextResponse } from "next/server";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";

interface UserData {
  authProvider?: string;
}

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Disallow local signup if account exists with Google provider
      const provider = (existing as UserData).authProvider;
      if (provider === "GOOGLE") {
        return NextResponse.json({ message: "Account exists via Google. Please sign in with Google." }, { status: 409 });
      }
      return NextResponse.json({ message: "Account already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        email,
        authProvider: "LOCAL",
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}


