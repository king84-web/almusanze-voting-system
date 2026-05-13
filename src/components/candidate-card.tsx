"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface CandidateCardProps {
  candidate: {
    id: string;
    full_name: string;
    profile_picture: string | null;
    party_affiliation: string | null;
    previous_leadership: string | null;
    letter_of_intent: string | null;
    bio: string | null;
    position_title: string;
    position_display: string | null;
    running_mate_name: string | null;
    running_mate_picture: string | null;
    running_mate_party: string | null;
    running_mate_previous_leadership: string | null;
    running_mate_letter_of_intent: string | null;
    running_mate_bio: string | null;
  };
  hasVoted: boolean;
  onVote: () => void;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPositionDisplay(title: string): string {
  const titleMap: Record<string, string> = {
    president: "President",
    vice_president: "Vice President",
    general_secretary: "General Secretary",
    financial_secretary: "Financial Secretary",
  };
  return titleMap[title] || title;
}

export default function CandidateCard({ candidate, hasVoted, onVote }: CandidateCardProps) {
  const isPresidentVP = candidate.position_title === "president";
  const positionDisplay = getPositionDisplay(candidate.position_title);

  // Single candidate (GS/FS)
  if (!isPresidentVP) {
    return (
      <motion.article
        layout
        whileHover={!hasVoted ? { y: -4 } : undefined}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        {/* Voted Overlay */}
        {hasVoted && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 size={40} className="text-green-500" />
              <span className="text-sm font-semibold text-[#1a2744]">Voted</span>
            </div>
          </div>
        )}

        {/* Photo - Large Circular */}
        <div className="flex justify-center mb-6">
          {candidate.profile_picture ? (
            <img
              src={candidate.profile_picture}
              alt={candidate.full_name}
              className="h-32 w-32 rounded-full object-cover border-4 border-[#c9a84c]"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#1a2744] text-4xl font-bold text-white border-4 border-[#c9a84c]">
              {getInitials(candidate.full_name)}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-center text-2xl font-bold text-[#1a2744] mb-2">{candidate.full_name}</h3>

        {/* Position Title - Gold */}
        <p className="text-center text-sm font-medium text-[#c9a84c] mb-6">{positionDisplay}</p>

        {/* Divider */}
        <div className="border-t border-slate-200 my-6" />

        {/* Content Section - Show only if fields have values */}
        <div className="space-y-4 mb-6 text-sm text-slate-700">
          {candidate.party_affiliation && (
            <div>
              <p className="font-semibold text-[#1a2744] mb-1">🏛️ Party Affiliation</p>
              <p>{candidate.party_affiliation}</p>
            </div>
          )}

          {candidate.previous_leadership && (
            <div>
              <p className="font-semibold text-[#1a2744] mb-1">📋 Previous Leadership Positions</p>
              <p className="whitespace-pre-wrap">{candidate.previous_leadership}</p>
            </div>
          )}

          {candidate.letter_of_intent && (
            <div>
              <p className="font-semibold text-[#1a2744] mb-1">📝 Letter of Intent</p>
              <p className="whitespace-pre-wrap">{candidate.letter_of_intent}</p>
            </div>
          )}

          {candidate.bio && (
            <div>
              <p className="font-semibold text-[#1a2744] mb-1">👤 Bio</p>
              <p className="whitespace-pre-wrap">{candidate.bio}</p>
            </div>
          )}
        </div>

        {/* Vote Button */}
        <button
          type="button"
          disabled={hasVoted}
          onClick={onVote}
          className="w-full rounded-2xl bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c9a84c] hover:text-[#1a2744] disabled:cursor-not-allowed disabled:opacity-50"
        >
          VOTE FOR THIS CANDIDATE
        </button>
      </motion.article>
    );
  }

  // President & Vice President ticket
  return (
    <motion.article
      layout
      whileHover={!hasVoted ? { y: -4 } : undefined}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {/* Voted Overlay */}
      {hasVoted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 size={40} className="text-green-500" />
            <span className="text-sm font-semibold text-[#1a2744]">Voted</span>
          </div>
        </div>
      )}

      {/* Photos - Side by side */}
      <div className="flex justify-center gap-6 mb-8">
        {/* President Photo */}
        <div className="text-center">
          {candidate.profile_picture ? (
            <img
              src={candidate.profile_picture}
              alt={candidate.full_name}
              className="h-28 w-28 rounded-full object-cover border-4 border-[#c9a84c] mb-2"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#1a2744] text-2xl font-bold text-white border-4 border-[#c9a84c] mb-2">
              {getInitials(candidate.full_name)}
            </div>
          )}
          <p className="text-xs font-bold text-[#1a2744] uppercase">President</p>
          <p className="text-sm font-semibold text-[#1a2744]">{candidate.full_name}</p>
        </div>

        {/* Vice President Photo */}
        <div className="text-center">
          {candidate.running_mate_picture ? (
            <img
              src={candidate.running_mate_picture}
              alt={candidate.running_mate_name || "Vice President"}
              className="h-28 w-28 rounded-full object-cover border-4 border-[#c9a84c] mb-2"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#c9a84c] text-2xl font-bold text-[#1a2744] border-4 border-[#1a2744] mb-2">
              {getInitials(candidate.running_mate_name)}
            </div>
          )}
          <p className="text-xs font-bold text-[#1a2744] uppercase">Vice President</p>
          <p className="text-sm font-semibold text-[#1a2744]">{candidate.running_mate_name}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 my-6" />

      {/* President Details */}
      <div className="mb-6 pb-6 border-b border-slate-200">
        <h4 className="text-lg font-bold text-[#1a2744] mb-3">PRESIDENT</h4>
        <div className="space-y-3 text-sm text-slate-700">
          {candidate.party_affiliation && (
            <div>
              <p className="font-semibold text-[#1a2744]">🏛️ Party: {candidate.party_affiliation}</p>
            </div>
          )}
          {candidate.previous_leadership && (
            <div>
              <p className="font-semibold text-[#1a2744]">📋 Previous Leadership:</p>
              <p className="whitespace-pre-wrap text-slate-700">{candidate.previous_leadership}</p>
            </div>
          )}
          {candidate.letter_of_intent && (
            <div>
              <p className="font-semibold text-[#1a2744]">📝 Letter of Intent:</p>
              <p className="whitespace-pre-wrap text-slate-700">{candidate.letter_of_intent}</p>
            </div>
          )}
          {candidate.bio && (
            <div>
              <p className="font-semibold text-[#1a2744]">👤 Bio:</p>
              <p className="whitespace-pre-wrap text-slate-700">{candidate.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vice President Details */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-[#1a2744] mb-3">VICE PRESIDENT</h4>
        <div className="space-y-3 text-sm text-slate-700">
          {candidate.running_mate_party && (
            <div>
              <p className="font-semibold text-[#1a2744]">🏛️ Party: {candidate.running_mate_party}</p>
            </div>
          )}
          {candidate.running_mate_previous_leadership && (
            <div>
              <p className="font-semibold text-[#1a2744]">📋 Previous Leadership:</p>
              <p className="whitespace-pre-wrap text-slate-700">{candidate.running_mate_previous_leadership}</p>
            </div>
          )}
          {candidate.running_mate_letter_of_intent && (
            <div>
              <p className="font-semibold text-[#1a2744]">📝 Letter of Intent:</p>
              <p className="whitespace-pre-wrap text-slate-700">{candidate.running_mate_letter_of_intent}</p>
            </div>
          )}
          {candidate.running_mate_bio && (
            <div>
              <p className="font-semibold text-[#1a2744]">👤 Bio:</p>
              <p className="whitespace-pre-wrap text-slate-700">{candidate.running_mate_bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vote Button */}
      <button
        type="button"
        disabled={hasVoted}
        onClick={onVote}
        className="w-full rounded-2xl bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c9a84c] hover:text-[#1a2744] disabled:cursor-not-allowed disabled:opacity-50"
      >
        VOTE FOR THIS TICKET
      </button>
    </motion.article>
  );
}
