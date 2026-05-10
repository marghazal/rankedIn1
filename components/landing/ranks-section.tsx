"use client"

import { motion } from "framer-motion"
import { RANK_TIERS } from "@/lib/ranks"

const TIER_BG = [
  "bg-ri-off-white",
  "bg-amber-50",
  "bg-yellow-50",
  "bg-orange-50",
  "bg-red-50",
  "bg-rose-50",
]

export function RanksSection() {
  return (
    <section className="py-24 px-6 border-t border-ri-gray-100">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.14em] mb-3">
            the ranks
          </p>
          <h2 className="font-serif text-[32px] font-[800] text-ri-black tracking-tight">
            where do you actually stand?
          </h2>
        </motion.div>

        <div className="space-y-3">
          {RANK_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`card-raised rounded-xl ${TIER_BG[i]} p-5 cursor-default`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[17px] font-[700] text-ri-black tracking-tight">
                    {tier.name}
                  </p>
                  <p className="text-[12px] text-ri-gray-500 mt-0.5 font-sans">
                    {tier.description}
                  </p>
                </div>
                <p className="text-[12px] font-mono font-[500] text-ri-gray-500 tabular-nums whitespace-nowrap shrink-0">
                  {tier.auraMin.toLocaleString()}
                  {tier.auraMax ? `–${tier.auraMax.toLocaleString()}` : "+"} aura
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
