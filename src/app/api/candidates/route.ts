import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidates, positions, teams, auditLogs } from "@/lib/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { uploadImage } from "@/lib/cloudinary";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  const records = await db
    .select({
      id: candidates.id,
      team_id: candidates.team_id,
      position_id: candidates.position_id,
      full_name: candidates.full_name,
      profile_picture: candidates.profile_picture,
      party_affiliation: candidates.party_affiliation,
      previous_leadership: candidates.previous_leadership,
      letter_of_intent: candidates.letter_of_intent,
      bio: candidates.bio,
      running_mate_name: candidates.running_mate_name,
      running_mate_picture: candidates.running_mate_picture,
      running_mate_party: candidates.running_mate_party,
      running_mate_previous_leadership: candidates.running_mate_previous_leadership,
      running_mate_letter_of_intent: candidates.running_mate_letter_of_intent,
      running_mate_bio: candidates.running_mate_bio,
      created_at: candidates.created_at,
      position_title: positions.title,
      position_display: positions.display_name,
      team_name: teams.name,
    })
    .from(candidates)
    .leftJoin(teams, eq(candidates.team_id, teams.id))
    .leftJoin(positions, eq(candidates.position_id, positions.id));

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const formData = await request.formData();

  // Required fields
  const teamId = formData.get("team_id")?.toString();
  const positionId = formData.get("position_id")?.toString();
  const fullName = formData.get("full_name")?.toString();
  const profilePictureFile = formData.get("profile_picture");

  if (!teamId || !positionId || !fullName || !(profilePictureFile instanceof File)) {
    return NextResponse.json({ message: "Missing required fields: team_id, position_id, full_name, profile_picture" }, { status: 400 });
  }

  // Optional fields
  const partyAffiliation = formData.get("party_affiliation")?.toString() || null;
  const previousLeadership = formData.get("previous_leadership")?.toString() || null;
  const letterOfIntent = formData.get("letter_of_intent")?.toString() || null;
  const bio = formData.get("bio")?.toString() || null;

  // Running mate fields
  const runningMateName = formData.get("running_mate_name")?.toString() || null;
  const runningMateParty = formData.get("running_mate_party")?.toString() || null;
  const runningMatePreviousLeadership = formData.get("running_mate_previous_leadership")?.toString() || null;
  const runningMateLetterOfIntent = formData.get("running_mate_letter_of_intent")?.toString() || null;
  const runningMateBio = formData.get("running_mate_bio")?.toString() || null;
  const runningMatePictureFile = formData.get("running_mate_picture");

  try {
    // Upload profile picture
    const profilePictureBuffer = Buffer.from(await profilePictureFile.arrayBuffer());
    const profilePictureUrl = await uploadImage(profilePictureBuffer, `candidates/${teamId}/${fullName}`);

    // Upload running mate picture if provided
    let runningMatePictureUrl: string | null = null;
    if (runningMatePictureFile instanceof File) {
      const runningMatePictureBuffer = Buffer.from(await runningMatePictureFile.arrayBuffer());
      runningMatePictureUrl = await uploadImage(runningMatePictureBuffer, `candidates/${teamId}/${runningMateName}`);
    }

    // Insert candidate
    const result = await db
      .insert(candidates)
      .values({
        team_id: teamId,
        position_id: positionId,
        full_name: fullName,
        profile_picture: profilePictureUrl,
        party_affiliation: partyAffiliation,
        previous_leadership: previousLeadership,
        letter_of_intent: letterOfIntent,
        bio: bio,
        running_mate_name: runningMateName,
        running_mate_picture: runningMatePictureUrl,
        running_mate_party: runningMateParty,
        running_mate_previous_leadership: runningMatePreviousLeadership,
        running_mate_letter_of_intent: runningMateLetterOfIntent,
        running_mate_bio: runningMateBio,
      })
      .returning({ id: candidates.id });

    const candidateId = result[0]?.id;

    // Log audit
    if (currentUser?.id) {
      await db.insert(auditLogs).values({
        actor_id: currentUser.id,
        action: "CANDIDATE_ADDED",
        metadata: {
          candidate_id: candidateId,
          full_name: fullName,
          team_id: teamId,
          position_id: positionId,
        },
      });
    }

    revalidatePath("/vote");
    revalidatePath("/admin/candidates");

    return NextResponse.json({ message: "Candidate added", id: candidateId }, { status: 201 });
  } catch (error) {
    console.error("Error adding candidate:", error);
    return NextResponse.json({ message: "Failed to add candidate" }, { status: 500 });
  }
}
