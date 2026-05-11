"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

const errorMessages: Record<string, string> = {
  Configuration: "Server configuration error. Check environment variables.",
  NotApproved: "Your account is pending admin approval. Please wait for approval before logging in.",
  CredentialsSignin: "Invalid email or password.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const initialError = useMemo(() => {
    const error = searchParams?.get("error");
    if (!error) {
      return null;
    }
    return errorMessages[error] ?? "Login failed. Please try again.";
  }, [searchParams]);

  async function onSubmit(values: LoginForm) {
    setIsSubmitting(true);
    setLoginError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setLoginError(errorMessages[result.error] ?? "Login failed. Please try again.");
      return;
    }

    const session = await getSession();
    const destination = session?.user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    router.push(destination);
  }

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

        {(loginError || initialError) && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loginError || initialError}
          </div>
        )}

        <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              {...register("email")}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-[#1a2744] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#16203b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to ALM? <Link href="/register" className="font-semibold text-[#1a2744]">Register now</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
