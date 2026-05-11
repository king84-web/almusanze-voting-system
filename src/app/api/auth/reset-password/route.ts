import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, resetTokens, auditLogs } from "@/lib/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.token || typeof body.token !== "string") {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    if (!body?.password || typeof body.password !== "string") {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const tokenRow = await db
      .select()
      .from(resetTokens)
      .where(
        and(
          eq(resetTokens.token, body.token),
          eq(resetTokens.used, false),
          gt(resetTokens.expires_at, new Date())
        )
      )
      .limit(1);

    const resetRecord = tokenRow[0];
    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    await db
      .update(users)
      .set({ password_hash: passwordHash })
      .where(eq(users.id, resetRecord.user_id));

    await db
      .update(resetTokens)
      .set({ used: true })
      .where(eq(resetTokens.id, resetRecord.id));

    await db.insert(auditLogs).values({
      actor_id: resetRecord.user_id,
      action: "PASSWORD_RESET",
      metadata: { ip: req.headers.get("x-forwarded-for") || "unknown" },
    });

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to process request." }, { status: 500 });
  }
}
