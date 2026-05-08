import { NextResponse } from "next/server";
import { db, votes, auditLogs } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  await db.delete(votes).execute();
  await db.insert(auditLogs).values({
    actor_id: currentUser.id,
    action: "reset_votes",
    metadata: { message: "All votes cleared" },
  });

  return NextResponse.json({ message: "Votes reset" });
}
