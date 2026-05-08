import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET || "dev-secret";

export type CurrentUser = {
  id: string;
  role: "admin" | "member";
  email: string;
  full_name?: string;
};

export async function getCurrentUser(request: Request): Promise<CurrentUser> {
  const token = await getToken({ req: request, secret });

  if (!token || !token.id || !token.role) {
    throw new Error("Unauthorized");
  }

  return {
    id: token.id as string,
    role: token.role as "admin" | "member",
    email: token.email as string,
    full_name: token.full_name as string | undefined,
  };
}

export function requireAdmin(user: CurrentUser) {
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
}
