import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Base name is required" }, { status: 400 });
    }

    const base = await db.base.create({
      data: {
        name: name.trim(),
        ownerId: session.user.id,
        tables: {
          create: {
            name: "Untitled Table",
            columns: {
              create: [
                { name: "Name", type: "TEXT"},
                { name: "Notes", type: "TEXT"},
              ],
            },
          },
        },
      },
      include: {
        tables: {
          include: {
            columns: true,
          },
        },
      },
    });

    return NextResponse.json(base);
  } catch (error) {
    console.error("Error creating base:", error);
    return NextResponse.json({ error: "Failed to create base" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bases = await db.base.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        tables: {
          include: {
            columns: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(bases);
  } catch (error) {
    console.error("Error fetching bases:", error);
    return NextResponse.json({ error: "Failed to fetch bases" }, { status: 500 });
  }
}
