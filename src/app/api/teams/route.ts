import { NextResponse } from "next/server";
import { db, teams } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  const allTeams = await db.select().from(teams).orderBy(asc(teams.name));
  return NextResponse.json(allTeams);
}
