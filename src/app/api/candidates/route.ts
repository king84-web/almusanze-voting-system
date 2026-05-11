import { NextResponse } from "next/server";
import { db, candidates, positions, teams } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { uploadImage } from "@/lib/cloudinary";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  const records = await db.select({
    id: candidates.id,
    full_name: candidates.full_name,
    profile_picture: candidates.profile_picture,
    position_id: candidates.position_id,
    team_id: candidates.team_id,
    bio: candidates.bio,
    running_mate_name: candidates.running_mate_name,
    running_mate_picture: candidates.running_mate_picture,
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
  const fullName = formData.get("full_name")?.toString() ?? "";
  const positionId = formData.get("position_id")?.toString() ?? "";
  const teamId = formData.get("team_id")?.toString() ?? "";
  const bio = formData.get("bio")?.toString() ?? "";
  const runningMateName = formData.get("running_mate_name")?.toString() ?? null;
  const runningMateImage = formData.get("running_mate_image");
  const image = formData.get("image");

  if (!fullName || !positionId || !teamId || !bio || !(image instanceof File)) {
    return NextResponse.json({ message: "Missing candidate data" }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const profileUrl = await uploadImage(buffer, "alm/candidates");

  let runningMateUrl: string | undefined;
  if (runningMateImage instanceof File) {
    const runningMateBuffer = Buffer.from(await runningMateImage.arrayBuffer());
    runningMateUrl = await uploadImage(runningMateBuffer, "alm/candidates");
  }

  const candidateId = await db.insert(candidates).values({
    full_name: fullName,
    profile_picture: profileUrl,
    position_id: positionId,
    team_id: teamId,
    bio,
    running_mate_name: runningMateName ?? undefined,
    running_mate_picture: runningMateUrl,
  });

  revalidatePath('/');

  return NextResponse.json({ message: "Candidate added", id: candidateId });
}
