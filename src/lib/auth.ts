import { compare } from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, users } from "./db";
import { eq } from "drizzle-orm";

const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db
          .select({
            id: users.id,
            email: users.email,
            full_name: users.full_name,
            role: users.role,
            password_hash: users.password_hash,
            is_approved: users.is_approved,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
          .then((result) => result[0]);

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (user.role !== "admin" && !user.is_approved) {
          throw new Error("Your account is pending approval");
        }

        const passwordMatches = await compare(password, user.password_hash);

        if (!passwordMatches) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as "admin" | "member";
        token.full_name = user.name ?? "";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "member";
        session.user.name = token.full_name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const { handlers, auth } = NextAuth(authOptions);
export const { GET, POST } = handlers;
export { auth, authOptions };
export { signIn, signOut } from "next-auth/react";
