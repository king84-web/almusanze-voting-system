export const dynamic = "force-dynamic";

import Link from "next/link";
import { CountdownTimer } from "@/components/countdown-timer";
import { db, electionSettings } from "@/lib/db";
import { desc } from "drizzle-orm";

async function getElectionSettings() {
  try {
    const result = await db.select().from(electionSettings).orderBy(desc(electionSettings.id)).limit(1);
    return result[0];
  } catch (error) {
    console.warn("Unable to fetch election settings", error);
    return null;
  }
}

export default async function Home() {
  const settings = await getElectionSettings();
  const targetDate = settings?.voting_start?.toISOString() ?? "2026-12-31T00:00:00.000Z";

  return (
    <main className="min-h-screen bg-[#f4f4f7] text-[#1a2744]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-10 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex rounded-full bg-[#1a2744] px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-white shadow-sm">
              ALM General Elections
            </div>
            <div className="flex flex-col gap-6 rounded-4xl border border-[#e7e7e7] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <img src="/alm-community-logo.png" alt="ALM Community Logo" className="h-24 w-24 rounded-full object-cover" />
                <img src="/alm-flags.png" alt="ALM and Rwanda flags" className="h-24 w-24 rounded-3xl object-cover" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-[#c9a84c]">Association of Liberians in Musanze</p>
                <p className="mt-2 text-2xl font-semibold text-[#1a2744]">Unity Leads and God Above All.</p>
                <p className="mt-3 text-sm text-slate-600">A community election platform for Liberians living in Musanze.</p>
              </div>
            </div>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Vote for Liberia’s future leaders in Musanze.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-700">
              The Association of Liberians in Musanze empowers members with a secure voting experience, transparent results, and election management for every candidate and member.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[#c9a84c] px-8 py-4 text-base font-semibold text-[#1a2744] transition hover:bg-[#b7a33b]"
              >
                Register to Vote
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[#1a2744] bg-white px-8 py-4 text-base font-semibold text-[#1a2744] transition hover:bg-[#f7f7f7]"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="rounded-4xl border border-[#d8d8d8] bg-white p-8 shadow-[0_20px_80px_rgba(26,39,68,0.08)] lg:max-w-xl">
            <h2 className="text-xl font-semibold text-[#1a2744]">Voting starts in</h2>
            <p className="mt-2 text-sm text-slate-600">Election: {settings?.election_name ?? "ALM General Elections 2024"}</p>
            <div className="mt-6">
              <CountdownTimer targetDate={targetDate} />
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-8 lg:grid-cols-3">
          {[
            {
              title: "Verify membership",
              description: "Register with your member ID and wait for admin approval before voting.",
            },
            {
              title: "Choose your team",
              description: "Review candidate teams and positions before casting your ballot.",
            },
            {
              title: "Track election results",
              description: "Members and admins can view live tallies and final outcomes.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-4xl border border-[#e7e7e7] bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-[#1a2744]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>

        <footer className="mt-24 rounded-4xl border border-[#d8d8d8] bg-[#1a2744] p-8 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#f8f3cf]">Association of Liberians in Musanze</p>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[#e9e2a5]">
                Join your community election platform, promote democratic participation, and support the candidates you believe in.
              </p>
            </div>
            <div className="space-y-1 text-sm text-[#f8f3cf]">
              <p>Contact: info@alm.org</p>
              <p>Musanze, Rwanda</p>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
