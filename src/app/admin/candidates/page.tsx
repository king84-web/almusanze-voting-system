"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  display_name: string;
}

interface Candidate {
  id: string;
  full_name: string;
  profile_picture: string | null;
  party_affiliation: string | null;
  previous_leadership: string | null;
  letter_of_intent: string | null;
  bio: string | null;
  running_mate_name: string | null;
  running_mate_picture: string | null;
  running_mate_party: string | null;
  position_title: string;
  team_name: string;
}

interface CandidateFormData {
  // Main candidate
  full_name: string;
  profile_picture: File | null;
  profile_picture_preview: string;
  party_affiliation: string;
  previous_leadership: string;
  letter_of_intent: string;
  bio: string;

  // Running mate (President/VP only)
  running_mate_name: string;
  running_mate_picture: File | null;
  running_mate_picture_preview: string;
  running_mate_party: string;
  running_mate_previous_leadership: string;
  running_mate_letter_of_intent: string;
  running_mate_bio: string;
}

export default function AdminCandidatesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CandidateFormData>({
    full_name: "",
    profile_picture: null,
    profile_picture_preview: "",
    party_affiliation: "",
    previous_leadership: "",
    letter_of_intent: "",
    bio: "",
    running_mate_name: "",
    running_mate_picture: null,
    running_mate_picture_preview: "",
    running_mate_party: "",
    running_mate_previous_leadership: "",
    running_mate_letter_of_intent: "",
    running_mate_bio: "",
  });

  const positions: Position[] = [
    { id: "president", title: "president", display_name: "President & Vice President" },
    { id: "general_secretary", title: "general_secretary", display_name: "General Secretary" },
    { id: "financial_secretary", title: "financial_secretary", display_name: "Financial Secretary" },
  ];

  const selectedPosition = positions.find((p) => p.id === selectedPositionId);
  const isPresidentVP = selectedPositionId === "president";

  useEffect(() => {
    loadTeams();
    loadCandidates();
  }, []);

  async function loadTeams() {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
    }
  }

  async function loadCandidates() {
    try {
      const res = await fetch("/api/candidates");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error("Failed to load candidates:", error);
    }
  }

  function handlePhotoChange(file: File | null, isRunningMate: boolean) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (isRunningMate) {
        setFormData((prev) => ({
          ...prev,
          running_mate_picture: file,
          running_mate_picture_preview: e.target?.result as string,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          profile_picture: file,
          profile_picture_preview: e.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!selectedTeamId || !selectedPositionId) {
        toast.error("Please select a team and position");
        return;
      }

      if (!formData.full_name.trim()) {
        toast.error("Full name is required");
        return;
      }

      if (!formData.profile_picture) {
        toast.error("Profile picture is required");
        return;
      }

      if (isPresidentVP) {
        if (!formData.running_mate_name.trim()) {
          toast.error("Running mate name is required");
          return;
        }
        if (!formData.running_mate_picture) {
          toast.error("Running mate picture is required");
          return;
        }
      }

      const form = new FormData();
      form.append("team_id", selectedTeamId);
      form.append("position_id", selectedPositionId);
      form.append("full_name", formData.full_name);
      if (formData.profile_picture) {
        form.append("profile_picture", formData.profile_picture);
      }
      form.append("party_affiliation", formData.party_affiliation);
      form.append("previous_leadership", formData.previous_leadership);
      form.append("letter_of_intent", formData.letter_of_intent);
      form.append("bio", formData.bio);

      if (isPresidentVP) {
        form.append("running_mate_name", formData.running_mate_name);
        if (formData.running_mate_picture) {
          form.append("running_mate_picture", formData.running_mate_picture);
        }
        form.append("running_mate_party", formData.running_mate_party);
        form.append("running_mate_previous_leadership", formData.running_mate_previous_leadership);
        form.append("running_mate_letter_of_intent", formData.running_mate_letter_of_intent);
        form.append("running_mate_bio", formData.running_mate_bio);
      }

      const res = await fetch("/api/candidates", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Failed to add candidate");
        return;
      }

      toast.success("Candidate added successfully!");

      // Reset form
      setFormData({
        full_name: "",
        profile_picture: null,
        profile_picture_preview: "",
        party_affiliation: "",
        previous_leadership: "",
        letter_of_intent: "",
        bio: "",
        running_mate_name: "",
        running_mate_picture: null,
        running_mate_picture_preview: "",
        running_mate_party: "",
        running_mate_previous_leadership: "",
        running_mate_letter_of_intent: "",
        running_mate_bio: "",
      });
      setSelectedPositionId("");

      await loadCandidates();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteCandidate(id: string) {
    if (!confirm("Delete this candidate?")) return;

    try {
      const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Candidate deleted");
      await loadCandidates();
    } catch (error) {
      toast.error("Failed to delete candidate");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Candidates</h1>
        <p className="mt-3 text-sm text-slate-600">Add and manage candidates for elections.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        {/* Add Candidate Form */}
        <form onSubmit={handleSubmit} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-[#1a2744]">Add Candidate</h2>

          {teams.length === 0 ? (
            <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-900">
                No teams found.{" "}
                <a href="/admin/teams" className="font-semibold underline">
                  Create teams first
                </a>
              </p>
            </div>
          ) : null}

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Team *</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            >
              <option value="">Choose a team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Position Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Position *</label>
            <select
              value={selectedPositionId}
              onChange={(e) => setSelectedPositionId(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            >
              <option value="">Choose a position...</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.display_name}
                </option>
              ))}
            </select>
          </div>

          {selectedPositionId && (
            <>
              {/* Main Candidate Section */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-[#1a2744] mb-4">
                  {isPresidentVP ? "PRESIDENT" : selectedPosition?.display_name}
                </h3>

                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                </div>

                {/* Profile Picture */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Passport Photo *</label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoChange(e.target.files?.[0] || null, false)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1a2744] file:text-white hover:file:bg-[#2a3a54]"
                      />
                    </div>
                    {formData.profile_picture_preview && (
                      <img
                        src={formData.profile_picture_preview}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover border-2 border-[#c9a84c]"
                      />
                    )}
                  </div>
                </div>

                {/* Party Affiliation */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Party Affiliation</label>
                  <input
                    type="text"
                    value={formData.party_affiliation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, party_affiliation: e.target.value }))}
                    placeholder="Enter party affiliation"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                </div>

                {/* Previous Leadership */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Previous Leadership Positions</label>
                  <textarea
                    value={formData.previous_leadership}
                    onChange={(e) => setFormData((prev) => ({ ...prev, previous_leadership: e.target.value }))}
                    placeholder="Enter previous leadership positions"
                    rows={2}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 resize-none"
                  />
                </div>

                {/* Letter of Intent */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Letter of Intent</label>
                  <textarea
                    value={formData.letter_of_intent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, letter_of_intent: e.target.value }))}
                    placeholder="Enter letter of intent"
                    rows={2}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 resize-none"
                  />
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Enter candidate bio"
                    rows={2}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 resize-none"
                  />
                </div>
              </div>

              {/* Running Mate Section (President/VP only) */}
              {isPresidentVP && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-[#1a2744] mb-4">VICE PRESIDENT</h3>

                  {/* Running Mate Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.running_mate_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, running_mate_name: e.target.value }))}
                      placeholder="Enter running mate full name"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                    />
                  </div>

                  {/* Running Mate Photo */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Passport Photo *</label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoChange(e.target.files?.[0] || null, true)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1a2744] file:text-white hover:file:bg-[#2a3a54]"
                        />
                      </div>
                      {formData.running_mate_picture_preview && (
                        <img
                          src={formData.running_mate_picture_preview}
                          alt="Preview"
                          className="h-20 w-20 rounded-full object-cover border-2 border-[#c9a84c]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Running Mate Party */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Party Affiliation</label>
                    <input
                      type="text"
                      value={formData.running_mate_party}
                      onChange={(e) => setFormData((prev) => ({ ...prev, running_mate_party: e.target.value }))}
                      placeholder="Enter party affiliation"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                    />
                  </div>

                  {/* Running Mate Previous Leadership */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Previous Leadership Positions</label>
                    <textarea
                      value={formData.running_mate_previous_leadership}
                      onChange={(e) => setFormData((prev) => ({ ...prev, running_mate_previous_leadership: e.target.value }))}
                      placeholder="Enter previous leadership positions"
                      rows={2}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 resize-none"
                    />
                  </div>

                  {/* Running Mate Letter of Intent */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Letter of Intent</label>
                    <textarea
                      value={formData.running_mate_letter_of_intent}
                      onChange={(e) => setFormData((prev) => ({ ...prev, running_mate_letter_of_intent: e.target.value }))}
                      placeholder="Enter letter of intent"
                      rows={2}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 resize-none"
                    />
                  </div>

                  {/* Running Mate Bio */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={formData.running_mate_bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, running_mate_bio: e.target.value }))}
                      placeholder="Enter bio"
                      rows={2}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2a3a54] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Adding..." : "Add Candidate"}
              </button>
            </>
          )}
        </form>

        {/* Candidates List */}
        <div className="space-y-4">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1a2744] mb-6">All Candidates ({candidates.length})</h2>

            {candidates.length === 0 ? (
              <p className="text-sm text-slate-500">No candidates added yet.</p>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition">
                    <div className="flex gap-4">
                      <div className="flex gap-3 flex-1">
                        {/* Main Photo */}
                        {candidate.profile_picture ? (
                          <img
                            src={candidate.profile_picture}
                            alt={candidate.full_name}
                            className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-[#1a2744] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {candidate.full_name
                              .split(" ")
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")}
                          </div>
                        )}

                        {/* Running Mate Photo (if exists) */}
                        {candidate.running_mate_picture && (
                          <>
                            <div className="text-slate-400">+</div>
                            {candidate.running_mate_picture ? (
                              <img
                                src={candidate.running_mate_picture}
                                alt={candidate.running_mate_name || "Running Mate"}
                                className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#1a2744] text-xs font-bold flex-shrink-0">
                                {candidate.running_mate_name
                                  ?.split(" ")
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")}
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1a2744] truncate">
                            {candidate.full_name}
                            {candidate.running_mate_name && ` + ${candidate.running_mate_name}`}
                          </p>
                          <p className="text-xs text-slate-600">{candidate.position_title.replace(/_/g, " ")}</p>
                          <p className="text-xs text-slate-500">{candidate.team_name}</p>
                          {candidate.party_affiliation && (
                            <p className="text-xs text-slate-500">{candidate.party_affiliation}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCandidate(candidate.id)}
                          className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
