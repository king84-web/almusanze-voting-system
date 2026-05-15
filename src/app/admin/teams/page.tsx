"use client"

import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

interface Team {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadTeams = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/teams")
      if (!res.ok) {
        throw new Error("Unable to load teams")
      }
      const data = await res.json()
      setTeams(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  const resetForm = () => {
    setName("")
    setDescription("")
    setEditingTeam(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Team name is required")
      return
    }

    setSaving(true)
    try {
      const payload = { name: name.trim(), description: description.trim() || null }
      const target = editingTeam ? `/api/teams/${editingTeam.id}` : "/api/teams"
      const method = editingTeam ? "PUT" : "POST"

      const res = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Unable to save team")
        return
      }

      if (editingTeam) {
        setTeams((prev) => prev.map((team) => (team.id === data.id ? data : team)))
        toast.success("Team updated")
      } else {
        setTeams((prev) => [data, ...prev])
        toast.success("Team created")
      }

      resetForm()
    } catch (error) {
      console.error(error)
      toast.error("Error saving team")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setName(team.name)
    setDescription(team.description ?? "")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team? This cannot be undone.")) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/teams/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Unable to delete team")
        return
      }
      setTeams((prev) => prev.filter((team) => team.id !== id))
      toast.success("Team deleted")
      if (editingTeam?.id === id) {
        resetForm()
      }
    } catch (error) {
      console.error(error)
      toast.error("Error deleting team")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Teams</h1>
          <p className="text-gray-500">Create and manage election teams for candidate assignments.</p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1a2744]">{editingTeam ? "Edit team" : "Create team"}</h2>
            <p className="text-sm text-slate-500">Teams group candidates and help organize the ballot.</p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Team name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/30"
                placeholder="E.g. Unity Front"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/30"
                placeholder="Optional team description"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#1a2744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#162038] disabled:opacity-50"
            >
              {saving ? (editingTeam ? "Saving..." : "Creating...") : editingTeam ? "Save changes" : "Create team"}
            </button>
            {editingTeam ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1a2744]">Team list</h2>
            <p className="text-sm text-slate-500">View existing teams and update or remove them as needed.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
            {teams.length} teams
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-16 rounded-3xl bg-slate-100" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            <p className="text-lg font-semibold">No teams created yet</p>
            <p className="mt-2 text-sm">Use the form above to create your first election team.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 font-semibold">Team</th>
                  <th className="px-4 py-4 font-semibold">Description</th>
                  <th className="px-4 py-4 font-semibold">Created</th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-[#1a2744]">{team.name}</td>
                    <td className="px-4 py-4 text-slate-600">{team.description || "—"}</td>
                    <td className="px-4 py-4 text-slate-500">{new Date(team.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(team)}
                        className="rounded-full bg-[#c9a84c] px-4 py-2 text-xs font-semibold text-[#1a2744] transition hover:bg-[#b7983f]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(team.id)}
                        disabled={deletingId === team.id}
                        className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === team.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
