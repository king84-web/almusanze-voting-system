import { NextResponse } from "next/server";
import { db, teams } from "@/lib/db";
import { asc } from "drizzle-orm";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";

export async function GET() {
  const allTeams = await db.select().from(teams).orderBy(asc(teams.name));
  return NextResponse.json(allTeams);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const body = await request.json();
  const name = body?.name?.toString()?.trim();
  const description = body?.description?.toString()?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const [createdTeam] = await db
    .insert(teams)
    .values({ name, description })
    .returning({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      created_at: teams.created_at,
    });

  return NextResponse.json(createdTeam, { status: 201 });
}
