import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/lib/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No database URL" }, { status: 500 })
    }

    const session = await auth()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const sql = neon(process.env.DATABASE_URL)

    await sql`
      DELETE FROM votes
      WHERE voter_id = ${id}
    `

    await sql`
      DELETE FROM reset_tokens
      WHERE user_id = ${id}
    `

    await sql`
      DELETE FROM users
      WHERE id = ${id} AND role = 'member'
    `

    await sql`
      INSERT INTO audit_logs (actor_id, action, metadata)
      VALUES (
        ${session.user.id},
        'MEMBER_REJECTED',
        ${JSON.stringify({ rejected_user_id: id })}
      )
    `

    return NextResponse.json({ success: true, id })
  } catch (error: unknown) {
    console.error("Member delete error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
