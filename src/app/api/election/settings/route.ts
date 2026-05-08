import { NextResponse } from "next/server";
import { db, electionSettings } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { electionSettingsSchema } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";

async function getLatestElection() {
  return db
    .select()
    .from(electionSettings)
    .orderBy(desc(electionSettings.created_at))
    .limit(1)
    .then((result) => result[0]);
}

export async function GET() {
  const election = await getLatestElection();

  if (!election) {
    return NextResponse.json({ message: "No election settings found" }, { status: 404 });
  }

  return NextResponse.json(election);
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const body = await request.json();
  const parseResult = electionSettingsSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.issues[0]?.message ?? "Invalid settings" }, { status: 400 });
  }

  const settings = parseResult.data;
  const election = await getLatestElection();

  if (!election) {
    return NextResponse.json({ message: "No election settings found" }, { status: 404 });
  }

  await db
    .update(electionSettings)
    .set({
      election_name: settings.election_name,
      is_active: settings.is_active,
      voting_start: new Date(settings.voting_start),
      voting_end: new Date(settings.voting_end),
      allow_registration: settings.allow_registration,
    })
    .where(eq(electionSettings.id, election.id));

  return NextResponse.json({ message: "Election settings updated" });
}
