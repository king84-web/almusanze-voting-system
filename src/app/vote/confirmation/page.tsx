"use client";

import Link from "next/link";

export default function VoteConfirmationPage() {
  return (
    <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
      <div className="mx-auto max-w-3xl rounded-4xl border border-slate-200 bg-white p-10 shadow-sm text-center">
        <div className="text-5xl mb-4">✓</div>
        <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c] font-semibold">Thank You</p>
        <h1 className="mt-4 text-4xl font-bold">Your votes are recorded</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">Your participation strengthens the ALM community. Thank you for voting in all three positions.</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full bg-[#1a2744] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2a3a54]"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/vote"
            className="inline-flex rounded-full border border-[#1a2744] px-8 py-3 text-sm font-semibold text-[#1a2744] transition hover:bg-[#f7f7f7]"
          >
            View Voting Page
          </Link>
        </div>
      </div>
    </main>
  );
}
