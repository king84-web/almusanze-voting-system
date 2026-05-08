"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

interface ResultPoint {
  name: string;
  votes: number;
  team: string;
}

interface ResultsChartProps {
  data: ResultPoint[];
}

const colors = ["#1a2744", "#c9a84c", "#4f46e5", "#0f766e"];

export default function ResultsChart({ data }: ResultsChartProps) {
  return (
    <div className="h-96 rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1a2744]">Live results</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="votes" fill="#1a2744">
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
