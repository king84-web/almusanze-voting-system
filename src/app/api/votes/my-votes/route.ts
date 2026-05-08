import { NextResponse } from "next/server";
import { db, votes } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);

  const records = await db
    .select({ position_id: votes.position_id })
    .from(votes)
    .where(eq(votes.voter_id, currentUser.id));

  return NextResponse.json(records.map((record) => record.position_id));
}
