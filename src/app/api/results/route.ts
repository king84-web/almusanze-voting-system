import { NextResponse } from "next/server";
import { db, candidates, electionSettings, positions, teams, users, votes } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { sql, desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);

  const election = await db
    .select()
    .from(electionSettings)
    .orderBy(desc(electionSettings.created_at))
    .limit(1)
    .then((result) => result[0]);

  const now = new Date();
  const ended = election?.voting_end ? now >= election.voting_end : false;

  if (currentUser.role !== "admin" && !ended) {
    return NextResponse.json({ message: "Results are available only after the election ends" }, { status: 403 });
  }

  const candidateList = await db.select({
    id: candidates.id,
    full_name: candidates.full_name,
    profile_picture: candidates.profile_picture,
    position_id: candidates.position_id,
    team_id: candidates.team_id,
    bio: candidates.bio,
    running_mate_name: candidates.running_mate_name,
    running_mate_picture: candidates.running_mate_picture,
    team_name: teams.name,
    position_title: positions.title,
    position_display: positions.display_name,
  })
    .from(candidates)
    .leftJoin(teams, eq(candidates.team_id, teams.id))
    .leftJoin(positions, eq(candidates.position_id, positions.id));

  const voteCounts = await db
    .select({ candidate_id: votes.candidate_id, total: sql`count(*)`.mapWith(Number) })
    .from(votes)
    .groupBy(votes.candidate_id);

  const voteMap = new Map(voteCounts.map((vote) => [vote.candidate_id, Number(vote.total)]));

  const candidatesWithTotals = candidateList.map((candidate) => ({
    ...candidate,
    votes: voteMap.get(candidate.id) ?? 0,
  }));

  const voterResults =
    currentUser.role === "admin"
      ? await db
          .select({
            voter_name: users.full_name,
            candidate_id: votes.candidate_id,
            position_title: positions.title,
            position_display: positions.display_name,
            voted_at: votes.voted_at,
          })
          .from(votes)
          .leftJoin(users, eq(votes.voter_id, users.id))
          .leftJoin(positions, eq(votes.position_id, positions.id))
      : [];

  const turnout = voteCounts.reduce((sum, vote) => sum + Number(vote.total), 0);

  return NextResponse.json({ election, results: candidatesWithTotals, votes: voterResults, turnout });
}
