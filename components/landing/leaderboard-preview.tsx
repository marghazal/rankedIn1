"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { LeaderboardEntry } from "@/lib/leaderboard-data"
import { getGeneratedAvatarUrl, getScanLeaderboardEntry } from "@/lib/profile-utils"
import { isAfterLeaderboardReset } from "@/lib/aura"

const MEDALS = ["", "", ""]

export function LeaderboardPreview() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=3')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setEntries(data.slice(0, 3))
          return
        }
      } catch { /* fall through */ }

      try {
        const raw = localStorage.getItem("rankedin_last_scan")
        const historyRaw = localStorage.getItem("rankedin_scan_history")
        const lastScan = raw ? JSON.parse(raw) : null
        const history = historyRaw ? JSON.parse(historyRaw) : []
        const scans = (Array.isArray(history) ? history : []).filter((scan) => isAfterLeaderboardReset(scan?.scannedAt || scan?.created_at))
        if (lastScan && isAfterLeaderboardReset(lastScan.scannedAt || lastScan.created_at)) scans.push(lastScan)

        const byUrl = new Map<string, LeaderboardEntry>()
        for (const scan of scans) {
          const entry = getScanLeaderboardEntry(scan)
          if (entry) byUrl.set(entry.linkedinUrl || entry.username, entry)
        }

        setEntries(
          [...byUrl.values()]
            .sort((a, b) => b.aura - a.aura || a.name.localeCompare(b.name))
            .slice(0, 3)
        )
      } catch {
        setEntries([])
      }
    }

    load()
  }, [])

  return (
    <section className="py-20 px-6 border-y border-ri-gray-100">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between gap-6 mb-10"
        >
          <div>
            <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.14em] mb-3">
              leaderboard
            </p>
            <h2 className="font-serif text-[32px] font-[800] text-ri-black tracking-tight">
              top aura right now
            </h2>
          </div>
          <Link
            href="/leaderboard"
            className="text-[13px] font-[600] text-ri-gray-500 hover:text-ri-black transition-colors duration-150 shrink-0 underline underline-offset-4 decoration-ri-gray-200"
          >
            view all →
          </Link>
        </motion.div>

        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-raised rounded-xl p-8 text-center bg-ri-off-white"
          >
            <p className="text-3xl mb-3">🏆</p>
            <p className="font-serif text-[18px] font-[700] text-ri-gray-400 italic">
              no scans yet. be the first on the board.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id || entry.linkedinUrl || entry.username}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={`/profile/${entry.id || entry.username}`}
                  className="card-raised-sm rounded-xl bg-ri-off-white p-4 flex items-center gap-4 group block"
                >
                  <span className="text-2xl w-8 text-center shrink-0 select-none">
                    {MEDALS[index] ?? index + 1}
                  </span>
                  <PreviewAvatar entry={entry} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] font-[600] text-ri-black truncate block group-hover:underline underline-offset-2">
                      {entry.name}
                    </span>
                    <p className="text-[12px] text-ri-gray-400 truncate font-serif italic">
                      {entry.tier}
                    </p>
                  </div>
                  <p className="font-mono text-[20px] font-[500] text-ri-black tabular-nums shrink-0">
                    {entry.aura.toLocaleString()}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PreviewAvatar({ entry }: { entry: LeaderboardEntry }) {
  const [src, setSrc] = useState(entry.avatar || getGeneratedAvatarUrl(entry.name, entry.username))
  return (
    <img
      src={src}
      alt={entry.name}
      className="w-[44px] h-[44px] rounded-full object-cover shrink-0 border border-ri-gray-100"
      onError={() => setSrc(getGeneratedAvatarUrl(entry.name, entry.username))}
    />
  )
}
