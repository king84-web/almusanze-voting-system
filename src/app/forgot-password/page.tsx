"use client";

import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordForm) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error || "Unable to send reset link.");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Forgot password submit error:", error);
      toast.error("Unable to send reset link. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f7] px-6 py-12">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_30px_120px_rgba(26,39,68,0.08)]"
        >
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">ALM Voting System</p>
            <h1 className="mt-4 text-4xl font-semibold text-[#1a2744]">Forgot Password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter your registered email address and we will send you a password reset link.
            </p>
          </div>

          <AnimatePresence initial={false}>
            {submitted ? (
              <motion.div
                key="success-card"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-[2rem] border border-green-200 bg-emerald-50 p-8"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✉️</div>
                  <h2 className="text-2xl font-semibold text-slate-900">Check Your Email</h2>
                  <p className="max-w-md text-sm leading-6 text-slate-700">
                    If your email is registered, you will receive a reset link shortly. Check your inbox and spam folder.
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex rounded-full bg-[#1a2744] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16203b]"
                  >
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="forgot-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-full bg-[#1a2744] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#16203b] disabled:opacity-60"
                >
                  {isLoading ? "Sending reset link..." : "Send Reset Link"}
                </button>

                <p className="text-center text-sm text-slate-600">
                  Remembered your password?{' '}
                  <Link href="/login" className="font-semibold text-[#1a2744] hover:underline">
                    Back to login
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
