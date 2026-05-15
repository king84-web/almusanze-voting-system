import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No database URL" }, { status: 500 })
    }

    const session = await auth()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL)

    const [totalMembers] = await sql`
      SELECT COUNT(*) as count FROM users WHERE role = 'member'
    `
    const [approvedMembers] = await sql`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'member' AND is_approved = true
    `
    const [totalVotes] = await sql`
      SELECT COUNT(*) as count FROM votes
    `
    const [pendingApprovals] = await sql`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'member' AND is_approved = false
    `

    const approved = Number(approvedMembers.count)
    const voted = Number(totalVotes.count)
    const turnout = approved > 0
      ? Math.round((voted / approved) * 100)
      : 0

    const stats = {
      totalMembers: Number(totalMembers.count),
      approvedMembers: approved,
      totalVotes: voted,
      pendingApprovals: Number(pendingApprovals.count),
      turnout,
    }

    console.log("Stats:", stats)
    return NextResponse.json(stats)

  } catch (error: unknown) {
    console.error("Stats API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
