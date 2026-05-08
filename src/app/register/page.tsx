"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerSchema } from "@/lib/validations";

type RegisterForm = z.infer<typeof registerSchema>;
type RegisterPayload = RegisterForm & { confirmPassword: string };

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema) as unknown as Resolver<RegisterPayload>,
  });

  async function onSubmit(values: RegisterPayload) {
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Registration failed" }));
      toast.error(error.message ?? "Registration failed");
      return;
    }

    toast.success("Registration submitted. Await admin approval.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f7] px-6 py-10">
      <div className="w-full max-w-2xl rounded-4xl bg-white p-10 shadow-[0_30px_120px_rgba(26,39,68,0.08)]">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#c9a84c]">ALM Registration</p>
          <h1 className="text-4xl font-semibold text-[#1a2744]">Create your voter account</h1>
          <p className="text-sm leading-6 text-slate-600">Complete your details and wait for admin approval before you can cast your vote.</p>
        </div>

        <form className="mt-10 grid gap-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-slate-700">
            Full Name
            <input
              type="text"
              {...register("full_name")}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
            {errors.full_name && <p className="mt-2 text-sm text-red-600">{errors.full_name.message}</p>}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              {...register("email")}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Phone
              <input
                type="text"
                {...register("phone")}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Member ID
              <input
                type="text"
                {...register("member_id")}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              />
              {errors.member_id && <p className="mt-2 text-sm text-red-600">{errors.member_id.message}</p>}
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                {...register("password")}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirm Password
              <input
                type="password"
                {...register("confirmPassword")}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1a2744] focus:ring-2 focus:ring-[#c9a84c]/30"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-[#1a2744] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#16203b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered? <Link href="/login" className="font-semibold text-[#1a2744]">Log in</Link>
        </p>
      </div>
    </main>
  );
}
