"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function ApplyCandidatePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [values, setValues] = useState({
    full_name: "",
    email: "",
    phone: "",
    team_id: "",
    position_id: "",
    party: "",
    bio: "",
    previous_leadership_positions: "",
    letter_of_intent: "",
    running_mate_name: "",
    image: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    loadMeta().catch(() => {
      setTeams([]);
      setPositions([]);
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !values.full_name ||
      !values.email ||
      !values.phone ||
      !values.team_id ||
      !values.position_id ||
      !values.party ||
      !values.bio ||
      !values.previous_leadership_positions ||
      !values.letter_of_intent ||
      !values.image
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("full_name", values.full_name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("team_id", values.team_id);
    formData.append("position_id", values.position_id);
    formData.append("party", values.party);
    formData.append("bio", values.bio);
    formData.append("previous_leadership_positions", values.previous_leadership_positions);
    formData.append("letter_of_intent", values.letter_of_intent);
    formData.append("running_mate_name", values.running_mate_name);
    formData.append("image", values.image);

    const response = await fetch("/api/candidate-applications", { method: "POST", body: formData });

    setIsSubmitting(false);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Submission failed" }));
      toast.error(error.message ?? "Submission failed");
      return;
    }

    toast.success("Application submitted successfully. You will be contacted by the admin.");
    setValues({
      full_name: "",
      email: "",
      phone: "",
      team_id: "",
      position_id: "",
      party: "",
      bio: "",
      previous_leadership_positions: "",
      letter_of_intent: "",
      running_mate_name: "",
      image: null,
    });
  }

  const teamPositions = positions.filter((pos) => pos.team_id === values.team_id);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f7] px-6 py-10">
      <div className="w-full max-w-2xl rounded-4xl bg-white p-10 shadow-[0_30px_120px_rgba(26,39,68,0.08)]">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Candidate Application</p>
          <h1 className="text-4xl font-semibold text-[#1a2744]">Apply to Contest</h1>
          <p className="text-sm leading-6 text-slate-600">Submit your application to become a candidate in the upcoming elections.</p>
        </div>

        <form className="mt-10 grid gap-6" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Full Name
            <input
              type="text"
              value={values.full_name}
              onChange={(e) => setValues((current) => ({ ...current, full_name: e.target.value }))}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={values.email}
                onChange={(e) => setValues((current) => ({ ...current, email: e.target.value }))}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Phone
              <input
                type="text"
                value={values.phone}
                onChange={(e) => setValues((current) => ({ ...current, phone: e.target.value }))}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Select Team
              <select
                value={values.team_id}
                onChange={(e) => setValues((current) => ({ ...current, team_id: e.target.value, position_id: "" }))}
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
            <label className="block text-sm font-medium text-slate-700">
              Position Contesting For
              <select
                value={values.position_id}
                onChange={(e) => setValues((current) => ({ ...current, position_id: e.target.value }))}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              >
                <option value="">Select position</option>
                {teamPositions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.display_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Party
            <input
              type="text"
              value={values.party}
              onChange={(e) => setValues((current) => ({ ...current, party: e.target.value }))}
              placeholder="Enter your party affiliation"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Passport Size Picture
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setValues((current) => ({ ...current, image: e.target.files?.[0] || null }))}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1a2744] file:text-white hover:file:bg-[#2a3a54]"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Previous Leadership Positions
            <textarea
              value={values.previous_leadership_positions}
              onChange={(e) => setValues((current) => ({ ...current, previous_leadership_positions: e.target.value }))}
              placeholder="List any previous leadership roles you have held"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              rows={4}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Letter of Intent
            <textarea
              value={values.letter_of_intent}
              onChange={(e) => setValues((current) => ({ ...current, letter_of_intent: e.target.value }))}
              placeholder="Explain why you are applying for this position"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              rows={4}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Bio
            <textarea
              value={values.bio}
              onChange={(e) => setValues((current) => ({ ...current, bio: e.target.value }))}
              placeholder="Tell us about yourself and why you want to contest"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              rows={4}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Running Mate Name (Optional)
            <input
              type="text"
              value={values.running_mate_name}
              onChange={(e) => setValues((current) => ({ ...current, running_mate_name: e.target.value }))}
              placeholder="Name of your running mate if applicable"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-[#1a2744] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#16203b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </main>
  );
}