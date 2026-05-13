import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidates } from "@/lib/db/schema";
import { getCurrentUser, requireAdmin } from "@/lib/server/auth";
import { uploadImage } from "@/lib/cloudinary";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const { id: candidateId } = await params;
  const formData = await request.formData();

  const existing = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(eq(candidates.id, candidateId))
    .limit(1)
    .then((result) => result[0]);

  if (!existing) {
    return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
  }

  // Extract fields from form data
  const fullName = formData.get("full_name")?.toString();
  const partyAffiliation = formData.get("party_affiliation")?.toString();
  const previousLeadership = formData.get("previous_leadership")?.toString();
  const letterOfIntent = formData.get("letter_of_intent")?.toString();
  const bio = formData.get("bio")?.toString();
  const runningMateName = formData.get("running_mate_name")?.toString();
  const runningMateParty = formData.get("running_mate_party")?.toString();
  const runningMatePreviousLeadership = formData.get("running_mate_previous_leadership")?.toString();
  const runningMateLetterOfIntent = formData.get("running_mate_letter_of_intent")?.toString();
  const runningMateBio = formData.get("running_mate_bio")?.toString();

  const profilePictureFile = formData.get("profile_picture");
  const runningMatePictureFile = formData.get("running_mate_picture");

  let profilePictureUrl: string | undefined;
  let runningMatePictureUrl: string | undefined;

  // Upload new profile picture if provided
  if (profilePictureFile instanceof File) {
    const buffer = Buffer.from(await profilePictureFile.arrayBuffer());
    profilePictureUrl = await uploadImage(buffer, `candidates/update/${candidateId}`);
  }

  // Upload new running mate picture if provided
  if (runningMatePictureFile instanceof File) {
    const buffer = Buffer.from(await runningMatePictureFile.arrayBuffer());
    runningMatePictureUrl = await uploadImage(buffer, `candidates/update/${candidateId}`);
  }

  // Build update object with only provided fields
  const updateData: Record<string, any> = {};
  if (fullName !== undefined) updateData.full_name = fullName;
  if (partyAffiliation !== undefined) updateData.party_affiliation = partyAffiliation;
  if (previousLeadership !== undefined) updateData.previous_leadership = previousLeadership;
  if (letterOfIntent !== undefined) updateData.letter_of_intent = letterOfIntent;
  if (bio !== undefined) updateData.bio = bio;
  if (runningMateName !== undefined) updateData.running_mate_name = runningMateName;
  if (runningMatePreviousLeadership !== undefined) updateData.running_mate_previous_leadership = runningMatePreviousLeadership;
  if (runningMateLetterOfIntent !== undefined) updateData.running_mate_letter_of_intent = runningMateLetterOfIntent;
  if (runningMateBio !== undefined) updateData.running_mate_bio = runningMateBio;
  if (runningMateParty !== undefined) updateData.running_mate_party = runningMateParty;
  if (profilePictureUrl !== undefined) updateData.profile_picture = profilePictureUrl;
  if (runningMatePictureUrl !== undefined) updateData.running_mate_picture = runningMatePictureUrl;

  await db.update(candidates).set(updateData).where(eq(candidates.id, candidateId));

  revalidatePath("/vote");
  revalidatePath("/admin/candidates");

  return NextResponse.json({ message: "Candidate updated" });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  requireAdmin(currentUser);

  const { id: candidateId } = await params;

  await db.delete(candidates).where(eq(candidates.id, candidateId));

  revalidatePath("/vote");
  revalidatePath("/admin/candidates");

  return NextResponse.json({ message: "Candidate deleted" });
}
