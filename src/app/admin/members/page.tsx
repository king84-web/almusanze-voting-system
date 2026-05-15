"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

interface Member {
  id: string
  full_name: string
  email: string
  phone: string
  member_id: string
  is_approved: boolean
  vote_count: number
  created_at: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all"|"pending"|"approved">("all")
  const [search, setSearch] = useState("")
  const [approvingId, setApprovingId] = useState<string|null>(null)
  const [deletingId, setDeletingId] = useState<string|null>(null)

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/members")
      if (!res.ok) {
        const err = await res.json()
        console.error("Members fetch error:", err)
        toast.error("Failed to load members: " + (err.error || "Unknown error"))
        return
      }
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Network error loading members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleApprove = async (id: string) => {
    setApprovingId(id)
    try {
      const res = await fetch(`/api/members/${id}/approve`, {
        method: "PATCH",
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error("Failed to approve: " + (data.error || "Unknown error"))
        return
      }

      setMembers((prev) => prev.map((member) =>
        member.id === id ? { ...member, is_approved: true } : member
      ))
      toast.success("Member approved successfully!")
    } catch (error) {
      console.error("Approve error:", error)
      toast.error("Error approving member")
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm("Reject this member and remove their account?")) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error("Failed to reject member: " + (data.error || "Unknown error"))
        return
      }

      setMembers((prev) => prev.filter((member) => member.id !== id))
      toast.success("Member rejected successfully")
    } catch (error) {
      console.error("Reject error:", error)
      toast.error("Error rejecting member")
    } finally {
      setDeletingId(null)
    }
  }

  const exportCsv = () => {
    const header = ["Name", "Member ID", "Email", "Phone", "Status", "Voted", "Joined"]
    const rows = filtered.map((member) => [
      member.full_name,
      member.member_id,
      member.email,
      member.phone,
      member.is_approved ? "Approved" : "Pending",
      member.vote_count.toString(),
      new Date(member.created_at).toLocaleDateString(),
    ])

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "alm_members.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const filtered = members.filter((member) => {
    const matchesFilter =
      filter === "all" ? true :
      filter === "pending" ? !member.is_approved :
      member.is_approved

    const matchesSearch =
      member.full_name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase()) ||
      member.member_id.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const pendingCount = members.filter((member) => !member.is_approved).length

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Members</h1>
          <p className="text-gray-500 text-sm">
            {members.length} total · {pendingCount} pending approval
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={fetchMembers}
            className="rounded-full bg-[#1a2744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9a84c] hover:text-[#1a2744] transition-all"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-full bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#1a2744] hover:bg-[#1a2744] hover:text-white transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="text"
          placeholder="Search by name, email or member ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === tab ? "bg-[#1a2744] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tab}
              {tab === "pending" && pendingCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <p className="text-lg font-semibold">No members found</p>
          <p className="mt-2 text-sm">{search ? "Try a different search term." : "No member records are available."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-4 font-semibold">Name</th>
                <th className="px-4 py-4 font-semibold">Member ID</th>
                <th className="px-4 py-4 font-semibold">Email</th>
                <th className="px-4 py-4 font-semibold">Phone</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Voted</th>
                <th className="px-4 py-4 font-semibold">Joined</th>
                <th className="px-4 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-[#1a2744]">{member.full_name}</td>
                  <td className="px-4 py-4 text-slate-600">{member.member_id}</td>
                  <td className="px-4 py-4 text-slate-600">{member.email}</td>
                  <td className="px-4 py-4 text-slate-600">{member.phone}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${member.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {member.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{member.vote_count > 0 ? "Yes" : "No"}</td>
                  <td className="px-4 py-4 text-slate-500">{new Date(member.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4 space-y-2">
                    {!member.is_approved ? (
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(member.id)}
                          disabled={approvingId === member.id}
                          className="rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approvingId === member.id ? "Approving..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(member.id)}
                          disabled={deletingId === member.id}
                          className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === member.id ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-600 text-sm font-semibold">✓ Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
