import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // 1. Check database connection
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not set")
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    // 2. Check authentication where needed
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 3. Connect and query
    const sql = neon(process.env.DATABASE_URL)
    const members = await sql`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.member_id,
        u.role,
        u.is_approved,
        u.created_at,
        COUNT(v.id) as vote_count
      FROM users u
      LEFT JOIN votes v ON v.voter_id = u.id
      WHERE u.role = 'member'
      GROUP BY u.id, u.full_name, u.email, u.phone,
               u.member_id, u.role, u.is_approved, u.created_at
      ORDER BY u.created_at DESC
    `

    console.log("Members fetched:", members.length)
    return NextResponse.json(members)

  } catch (error: unknown) {
    // 5. Log full error
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
