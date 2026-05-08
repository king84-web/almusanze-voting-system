import { NextResponse } from "next/server";
import { db, auditLogs, electionSettings, votes } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { desc, eq, and } from "drizzle-orm";
import { voteSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);

  if (currentUser.role !== "member") {
    return NextResponse.json({ message: "Only members can vote" }, { status: 403 });
  }

  const body = await request.json();
  const parseResult = voteSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.issues[0]?.message ?? "Invalid vote payload" }, { status: 400 });
  }

  const voteData = parseResult.data;

  const election = await db
    .select()
    .from(electionSettings)
    .orderBy(desc(electionSettings.created_at))
    .limit(1)
    .then((result) => result[0]);

  if (!election || !election.is_active) {
    return NextResponse.json({ message: "Voting is not active" }, { status: 403 });
  }

  const existingVote = await db
    .select({ id: votes.id })
    .from(votes)
    .where(and(eq(votes.voter_id, currentUser.id), eq(votes.position_id, voteData.position_id)))
    .limit(1)
    .then((result) => result[0]);

  if (existingVote) {
    return NextResponse.json({ message: "You have already voted for this position" }, { status: 409 });
  }

  await db.insert(votes).values({
    voter_id: currentUser.id,
    candidate_id: voteData.candidate_id,
    position_id: voteData.position_id,
    team_id: voteData.team_id,
  });

  await db.insert(auditLogs).values({
    actor_id: currentUser.id,
    action: "cast_vote",
    metadata: {
      candidateId: voteData.candidate_id,
      positionId: voteData.position_id,
      teamId: voteData.team_id,
    },
  });

  return NextResponse.json({ message: "Vote submitted successfully" });
}
