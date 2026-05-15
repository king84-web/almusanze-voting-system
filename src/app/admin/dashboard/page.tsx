"use client"

import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    approvedMembers: 0,
    totalVotes: 0,
    pendingApprovals: 0,
    turnout: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        console.log("Dashboard stats:", data)
        setStats(data)
      } else {
        const err = await res.json()
        console.error("Stats error:", err)
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"/>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm uppercase tracking-wide text-[#c9a84c] mb-2">
            Total Members
          </p>
          <p className="text-3xl font-bold text-[#1a2744]">
            {stats.totalMembers}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm uppercase tracking-wide text-[#c9a84c] mb-2">
            Approved Members
          </p>
          <p className="text-3xl font-bold text-[#1a2744]">
            {stats.approvedMembers}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm uppercase tracking-wide text-[#c9a84c] mb-2">
            Total Votes
          </p>
          <p className="text-3xl font-bold text-[#1a2744]">
            {stats.totalVotes}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm uppercase tracking-wide text-[#c9a84c] mb-2">
            Turnout
          </p>
          <p className="text-3xl font-bold text-[#1a2744]">
            {stats.turnout}%
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-[#1a2744] mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/members"
              className="block bg-[#1a2744] text-white px-4 py-3 rounded-lg
                hover:bg-[#c9a84c] hover:text-[#1a2744] transition-all text-center"
            >
              Manage Members ({stats.pendingApprovals} pending)
            </a>
            <a
              href="/admin/settings"
              className="block bg-[#c9a84c] text-[#1a2744] px-4 py-3 rounded-lg
                hover:bg-[#1a2744] hover:text-white transition-all text-center"
            >
              Election Settings
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-[#1a2744] mb-4">
            Election Status
          </h2>
          <div className="text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium
              ${stats.totalVotes > 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {stats.totalVotes > 0 ? "Election In Progress" : "Election Not Started"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
