"use client";

import { useEffect, useMemo, useState } from "react";
import CandidateCard from "@/components/candidate-card";
import { toast } from "sonner";

interface Candidate {
  id: string;
  full_name: string;
  profile_picture: string | null;
  party_affiliation: string | null;
  previous_leadership: string | null;
  letter_of_intent: string | null;
  bio: string | null;
  team_id: string;
  team_name: string;
  position_id: string;
  position_title: string;
  running_mate_name: string | null;
  running_mate_picture: string | null;
  running_mate_party: string | null;
  running_mate_previous_leadership: string | null;
  running_mate_letter_of_intent: string | null;
  running_mate_bio: string | null;
  position_display: string | null;
}

interface ElectionSettings {
  is_active: boolean;
  voting_start: string | null;
  voting_end: string | null;
}

const STEPS = [
  { id: "president", title: "President & Vice President", description: "Select one ticket to vote for" },
  { id: "general_secretary", title: "General Secretary", description: "Select one candidate to vote for" },
  { id: "financial_secretary", title: "Financial Secretary", description: "Select one candidate to vote for" },
];

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedPositions, setVotedPositions] = useState<string[]>([]);
  const [electionSettings, setElectionSettings] = useState<ElectionSettings | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [candidatesRes, votedRes, settingsRes] = await Promise.all([
        fetch("/api/candidates"),
        fetch("/api/votes/my-votes"),
        fetch("/api/election/settings"),
      ]);

      const candidates = await candidatesRes.json();
      const voted = await votedRes.json();
      const settings = await settingsRes.json();

      setCandidates(candidates);
      setVotedPositions(voted);
      setElectionSettings(settings);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load voting page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const currentStep = STEPS[currentStepIndex];
  const allVoted = STEPS.every((step) => votedPositions.includes(step.id));

  // Group candidates by position and team
  const candidatesByPositionAndTeam = useMemo(() => {
    const grouped: Record<string, Record<string, Candidate[]>> = {};

    STEPS.forEach((step) => {
      grouped[step.id] = {};

      const positionCandidates = candidates.filter((c) => c.position_title === step.id);
      positionCandidates.forEach((candidate) => {
        const teamName = candidate.team_name || "Unknown Team";
        if (!grouped[step.id][teamName]) {
          grouped[step.id][teamName] = [];
        }
        grouped[step.id][teamName].push(candidate);
      });
    });

    return grouped;
  }, [candidates]);

  async function handleVote(candidate: Candidate) {
    if (isSubmittingVote) return;
    setIsSubmittingVote(true);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate.id,
          position_id: candidate.position_id,
          team_id: candidate.team_id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Failed to record vote");
        return;
      }

      toast.success("Vote recorded!");
      setVotedPositions((prev) => [...prev, STEPS[currentStepIndex].id]);

      // Move to next step after a short delay
      setTimeout(() => {
        if (currentStepIndex < STEPS.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        }
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmittingVote(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
        <div className="mx-auto max-w-6xl rounded-4xl border border-slate-200 bg-white p-12 shadow-sm">
          <p className="text-lg font-semibold">Loading voting page...</p>
        </div>
      </main>
    );
  }

  if (!electionSettings?.is_active) {
    return (
      <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
        <div className="mx-auto max-w-6xl rounded-4xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <h1 className="text-3xl font-semibold">Voting Not Available</h1>
          <p className="mt-4 text-sm text-slate-600">Voting is not currently open. Please check back later.</p>
        </div>
      </main>
    );
  }

  if (allVoted) {
    return (
      <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
        <div className="mx-auto max-w-6xl rounded-4xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <h1 className="text-3xl font-semibold">Voting Complete</h1>
          <p className="mt-4 text-sm text-slate-600">Thank you for voting in all positions.</p>
          <a
            href="/vote/confirmation"
            className="mt-8 inline-flex rounded-full bg-[#c9a84c] px-8 py-3 text-sm font-semibold text-[#1a2744] transition hover:bg-[#b7a33b]"
          >
            View Confirmation
          </a>
        </div>
      </main>
    );
  }

  const currentCandidates = candidatesByPositionAndTeam[currentStep.id] || {};
  const hasCurrentCandidates = Object.values(currentCandidates).some((team) => team.length > 0);

  return (
    <main className="min-h-screen bg-[#f4f4f7] px-6 py-10 text-[#1a2744]">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Cast Your Vote</h1>
          <p className="mt-2 text-sm text-slate-600">Complete each position in order. Once you vote for a position, you cannot change it.</p>
        </div>

        {/* Progress Bar */}
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div
                  className={`flex h-10 items-center justify-center rounded-full text-xs font-bold transition ${
                    index < currentStepIndex
                      ? "bg-green-500 text-white"
                      : index === currentStepIndex
                        ? "bg-[#c9a84c] text-[#1a2744]"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {index < currentStepIndex ? "✓" : index + 1}
                </div>
                <p className="mt-2 text-center text-xs font-medium">{index === currentStepIndex ? "Step " + (index + 1) : ""}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">{currentStep.title}</h2>
          <p className="text-sm text-slate-600 mb-8">{currentStep.description}</p>

          {!hasCurrentCandidates ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-600">
              <p>No candidates added yet for this position</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(currentCandidates).map(([teamName, teamCandidates]) => (
                teamCandidates.length > 0 && (
                  <div key={teamName}>
                    <h3 className="text-lg font-semibold text-[#1a2744] mb-4">{teamName}</h3>
                    <div className="grid gap-6 lg:grid-cols-2">
                      {teamCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          hasVoted={votedPositions.includes(candidate.position_title)}
                          onVote={() => handleVote(candidate)}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
