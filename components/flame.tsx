"use client"

import { motion } from "framer-motion"

interface FlameProps {
  aura?: number
  size?: number
  className?: string
}

function getFlameSize(aura: number): number {
  if (aura < 200) return 16
  if (aura < 500) return 22
  if (aura < 1000) return 28
  if (aura < 2000) return 34
  return 42
}

// Flash FX style - sharp, dynamic, stylized flames
const mainFlame = {
  frame1: "M 18 34 Q 12 28, 8 20 Q 6 14, 10 8 Q 14 2, 18 6 Q 22 2, 26 8 Q 30 14, 28 20 Q 24 28, 18 34 Z",
  frame2: "M 18 34 Q 10 26, 7 18 Q 4 10, 9 5 Q 15 0, 18 8 Q 21 0, 27 5 Q 32 10, 29 18 Q 26 26, 18 34 Z",
  frame3: "M 18 34 Q 14 30, 9 22 Q 5 16, 8 9 Q 12 3, 18 7 Q 24 3, 28 9 Q 31 16, 27 22 Q 22 30, 18 34 Z",
  frame4: "M 18 34 Q 11 27, 6 19 Q 3 12, 8 6 Q 14 1, 18 9 Q 22 1, 28 6 Q 33 12, 30 19 Q 25 27, 18 34 Z",
}

const innerFlame = {
  frame1: "M 18 32 Q 14 26, 12 20 Q 10 15, 13 11 Q 16 8, 18 12 Q 20 8, 23 11 Q 26 15, 24 20 Q 22 26, 18 32 Z",
  frame2: "M 18 32 Q 13 24, 11 18 Q 9 12, 12 8 Q 15 5, 18 11 Q 21 5, 24 8 Q 27 12, 25 18 Q 23 24, 18 32 Z",
  frame3: "M 18 32 Q 15 27, 13 21 Q 11 16, 14 12 Q 17 9, 18 13 Q 19 9, 22 12 Q 25 16, 23 21 Q 21 27, 18 32 Z",
  frame4: "M 18 32 Q 12 25, 10 19 Q 8 13, 11 9 Q 14 6, 18 12 Q 22 6, 25 9 Q 28 13, 26 19 Q 24 25, 18 32 Z",
}

const coreFlame = {
  frame1: "M 18 30 Q 16 26, 15 22 Q 14 19, 16 17 Q 17 15, 18 18 Q 19 15, 20 17 Q 22 19, 21 22 Q 20 26, 18 30 Z",
  frame2: "M 18 30 Q 15 25, 14 20 Q 13 17, 15 14 Q 17 12, 18 16 Q 19 12, 21 14 Q 23 17, 22 20 Q 21 25, 18 30 Z",
  frame3: "M 18 30 Q 16 27, 15 23 Q 14 20, 16 18 Q 17 16, 18 19 Q 19 16, 20 18 Q 22 20, 21 23 Q 20 27, 18 30 Z",
  frame4: "M 18 30 Q 14 24, 13 19 Q 12 16, 14 13 Q 16 11, 18 15 Q 20 11, 22 13 Q 24 16, 23 19 Q 22 24, 18 30 Z",
}

// Side sparks for FX feel
const sparkLeft = {
  frame1: "M 10 18 Q 8 16, 6 14 Q 5 12, 7 11 Q 9 12, 10 14 Q 11 16, 10 18 Z",
  frame2: "M 9 16 Q 6 13, 4 10 Q 3 8, 5 7 Q 7 9, 8 12 Q 9 14, 9 16 Z",
  frame3: "M 11 17 Q 9 15, 7 13 Q 6 11, 8 10 Q 10 11, 11 13 Q 12 15, 11 17 Z",
  frame4: "M 10 17 Q 7 14, 5 11 Q 4 9, 6 8 Q 8 10, 9 13 Q 10 15, 10 17 Z",
}

const sparkRight = {
  frame1: "M 26 18 Q 28 16, 30 14 Q 31 12, 29 11 Q 27 12, 26 14 Q 25 16, 26 18 Z",
  frame2: "M 27 16 Q 30 13, 32 10 Q 33 8, 31 7 Q 29 9, 28 12 Q 27 14, 27 16 Z",
  frame3: "M 25 17 Q 27 15, 29 13 Q 30 11, 28 10 Q 26 11, 25 13 Q 24 15, 25 17 Z",
  frame4: "M 26 17 Q 29 14, 31 11 Q 32 9, 30 8 Q 28 10, 27 13 Q 26 15, 26 17 Z",
}

export function Flame({ aura = 500, size, className = "" }: FlameProps) {
  const flameSize = size ?? getFlameSize(aura)
  const isLarge = aura >= 2000
  const showSparks = aura >= 1000

  const mainFrames = [mainFlame.frame1, mainFlame.frame2, mainFlame.frame3, mainFlame.frame4, mainFlame.frame1]
  const innerFrames = [innerFlame.frame1, innerFlame.frame2, innerFlame.frame3, innerFlame.frame4, innerFlame.frame1]
  const coreFrames = [coreFlame.frame1, coreFlame.frame2, coreFlame.frame3, coreFlame.frame4, coreFlame.frame1]
  const sparkLFrames = [sparkLeft.frame1, sparkLeft.frame2, sparkLeft.frame3, sparkLeft.frame4, sparkLeft.frame1]
  const sparkRFrames = [sparkRight.frame1, sparkRight.frame2, sparkRight.frame3, sparkRight.frame4, sparkRight.frame1]

  return (
    <span
      className={`inline-flex items-end shrink-0 ${className}`}
      style={{ width: flameSize, height: flameSize * 1.15 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 36 36"
        width={flameSize}
        height={flameSize * 1.15}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isLarge
            ? `drop-shadow(0 0 ${flameSize * 0.3}px rgba(234, 88, 12, 0.55))`
            : `drop-shadow(0 0 ${flameSize * 0.2}px rgba(234, 88, 12, 0.35))`,
        }}
      >
        {/* Side sparks - only show for higher aura */}
        {showSparks && (
          <>
            <motion.path
              d={sparkLeft.frame1}
              fill="#f97316"
              fillOpacity={0.6}
              animate={{ d: sparkLFrames }}
              transition={{
                duration: 0.35,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.path
              d={sparkRight.frame1}
              fill="#f97316"
              fillOpacity={0.6}
              animate={{ d: sparkRFrames }}
              transition={{
                duration: 0.35,
                repeat: Infinity,
                ease: "linear",
                delay: 0.08,
              }}
            />
          </>
        )}

        {/* Main outer flame */}
        <motion.path
          d={mainFlame.frame1}
          fill="#ea580c"
          fillOpacity={0.95}
          animate={{ d: mainFrames }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner flame */}
        <motion.path
          d={innerFlame.frame1}
          fill="#fb923c"
          fillOpacity={0.9}
          animate={{ d: innerFrames }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: "linear",
            delay: 0.05,
          }}
        />

        {/* Core flame - brightest / hottest yellow-orange */}
        <motion.path
          d={coreFlame.frame1}
          fill="#fbbf24"
          fillOpacity={0.85}
          animate={{ d: coreFrames }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: "linear",
            delay: 0.1,
          }}
        />
      </svg>
    </span>
  )
}
