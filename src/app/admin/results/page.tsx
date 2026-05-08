"use client";

import { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Printer } from "lucide-react";
import ResultsChart from "@/components/results-chart";
import ResultsPdf from "@/components/pdf-results";

interface ResultItem {
  id: string;
  full_name: string;
  team_name: string | null;
  position_display: string | null;
  votes: number;
}

interface VoteRecord {
  voter_name: string;
  position_display: string;
  voted_at: string;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [electionName, setElectionName] = useState("ALM Election");
  const [turnout, setTurnout] = useState(0);

  useEffect(() => {
    fetch("/api/results")
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setVotes(data.votes || []);
        setElectionName(data.election?.election_name ?? "ALM Election");
        setTurnout(data.turnout ?? 0);
      })
      .catch(() => {
        setResults([]);
        setVotes([]);
        setTurnout(0);
      });
  }, []);

  const chartData = useMemo(
    () => results.map((item) => ({ name: item.full_name, votes: item.votes, team: item.team_name ?? "Team" })),
    [results],
  );

  const pdfData = useMemo(
    () => ({
      electionName,
      electionDate: new Date().toLocaleDateString(),
      turnout,
      results: results.map((item) => ({
        name: item.full_name,
        team: item.team_name ?? "Team",
        position: item.position_display ?? "Position",
        votes: item.votes,
        percentage: 0,
        winner: false,
      })),
    }),
    [results, electionName, turnout],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Election results</h1>
          <p className="mt-2 text-sm text-slate-600">Live vote tallies and voter history for the current election.</p>
        </div>
        <PDFDownloadLink document={<ResultsPdf {...pdfData} />} fileName="alm-election-results.pdf">
          {({ loading }) => (
            <button className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-[#1a2744] hover:bg-[#b7a33b]">
              <Printer size={16} /> {loading ? "Preparing PDF..." : "Print Results PDF"}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ResultsChart data={chartData} />
        <div className="space-y-6">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a2744]">Who voted for who</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {votes.map((record, index) => (
                <div key={`${record.voter_name}-${index}`} className="rounded-3xl bg-slate-50 p-4">
                  <p className="font-semibold">{record.voter_name}</p>
                  <p>{record.position_display}</p>
                  <p className="text-xs text-slate-500">{new Date(record.voted_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
