import { NextResponse } from "next/server";
import { db, candidates } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const { id: candidateId } = await params;
  const body = await request.json();

  const existing = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(eq(candidates.id, candidateId))
    .limit(1)
    .then((result) => result[0]);

  if (!existing) {
    return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
  }

  await db
    .update(candidates)
    .set({
      full_name: body.full_name,
      bio: body.bio,
      running_mate_name: body.running_mate_name,
      running_mate_picture: body.running_mate_picture,
    })
    .where(eq(candidates.id, candidateId));

  return NextResponse.json({ message: "Candidate updated" });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const { id: candidateId } = await params;

  await db.delete(candidates).where(eq(candidates.id, candidateId));

  return NextResponse.json({ message: "Candidate deleted" });
}
