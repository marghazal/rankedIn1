"use client"

import { motion } from "framer-motion"

const STEPS = [
  {
    number: "01",
    emoji: "",
    title: "paste your linkedin url",
    body: "drop your linkedin profile link. no login, no signup — we fetch your public data. that's it.",
  },
  {
    number: "02",
    emoji: "",
    title: "we scan your profile",
    body: "we parse your headline, experience, education, and skills. the algorithm weighs every piece. no favoritism.",
  },
  {
    number: "03",
    emoji: "",
    title: "the verdict is delivered",
    body: "aura score, rank tier, job matches, roasts, improvement tips. share it. cope. improve.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.14em] mb-3">
            how it works
          </p>
          <h2 className="font-serif text-[32px] font-[800] text-ri-black tracking-tight">
            three steps to self-awareness.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card-raised rounded-2xl bg-ri-off-white p-6"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-2xl">{step.emoji}</span>
                <span className="font-serif text-[42px] font-[800] text-ri-black/10 leading-none select-none">
                  {step.number}
                </span>
              </div>
              <h3 className="font-serif text-[18px] font-[700] text-ri-black mb-3 leading-snug tracking-tight">
                {step.title}
              </h3>
              <p className="text-[13px] text-ri-gray-500 leading-[1.7] font-sans">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
