import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Base ID is required" }, { status: 400 });
    }

    // Check if the base belongs to the current user
    const existingBase = await db.base.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!existingBase) {
      return NextResponse.json({ error: "Base not found or access denied" }, { status: 404 });
    }

    // Delete the base (this will cascade delete tables, columns, and records)
    await db.base.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Base deleted successfully" });
  } catch (error) {
    console.error("Error deleting base:", error);
    return NextResponse.json({ error: "Failed to delete base" }, { status: 500 });
  }
}
