"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

export function ResetPasswordView() {
  const router = useRouter()
  const { updatePassword, session, loading } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !session) {
      setError("reset link expired or invalid. request a new reset email.")
    }
  }, [loading, session])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 6) {
      setError("password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("passwords do not match.")
      return
    }

    setSaving(true)
    const { error: updateError } = await updatePassword(password)
    setSaving(false)

    if (updateError) {
      setError(updateError.toLowerCase())
      return
    }

    setSuccess("password updated. sending you to sign in...")
    setTimeout(() => router.push("/login"), 1200)
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
          password reset
        </p>

        <h1 className="font-serif text-[32px] font-[500] text-ri-black mb-3 text-balance">
          choose a new password.
        </h1>

        <p className="text-[15px] text-ri-gray-500 mb-10 leading-relaxed">
          enter a new password for your RankedIn account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-2">
              new password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="at least 6 characters"
              autoComplete="new-password"
              disabled={!session || saving}
              className="w-full px-4 py-3 rounded-lg border border-ri-gray-200 bg-ri-white text-ri-black placeholder:text-ri-gray-300 text-[15px] focus:outline-none focus:border-ri-black transition-colors duration-150 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-2">
              confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="type it again"
              autoComplete="new-password"
              disabled={!session || saving}
              className="w-full px-4 py-3 rounded-lg border border-ri-gray-200 bg-ri-white text-ri-black placeholder:text-ri-gray-300 text-[15px] focus:outline-none focus:border-ri-black transition-colors duration-150 disabled:opacity-60"
            />
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}
          {success && <p className="text-[13px] text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={!session || saving}
            className="w-full py-3.5 rounded-full bg-ri-black text-ri-white text-[15px] font-[500] hover:bg-ri-gray-800 transition-colors duration-150 disabled:opacity-50 mt-2"
          >
            {saving ? "updating..." : "update password"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
