"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

type Mode = "signin" | "signup"

export function LoginView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, resetPassword } = useAuth()
  const nextPath = searchParams.get("next") || "/history"

  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    const queryType = searchParams.get("type")

    if (hash.includes("type=recovery") || queryType === "recovery") {
      router.replace(`/reset-password${hash}`)
    }
  }, [router, searchParams])

  const handlePasswordReset = async () => {
    setError(null)
    setResetMessage(null)

    if (!email) {
      setError("enter your email first.")
      return
    }

    setResetLoading(true)
    const { error: resetError } = await resetPassword(email)
    setResetLoading(false)

    if (resetError) {
      setError(resetError.toLowerCase())
      return
    }

    setResetMessage("reset link sent. check your email.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError("email and password required.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("password must be at least 6 characters.")
      setLoading(false)
      return
    }

    const { error: authError } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password)

    setLoading(false)

    if (authError) {
      setError(authError.toLowerCase())
      return
    }

    if (mode === "signup") {
      setSuccess(true)
      setTimeout(() => router.push(nextPath), 1500)
    } else {
      router.push(nextPath)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <p className="text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-6">
          {mode === "signin" ? "welcome back" : "join rankedin"}
        </p>

        <h1 className="font-serif text-[32px] font-[500] text-ri-black mb-3 text-balance">
          {mode === "signin" ? "sign in to your aura." : "save your aura forever."}
        </h1>

        <p className="text-[15px] text-ri-gray-500 mb-10 leading-relaxed">
          {mode === "signin"
            ? "track your scan history and watch your rank climb."
            : "create an account to save scans, track progress, and unlock history."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-2">
              email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg border border-ri-gray-200 bg-ri-white text-ri-black placeholder:text-ri-gray-300 text-[15px] focus:outline-none focus:border-ri-black transition-colors duration-150"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="block text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em]">
                password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setResetOpen((open) => !open)
                    setError(null)
                    setResetMessage(null)
                  }}
                  className="text-[12px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150"
                >
                  forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full px-4 py-3 rounded-lg border border-ri-gray-200 bg-ri-white text-ri-black placeholder:text-ri-gray-300 text-[15px] focus:outline-none focus:border-ri-black transition-colors duration-150"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500">{error}</p>
          )}

          {success && (
            <p className="text-[13px] text-green-600">
              account created! check your email to confirm, then redirecting…
            </p>
          )}

          {resetOpen && mode === "signin" && (
            <div className="rounded-lg border border-ri-gray-100 bg-ri-off-white p-4">
              <p className="text-[13px] text-ri-gray-600 leading-relaxed mb-3">
                We&apos;ll send a reset link to the email above.
              </p>
              {resetMessage && (
                <p className="text-[13px] text-green-600 mb-3">{resetMessage}</p>
              )}
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="w-full py-2.5 rounded-full border border-ri-black text-ri-black text-[13px] font-[500] hover:bg-ri-black hover:text-ri-white transition-colors duration-150 disabled:opacity-50"
              >
                {resetLoading ? "sending..." : "send reset link"}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-ri-black text-ri-white text-[15px] font-[500] hover:bg-ri-gray-800 transition-colors duration-150 disabled:opacity-50 mt-2"
          >
            {loading ? "..." : mode === "signin" ? "sign in" : "create account"}
          </button>
        </form>

        <p className="text-[13px] text-ri-gray-500 text-center mt-8">
          {mode === "signin" ? "no account yet? " : "already have one? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin")
              setError(null)
            }}
            className="text-ri-black font-[500] hover:underline"
          >
            {mode === "signin" ? "sign up" : "sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
