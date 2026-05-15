"use client";

import { useState } from "react";
import Link from "next/link";
import { CountdownTimer } from "@/components/countdown-timer";
import { Lock } from "lucide-react";

interface ElectionSettings {
  election_name?: string;
  is_active?: boolean;
  allow_registration?: boolean;
  voting_start?: Date | string | null;
  voting_end?: Date | string | null;
}

interface HeroSectionProps {
  settings: ElectionSettings | null;
  targetDate: string;
}

export default function HeroSection({ settings, targetDate }: HeroSectionProps) {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <>
      <section 
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-4 sm:px-6 py-8 sm:py-10 lg:px-12 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 39, 68, 0.75), rgba(26, 39, 68, 0.75)), url('/alm.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" aria-hidden="true"></div>
        <div className="relative z-10 flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex rounded-full bg-linear-to-r from-[#0052cc] to-[#003d99] px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-white shadow-sm">
              ALM General Elections
            </div>
            <div className="flex flex-col gap-4 sm:gap-6 rounded-4xl border border-[#e7e7e7] bg-white/95 backdrop-blur p-4 sm:p-6 shadow-lg sm:flex-row sm:items-center">
              <div className="flex items-center gap-4 shrink-0">
                <img src="/alm.png" alt="ALM Community Logo" className="h-20 sm:h-24 w-20 sm:w-24 rounded-full object-cover shadow-md" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm uppercase tracking-[0.32em] text-[#c9a84c] font-semibold">Association of Liberians in Musanze</p>
                <p className="mt-2 text-xl sm:text-2xl font-semibold text-[#1a2744]">Unity Leads and God Above All.</p>
                <p className="mt-3 text-xs sm:text-sm text-slate-600">A community election platform for Liberians living in Musanze.</p>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
              vote wisely for the betterment of ALM
            </h1>
            <p className="max-w-xl text-sm sm:text-base lg:text-lg leading-7 sm:leading-8 text-white/90 drop-shadow">
              The Association of Liberians in Musanze empowers members with a secure voting experience, transparent results, and election management for every candidate and member.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 flex-wrap">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[#0052cc] px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#003d99] active:scale-95 shadow-md hover:shadow-lg"
              >
                Register to Vote
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border-2 border-white bg-white/10 backdrop-blur px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#ff6b6b] bg-[#ff6b6b]/10 backdrop-blur px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#ff6b6b]/20 active:scale-95"
              >
                <Lock className="h-4 w-4" />
                Admin
              </Link>
            </div>
          </div>
          <div className="rounded-4xl border-2 border-white bg-white/95 backdrop-blur p-4 sm:p-6 lg:p-8 shadow-2xl lg:max-w-xl w-full lg:w-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-[#1a2744]">Voting starts in</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">Election: {settings?.election_name ?? "ALM General Elections 2026"}</p>
            <div className="mt-6">
              <CountdownTimer targetDate={targetDate} />
            </div>
          </div>
        </div>

        <section className="relative z-10 mt-12 sm:mt-16 lg:mt-20 grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
          {[
            {
              title: "Verify membership",
              description: "Register with your member ID and wait for admin approval before voting.",
            },
            {
              title: "Choose your team",
              description: "Review candidate teams and positions before casting your ballot.",
            },
            {
              title: "Track election results",
              description: "Members and admins can view live tallies and final outcomes.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-4xl border border-white bg-white/95 backdrop-blur p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl hover:border-[#0052cc]/50 transition">
              <h3 className="text-lg sm:text-xl font-semibold text-[#1a2744]">{item.title}</h3>
              <p className="mt-3 text-xs sm:text-sm leading-6 sm:leading-7 text-slate-700">{item.description}</p>
            </article>
          ))}
        </section>

        <footer className="relative z-10 mt-12 sm:mt-16 lg:mt-24 rounded-4xl border border-white bg-white/10 backdrop-blur p-4 sm:p-6 lg:p-8 text-white shadow-lg">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white font-semibold">Association of Liberians in Musanze</p>
              <p className="mt-3 max-w-lg text-xs sm:text-sm leading-6 sm:leading-7 text-white/90">
                Join your community election platform, promote democratic participation, and support the candidates you believe in.
              </p>
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-white/90 shrink-0 w-full sm:w-auto text-left sm:text-right">
              <p className="break-words">Contact: <a href="tel:0792405593" className="underline decoration-white/40">0792405593</a></p>
              <p className="break-words">Solomon Kamara — Developer</p>
            </div>
          </div>
        </footer>
      </section>

    </>
  );
}
