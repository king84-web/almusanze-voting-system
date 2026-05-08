import { NextResponse } from "next/server";
import { db, candidateApplications, teams, positions } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const applications = await db
      .select({
        id: candidateApplications.id,
        full_name: candidateApplications.full_name,
        email: candidateApplications.email,
        phone: candidateApplications.phone,
        team_name: teams.name,
        position_display: positions.display_name,
        party: candidateApplications.party,
        bio: candidateApplications.bio,
        previous_leadership_positions: candidateApplications.previous_leadership_positions,
        letter_of_intent: candidateApplications.letter_of_intent,
        profile_picture: candidateApplications.profile_picture,
        status: candidateApplications.status,
        created_at: candidateApplications.created_at,
      })
      .from(candidateApplications)
      .leftJoin(teams, eq(candidateApplications.team_id, teams.id))
      .leftJoin(positions, eq(candidateApplications.position_id, positions.id));

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = formData.get("full_name")?.toString() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const phone = formData.get("phone")?.toString() ?? "";
  const teamId = formData.get("team_id")?.toString() ?? "";
  const positionId = formData.get("position_id")?.toString() ?? "";
  const party = formData.get("party")?.toString() ?? "";
  const bio = formData.get("bio")?.toString() ?? "";
  const previousLeadershipPositions = formData.get("previous_leadership_positions")?.toString() ?? "";
  const letterOfIntent = formData.get("letter_of_intent")?.toString() ?? "";
  const runningMateName = formData.get("running_mate_name")?.toString() ?? "";
  const image = formData.get("image");

  if (
    !fullName ||
    !email ||
    !phone ||
    !teamId ||
    !positionId ||
    !party ||
    !bio ||
    !previousLeadershipPositions ||
    !letterOfIntent ||
    !(image instanceof File)
  ) {
    return NextResponse.json({ message: "Missing application data" }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const profileUrl = await uploadImage(buffer, "alm/applications");

  await db.insert(candidateApplications).values({
    full_name: fullName,
    email,
    phone,
    team_id: teamId,
    position_id: positionId,
    party,
    bio,
    previous_leadership_positions: previousLeadershipPositions,
    letter_of_intent: letterOfIntent,
    profile_picture: profileUrl,
    running_mate_name: runningMateName,
    status: "pending",
  });

  return NextResponse.json({ message: "Application submitted successfully" }, { status: 201 });
}