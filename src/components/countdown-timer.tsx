"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const target = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => setTimeLeft(Math.max(target - Date.now(), 0));
    updateTime();

    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  if (timeLeft === null) {
    return (
      <div className="rounded-3xl border border-[#c9a84c] bg-[#fdf7e1] p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-[#6b7280]">Loading countdown...</p>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="rounded-3xl bg-[#f8edd0] border border-[#c9a84c] px-6 py-5 text-center text-[#1a2744] shadow-sm sm:px-10">
        <p className="text-sm uppercase tracking-[0.25em] text-[#8b6c1f]">Voting is Open!</p>
        <p className="mt-2 text-2xl font-semibold text-[#1a2744]">Cast your vote now</p>
      </div>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="grid gap-4 rounded-3xl border border-[#c9a84c] bg-[#fdf7e1] p-6 text-center shadow-sm sm:grid-cols-4 sm:p-8">
      {[
        { label: "Days", value: days },
        { label: "Hours", value: hours },
        { label: "Minutes", value: minutes },
        { label: "Seconds", value: seconds },
      ].map((segment) => (
        <div key={segment.label} className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="text-4xl font-semibold text-[#1a2744]">{pad(segment.value)}</p>
          <span className="text-sm uppercase tracking-[0.25em] text-[#6b7280]">{segment.label}</span>
        </div>
      ))}
    </div>
  );
}
