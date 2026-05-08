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
    full_name: "",
    position_id: "",
    team_id: "",
    bio: "",
    running_mate_name: "",
    image: null as File | null,
  });

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
    loadCandidates().catch(() => {
      setCandidates([]);
    });
    loadMeta().catch(() => {
      setTeams([]);
      setPositions([]);
    });
  }, []);

  async function addCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.image) {
      toast.error("Please upload a photo");
      return;
    }

    if (!values.full_name || !values.position_id || !values.team_id || !values.bio) {
      toast.error("Please complete all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("full_name", values.full_name);
    formData.append("position_id", values.position_id);
    formData.append("team_id", values.team_id);
    formData.append("bio", values.bio);
    formData.append("running_mate_name", values.running_mate_name);
    formData.append("image", values.image);

    const response = await fetch("/api/candidates", { method: "POST", body: formData });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Candidate upload failed" }));
      toast.error(error.message ?? "Candidate upload failed");
      return;
    }

    toast.success("Candidate created");
    setValues({ full_name: "", position_id: "", team_id: "", bio: "", running_mate_name: "", image: null });
    loadCandidates().catch(() => setCandidates([]));
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
        <form onSubmit={addCandidate} className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-semibold text-[#1a2744]">Add candidate</h2>
          <label className="block text-sm font-medium text-slate-700">
            Candidate name
            <input
              type="text"
              value={values.full_name}
              onChange={(e) => setValues((current) => ({ ...current, full_name: e.target.value }))}
              placeholder="Full name"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Candidate bio
            <textarea
              value={values.bio}
              onChange={(e) => setValues((current) => ({ ...current, bio: e.target.value }))}
              placeholder="Bio"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              rows={4}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Position
              <select
                value={values.position_id}
                onChange={(e) => setValues((current) => ({ ...current, position_id: e.target.value }))}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              >
                <option value="">Select position</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.display_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Team
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
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Running mate
            <input
              type="text"
              value={values.running_mate_name}
              onChange={(e) => setValues((current) => ({ ...current, running_mate_name: e.target.value }))}
              placeholder="Running mate name"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Profile photo
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setValues((current) => ({ ...current, image: file }));
              }}
              className="mt-2 w-full text-sm text-slate-600"
            />
          </label>
          <button type="submit" className="rounded-full bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#1a2744] hover:bg-[#b7a33b]">
            Save candidate
          </button>
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
