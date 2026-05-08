export const dynamic = "force-dynamic";

import Link from "next/link";
import ResultsChart from "@/components/results-chart";
import { db, auditLogs, candidates, teams, users, votes } from "@/lib/db";
import { sql, desc, eq, and } from "drizzle-orm";

async function getStats() {
  try {
    const totalMembersResult = await db.select({ total: sql`count(*)`.mapWith(Number) }).from(users).where(eq(users.role, "member"));
    const totalMembers = totalMembersResult[0]?.total ?? 0;
    const approvedMembersResult = await db.select({ total: sql`count(*)`.mapWith(Number) }).from(users).where(and(eq(users.role, "member"), eq(users.is_approved, true)));
    const approvedMembers = approvedMembersResult[0]?.total ?? 0;
    const totalVotesResult = await db.select({ total: sql`count(*)`.mapWith(Number) }).from(votes);
    const totalVotes = totalVotesResult[0]?.total ?? 0;
    const voteCounts = await db
      .select({ candidate_id: votes.candidate_id, total: sql`count(*)`.mapWith(Number) })
      .from(votes)
      .groupBy(votes.candidate_id);
    const candidateResults = await db
      .select({ id: candidates.id, full_name: candidates.full_name, team_name: teams.name })
      .from(candidates)
      .leftJoin(teams, eq(candidates.team_id, teams.id));

    const recentActivity = await db
      .select({ actor_name: users.full_name, action: auditLogs.action, metadata: auditLogs.metadata, created_at: auditLogs.created_at })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actor_id, users.id))
      .orderBy(desc(auditLogs.created_at))
      .limit(5);

    const pendingApprovalsResult = await db.select({ total: sql`count(*)`.mapWith(Number) }).from(users).where(and(eq(users.role, "member"), eq(users.is_approved, false)));
    const pendingApprovals = pendingApprovalsResult[0]?.total ?? 0;
    const turnout = totalMembers > 0 ? Math.min(100, Math.round((totalVotes / totalMembers) * 100)) : 0;

    return {
      totalMembers,
      approvedMembers,
      totalVotes,
      turnout,
      pendingApprovals,
      voteData: voteCounts,
      recentActivity,
      candidateResults,
    };
  } catch (error) {
    console.warn("Unable to load admin stats", error);
    return {
      totalMembers: 0,
      approvedMembers: 0,
      totalVotes: 0,
      turnout: 0,
      voteData: [],
      recentActivity: [],
      candidateResults: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const chartData = stats.voteData
    .filter((item) => item.candidate_id !== null)
    .map((item) => ({ name: item.candidate_id || "Unknown", votes: Number(item.total), team: "Team" }));

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Total members</p>
          <p className="mt-4 text-4xl font-semibold text-[#1a2744]">{stats.totalMembers}</p>
        </div>
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Approved</p>
          <p className="mt-4 text-4xl font-semibold text-[#1a2744]">{stats.approvedMembers}</p>
        </div>
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Total votes</p>
          <p className="mt-4 text-4xl font-semibold text-[#1a2744]">{stats.totalVotes}</p>
        </div>
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Turnout</p>
          <p className="mt-4 text-4xl font-semibold text-[#1a2744]">{stats.turnout}%</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ResultsChart data={chartData} />
        <div className="space-y-6">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a2744]">Required actions</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-[#fdf9e8] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Pending member approvals</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1a2744]">{stats.pendingApprovals}</p>
                  </div>
                  <Link href="/admin/members" className="rounded-full bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#1a2744] hover:bg-[#b7a33b]">
                    Review members
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-[#f8f2d6] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Election status</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1a2744]">{stats.totalVotes > 0 ? "In progress" : "Not started"}</p>
                  </div>
                  <Link href="/admin/settings" className="rounded-full bg-[#1a2744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16203b]">
                    Update settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a2744]">Recent activity</h2>
            <div className="mt-4 space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={`${activity.actor_name}-${activity.created_at.toISOString()}`} className="rounded-3xl bg-[#f8f2d6] p-4">
                  <p className="text-sm font-semibold text-[#1a2744]">{activity.actor_name ?? "System"}</p>
                  <p className="mt-1 text-sm text-slate-600">{activity.action}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
