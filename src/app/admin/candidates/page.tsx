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
  is_combined: boolean;
}

interface CandidateFormValues {
  full_name: string;
  bio: string;
  image: File | null;
  position_id: string;
  running_mate_name: string;
  running_mate_image: File | null;
}

interface CandidateApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  team_name: string | null;
  position_display: string | null;
  party: string;
  bio: string;
  previous_leadership_positions: string;
  letter_of_intent: string;
  profile_picture: string | null;
  status: string;
  created_at: string;
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [teamPositions, setTeamPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [values, setValues] = useState({
    team_id: "",
    candidates: [
      { full_name: "", bio: "", image: null as File | null, position_id: "", running_mate_name: "", running_mate_image: null as File | null },
      { full_name: "", bio: "", image: null as File | null, position_id: "", running_mate_name: "", running_mate_image: null as File | null },
      { full_name: "", bio: "", image: null as File | null, position_id: "", running_mate_name: "", running_mate_image: null as File | null },
      { full_name: "", bio: "", image: null as File | null, position_id: "", running_mate_name: "", running_mate_image: null as File | null },
    ] as CandidateFormValues[],
  });

  async function loadCandidates() {
    const response = await fetch("/api/candidates");
    if (!response.ok) return;
    const data = await response.json();
    setCandidates(data);
  }

  async function loadApplications() {
    const response = await fetch("/api/candidate-applications");
    if (!response.ok) return;
    const data = await response.json();
    setApplications(data);
  }

  async function loadMeta() {
    const teamsResponse = await fetch("/api/teams");
    if (teamsResponse.ok) {
      setTeams(await teamsResponse.json());
    }
  }

  async function loadPositionsForTeam(teamId: string) {
    if (!teamId) {
      setTeamPositions([]);
      return;
    }
    setLoadingPositions(true);
    try {
      const response = await fetch(`/api/positions?team_id=${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamPositions(data);
      } else {
        setTeamPositions([]);
      }
    } catch {
      setTeamPositions([]);
    } finally {
      setLoadingPositions(false);
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
        await loadApplications();
      } catch {
        setApplications([]);
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

  useEffect(() => {
    loadPositionsForTeam(values.team_id);
  }, [values.team_id]);

  async function addCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.team_id) {
      toast.error("Please select a team");
      return;
    }

    if (teamPositions.length === 0) {
      if (loadingPositions) {
        toast.error("Loading positions...");
        return;
      } else {
        toast.error("No positions found for the selected team. Run db:seed first.");
        return;
      }
    }

    const hasCandidates = values.candidates.some(
      (candidate) => candidate.full_name && candidate.bio && candidate.image && candidate.position_id,
    );
    if (!hasCandidates) {
      toast.error("Please add at least one candidate with name, bio, photo, and position");
      return;
    }

    try {
      for (const candidate of values.candidates) {
        if (!candidate.full_name || !candidate.bio || !candidate.image) continue;
        if (!candidate.position_id) {
          toast.error(`Please select a position for ${candidate.full_name || "one of the candidates"}`);
          continue;
        }

        const position = teamPositions.find((pos) => pos.id === candidate.position_id);
        if (!position) {
          toast.error(`Selected position is not valid for the chosen team.`);
          continue;
        }

        const formData = new FormData();
        formData.append("full_name", candidate.full_name);
        formData.append("position_id", candidate.position_id);
        formData.append("team_id", values.team_id);
        formData.append("bio", candidate.bio);
        formData.append("image", candidate.image);
        if (candidate.running_mate_name) {
          formData.append("running_mate_name", candidate.running_mate_name);
        }
        if (candidate.running_mate_image) {
          formData.append("running_mate_image", candidate.running_mate_image);
        }

        const response = await fetch("/api/candidates", { method: "POST", body: formData });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: "Upload failed" }));
          toast.error(`Failed to add ${candidate.full_name}: ${error.message}`);
          continue;
        }

        toast.success(`${candidate.full_name} added successfully`);
      }

      setValues({
        team_id: "",
        candidates: [
          { full_name: "", bio: "", image: null, position_id: "", running_mate_name: "", running_mate_image: null },
          { full_name: "", bio: "", image: null, position_id: "", running_mate_name: "", running_mate_image: null },
          { full_name: "", bio: "", image: null, position_id: "", running_mate_name: "", running_mate_image: null },
          { full_name: "", bio: "", image: null, position_id: "", running_mate_name: "", running_mate_image: null },
        ],
      });
      loadCandidates().catch(() => setCandidates([]));
    } catch {
      toast.error("Failed to add candidates");
    }
  }

  async function approveApplication(applicationId: string) {
    const response = await fetch(`/api/candidate-applications/${applicationId}/approve`, { method: "POST" });
    if (!response.ok) {
      toast.error("Failed to approve application");
      return;
    }
    toast.success("Application approved and candidate added");
    loadApplications().catch(() => setApplications([]));
    loadCandidates().catch(() => setCandidates([]));
  }

  async function rejectApplication(applicationId: string) {
    const response = await fetch(`/api/candidate-applications/${applicationId}/reject`, { method: "POST" });
    if (!response.ok) {
      toast.error("Failed to reject application");
      return;
    }
    toast.success("Application rejected");
    loadApplications().catch(() => setApplications([]));
  }

  async function deleteCandidate(candidateId: string) {
    const response = await fetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete candidate");
      return;
    }
    toast.success("Candidate removed");
    loadCandidates().catch(() => setCandidates([]));
  }

  function generateApplicationLink() {
    const link = `${window.location.origin}/apply-candidate`;
    navigator.clipboard.writeText(link);
    toast.success("Application link copied to clipboard");
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
            Team Name
            <select
              value={values.team_id}
              onChange={(e) => {
                setValues((current) => ({
                  ...current,
                  team_id: e.target.value,
                  candidates: current.candidates.map((candidate) => ({
                    ...candidate,
                    position_id: "",
                  })),
                }));
              }}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
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
              <h3 className="text-lg font-medium text-[#1a2744]">Add Candidates for {teams.find((t) => t.id === values.team_id)?.name}</h3>

              {values.candidates.map((candidate, index) => {

                return (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-md font-semibold text-[#1a2744]">Candidate {index + 1}</h4>
                      <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-medium text-[#1a2744]">Position contesting for</span>
                    </div>

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
                          placeholder={`Enter Candidate ${index + 1} name`}
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

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Position Contesting For
                        <select
                          value={candidate.position_id}
                          onChange={(e) => {
                            const newCandidates = [...values.candidates];
                            newCandidates[index].position_id = e.target.value;
                            setValues((current) => ({ ...current, candidates: newCandidates }));
                          }}
                          className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                        >
                          <option value="">Select position</option>
                          {teamPositions.map((position) => (
                            <option key={position.id} value={position.id}>
                              {position.display_name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Bio
                        <textarea
                          value={candidate.bio}
                          onChange={(e) => {
                            const newCandidates = [...values.candidates];
                            newCandidates[index].bio = e.target.value;
                            setValues((current) => ({ ...current, candidates: newCandidates }));
                          }}
                          placeholder="Enter candidate bio"
                          className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                          rows={3}
                        />
                      </label>
                    </div>

                    {(() => {
                      const selectedPosition = teamPositions.find(p => p.id === candidate.position_id);
                      if (selectedPosition?.is_combined) {
                        return (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Running Mate Name
                              <input
                                type="text"
                                value={candidate.running_mate_name}
                                onChange={(e) => {
                                  const newCandidates = [...values.candidates];
                                  newCandidates[index].running_mate_name = e.target.value;
                                  setValues((current) => ({ ...current, candidates: newCandidates }));
                                }}
                                placeholder="Enter running mate name"
                                className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                              />
                            </label>
                            <label className="block text-sm font-medium text-slate-700">
                              Running Mate Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const newCandidates = [...values.candidates];
                                  newCandidates[index].running_mate_image = e.target.files?.[0] || null;
                                  setValues((current) => ({ ...current, candidates: newCandidates }));
                                }}
                                className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1a2744] file:text-white hover:file:bg-[#2a3a54]"
                              />
                            </label>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                );
              })}

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

          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1a2744]">Candidate Applications</h2>
              <button
                type="button"
                onClick={generateApplicationLink}
                className="rounded-full bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#1a2744] hover:bg-[#b8953a]"
              >
                Generate Link
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#1a2744]">{application.full_name}</p>
                      <p className="text-sm text-slate-600">{application.position_display}</p>
                      <p className="text-sm text-slate-500">{application.team_name}</p>
                      <p className="text-xs text-slate-400">{application.email} • {application.phone}</p>
                      <p className="mt-2 text-sm text-slate-600"><span className="font-semibold">Party:</span> {application.party}</p>
                      <p className="text-sm text-slate-600"><span className="font-semibold">Previous leadership:</span> {application.previous_leadership_positions}</p>
                      <p className="text-sm text-slate-600"><span className="font-semibold">Letter of intent:</span> {application.letter_of_intent}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {application.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveApplication(application.id)}
                            className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectApplication(application.id)}
                            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {application.status === "approved" && (
                        <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-800">Approved</span>
                      )}
                      {application.status === "rejected" && (
                        <span className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-800">Rejected</span>
                      )}
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
