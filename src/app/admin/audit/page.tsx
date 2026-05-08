export const dynamic = "force-dynamic";

import { db, auditLogs, users } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

async function getAuditLogs() {
  try {
    const records = await db
      .select({
        actor_name: users.full_name,
        action: auditLogs.action,
        metadata: auditLogs.metadata,
        created_at: auditLogs.created_at,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actor_id, users.id))
      .orderBy(desc(auditLogs.created_at))
      .limit(50);

    return records;
  } catch (error) {
    console.warn("Unable to load audit logs", error);
    return [];
  }
}

export default async function AdminAuditPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Audit log</h1>
        <p className="mt-2 text-sm text-slate-600">View a history of admin actions and system events.</p>
      </div>

      <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log, index) => (
                <tr key={`${log.actor_name ?? "system"}-${index}`}>
                  <td className="px-4 py-4">{log.actor_name ?? "System"}</td>
                  <td className="px-4 py-4">{log.action}</td>
                  <td className="px-4 py-4">{JSON.stringify(log.metadata)}</td>
                  <td className="px-4 py-4">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
