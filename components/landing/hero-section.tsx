"use client"

import Link from "next/link"
import { motion, animate } from "framer-motion"
import { useEffect, useState } from "react"

function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const ctrl = animate(0, target, {
      duration: 1.2,
      delay: 0.3,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return ctrl.stop
  }, [target])
  return <span>{display.toLocaleString()}</span>
}

function AuraCardMock() {
  const bars = [60, 85, 45, 95, 70, 88, 55]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      className="card-raised rounded-2xl bg-[#FAF6EF] p-6 w-[280px]"
    >
      {/* Profile */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-black/10">
          A
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-[600] text-ri-black leading-none mb-0.5">Mkareos Kzkoz</p>
          <p className="text-[11px] text-ri-gray-400">Software Engineer</p>
        </div>
        <span className="ml-auto shrink-0 text-[10px] font-[700] px-2 py-0.5 rounded-full bg-amber-400 text-black border border-amber-500">
          Top 1%
        </span>
      </div>

      {/* Score */}
      <div className="mb-1">
        <p className="text-[10px] font-[600] text-ri-gray-400 uppercase tracking-[0.14em] mb-1">aura score</p>
        <p className="font-serif text-[52px] font-[800] text-ri-black leading-none tabular-nums">
          <AnimatedScore target={2847} />
        </p>
      </div>

      <p className="text-[11px] font-[600] text-amber-600 mb-5 uppercase tracking-wide">RankedIn Warrior</p>

      {/* Bar chart */}
      <div className="flex gap-1.5 items-end h-10 mb-1">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-amber-400 border border-amber-500"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.25, delay: 0.3 + i * 0.04, ease: "easeOut" }}
            style={{ height: `${h}%`, originY: 1 }}
          />
        ))}
      </div>
      <p className="text-[9px] text-ri-gray-300 uppercase tracking-[0.1em]">breakdown</p>

      {/* Roast */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="mt-4 bg-ri-gray-50 rounded-lg px-3 py-2.5 border border-ri-gray-100"
      >
        <p className="text-[11px] text-ri-gray-500 italic leading-snug">
          "+ 10000 aura points "
        </p>
      </motion.div>
    </motion.div>
  )
}

export function HeroSection() {
  return (
    <section className="min-h-[88vh] flex flex-col justify-center px-6 py-20">
      <div className="max-w-[1100px] mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div>
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.14em]">
              RankedIn — career as a sport
            </p>
          </motion.div>

          <motion.h1
            className="font-serif text-[clamp(48px,7vw,80px)] font-[800] text-ri-black leading-[1.0] mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            LinkedIn<br />
            <em className="not-italic text-amber-500">ranked.</em>
          </motion.h1>

          <motion.p
            className="text-[17px] text-ri-gray-500 leading-[1.7] mb-10 max-w-sm font-sans"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            paste your linkedin. and check how much aura u got.
          </motion.p>

          <motion.div
            className="flex items-center gap-3 flex-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <Link
              href="/scan"
              className="card-raised-sm inline-flex items-center px-6 py-3 rounded-xl bg-ri-black text-[#FAF6EF] text-[14px] font-[600] hover:bg-ri-gray-800 active:scale-[0.97] transition-[colors,transform] duration-100"
            >
              calculate my aura
            </Link>
            <Link
              href="/leaderboard"
              className="text-[14px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150 underline underline-offset-4 decoration-ri-gray-200"
            >
              see leaderboard
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-10 text-[12px] text-ri-gray-300 border-l-2 border-ri-gray-100 pl-3"
          >
            Results saved to the leaderboard and ranked by aura.
          </motion.p>
        </div>

        {/* Right: card */}
        <div className="hidden md:flex justify-center items-center">
          <AuraCardMock />
        </div>
      </div>
    </section>
  )
}
