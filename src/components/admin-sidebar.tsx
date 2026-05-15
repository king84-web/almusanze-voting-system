"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Users, ListChecks, FileText, Settings, LogOut } from "lucide-react";

interface AdminSidebarProps {
  pendingApprovals: number;
}

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/candidates", label: "Candidates" },
  { href: "/admin/results", label: "Results" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit Log" },
];

export default function AdminSidebar({ pendingApprovals }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 h-screen border-r border-slate-200 bg-white px-4 py-6 shadow-sm md:px-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#1a2744] px-4 py-2 text-sm font-semibold text-white md:hidden"
      >
        <Menu size={16} /> Menu
      </button>
      <div className={open ? "block" : "hidden md:block"}>
        <div className="mb-10 rounded-3xl bg-[#1a2744] p-5 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-[#f7e5a3]">ALM Admin</p>
          <p className="mt-4 text-lg font-semibold">Admin Dashboard</p>
          <p className="mt-2 text-sm text-[#d6c48d]">Pending approvals: {pendingApprovals}</p>
        </div>
        <nav className="space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-3xl px-4 py-3 text-sm font-medium transition ${
                  active ? "bg-[#c9a84c] text-[#1a2744]" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{link.label}</span>
                {link.href === "/admin/members" && pendingApprovals > 0 ? (
                  <span className="rounded-full bg-[#1a2744] px-3 py-1 text-xs text-white">{pendingApprovals}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 border-t border-slate-200 pt-6">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-[#1a2744] hover:bg-slate-200"
          >
            <LogOut size={16} /> Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
