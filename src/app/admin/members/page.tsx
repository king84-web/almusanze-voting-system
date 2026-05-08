"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  member_id: string;
  role: string;
  is_approved: boolean;
  joined_at: string;
  voted_positions: string[];
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then(setMembers)
      .catch(() => setMembers([]));
  }, []);

  const filtered = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.full_name.toLowerCase().includes(search.toLowerCase()) || member.member_id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "approved"
          ? member.is_approved
          : filter === "pending"
          ? !member.is_approved
          : filter === "voted"
          ? member.voted_positions.length > 0
          : filter === "not-voted"
          ? member.voted_positions.length === 0
          : true;
      return matchesSearch && matchesFilter;
    });
  }, [members, filter, search]);

  async function approveMember(id: string) {
    const response = await fetch(`/api/members/${id}/approve`, { method: "PATCH" });
    if (!response.ok) {
      toast.error("Unable to approve member");
      return;
    }
    toast.success("Member approved");
    setMembers((current) => current.map((member) => (member.id === id ? { ...member, is_approved: true } : member)));
  }

  function exportCsv() {
    const csv = [
      ["Name", "Member ID", "Email", "Phone", "Status", "Voted Positions", "Joined"],
      ...filtered.map((member) => [
        member.full_name,
        member.member_id,
        member.email,
        member.phone,
        member.is_approved ? "Approved" : "Pending",
        member.voted_positions.join(";") || "None",
        member.joined_at,
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "alm_members.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Members</h1>
            <p className="mt-2 text-sm text-slate-600">Manage voter registrations, approvals, and participation status.</p>
          </div>
          <button onClick={exportCsv} className="rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-[#1a2744] hover:bg-[#b7a33b]">
            Export to CSV
          </button>
        </div>
      </div>

      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="member-search" className="sr-only">
              Search members
            </label>
            <input
              id="member-search"
              type="search"
              placeholder="Search name or member ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
            <label htmlFor="member-filter" className="sr-only">
              Filter members
            </label>
            <select
              id="member-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="voted">Voted</option>
              <option value="not-voted">Not Voted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-4">{member.full_name}</td>
                  <td className="px-4 py-4">{member.member_id}</td>
                  <td className="px-4 py-4">{member.email}</td>
                  <td className="px-4 py-4">{member.phone}</td>
                  <td className="px-4 py-4">{member.is_approved ? "Approved" : "Pending"}</td>
                  <td className="px-4 py-4">{member.voted_positions.length}</td>
                  <td className="px-4 py-4">{new Date(member.joined_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    {!member.is_approved ? (
                      <button
                        type="button"
                        onClick={() => approveMember(member.id)}
                        className="rounded-full bg-[#1a2744] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16203b]"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
