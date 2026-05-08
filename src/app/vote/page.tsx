"use client";

import { useEffect, useMemo, useState } from "react";
import CandidateCard from "@/components/candidate-card";
import VotingWizard from "@/components/voting-wizard";
import { toast } from "sonner";

interface Candidate {
  id: string;
  full_name: string;
  profile_picture: string | null;
  team_id: string;
  team_name: string | null;
  position_id: string;
  position_title: string;
  position_display: string | null;
  bio: string;
  running_mate_name: string | null;
  running_mate_picture: string | null;
}

const steps = [
  { id: "president_vp", label: "President & Vice President" },
  { id: "general_secretary", label: "General Secretary" },
  { id: "financial_secretary", label: "Financial Secretary" },
];

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedPositions, setVotedPositions] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/candidates").then((res) => res.json()),
      fetch("/api/votes/my-votes").then((res) => res.json()),
    ])
      .then(([candList, votes]) => {
        setCandidates(candList);
        setVotedPositions(votes);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentStep = steps[stepIndex];
  const filteredCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.position_title === currentStep.id),
    [candidates, currentStep.id],
  );

  const completedSteps = steps.filter((step) => votedPositions.includes(step.id)).length;

  async function submitVote(candidate: Candidate) {
    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidate.id,
        position_id: candidate.position_id,
        team_id: candidate.team_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Vote failed" }));
      toast.error(error.message ?? "Vote failed");
      return;
    }

    toast.success("Vote recorded successfully");
    setVotedPositions((current) => [...current, candidate.position_id]);
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
        <div className="mx-auto max-w-5xl rounded-4xl border border-slate-200 bg-white p-12 shadow-sm">
          <p className="text-lg font-semibold">Loading voting options...</p>
        </div>
      </main>
    );
  }

  if (completedSteps >= steps.length) {
    return (
      <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
        <div className="mx-auto max-w-5xl rounded-4xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <h1 className="text-3xl font-semibold">Voting Complete</h1>
          <p className="mt-4 text-sm text-slate-600">Thank you for casting your votes. Review your confirmation and return to the dashboard.</p>
          <a href="/vote/confirmation" className="mt-8 inline-flex rounded-full bg-[#c9a84c] px-8 py-3 text-sm font-semibold text-[#1a2744]">
            View Confirmation
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Cast your vote</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Complete each position in order. Once a position is voted, you cannot change it.</p>
        </div>

        <VotingWizard step={stepIndex + 1}>
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                hasVoted={votedPositions.includes(candidate.position_id)}
                onVote={() => submitVote(candidate)}
              />
            ))}
          </div>
        </VotingWizard>
      </div>
    </main>
  );
}
