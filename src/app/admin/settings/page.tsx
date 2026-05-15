"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    election_name: "",
    is_active: false,
    allow_registration: true,
    voting_start: "",
    voting_end: "",
  })

  useEffect(() => {
    fetch("/api/election/settings")
      .then(res => res.json())
      .then(data => {
        console.log("Loaded settings:", data)
        setSettings({
          election_name: data.election_name || "",
          is_active: data.is_active || false,
          allow_registration: data.allow_registration ?? true,
          voting_start: data.voting_start
            ? new Date(data.voting_start).toISOString().slice(0, 16)
            : "",
          voting_end: data.voting_end
            ? new Date(data.voting_end).toISOString().slice(0, 16)
            : "",
        })
      })
      .catch(err => {
        console.error("Settings load error:", err)
        toast.error("Failed to load settings")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/election/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await res.json()
      console.log("Save response:", data)

      if (!res.ok) {
        toast.error("Failed to save: " + (data.error || "Unknown error"))
        return
      }

      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const copyRegistrationLink = () => {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/register`
    navigator.clipboard.writeText(link)
    toast.success("Registration link copied!")
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/2"/>
          <div className="h-10 bg-gray-200 rounded"/>
          <div className="h-10 bg-gray-200 rounded"/>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">
        Election Settings
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Configure election details and voting window
      </p>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">

        {/* Election Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Election Name
          </label>
          <input
            type="text"
            value={settings.election_name}
            onChange={e => setSettings(s => ({
              ...s, election_name: e.target.value
            }))}
            placeholder="ALM General Elections 2025"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
        </div>

        {/* Voting Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voting Start
          </label>
          <input
            type="datetime-local"
            value={settings.voting_start}
            onChange={e => setSettings(s => ({
              ...s, voting_start: e.target.value
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
        </div>

        {/* Voting End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voting End
          </label>
          <input
            type="datetime-local"
            value={settings.voting_end}
            onChange={e => setSettings(s => ({
              ...s, voting_end: e.target.value
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4
            bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Activate Election</p>
              <p className="text-sm text-gray-500">
                Allow members to cast votes
              </p>
            </div>
            <button
              onClick={() => setSettings(s => ({
                ...s, is_active: !s.is_active
              }))}
              className={`relative w-12 h-6 rounded-full transition-colors
                ${settings.is_active ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full
                shadow transition-transform
                ${settings.is_active ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4
            bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Allow Registration</p>
              <p className="text-sm text-gray-500">
                Allow new members to register
              </p>
            </div>
            <button
              onClick={() => setSettings(s => ({
                ...s, allow_registration: !s.allow_registration
              }))}
              className={`relative w-12 h-6 rounded-full transition-colors
                ${settings.allow_registration
                  ? "bg-green-500"
                  : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full
                shadow transition-transform
                ${settings.allow_registration
                  ? "translate-x-7"
                  : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#1a2744] text-white py-3 rounded-lg
            font-semibold hover:bg-[#c9a84c] hover:text-[#1a2744]
            transition-all disabled:opacity-50 flex items-center
            justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"
                fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            </>
          ) : "Save Settings"}
        </button>
      </div>

      {/* Copy Registration Link */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="font-bold text-[#1a2744] mb-1">
          Member Registration Link
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Share this link with members to register
        </p>
        <div className="flex gap-3">
          <input
            readOnly
            value={`${process.env.NEXT_PUBLIC_APP_URL}/register`}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200
              rounded-lg text-sm text-gray-600"
          />
          <button
            onClick={copyRegistrationLink}
            className="bg-[#c9a84c] text-[#1a2744] px-4 py-2 rounded-lg
              font-medium hover:bg-[#1a2744] hover:text-white transition-all"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow p-6 mt-6
        border border-red-100">
        <h2 className="font-bold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Resetting votes will remove all recorded ballots.
          This cannot be undone.
        </p>
        <button
          onClick={() => {
            if (confirm(
              "Are you sure? This will delete ALL votes permanently!"
            )) {
              if (confirm("This cannot be undone. Confirm reset?")) {
                fetch("/api/admin/reset-votes", { method: "POST" })
                  .then(r => r.json())
                  .then(() => toast.success("All votes reset"))
                  .catch(() => toast.error("Reset failed"))
              }
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg
            hover:bg-red-700 transition-all text-sm"
        >
          Reset All Votes
        </button>
      </div>
    </div>
  )
}
