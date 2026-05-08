export const dynamic = "force-dynamic";

import HeroSection from "@/components/hero-section";
import { db, electionSettings } from "@/lib/db";
import { desc } from "drizzle-orm";

async function getElectionSettings() {
  try {
    const result = await db.select().from(electionSettings).orderBy(desc(electionSettings.id)).limit(1);
    return result[0];
  } catch (error) {
    console.warn("Unable to fetch election settings", error);
    return null;
  }
}

export default async function Home() {
  const settings = await getElectionSettings();
  const targetDate = settings?.voting_start
    ? new Date(settings.voting_start).toISOString()
    : "2026-12-31T00:00:00.000Z";

  return (
    <main className="min-h-screen bg-[#1a2744]">
      <HeroSection settings={settings} targetDate={targetDate} />
    </main>
  );
}
