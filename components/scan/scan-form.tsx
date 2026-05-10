"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Flame } from "@/components/flame"
import { formatProfileName, getBestAvatarUrl } from "@/lib/profile-utils"
import { useAuth } from "@/lib/auth-context"
import { getAuraTier, normalizeAuraScore } from "@/lib/aura"

type ScanStep = "idle" | "fetching" | "analyzing" | "calculating" | "verdict"

const SCAN_STEPS = [
  { key: "fetching", label: "connecting to linkedin..." },
  { key: "analyzing", label: "analyzing your experience..." },
  { key: "calculating", label: "calculating aura..." },
  { key: "verdict", label: "preparing the verdict..." },
]

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

function isValidLinkedInUrl(url: string): boolean {
  const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i
  return pattern.test(url.trim())
}

function extractUsername(url: string): string {
  const match = url.match(/linkedin\.com\/in\/([\w-]+)/i)
  return match ? match[1] : "anon"
}

export function ScanForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [step, setStep] = useState<ScanStep>("idle")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    try {
      if (authLoading) {
        setError("one sec, loading your account.")
        return
      }

      if (!linkedinUrl.trim()) {
        setError("paste your linkedin profile url.")
        return
      }

      if (!isValidLinkedInUrl(linkedinUrl)) {
        setError("that doesn't look like a valid linkedin url. try https://www.linkedin.com/in/your-name/")
        return
      }

      // Check for duplicate before scanning
      try {
        const checkRes = await fetch(`/api/check-duplicate?url=${encodeURIComponent(linkedinUrl.trim())}`)
        if (checkRes.ok) {
          const { exists } = await checkRes.json()
          if (exists) {
            setError("this linkedin profile has already been scanned and is on the leaderboard.")
            return
          }
        }
      } catch {
        // If check fails, proceed anyway
      }

      setError(null)
      setStep("fetching")

      const scanUsername = extractUsername(linkedinUrl)
      const displayName = formatProfileName(scanUsername)
      const scanId = `scan-${Date.now()}`

      let linkedinData: Record<string, unknown> = {
        fullName: displayName,
        firstName: displayName.split(" ")[0] || displayName,
        headline: "",
        avatar: getBestAvatarUrl(null, displayName, scanUsername),
        username: scanUsername,
        profileUrl: linkedinUrl.trim(),
        experience: [],
        education: [],
        skills: [],
      }

      // Fire LinkedIn API immediately — in parallel with the minimum "fetching" delay
      const linkedinFetch = fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: linkedinUrl.trim() }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)

      // Show "fetching" for at least 1s before moving on
      const [scrapedData] = await Promise.all([linkedinFetch, sleep(1000)])

      if (scrapedData && !scrapedData.error) {
        const rawName =
          scrapedData.fullName || scrapedData.name || displayName
        linkedinData = {
          ...linkedinData,
          ...scrapedData,
          fullName: formatProfileName(rawName, scanUsername),
          firstName: scrapedData.firstName || linkedinData.firstName,
          headline: scrapedData.headline || "",
          avatar: getBestAvatarUrl(
            scrapedData,
            rawName,
            scanUsername
          ),
          username: scanUsername,
          profileUrl: linkedinUrl.trim(),
        }
      }

      setStep("analyzing")
      await sleep(900)

      setStep("calculating")

      // Score API
      let aiResult = null
      try {
        const scoreRes = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkedinData }),
        })
        if (scoreRes.ok) {
          aiResult = await scoreRes.json()
        }
      } catch (err) {
        console.error("Score API failed:", err)
      }

      await sleep(700)
      setStep("verdict")
      await sleep(900)

      const savedAura = normalizeAuraScore(aiResult?.aura)
      const savedTier = getAuraTier(savedAura, aiResult?.tier || aiResult?.rank)
      if (aiResult) {
        aiResult = {
          ...aiResult,
          aura: savedAura,
          auraScore: savedAura,
          tier: savedTier,
          rank: savedTier,
        }
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("rankedin_last_scan")

        const scanData = {
          id: scanId,
          username: scanUsername,
          userId: user?.id || null,
          linkedinUrl: linkedinUrl.trim(),
          linkedinData,
          aiResult,
          scannedAt: Date.now(),
          created_at: new Date().toISOString(),
        }

        localStorage.setItem("rankedin_last_scan", JSON.stringify(scanData))

        const history = JSON.parse(
          localStorage.getItem("rankedin_scan_history") || "[]"
        )
        const withoutDuplicate = history.filter(
          (item: { id?: string; linkedinUrl?: string }) =>
            item.id !== scanData.id && item.linkedinUrl !== scanData.linkedinUrl
        )
        withoutDuplicate.push(scanData)
        localStorage.setItem(
          "rankedin_scan_history",
          JSON.stringify(withoutDuplicate.slice(-25))
        )

        // Save to Supabase
        try {
          await fetch("/api/save-scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: scanUsername,
              linkedin_url: linkedinUrl.trim(),
              full_name: linkedinData.fullName || displayName,
              aura: savedAura,
              tier: savedTier,
              school: linkedinData.headline || "",
              user_id: user?.id || null,
            }),
          })
        } catch (err) {
          console.error("Failed to save to Supabase:", err)
        }
      }

      router.push(`/profile/${scanId}`)
    } catch (err) {
      console.error("Scan failed:", err)
      setError("scan failed. please try again.")
      setStep("idle")
    }
  }

  const isScanning = step !== "idle"
  const currentStepLabel = SCAN_STEPS.find((s) => s.key === step)?.label ?? ""

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {!isScanning ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-6">
                aura scan
              </p>

              <h1 className="font-serif text-[32px] font-[500] text-ri-black mb-3 text-balance">
                paste your linkedin url.
              </h1>

              <p className="text-[15px] text-ri-gray-500 mb-10 leading-relaxed">
                no login required for this step. we analyze your profile and deliver the verdict.
              </p>

              <div className="mb-6">
                <label className="block text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-2">
                  linkedin profile url
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  placeholder="https://www.linkedin.com/in/your-name/"
                  className="w-full px-4 py-3 rounded-lg border border-ri-gray-200 bg-ri-white text-ri-black placeholder:text-ri-gray-300 text-[15px] focus:outline-none focus:border-ri-black transition-colors duration-150"
                />
              </div>

              {error && (
                <p className="text-[13px] text-red-500 mb-4">{error}</p>
              )}

              <button
                onClick={handleScan}
                disabled={authLoading}
                className="w-full py-3.5 rounded-full bg-ri-black text-ri-white text-[15px] font-[500] hover:bg-ri-gray-800 active:scale-[0.98] transition-[colors,transform] duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? "loading account..." : "scan my aura"}
              </button>

              <p className="text-[12px] text-ri-gray-400 text-center mt-6">
                we&apos;ll fetch public linkedin profile data and rank your aura.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-8 py-16"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Flame aura={1200} size={56} />
              </motion.div>

              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStepLabel}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="font-serif text-[20px] font-[500] text-ri-black"
                  >
                    {currentStepLabel || "connecting to linkedin..."}
                  </motion.p>
                </AnimatePresence>

                <p className="text-[14px] text-ri-gray-400 mt-2">
                  this takes about 5–10 seconds
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["fetching", "analyzing", "calculating", "verdict"].map((s) => (
                  <span
                    key={s}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      step === s ? "bg-ri-black" : "bg-ri-gray-200"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
