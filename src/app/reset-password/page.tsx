"use client";

export const dynamic = "force-dynamic";

import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

type TokenStatus = "loading" | "valid" | "invalid";

function getPasswordStrength(password: string) {
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 8 && hasNumber && hasSpecial) {
    return { label: "Strong", color: "bg-emerald-500", width: 90 };
  }

  if (password.length >= 8 && hasNumber) {
    return { label: "Medium", color: "bg-amber-400", width: 60 };
  }

  if (password.length > 0) {
    return { label: "Weak", color: "bg-red-500", width: 30 };
  }

  return { label: "", color: "bg-transparent", width: 0 };
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [status, setStatus] = useState<TokenStatus>("loading");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password") || "";
  const strength = getPasswordStrength(passwordValue);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        setStatus(data.valid ? "valid" : "invalid");
      } catch (error) {
        console.error("Verify token error:", error);
        setStatus("invalid");
      }
    }

    verifyToken();
  }, [token]);

  async function onSubmit(values: ResetPasswordForm) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to reset password.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      console.error("Reset password submit error:", error);
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f7] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_30px_120px_rgba(26,39,68,0.08)]"
      >
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">ALM Voting System</p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1a2744]">Reset Password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Create a new password to access your account securely.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-700"
            >
              Checking your reset link...
            </motion.div>
          ) : status === "invalid" ? (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">❌</div>
                <h2 className="text-2xl font-semibold text-slate-900">Link Expired or Invalid</h2>
                <p className="max-w-md text-sm leading-6 text-slate-700">
                  This password reset link has expired or already been used.
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-4 inline-flex rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16203b]"
                >
                  Request New Reset Link
                </Link>
              </div>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
                <h2 className="text-2xl font-semibold text-slate-900">Password Reset Successful!</h2>
                <p className="max-w-md text-sm leading-6 text-slate-700">
                  Your password has been updated. You can now log in.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16203b]"
                >
                  Go to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                <div className="relative mt-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Password strength</span>
                  <span className="font-semibold text-slate-900">{strength.label}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <motion.div
                    initial={false}
                    animate={{ width: `${strength.width}%` }}
                    transition={{ duration: 0.3 }}
                    className={`${strength.color} h-2 rounded-full`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-full bg-[#1a2744] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#16203b] disabled:opacity-60"
              >
                {isLoading ? "Resetting password..." : "Reset Password"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[#f4f4f7] px-6 py-12">
        <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_30px_120px_rgba(26,39,68,0.08)] text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">ALM Voting System</p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1a2744]">Reset Password</h1>
          <div className="mt-8 text-slate-600">Loading...</div>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
