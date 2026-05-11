import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, resetTokens } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const usersFound = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = usersFound[0];
    if (!user) {
      return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.delete(resetTokens).where(
      and(eq(resetTokens.user_id, user.id), eq(resetTokens.used, false))
    );

    await db.insert(resetTokens).values({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    await sendPasswordResetEmail(user.email, user.full_name, token);

    return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to process request." }, { status: 500 });
  }
}
