"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface Candidate {
  id: string;
  full_name: string;
  profile_picture: string | null;
  team_name: string | null;
  position_id: string;
  position_title: string;
  position_display: string | null;
  bio: string;
  running_mate_name: string | null;
}

interface Team {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  display_name: string;
  team_id: string;
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [values, setValues] = useState({
    team_id: "",
    candidates: [
      { full_name: "", bio: "", image: null as File | null },
      { full_name: "", bio: "", image: null as File | null },
      { full_name: "", bio: "", image: null as File | null },
      { full_name: "", bio: "", image: null as File | null },
    ],
  });

  const positionTitles = ["President", "Vice President", "General Secretary", "Financial Secretary"];

  async function loadCandidates() {
    const response = await fetch("/api/candidates");
    if (!response.ok) return;
    const data = await response.json();
    setCandidates(data);
  }

  async function loadMeta() {
    const [teamsResponse, positionsResponse] = await Promise.all([
      fetch("/api/teams"),
      fetch("/api/positions"),
    ]);

    if (teamsResponse.ok) {
      setTeams(await teamsResponse.json());
    }

    if (positionsResponse.ok) {
      setPositions(await positionsResponse.json());
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadCandidates();
      } catch {
        setCandidates([]);
      }
      try {
        await loadMeta();
      } catch {
        setTeams([]);
        setPositions([]);
      }
    };
    loadData();
  }, []);

  async function addCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.team_id) {
      toast.error("Please select a team");
      return;
    }

    // Check if at least one candidate has data
    const hasCandidates = values.candidates.some(candidate => candidate.full_name && candidate.bio && candidate.image);
    if (!hasCandidates) {
      toast.error("Please add at least one candidate with name, bio, and photo");
      return;
    }

    try {
      // Get positions for the selected team
      const teamPositions = positions.filter(pos => pos.team_id === values.team_id);

      for (let i = 0; i < values.candidates.length; i++) {
        const candidate = values.candidates[i];
        if (!candidate.full_name || !candidate.bio || !candidate.image) continue;

        const position = teamPositions.find(pos => pos.display_name === positionTitles[i]);
        if (!position) {
          toast.error(`Position ${positionTitles[i]} not found for this team`);
          continue;
        }

        const formData = new FormData();
        formData.append("full_name", candidate.full_name);
        formData.append("position_id", position.id);
        formData.append("team_id", values.team_id);
        formData.append("bio", candidate.bio);
        formData.append("image", candidate.image);

        const response = await fetch("/api/candidates", { method: "POST", body: formData });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: "Upload failed" }));
          toast.error(`Failed to add ${candidate.full_name}: ${error.message}`);
          continue;
        }

        toast.success(`${candidate.full_name} added successfully`);
      }

      // Reset form
      setValues({
        team_id: "",
        candidates: [
          { full_name: "", bio: "", image: null },
          { full_name: "", bio: "", image: null },
          { full_name: "", bio: "", image: null },
          { full_name: "", bio: "", image: null },
        ],
      });
      loadCandidates().catch(() => setCandidates([]));
    } catch (error) {
      toast.error("Failed to add candidates");
    }
  }

  async function deleteCandidate(candidateId: string) {
    if (!window.confirm("Delete this candidate?")) {
      return;
    }

    const response = await fetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete candidate");
      return;
    }

    toast.success("Candidate deleted");
    setCandidates((current) => current.filter((candidate) => candidate.id !== candidateId));
  }

  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Candidates</h1>
        <p className="mt-3 text-sm text-slate-600">Create and manage candidates for ongoing elections.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_1.5fr]">
        <form onSubmit={addCandidate} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-[#1a2744]">Add Team Candidates</h2>

          <label className="block text-sm font-medium text-slate-700">
            Select Team
            <select
              value={values.team_id}
              onChange={(e) => setValues((current) => ({ ...current, team_id: e.target.value }))}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          {values.team_id && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-[#1a2744]">Add Candidates for {teams.find(t => t.id === values.team_id)?.name}</h3>

              {values.candidates.map((candidate, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                  <h4 className="text-md font-semibold text-[#1a2744]">{positionTitles[index]}</h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Candidate Name
                      <input
                        type="text"
                        value={candidate.full_name}
                        onChange={(e) => {
                          const newCandidates = [...values.candidates];
                          newCandidates[index].full_name = e.target.value;
                          setValues((current) => ({ ...current, candidates: newCandidates }));
                        }}
                        placeholder={`Enter ${positionTitles[index]} name`}
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                      />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Profile Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const newCandidates = [...values.candidates];
                          newCandidates[index].image = e.target.files?.[0] || null;
                          setValues((current) => ({ ...current, candidates: newCandidates }));
                        }}
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1a2744] file:text-white hover:file:bg-[#2a3a54]"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-slate-700">
                    Bio
                    <textarea
                      value={candidate.bio}
                      onChange={(e) => {
                        const newCandidates = [...values.candidates];
                        newCandidates[index].bio = e.target.value;
                        setValues((current) => ({ ...current, candidates: newCandidates }));
                      }}
                      placeholder={`Bio for ${positionTitles[index]}`}
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                      rows={3}
                    />
                  </label>
                </div>
              ))}

              <button
                type="submit"
                className="w-full rounded-3xl bg-[#1a2744] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#2a3a54] focus:ring-2 focus:ring-[#c9a84c]/30"
              >
                Add Team Candidates
              </button>
            </div>
          )}
        </form>

        <div className="space-y-6">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1a2744]">Candidates</h2>
            <div className="mt-6 space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#1a2744]">{candidate.full_name}</p>
                      <p className="text-sm text-slate-600">{candidate.position_display || candidate.position_title}</p>
                      <p className="text-sm text-slate-500">{candidate.team_name || "No team"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-full bg-[#1a2744] px-4 py-2 text-xs font-semibold text-white">Edit</button>
                      <button
                        type="button"
                        onClick={() => deleteCandidate(candidate.id)}
                        className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
