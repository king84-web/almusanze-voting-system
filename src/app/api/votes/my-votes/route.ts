import { NextResponse } from "next/server";
import { db, votes, positions } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);

  const records = await db
    .select({ position_title: positions.title })
    .from(votes)
    .innerJoin(positions, eq(votes.position_id, positions.id))
    .where(eq(votes.voter_id, currentUser.id));

  return NextResponse.json(records.map((record) => record.position_title));
}
