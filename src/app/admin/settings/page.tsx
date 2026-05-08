"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ElectionSettings {
  election_name: string;
  is_active: boolean;
  voting_start: string | null;
  voting_end: string | null;
  allow_registration: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ElectionSettings>({
    election_name: "",
    is_active: false,
    voting_start: null,
    voting_end: null,
    allow_registration: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/election/settings")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unable to load election settings");
        }
        return res.json();
      })
      .then((data) => {
        setSettings({
          election_name: data.election_name,
          is_active: data.is_active,
          voting_start: data.voting_start,
          voting_end: data.voting_end,
          allow_registration: data.allow_registration,
        });
      })
      .catch(() => {
        setSettings((current) => ({ ...current }));
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function saveSettings() {
    const response = await fetch("/api/election/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      toast.error("Unable to save settings");
      return;
    }

    toast.success("Election settings updated");
  }

  async function resetVotes() {
    const confirmation = prompt("Type RESET to permanently clear all votes.");
    if (confirmation !== "RESET") {
      return;
    }

    const response = await fetch("/api/admin/reset-votes", { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to reset votes");
      return;
    }

    toast.success("All votes reset successfully");
  }

  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Election settings</h1>
        <p className="mt-2 text-sm text-slate-600">Update voting windows, registration policies, and manage election activation.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <label className="block text-sm font-medium text-slate-700">
            Election name
            <input
              value={settings.election_name}
              onChange={(event) => setSettings((current) => ({ ...current, election_name: event.target.value }))}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Voting start
            <input
              type="datetime-local"
              value={settings.voting_start ? settings.voting_start.slice(0, 16) : ""}
              onChange={(event) => setSettings((current) => ({ ...current, voting_start: event.target.value }))}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Voting end
            <input
              type="datetime-local"
              value={settings.voting_end ? settings.voting_end.slice(0, 16) : ""}
              onChange={(event) => setSettings((current) => ({ ...current, voting_end: event.target.value }))}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.is_active}
              onChange={(event) => setSettings((current) => ({ ...current, is_active: event.target.checked }))}
              className="h-5 w-5 rounded border-slate-300 text-[#1a2744] focus:ring-[#c9a84c]"
            />
            Activate election
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.allow_registration}
              onChange={(event) => setSettings((current) => ({ ...current, allow_registration: event.target.checked }))}
              className="h-5 w-5 rounded border-slate-300 text-[#1a2744] focus:ring-[#c9a84c]"
            />
            Allow registration
          </label>
          <button onClick={saveSettings} className="rounded-full bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#1a2744] hover:bg-[#b7a33b]">
            Save settings
          </button>
        </div>

        <div className="rounded-4xl border border-rose-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1a2744]">Danger zone</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Resetting votes will remove all recorded ballots and should only be used when the election is restarted.</p>
          <button
            onClick={resetVotes}
            className="mt-6 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Reset all votes
          </button>
        </div>
      </div>
    </div>
  );
}
