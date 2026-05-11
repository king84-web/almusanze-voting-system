import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resetTokens } from "@/lib/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json({ valid: false, message: "Token is required." }, { status: 400 });
    }

    const tokenRow = await db
      .select()
      .from(resetTokens)
      .where(
        and(
          eq(resetTokens.token, token),
          eq(resetTokens.used, false),
          gt(resetTokens.expires_at, new Date())
        )
      )
      .limit(1);

    if (!tokenRow[0]) {
      return NextResponse.json({ valid: false, message: "Invalid or expired reset link." });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json({ valid: false, message: "Unable to verify token." }, { status: 500 });
  }
}
