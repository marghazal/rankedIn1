"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { TierBadge } from "@/components/profile/tier-badge"
import { getAuraTier, isAfterLeaderboardReset, normalizeAuraScore } from "@/lib/aura"
import { formatProfileName } from "@/lib/profile-utils"

interface ScanRecord {
  id: string
  username: string
  full_name: string
  linkedin_url: string
  aura: number
  tier: string
  school?: string
  created_at: string
}

function getLocalHistoryForUser(userId: string): ScanRecord[] {
  try {
    const raw = localStorage.getItem("rankedin_last_scan")
    const historyRaw = localStorage.getItem("rankedin_scan_history")
    const lastScan = raw ? JSON.parse(raw) : null
    const history = historyRaw ? JSON.parse(historyRaw) : []
    const scans = Array.isArray(history) ? history : []
    if (lastScan) scans.push(lastScan)

    const records = new Map<string, ScanRecord>()
    for (const scan of scans) {
      if (!scan || scan.userId !== userId) continue
      if (!isAfterLeaderboardReset(scan.scannedAt || scan.created_at)) continue

      const linkedinData = scan.linkedinData || {}
      const rawName = linkedinData.fullName || linkedinData.name || scan.username || "anon"
      const aura = normalizeAuraScore(scan.aiResult?.aura)
      if (!aura) continue

      const record: ScanRecord = {
        id: scan.id || `${scan.linkedinUrl}-${scan.scannedAt}`,
        username: scan.username || "",
        full_name: formatProfileName(rawName, scan.username || ""),
        linkedin_url: scan.linkedinUrl || linkedinData.profileUrl || "",
        aura,
        tier: getAuraTier(aura, scan.aiResult?.tier || scan.aiResult?.rank),
        school: linkedinData.headline || scan.university || "",
        created_at: scan.created_at || new Date(scan.scannedAt || Date.now()).toISOString(),
      }

      records.set(record.id, record)
    }

    return [...records.values()]
  } catch {
    return []
  }
}

export function HistoryView() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/history?user_id=${user.id}`)
        const data = await res.json()
        const remoteScans = Array.isArray(data) ? data : []
        const localScans = getLocalHistoryForUser(user.id)
        const merged = new Map<string, ScanRecord>()

        for (const scan of [...remoteScans, ...localScans]) {
          merged.set(scan.id, scan)
        }

        setScans(
          [...merged.values()].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      } catch (err) {
        console.error("Failed to load history:", err)
        setScans(getLocalHistoryForUser(user.id))
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <p className="text-[14px] text-ri-gray-400">loading your history…</p>
      </div>
    )
  }

  const peak = scans.reduce((max, s) => (s.aura > max ? s.aura : max), 0)
  const latest = scans[0]
  const trend = scans.length >= 2 ? scans[0].aura - scans[scans.length - 1].aura : 0

  return (
    <div className="max-w-[720px] mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-3">
          your scans
        </p>
        <h1 className="font-serif text-[32px] font-[500] text-ri-black mb-2 text-balance">
          your aura history.
        </h1>
        <p className="text-[14px] text-ri-gray-400 mb-10">
          signed in as <span className="font-mono text-ri-gray-600">{user?.email}</span>
        </p>
      </motion.div>

      {scans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-ri-off-white border border-ri-gray-100 rounded-xl"
        >
          <p className="font-serif text-[20px] italic text-ri-gray-400 mb-6">
            no scans yet.
          </p>
          <Link
            href="/scan"
            className="inline-block px-6 py-3 rounded-full bg-ri-black text-ri-white text-[14px] font-[500] hover:bg-ri-gray-800 transition-colors duration-150"
          >
            scan your first profile
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Stats overview */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-10"
          >
            <div className="bg-ri-off-white rounded-xl border border-ri-gray-100 p-5">
              <p className="text-[11px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-2">
                total scans
              </p>
              <p className="font-mono text-[24px] font-[500] text-ri-black tabular-nums">
                {scans.length}
              </p>
            </div>
            <div className="bg-ri-off-white rounded-xl border border-ri-gray-100 p-5">
              <p className="text-[11px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-2">
                peak aura
              </p>
              <p className="font-mono text-[24px] font-[500] text-ri-black tabular-nums">
                {peak.toLocaleString()}
              </p>
            </div>
            <div className="bg-ri-off-white rounded-xl border border-ri-gray-100 p-5">
              <p className="text-[11px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em] mb-2">
                trend
              </p>
              <p className={`font-mono text-[24px] font-[500] tabular-nums ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : "text-ri-gray-400"}`}>
                {trend > 0 ? "+" : ""}{trend !== 0 ? trend : "—"}
              </p>
            </div>
          </motion.div>

          {/* Latest scan callout */}
          {latest && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-ri-black text-ri-white rounded-xl p-6 mb-10"
            >
              <p className="text-[11px] font-[500] uppercase tracking-[0.1em] mb-2 opacity-60">
                most recent
              </p>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif text-[20px] font-[500] mb-1">{latest.full_name}</p>
                  <TierBadge tier={latest.tier} aura={latest.aura} dark />
                </div>
                <p className="font-serif italic text-[40px] tabular-nums leading-none">
                  {latest.aura.toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}

          {/* Scan list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-ri-off-white rounded-xl border border-ri-gray-100 overflow-hidden"
          >
            {scans.map((scan, i) => {
              const date = new Date(scan.created_at)
              const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              return (
                <div
                  key={scan.id}
                  className="flex items-center justify-between px-5 py-4 border-b border-ri-gray-100 last:border-0 hover:bg-ri-gray-50/50 transition-colors duration-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-[500] text-ri-black truncate">{scan.full_name}</p>
                    <p className="text-[12px] text-ri-gray-400 mt-0.5">
                      {dateStr} · <span className="font-serif italic">{scan.tier}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-mono text-[16px] font-[500] text-ri-black tabular-nums">
                      {scan.aura.toLocaleString()}
                    </p>
                    {i < scans.length - 1 && (
                      <p className={`text-[11px] font-mono tabular-nums ${
                        scan.aura - scans[i + 1].aura > 0 ? "text-green-600" :
                        scan.aura - scans[i + 1].aura < 0 ? "text-red-500" : "text-ri-gray-300"
                      }`}>
                        {scan.aura - scans[i + 1].aura > 0 ? "+" : ""}
                        {scan.aura - scans[i + 1].aura !== 0 ? scan.aura - scans[i + 1].aura : "—"}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        </>
      )}
    </div>
  )
}
