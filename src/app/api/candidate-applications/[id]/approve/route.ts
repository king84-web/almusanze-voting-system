import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidateApplications, candidates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params;

  try {

    // Get the application
    const application = await db
      .select()
      .from(candidateApplications)
      .where(eq(candidateApplications.id, applicationId))
      .limit(1);

    if (application.length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const app = application[0];

    if (app.status !== "pending") {
      return NextResponse.json({ error: "Application already processed" }, { status: 400 });
    }

    // Create the candidate
    await db.insert(candidates).values({
      full_name: app.full_name,
      team_id: app.team_id || '',
      position_id: app.position_id || '',
      profile_picture: app.profile_picture,
      party_affiliation: app.party,
      previous_leadership: app.previous_leadership_positions,
      letter_of_intent: app.letter_of_intent,
      bio: app.bio,
      running_mate_name: app.running_mate_name,
    } as any);

    // Update application status
    await db
      .update(candidateApplications)
      .set({ status: "approved" })
      .where(eq(candidateApplications.id, applicationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}