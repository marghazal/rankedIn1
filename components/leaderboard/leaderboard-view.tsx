"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { LEADERBOARD, ONTARIO_UNIVERSITIES, type LeaderboardEntry } from "@/lib/leaderboard-data"
import { getGeneratedAvatarUrl, getScanLeaderboardEntry } from "@/lib/profile-utils"
import { TierBadge } from "@/components/profile/tier-badge"
import { isAfterLeaderboardReset } from "@/lib/aura"

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

type TabType = "this-week" | "all-time"

const ALL_UNIVERSITIES = "All Ontario Universities"

export function LeaderboardView() {
  const [selectedUni, setSelectedUni] = useState<string>(ALL_UNIVERSITIES)
  const [localEntries, setLocalEntries] = useState<LeaderboardEntry[]>([])
  const [isLive, setIsLive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Default to the user's last-scanned university
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await fetch(`/api/leaderboard`)
        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
          setLocalEntries(data)
          setIsLive(true)
          setError(null)
          return
        }
        // Fall through to localStorage if API returns empty
        setIsLive(false)
      } catch (err) {
        console.error("Failed to load leaderboard:", err)
        setIsLive(false)
      }

      // Load from localStorage (either API failed or returned empty)
      try {
        const raw = localStorage.getItem("rankedin_last_scan")
        const historyRaw = localStorage.getItem("rankedin_scan_history")
        const scan = raw ? JSON.parse(raw) : null
        const history = historyRaw ? JSON.parse(historyRaw) : []
        const scans = (Array.isArray(history) ? history : []).filter((item) => isAfterLeaderboardReset(item?.scannedAt || item?.created_at))
        if (scan && isAfterLeaderboardReset(scan.scannedAt || scan.created_at)) scans.push(scan)

        const entriesByUrl = new Map<string, LeaderboardEntry>()
        for (const item of scans) {
          const entry = getScanLeaderboardEntry(item)
          if (entry) entriesByUrl.set(entry.linkedinUrl || entry.username, entry)
        }

        setLocalEntries([...entriesByUrl.values()])
        setError(null)
      } catch {
        setError("Failed to load leaderboard. Check your connection and try again.")
      }
    }

    loadLeaderboard()

    // Set up polling for realtime updates every 3 seconds
    const interval = setInterval(loadLeaderboard, 3000)
    return () => clearInterval(interval)
  }, [])

  // Deduplicate entries by username and name, keeping highest aura
  const uniqueMap = new Map<string, LeaderboardEntry>()
  for (const entry of localEntries) {
    const key = (entry.username || entry.name)?.toLowerCase().trim()
    if (!key) continue

    const existing = uniqueMap.get(key)
    if (!existing || entry.aura > existing.aura) {
      uniqueMap.set(key, entry)
    }
  }
  const allEntries = Array.from(uniqueMap.values())

  const filteredEntries: LeaderboardEntry[] = allEntries
    .filter((e) =>
      searchQuery.trim() === ""
        ? true
        : e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const entries = [...filteredEntries]
    .sort((a, b) => b.aura - a.aura || b.delta - a.delta || a.name.localeCompare(b.name))
    .map((e, i) => ({ ...e, rank: i + 1 }))

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const displayTitle = "The Rankings"

  return (
    <div className="max-w-[720px] mx-auto px-6 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.1em]">
            leaderboard
          </p>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[11px] font-[500] text-green-600">live</span>
            </div>
          )}
        </div>
        <h1 className="font-serif text-[32px] font-[500] text-ri-black mb-6 text-balance">
          {displayTitle}
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-ri-gray-200 text-[14px] text-ri-black placeholder:text-ri-gray-300 focus:outline-none focus:border-ri-black transition-colors duration-150 mb-6"
        />

      </motion.div>

      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block max-w-sm">
            <p className="text-[14px] font-[500] text-red-900 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-4 py-2 rounded-full bg-red-600 text-white text-[13px] font-[500] hover:bg-red-700 transition-colors duration-150"
            >
              try again
            </button>
          </div>
        </motion.div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <p className="font-serif text-[20px] italic text-ri-gray-400">
            no rankings yet.
          </p>
          <a
            href="/scan"
            className="inline-block mt-6 px-6 py-3 rounded-full bg-ri-black text-ri-white text-[14px] font-[500] hover:bg-ri-gray-800 transition-colors duration-150"
          >
            be the first
          </a>
        </motion.div>
      ) : (
        <>
          {/* Top 3 podium */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-3 mb-8"
          >
            {top3.map((entry) => (
              <a
                key={entry.username}
                href={`/profile/${entry.id || entry.username}`}
                className="bg-ri-off-white rounded-xl border border-ri-gray-100 p-5 flex items-center gap-4 hover:border-ri-gray-300 transition-colors duration-150 group"
              >
                <span className="font-serif text-[28px] font-[500] text-ri-gray-200 w-8 text-center shrink-0 leading-none">
                  {entry.rank}
                </span>

                <AvatarImage entry={entry} size={48} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-[500] text-ri-black truncate group-hover:underline">
                      {entry.name}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <TierBadge tier={entry.tier} size="sm" />
                    {timeAgo(entry.created_at) && (
                      <span className="text-[11px] text-ri-gray-400 font-[500]">{timeAgo(entry.created_at)}</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className="font-mono text-[20px] font-[500] text-ri-black tabular-nums">
                      {entry.aura.toLocaleString()}
                    </p>
                    <p
                      className={`text-[12px] font-mono font-[500] tabular-nums ${
                        entry.delta > 0 ? "text-ri-black" : "text-ri-gray-400"
                      }`}
                    >
                      {entry.delta > 0 ? "+" : ""}
                      {entry.delta !== 0 ? entry.delta : "—"}
                    </p>
                  </div>
                  <CopyButton entry={entry} />
                </div>
              </a>
            ))}
          </motion.div>

          {/* Ranks 4+ */}
          {rest.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-ri-off-white rounded-xl border border-ri-gray-100 overflow-hidden"
            >
              {rest.map((entry, i) => {
                return (
                  <motion.div
                    key={entry.username}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.25 + i * 0.02 }}
                  >
                    <a
                      href={`/profile/${entry.id || entry.username}`}
                      className="flex items-center gap-3 px-5 py-3 border-b border-ri-gray-100 last:border-0 transition-colors duration-100 group hover:bg-ri-gray-50/50"
                    >
                      <span
                        className="font-mono text-[13px] font-[500] w-6 shrink-0 tabular-nums text-ri-gray-300"
                      >
                        {entry.rank}
                      </span>

                      <AvatarImage entry={entry} size={36} />

                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span
                          className="text-[14px] font-[500] truncate group-hover:underline text-ri-gray-700"
                        >
                          {entry.name}
                        </span>
                        {timeAgo(entry.created_at) && (
                          <span className="text-[11px] text-ri-gray-400 font-[500] shrink-0">{timeAgo(entry.created_at)}</span>
                        )}
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <span
                          className="font-mono text-[14px] font-[500] tabular-nums text-ri-gray-700"
                        >
                          {entry.aura.toLocaleString()}
                        </span>
                        <span
                          className={`font-mono text-[12px] font-[500] tabular-nums w-10 text-right ${
                            entry.delta > 0 ? "text-ri-black" : "text-ri-gray-300"
                          }`}
                        >
                          {entry.delta > 0 ? "+" : ""}
                          {entry.delta !== 0 ? entry.delta : "—"}
                        </span>
                      </div>
                    </a>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </>
      )}

    </div>
  )
}

function CopyButton({ entry }: { entry: LeaderboardEntry }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    const text = `${entry.name} just ranked ${entry.aura.toLocaleString()} aura on RankedIn. ${entry.tier}. https://rankedin.app`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-full hover:bg-ri-gray-100 transition-colors duration-150"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={18} className="text-green-600" />
      ) : (
        <Copy size={18} className="text-ri-gray-400 hover:text-ri-gray-600" />
      )}
    </button>
  )
}

function AvatarImage({ entry, size }: { entry: LeaderboardEntry; size: number }) {
  const [failed, setFailed] = useState(false)
  const initial = entry.name?.charAt(0)?.toUpperCase() || "?"

  if (!entry.avatar || failed) {
    return (
      <span
        className="rounded-full bg-ri-gray-100 text-ri-gray-400 flex items-center justify-center font-[500] shrink-0"
        style={{ width: size, height: size, fontSize: Math.max(13, size * 0.38) }}
      >
        {initial}
      </span>
    )
  }

  return (
    <img
      src={entry.avatar}
      alt={entry.name}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
      onError={(event) => {
        const fallback = getGeneratedAvatarUrl(entry.name, entry.username)
        if (event.currentTarget.src !== fallback) {
          event.currentTarget.src = fallback
          return
        }
        setFailed(true)
      }}
    />
  )
}
