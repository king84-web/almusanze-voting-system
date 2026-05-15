import { NextResponse } from "next/server";
import { db, teams } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const { id } = await params;
  const body = await request.json();
  const name = body?.name?.toString()?.trim();
  const description = body?.description?.toString()?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const [updatedTeam] = await db
    .update(teams)
    .set({ name, description })
    .where(eq(teams.id, id))
    .returning({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      created_at: teams.created_at,
    });

  if (!updatedTeam) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(updatedTeam);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const { id } = await params;

  try {
    const result = await db.delete(teams).where(eq(teams.id, id));
    if (!result || result.rowCount === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error("Team delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete team" },
      { status: 400 }
    );
  }
}
