import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }

  // Ensure the user exists in DB (defensive in case of stale sessions)
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { email: session.user.email ?? undefined },
      ],
    },
  });
  
  if (!existingUser) {
    redirect("/");
  }

  return { session, user: existingUser };
}
