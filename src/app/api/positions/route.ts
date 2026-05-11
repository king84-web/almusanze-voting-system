import { NextResponse } from "next/server";
import { db, positions } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("team_id");

  const allPositions = teamId
    ? await db.select().from(positions).where(eq(positions.team_id, teamId)).orderBy(asc(positions.display_name))
    : await db.select().from(positions).orderBy(asc(positions.display_name));

  return NextResponse.json(allPositions);
}
