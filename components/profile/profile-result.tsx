"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { AuraCounter } from "@/components/profile/aura-counter"
import { ShareCardModal } from "@/components/profile/share-card-modal"
import { TierBadge } from "@/components/profile/tier-badge"
import { type ProfileData } from "@/lib/demo-profile"
import { formatProfileName, getBestAvatarUrl, getGeneratedAvatarUrl } from "@/lib/profile-utils"
import { getAuraTier, normalizeAuraScore } from "@/lib/aura"

interface ProfileResultProps {
  profile: ProfileData
}

export function ProfileResult({ profile: serverProfile }: ProfileResultProps) {
  const [profile, setProfile] = useState<ProfileData>(serverProfile)
  const [showShareCard, setShowShareCard] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [profile.avatar])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rankedin_last_scan")
      if (!raw) return
      const scan = JSON.parse(raw)

      // Only apply if this scan matches the current profile id
      if (!scan.id || scan.id !== serverProfile.id) return

      const ai = scan.aiResult
      if (!ai || typeof ai.aura !== "number") return

      const aura = normalizeAuraScore(ai.aura)
      const linkedinData = scan.linkedinData || {}

      // Extract name properly
      const displayName = linkedinData.fullName || 
        (linkedinData.first_name && linkedinData.last_name ? `${linkedinData.first_name} ${linkedinData.last_name}` : "") ||
        linkedinData.firstName || 
        scan.username || 
        serverProfile.name || "";
      const cleanDisplayName = formatProfileName(displayName, scan.username || serverProfile.username)
      const avatarUrl = getBestAvatarUrl(linkedinData, cleanDisplayName, scan.username || serverProfile.username)
      
      // ONLY use real data - no DEMO_PROFILE fallback
      setProfile({
        id: scan.id,
        username: scan.username ?? "",
        name: cleanDisplayName,
        school: scan.university || linkedinData.headline || serverProfile.school || "",
        aura,
        tier: getAuraTier(ai.aura, ai.tier ?? ai.rank),
        breakdown: (ai.breakdown || serverProfile.breakdown || []).filter((item: { label?: string }) => item.label !== "GitHub"),
        roasts: ai.roasts || serverProfile.roasts || [],
        jobMatches: ai.jobMatches || serverProfile.jobMatches || [],
        improvements: ai.improvements || serverProfile.improvements || [],
        avatar: avatarUrl,
      })
    } catch (e) {
      console.error("[v0] Failed to read AI result from localStorage:", e)
    }
  }, [serverProfile.id, serverProfile.username, serverProfile.school, serverProfile.name, serverProfile.avatar, serverProfile.breakdown, serverProfile.roasts, serverProfile.jobMatches, serverProfile.improvements])



  return (
    <>
    <ShareCardModal
      profile={profile}
      open={showShareCard}
      onClose={() => setShowShareCard(false)}
    />
    <div className="max-w-[720px] mx-auto px-6 py-16">
      {/* Hero: Profile card + Score + Meme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-12">
          {imgError || !profile.avatar ? (
            <div className="w-[64px] h-[64px] rounded-full bg-ri-gray-100 flex items-center justify-center text-ri-gray-400 text-[24px] font-[500]">
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          ) : (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-[64px] h-[64px] rounded-full object-cover"
              onError={(event) => {
                const fallback = getGeneratedAvatarUrl(profile.name, profile.username)
                if (event.currentTarget.src !== fallback) {
                  event.currentTarget.src = fallback
                  return
                }
                setImgError(true)
              }}
            />
          )}
          <div>
            <h1 className="text-[20px] font-[500] text-ri-black">{profile.name}</h1>
            <p className="text-[13px] text-ri-gray-500">@{profile.username}</p>
            {profile.school && <p className="text-[12px] text-ri-gray-400 mt-1">{profile.school}</p>}
          </div>
        </div>

        {/* Aura + Tier in a row */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <p className="text-[12px] text-ri-gray-400 uppercase tracking-[0.1em] mb-3">aura score</p>
            <AuraCounter
              value={profile.aura}
              className="tabular-nums leading-none text-ri-black block"
              style={{ fontSize: "3.5rem" } as React.CSSProperties}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col items-center justify-center"
          >
            <p className="text-[12px] text-ri-gray-400 uppercase tracking-[0.1em] mb-3">your tier</p>
            <TierBadge tier={profile.tier} size="lg" />
          </motion.div>
        </div>

      </motion.div>

      {/* Score breakdown */}
      {profile.breakdown && profile.breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.12em] mb-5">score breakdown</p>
          <div className="flex flex-col gap-3">
            {profile.breakdown.map((item: { label: string; value: number; max: number; reason: string; positive: boolean }) => {
              const pct = Math.round((item.value / item.max) * 100)
              return (
                <div key={item.label} className="bg-ri-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-[500] text-ri-black">{item.label}</span>
                    <span className="text-[13px] font-[600] tabular-nums text-ri-black">{item.value}<span className="text-ri-gray-400 font-[400]">/{item.max}</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-ri-gray-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`h-full rounded-full ${pct >= 60 ? "bg-[#E8A020]" : pct >= 30 ? "bg-ri-gray-300" : "bg-ri-gray-200"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[12px] text-ri-gray-400 leading-relaxed">{item.reason}</p>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Roast */}
      {profile.roasts && profile.roasts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">the verdict</p>
          <div className="bg-ri-black rounded-xl p-5 flex flex-col gap-3">
            {profile.roasts.map((roast: string, i: number) => (
              <p key={i} className="text-[13px] text-[#FAF6EF] leading-relaxed">{roast}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* How to improve */}
      {profile.improvements && profile.improvements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.12em] mb-5">how to increase your aura</p>
          <div className="flex flex-col gap-3">
            {profile.improvements.map((imp: { area: string; suggestion: string; potentialGain: number }, i: number) => (
              <div key={i} className="border border-ri-gray-100 rounded-xl p-4 flex gap-4 items-start">
                <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#E8A020]/15 flex items-center justify-center">
                  <span className="text-[11px] font-[700] text-[#C07010]">+{imp.potentialGain}</span>
                </div>
                <div>
                  <p className="text-[13px] font-[600] text-ri-black mb-1">{imp.area}</p>
                  <p className="text-[12px] text-ri-gray-500 leading-relaxed">{imp.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-20 pt-12 border-t border-ri-gray-100"
      >
        <div className="flex flex-col gap-2">
            <Link
              href="/scan"
              className="block w-full py-3.5 rounded-full bg-ri-black text-ri-white text-[15px] font-[500] text-center hover:bg-ri-gray-800 active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              scan another profile
            </Link>
            <Link
              href={`/battle?a=${profile.id}`}
              className="block w-full py-3 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] text-center hover:border-ri-black active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              battle with a friend
            </Link>
            <button
              onClick={() => setShowShareCard(true)}
              className="w-full py-3 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] hover:border-ri-black active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              share your result
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=just%20got%20ranked%20%F0%9F%94%A5%0AI%27m%20${profile.tier.replace(/ /g, "%20")}%20on%20%40RankedIn%0AMy%20aura%3A%20${profile.aura.toLocaleString()}%20%7C%20${profile.tier}%0A%0Awhat%27s%20your%20aura%3F&url=https://rankedin.app`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] text-center hover:border-ri-black active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              post on 𝕏
            </a>
        </div>
      </motion.div>
    </div>
    </>
  )
}
