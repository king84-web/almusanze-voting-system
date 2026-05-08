"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timeout = window.setTimeout(() => {
        setPassword("");
        setError("");
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Admin password (should be environment variable in production)
    const ADMIN_PASSWORD = "Trapper84";

    if (password === ADMIN_PASSWORD) {
      // Redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    } else {
      setError("Invalid password. Please try again.");
      setPassword("");
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-4xl border-2 border-[#0052cc] bg-white p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1a2744]">Admin Access</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6 text-[#1a2744]" />
          </button>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Enter your admin password to access the dashboard and manage users/admin accounts.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#1a2744]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="mt-2 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 sm:py-3 text-[#1a2744] placeholder:text-slate-400 focus:border-[#0052cc] focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-[#cc0000]/30 bg-[#fff5f5] p-3">
              <p className="text-xs sm:text-sm text-[#cc0000]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full rounded-full bg-[#0052cc] py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#003d99] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-slate-500">
          Only authorized administrators can access this section and add users or admin accounts.
        </p>
      </div>
    </div>
  );
}
