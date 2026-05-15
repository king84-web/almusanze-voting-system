import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No database URL" }, { status: 500 })
    }

    const sql = neon(process.env.DATABASE_URL)

    const rows = await sql`
      SELECT * FROM election_settings LIMIT 1
    `

    if (rows.length === 0) {
      // Create default settings if none exist
      const [created] = await sql`
        INSERT INTO election_settings (
          election_name,
          is_active,
          allow_registration,
          voting_start,
          voting_end,
          created_by
        ) VALUES (
          'ALM General Elections',
          false,
          true,
          NOW(),
          NOW() + INTERVAL '7 days',
          (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
        )
        RETURNING *
      `
      return NextResponse.json(created)
    }

    return NextResponse.json(rows[0])

  } catch (error: unknown) {
    console.error("Settings GET error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "No database URL" }, { status: 500 })
    }

    const session = await auth()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL)
    const body = await req.json()

    const {
      election_name,
      is_active,
      allow_registration,
      voting_start,
      voting_end,
    } = body

    console.log("Saving settings:", body)

    const rows = await sql`
      SELECT id FROM election_settings LIMIT 1
    `

    let result

    if (rows.length === 0) {
      // Insert new settings
      const [inserted] = await sql`
        INSERT INTO election_settings (
          election_name,
          is_active,
          allow_registration,
          voting_start,
          voting_end,
          created_by
        ) VALUES (
          ${election_name},
          ${is_active},
          ${allow_registration},
          ${voting_start},
          ${voting_end},
          ${session.user.id}
        )
        RETURNING *
      `
      result = inserted
    } else {
      // Update existing settings
      const [updated] = await sql`
        UPDATE election_settings SET
          election_name = ${election_name},
          is_active = ${is_active},
          allow_registration = ${allow_registration},
          voting_start = ${voting_start},
          voting_end = ${voting_end}
        WHERE id = ${rows[0].id}
        RETURNING *
      `
      result = updated
    }

    console.log("Settings saved:", result)

    // Force revalidation
    const { revalidatePath } = await import("next/cache")
    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/admin/settings")

    return NextResponse.json(result)

  } catch (error: unknown) {
    console.error("Settings PATCH error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
