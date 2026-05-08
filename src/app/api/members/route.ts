import { NextResponse } from "next/server";
import { db, users, votes } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  requireAdmin(user);

  const [allUsers, allVotes] = await Promise.all([
    db.select({
      id: users.id,
      full_name: users.full_name,
      email: users.email,
      phone: users.phone,
      member_id: users.member_id,
      role: users.role,
      is_approved: users.is_approved,
      created_at: users.created_at,
    })
      .from(users)
      .orderBy(desc(users.created_at)),
    db.select({ voter_id: votes.voter_id, position_id: votes.position_id })
      .from(votes)
      .orderBy(votes.voter_id),
  ]);

  const voteMap = new Map<string, string[]>();

  allVotes
    .filter((vote) => vote.voter_id !== null && vote.position_id !== null)
    .forEach((vote) => {
      const voter_id = vote.voter_id!;
      const position_id = vote.position_id!;
      const existing = voteMap.get(voter_id) ?? [];
      voteMap.set(voter_id, [...existing, position_id]);
    });

  return NextResponse.json(
    allUsers.map((member) => ({
      id: member.id,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      member_id: member.member_id,
      role: member.role,
      is_approved: member.is_approved,
      joined_at: member.created_at.toISOString(),
      voted_positions: voteMap.get(member.id) ?? [],
    })),
  );
}
