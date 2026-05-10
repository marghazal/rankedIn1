"use client"

import { motion } from "framer-motion"

const HIGH_AURA_MEMES = [
  {
    text: "CAN'T RELATE",
    bg: "from-slate-900 to-slate-800"
  },
  {
    text: "MAIN CHARACTER\nENERGY",
    bg: "from-amber-500 to-orange-600"
  },
  {
    text: "OFFER\nSPEEDRUN",
    bg: "from-blue-600 to-cyan-600"
  },
  {
    text: "ALREADY\nHAD 3\nOFFERS\nTHIS WEEK",
    bg: "from-green-500 to-emerald-600"
  },
  {
    text: "LINKEDIN\nRECRUITERS\nON STANDBY",
    bg: "from-purple-600 to-pink-600"
  }
]

const LOW_AURA_MEMES = [
  {
    text: "GOTTA\nSTART\nSOMEWHERE",
    bg: "from-blue-500 to-blue-600"
  },
  {
    text: "COOKING\nIN THE\nLABS",
    bg: "from-orange-500 to-red-600"
  },
  {
    text: "POTENTIAL\nDETECTED",
    bg: "from-green-500 to-emerald-600"
  },
  {
    text: "EARLY\nGAME\nGRIND",
    bg: "from-indigo-500 to-purple-600"
  },
  {
    text: "BET ON\nYOURSELF",
    bg: "from-pink-500 to-rose-600"
  },
  {
    text: "JUST\nVIBING",
    bg: "from-amber-500 to-orange-600"
  }
]

// Aura sparkle effect - radiating energy around the meme
function AuraSparkleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Center glow */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: "radial-gradient(circle, rgba(253, 224, 71, 0.3) 0%, transparent 70%)"
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      />

      {/* Sparkle particles radiating outward */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2
        const distance = 120
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance

        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: `hsl(${45 + i * 3}, 100%, 60%)`,
              boxShadow: "0 0 10px currentColor",
              left: "50%",
              top: "50%",
              marginLeft: "-6px",
              marginTop: "-6px",
              willChange: "transform"
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0
            }}
            whileInView={{
              x: x + (Math.random() - 0.5) * 30,
              y: y + (Math.random() - 0.5) * 30,
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              delay: (i * 0.05) % 1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )
      })}

      {/* Pulsing rings */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute inset-1/2 border-2 border-yellow-300 rounded-full"
          style={{
            width: "100px",
            height: "100px",
            marginLeft: "-50px",
            marginTop: "-50px"
          }}
          animate={{
            scale: [1, 2.5],
            opacity: [1, 0]
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.3,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  )
}

// Shake effect for low aura
function ShakeEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none" />
  )
}

// Glitch effect for mid-range
function GlitchEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-transparent opacity-20"
        animate={{
          x: [-2, 2, -2, 2],
          y: [-1, 1, -1, 1]
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 0.5
        }}
      />
    </div>
  )
}

export function AuraMemes({ aura }: { aura: number }) {
  // Text-based memes
  let memeList = null
  let effectType: "high" | "mid" | "low" = "low"

  if (aura > 1000) {
    memeList = HIGH_AURA_MEMES
    effectType = "high"
  } else if (aura >= 500) {
    memeList = HIGH_AURA_MEMES
    effectType = "mid"
  } else if (aura > 0) {
    memeList = LOW_AURA_MEMES
    effectType = "low"
  } else {
    return null
  }

  const selectedMeme = memeList[Math.floor(Math.random() * memeList.length)]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-12 mb-8"
    >
      <div className="relative max-w-sm mx-auto">
        <motion.div
          className={`bg-gradient-to-br ${selectedMeme.bg} rounded-2xl p-8 aspect-square flex items-center justify-center relative overflow-hidden`}
        >
          {/* Subtle background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Meme text */}
          <div className="relative z-10 text-center">
            <motion.p
              className="text-white font-bold text-3xl md:text-5xl uppercase leading-snug tracking-tight"
              style={{
                textShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {selectedMeme.text}
            </motion.p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}
