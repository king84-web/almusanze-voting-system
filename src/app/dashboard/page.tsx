"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const positions = [
  { id: "president", label: "President" },
  { id: "vice_president", label: "Vice President" },
  { id: "general_secretary", label: "General Secretary" },
  { id: "financial_secretary", label: "Financial Secretary" },
];

interface VoteProgress {
  voted: boolean;
  position_id: string;
}

interface ElectionSettings {
  election_name: string;
  is_active: boolean;
  voting_start: string | null;
  voting_end: string | null;
}

export default function DashboardPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [votes, setVotes] = useState<string[]>([]);
  const [settings, setSettings] = useState<ElectionSettings | null>(null);

  useEffect(() => {
    fetch("/api/votes/my-votes")
      .then((res) => res.json())
      .then(setVotes)
      .catch(() => setVotes([]));

    fetch("/api/election/settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Welcome back</p>
            <h1 className="mt-4 text-4xl font-semibold">{session?.user?.name ?? "ALM member"}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Continue your voting journey and review your progress for the current election.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {positions.map((position) => {
              const voted = votes.includes(position.id);
              return (
                <div key={position.id} className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.35em] text-[#1a2744]">{position.label}</p>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${voted ? "bg-emerald-100 text-emerald-700" : "bg-[#c9a84c]/10 text-[#1a2744]"}`}>
                      {voted ? "Voted ✓" : "Pending"}
                    </span>
                    <Link
                      href={voted ? "/dashboard" : "/vote"}
                      className="rounded-full bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#1a2744] transition hover:bg-[#b7a33b]"
                    >
                      {voted ? "View" : "Vote Now"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a2744]">Election details</h2>
            <p className="mt-4 text-sm text-slate-600">{settings?.election_name ?? "ALM General Elections 2024"}</p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Voting status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${settings?.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                  {settings?.is_active ? "Open" : "Closed"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Start</span>
                <span>{settings?.voting_start ? new Date(settings.voting_start).toLocaleString() : "TBD"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>End</span>
                <span>{settings?.voting_end ? new Date(settings.voting_end).toLocaleString() : "TBD"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a2744]">Profile</h2>
            <p className="mt-4 text-sm text-slate-600">Email</p>
            <p className="text-sm font-medium text-[#1a2744]">{session?.user?.email}</p>
            <p className="mt-6 text-sm text-slate-600">Role</p>
            <p className="text-sm font-medium text-[#1a2744]">Member</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
