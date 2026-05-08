"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface VotingWizardProps {
  step: number;
  children: ReactNode;
}

const steps = [
  "President & VP",
  "General Secretary",
  "Financial Secretary",
];

export default function VotingWizard({ step, children }: VotingWizardProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Step {step} of 3</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1a2744]">{steps[step - 1]}</h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2744] text-white">
            {step}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            initial={false}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full rounded-full bg-[#c9a84c]"
          />
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {children}
      </motion.div>
    </div>
  );
}
