import { NextResponse } from "next/server";
import { db, positions } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  const allPositions = await db.select().from(positions).orderBy(asc(positions.display_name));
  return NextResponse.json(allPositions);
}
