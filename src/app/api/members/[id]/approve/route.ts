import { NextResponse } from "next/server";
import { db, auditLogs, users } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const { id: memberId } = await params;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, memberId))
    .limit(1)
    .then((result) => result[0]);

  if (!existing) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }

  await db.update(users).set({ is_approved: true }).where(eq(users.id, memberId));

  await db.insert(auditLogs).values({
    actor_id: currentUser.id,
    action: "approve_member",
    metadata: { approvedMemberId: memberId },
  });

  return NextResponse.json({ message: "Member approved" });
}
