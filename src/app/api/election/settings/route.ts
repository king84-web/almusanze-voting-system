import { NextResponse } from "next/server";
import { db, electionSettings } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { electionSettingsSchema } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getOrCreateElection() {
  let election = await db
    .select()
    .from(electionSettings)
    .orderBy(desc(electionSettings.created_at))
    .limit(1)
    .then((result) => result[0]);

  if (!election) {
    // Create default election settings
    const [newElection] = await db
      .insert(electionSettings)
      .values({
        election_name: "ALM General Elections",
        is_active: false,
        allow_registration: true,
        created_by: null, // Will be set when admin updates
      })
      .returning();
    election = newElection;
  }

  return election;
}

export async function GET() {
  const election = await getOrCreateElection();
  return NextResponse.json(election);
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);
    requireAdmin(currentUser);

    const body = await request.json();
    const parseResult = electionSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: parseResult.error.issues[0]?.message ?? "Invalid settings" }, { status: 400 });
    }

    const settings = parseResult.data;
    const election = await getOrCreateElection();

    await db
      .update(electionSettings)
      .set({
        election_name: settings.election_name,
        is_active: settings.is_active,
        voting_start: settings.voting_start ? new Date(settings.voting_start) : null,
        voting_end: settings.voting_end ? new Date(settings.voting_end) : null,
        allow_registration: settings.allow_registration,
        created_by: currentUser.id,
      })
      .where(eq(electionSettings.id, election.id));

    revalidatePath('/');

    return NextResponse.json({ message: "Election settings updated" });
  } catch (error) {
    console.error("Error updating election settings:", error);
    return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
