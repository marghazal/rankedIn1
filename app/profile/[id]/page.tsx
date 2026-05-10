'use client'

import { Nav } from "@/components/nav"
import { ProfileResult } from "@/components/profile/profile-result"
import { type ProfileData } from "@/lib/demo-profile"
import { getAuraTier, normalizeAuraScore } from "@/lib/aura"
import { formatProfileName, getBestAvatarUrl } from "@/lib/profile-utils"
import { useEffect, useState } from 'react'
import { use } from 'react'

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // First try to fetch from Supabase leaderboard
        const leaderboardRes = await fetch('/api/leaderboard')
        const leaderboardData = await leaderboardRes.json()

        if (Array.isArray(leaderboardData)) {
          const entry = leaderboardData.find(
            (e: any) => e.id === id || e.username === id || e.linkedinUrl.includes(id)
          )

          if (entry) {
            const profile: ProfileData = {
              id: entry.id || id,
              username: entry.username,
              name: entry.name,
              school: entry.university || "",
              aura: normalizeAuraScore(entry.aura),
              tier: getAuraTier(entry.aura, entry.tier),
              breakdown: [],
              roasts: [],
              jobMatches: [],
              improvements: [],
              avatar: entry.avatar,
            }
            setProfile(profile)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        console.error("Failed to load from leaderboard:", e)
      }

      // Fallback to localStorage (for current scan)
      const raw = localStorage.getItem('rankedin_last_scan')
      if (!raw) {
        setLoading(false)
        return
      }

      try {
        const scan = JSON.parse(raw)
        if (scan.id !== id) {
          // ID doesn't match current scan, don't load
          setLoading(false)
          return
        }

        const aiResult = scan.aiResult
        const linkedinData = scan.linkedinData

        if (!aiResult || !linkedinData) {
          setLoading(false)
          return
        }

        // Use name from manual input or LinkedIn data
        const displayName = linkedinData.fullName ||
          (linkedinData.first_name && linkedinData.last_name ? `${linkedinData.first_name} ${linkedinData.last_name}` : "") ||
          linkedinData.firstName ||
          scan.username || "";
        const cleanDisplayName = formatProfileName(displayName, scan.username || "")
        const avatarUrl = getBestAvatarUrl(linkedinData, cleanDisplayName, scan.username || "")

        // Use headline as school/role info
        const headline = linkedinData.headline || "";

        // ONLY use real data - no mock fallbacks
        const rawAura = typeof aiResult.aura === "number" ? aiResult.aura : 0
        const aura = normalizeAuraScore(rawAura)
        const profile: ProfileData = {
          id: scan.id,
          username: scan.username ?? "",
          name: cleanDisplayName,
          school: scan.university || headline || "",
          aura,
          tier: getAuraTier(rawAura, aiResult.tier ?? aiResult.rank),
          breakdown: (aiResult.breakdown ?? []).filter((item: { label?: string }) => item.label !== "GitHub"),
          roasts: aiResult.roasts ?? [],
          jobMatches: aiResult.jobMatches ?? [],
          improvements: aiResult.improvements ?? [],
          avatar: avatarUrl,
        }
        setProfile(profile)
      } catch (e) {
        console.error("Failed to load profile:", e)
      }
      setLoading(false)
    }

    loadProfile()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-ri-white">
        <Nav />
        <div className="max-w-[720px] mx-auto px-6 py-24 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-ri-gray-200 border-t-ri-black rounded-full animate-spin" />
            <p className="text-[14px] text-ri-gray-400">loading profile…</p>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-ri-white">
        <Nav />
        <div className="max-w-[520px] mx-auto px-6 py-24 text-center">
          <p className="text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-4">
            profile not found
          </p>
          <h1 className="font-serif text-[28px] font-[500] text-ri-black mb-3">
            we couldn&apos;t load this scan.
          </h1>
          <p className="text-[15px] text-ri-gray-500 mb-8 leading-relaxed">
            it might have expired, or the link is broken. try scanning again to get a fresh aura read.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] hover:border-ri-black transition-colors duration-150"
            >
              retry
            </button>
            <a
              href="/scan"
              className="px-5 py-2.5 rounded-full bg-ri-black text-ri-white text-[14px] font-[500] hover:bg-ri-gray-800 transition-colors duration-150"
            >
              scan a profile
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ri-white">
      <Nav />
      <ProfileResult profile={profile} />
    </main>
  )
}
