"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        setError("No response from server. Try again.");
        return;
      }

      if (result.error) {
        if (result.error.includes("NotApproved")) {
          setError("Your account is pending admin approval.");
        } else {
          setError("Invalid email or password.");
        }
        return;
      }

      if (result.ok) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.role === "admin") {
          router.push("/admin/dashboard");
          router.refresh();
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f7] px-6 py-10">
      <div className="w-full max-w-xl rounded-4xl bg-white p-10 shadow-[0_30px_120px_rgba(26,39,68,0.08)]">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">ALM Voting System</p>
          <h1 className="text-4xl font-semibold text-[#1a2744]">Member login</h1>
          <p className="text-sm leading-6 text-slate-600">
            Access your dashboard, review candidates, and cast your vote securely.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              placeholder="your@email.com"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              placeholder="••••••••"
            />
          </label>

          <div className="text-right mb-6">
            <Link href="/forgot-password" className="text-sm text-[#c9a84c] hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-[#1a2744] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#16203b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Do not have an account?{' '}
            <Link href="/register" className="text-[#c9a84c] hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
