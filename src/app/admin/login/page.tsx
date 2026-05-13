"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password.")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (!result) {
        setError("No response from server. Please try again.")
        return
      }

      if (result.error) {
        setError("Invalid admin email or password.")
        return
      }

      if (result.ok) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const sessionRes = await fetch("/api/auth/session")
        const session = await sessionRes.json()

        if (session?.user?.role === "admin") {
          router.push("/admin/dashboard")
          router.refresh()
        } else {
          setError("Access denied. Admin credentials required.")
        }
      }
    } catch (err) {
      console.error("Admin login error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2744] to-[#2a3d6b] 
      flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 
            bg-[#1a2744] rounded-full mb-4">
            <span className="text-[#c9a84c] font-bold text-xl">ALM</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">
            Association of Liberians in Musanze
          </p>
          <div className="inline-block bg-[#c9a84c] text-[#1a2744] text-xs 
            font-bold px-3 py-1 rounded-full mt-2">
            ADMIN ACCESS ONLY
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 
              px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@alm.org"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#c9a84c] 
                focus:border-transparent transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-[#c9a84c] 
                  focus:border-transparent transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                  text-gray-400 hover:text-gray-600 text-lg"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-[#1a2744] text-white py-3 rounded-lg 
              font-semibold hover:bg-[#c9a84c] hover:text-[#1a2744] 
              transition-all duration-200 disabled:opacity-50 
              disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" 
                  fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In as Admin"
            )}
          </motion.button>
        </form>

        {/* Back to member login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Not an admin?{" "}
          <Link href="/login" className="text-[#c9a84c] hover:underline font-medium">
            Member Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
