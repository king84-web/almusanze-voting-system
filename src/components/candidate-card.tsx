"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Users } from "lucide-react";

interface CandidateCardProps {
  candidate: {
    id: string;
    full_name: string;
    profile_picture: string | null;
    team_name: string | null;
    position_display: string | null;
    bio: string;
    running_mate_name: string | null;
    running_mate_picture: string | null;
  };
  hasVoted: boolean;
  onVote: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function CandidateCard({ candidate, hasVoted, onVote }: CandidateCardProps) {
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {hasVoted ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-[#1a2744]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#1a2744]">
            <CheckCircle2 size={18} /> Voted ✓
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-4">
        {candidate.profile_picture ? (
          <img src={candidate.profile_picture} alt={candidate.full_name} className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#c9a84c] text-2xl font-bold text-[#1a2744]">
            {initials(candidate.full_name)}
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a84c]">{candidate.team_name ?? "Team"}</p>
          <h3 className="text-xl font-semibold text-[#1a2744]">{candidate.full_name}</h3>
          <p className="text-sm text-slate-600">{candidate.position_display ?? "Candidate"}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">{candidate.bio}</p>

      {candidate.running_mate_name ? (
        <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Running Mate</p>
          <p>{candidate.running_mate_name}</p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={hasVoted}
        onClick={onVote}
        className="mt-6 w-full rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-[#1a2744] transition hover:bg-[#b7a33b] disabled:cursor-not-allowed disabled:bg-slate-200"
      >
        {hasVoted ? "Already Voted" : "Vote"}
      </button>
    </motion.article>
  );
}
