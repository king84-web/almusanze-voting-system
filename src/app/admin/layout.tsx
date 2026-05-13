export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { sql, eq, and } from "drizzle-orm";
import AdminSidebar from "@/components/admin-sidebar";

async function getPendingCount() {
  try {
    const result = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(users).where(and(eq(users.role, "member"), eq(users.is_approved, false)));
    return result[0]?.count ?? 0;
  } catch (error) {
    console.warn("Unable to fetch pending approvals", error);
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin/login");
  }

  const pendingApprovals = await getPendingCount();

  return (
    <div className="min-h-screen bg-[#f4f4f7] text-[#1a2744]">
      <div className="grid min-h-screen grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <AdminSidebar pendingApprovals={pendingApprovals} />
        <div className="px-6 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
