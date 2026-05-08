"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const labels: Record<string, string> = {
  president: "President",
  vice_president: "Vice President",
  general_secretary: "General Secretary",
  financial_secretary: "Financial Secretary",
};

export default function VoteConfirmationPage() {
  const [voteIds, setVoteIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/votes/my-votes")
      .then((res) => res.json())
      .then(setVoteIds)
      .catch(() => setVoteIds([]));
  }, []);

  function downloadReceipt() {
    const content = `ALM Voting Receipt\n\nPositions voted:\n${voteIds.map((id) => `- ${labels[id] ?? id}`).join("\n")}\n\nThank you for participating.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "alm-voting-receipt.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
      <div className="mx-auto max-w-3xl rounded-4xl border border-slate-200 bg-white p-10 shadow-sm text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Thank you</p>
        <h1 className="mt-4 text-4xl font-semibold">Your vote is recorded</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">Your participation strengthens the ALM community and helps elect trusted representatives.</p>

        <div className="mt-8 space-y-4 rounded-4xl bg-[#f8f2d6] p-6 text-left text-sm text-[#1a2744]">
          <h2 className="text-lg font-semibold">Positions recorded</h2>
          <ul className="space-y-2">
            {voteIds.map((position) => (
              <li key={position} className="list-disc pl-5">{labels[position] ?? position}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={downloadReceipt}
            className="rounded-full bg-[#c9a84c] px-8 py-3 text-sm font-semibold text-[#1a2744] transition hover:bg-[#b7a33b]"
          >
            Download receipt
          </button>
          <Link href="/dashboard" className="rounded-full border border-[#1a2744] px-8 py-3 text-sm font-semibold text-[#1a2744] transition hover:bg-[#f7f7f7]">
            Return to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
