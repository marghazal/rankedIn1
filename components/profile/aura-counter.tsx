"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

interface AuraCounterProps {
  value: number
  className?: string
  style?: React.CSSProperties
}

export function AuraCounter({ value, className = "", style }: AuraCounterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    })

    return () => controls.stop()
  }, [count, value])

  return (
    <motion.span className={`${className} font-medium tracking-tight`} style={{...style, fontFamily: 'system-ui, -apple-system, sans-serif', fontStyle: 'normal'}}>
      {rounded}
    </motion.span>
  )
}
