import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f7] px-6 py-10">
      <div className="w-full max-w-2xl rounded-4xl border border-[#e5e7eb] bg-white p-12 shadow-[0_30px_120px_rgba(26,39,68,0.08)]">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">Access denied</p>
          <h1 className="mt-6 text-4xl font-semibold text-[#1a2744]">You do not have permission</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            This page is restricted. Please return to the dashboard or request admin access if you believe this is a mistake.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-[#1a2744] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#16203b]"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-[#1a2744] px-8 py-3 text-sm font-semibold text-[#1a2744] transition hover:bg-[#f7f7f7]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
