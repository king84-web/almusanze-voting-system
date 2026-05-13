import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const config: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const sql = neon(process.env.DATABASE_URL!)

          const rows = await sql`
            SELECT id, full_name, email, password_hash, role, is_approved
            FROM users
            WHERE email = ${credentials.email as string}
            LIMIT 1
          `

          if (!rows || rows.length === 0) {
            return null
          }

          const user = rows[0]

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password_hash as string
          )

          if (!isValid) {
            return null
          }

          if (user.is_approved === false && user.role !== "admin") {
            throw new Error("NotApproved")
          }

          return {
            id: String(user.id),
            email: String(user.email),
            name: String(user.full_name),
            role: String(user.role),
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.message === "NotApproved") {
            throw new Error("NotApproved")
          }
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = String(user.id ?? "")
        token.role = String((user as any).role ?? "member")
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id ?? ""),
          role: String(token.role ?? "member"),
          name: token.name,
          email: token.email,
        },
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
