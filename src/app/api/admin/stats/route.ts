import { NextResponse } from "next/server";
import { db, electionSettings, positions, users, votes } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { and, count, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const [memberCount, approvedCount, totalVotes] = await Promise.all([
    db.select({ total: count() }).from(users).where(eq(users.role, "member")).then((result) => Number(result[0].total ?? 0)),
    db.select({ total: count() }).from(users).where(and(eq(users.role, "member"), eq(users.is_approved, true))).then((result) => Number(result[0].total ?? 0)),
    db.select({ total: count() }).from(votes).then((result) => Number(result[0].total ?? 0)),
  ]);

  const positionTotals = await db
    .select({ position_id: votes.position_id, total: count() })
    .from(votes)
    .groupBy(votes.position_id);

  const turnout = memberCount > 0 ? Math.round((totalVotes / memberCount) * 100) : 0;

  return NextResponse.json({
    total_members: memberCount,
    approved_members: approvedCount,
    total_votes: totalVotes,
    turnout_percentage: turnout,
    votes_per_position: positionTotals.map((row) => ({ position_id: row.position_id, votes: Number(row.total) })),
  });
}
