import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No database URL" }, { status: 500 })
    }

    const session = await auth()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL)

    // Delete all votes
    await sql`DELETE FROM votes`

    // Log the action
    await sql`
      INSERT INTO audit_logs (actor_id, action, metadata)
      VALUES (
        ${session.user.id},
        'RESET_VOTES',
        ${JSON.stringify({ message: "All votes reset by admin" })}
      )
    `

    console.log("All votes reset by admin:", session.user.id)
    return NextResponse.json({ success: true, message: "All votes have been reset" })

  } catch (error: unknown) {
    console.error("Reset votes error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
