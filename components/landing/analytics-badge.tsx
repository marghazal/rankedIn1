"use client"

import { useEffect, useState } from "react"
import { motion, animate } from "framer-motion"
import { isAfterLeaderboardReset, normalizeAuraScore } from "@/lib/aura"

function CountUp({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const ctrl = animate(0, target, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return ctrl.stop
  }, [target])
  return <span>{display.toLocaleString()}</span>
}

export function AnalyticsBadge() {
  const [stats, setStats] = useState({ count: 0, avgAura: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/leaderboard")
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const count = data.length
          const avgAura = Math.round(data.reduce((s: number, e: any) => s + e.aura, 0) / count)
          setStats({ count, avgAura })
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
        if (scans.length > 0) {
          const count = scans.length
          const avgAura = Math.round(scans.reduce((s: number, e: any) => s + normalizeAuraScore(e.aiResult?.aura), 0) / count)
          setStats({ count, avgAura })
        }
      } catch { /* ignore */ }
    }
    load()
  }, [])

  return (
    <section className="py-16 px-6 bg-ri-black border-y border-ri-black">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          onViewportEnter={() => setVisible(true)}
          className="grid grid-cols-3 gap-0 text-center divide-x divide-white/10"
        >
          <div className="px-6 py-4">
            <p className="font-serif text-[48px] md:text-[60px] font-[800] text-white tabular-nums leading-none">
              {visible ? <CountUp target={stats.count} /> : "0"}
            </p>
            <p className="text-[11px] font-[600] text-white/40 mt-3 uppercase tracking-[0.14em]">profiles ranked</p>
          </div>
          <div className="px-6 py-4">
            <p className="font-serif text-[48px] md:text-[60px] font-[800] text-amber-400 tabular-nums leading-none">
              {visible ? <CountUp target={stats.avgAura} /> : "0"}
            </p>
            <p className="text-[11px] font-[600] text-white/40 mt-3 uppercase tracking-[0.14em]">average aura</p>
          </div>
          <div className="px-6 py-4">
            <p className="font-serif text-[48px] md:text-[60px] font-[800] text-white tabular-nums leading-none">
              6
            </p>
            <p className="text-[11px] font-[600] text-white/40 mt-3 uppercase tracking-[0.14em]">rank tiers</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
