import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidateApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params;

  try {

    // Update application status to rejected
    await db
      .update(candidateApplications)
      .set({ status: "rejected" })
      .where(eq(candidateApplications.id, applicationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}