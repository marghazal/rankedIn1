"use client"

import { Sparkles, Trophy, Crown, Star, Award, Medal } from "lucide-react"

interface TierStyle {
  icon: typeof Sparkles
  bg: string
  bgDark: string
  text: string
  textDark: string
  border: string
  borderDark: string
}

const TIER_STYLES: Record<string, TierStyle> = {
  "Resume Silver": {
    icon: Star,
    bg: "bg-slate-100",
    bgDark: "bg-slate-800/40",
    text: "text-slate-600",
    textDark: "text-slate-200",
    border: "border-slate-200",
    borderDark: "border-slate-700",
  },
  "Internship Bronze": {
    icon: Medal,
    bg: "bg-amber-50",
    bgDark: "bg-amber-900/30",
    text: "text-amber-700",
    textDark: "text-amber-200",
    border: "border-amber-200",
    borderDark: "border-amber-800",
  },
  "Internship Gold": {
    icon: Award,
    bg: "bg-yellow-50",
    bgDark: "bg-yellow-900/30",
    text: "text-yellow-700",
    textDark: "text-yellow-200",
    border: "border-yellow-200",
    borderDark: "border-yellow-700",
  },
  "New Grad Silver": {
    icon: Sparkles,
    bg: "bg-blue-50",
    bgDark: "bg-blue-900/30",
    text: "text-blue-700",
    textDark: "text-blue-200",
    border: "border-blue-200",
    borderDark: "border-blue-800",
  },
  "FAANG Contender": {
    icon: Trophy,
    bg: "bg-purple-50",
    bgDark: "bg-purple-900/30",
    text: "text-purple-700",
    textDark: "text-purple-200",
    border: "border-purple-200",
    borderDark: "border-purple-800",
  },
  "FAANG Platinum": {
    icon: Crown,
    bg: "bg-gradient-to-r from-pink-50 to-violet-50",
    bgDark: "bg-gradient-to-r from-pink-900/40 to-violet-900/40",
    text: "text-pink-700",
    textDark: "text-pink-200",
    border: "border-pink-200",
    borderDark: "border-pink-800",
  },
}

const FALLBACK_STYLE: TierStyle = TIER_STYLES["Resume Silver"]

export function TierBadge({
  tier,
  aura,
  dark = false,
  size = "md",
}: {
  tier: string
  aura?: number
  dark?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const style = TIER_STYLES[tier] || FALLBACK_STYLE
  const Icon = style.icon

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-[12px] px-2.5 py-1 gap-1.5",
    lg: "text-[14px] px-3.5 py-1.5 gap-2",
  }[size]

  const iconSize = size === "sm" ? 10 : size === "lg" ? 14 : 12

  return (
    <span
      className={`inline-flex items-center rounded-full border font-[500] tracking-tight ${sizeClasses} ${
        dark ? `${style.bgDark} ${style.textDark} ${style.borderDark}` : `${style.bg} ${style.text} ${style.border}`
      }`}
    >
      <Icon size={iconSize} strokeWidth={2.2} />
      <span className="font-serif italic">{tier}</span>
      {typeof aura === "number" && (
        <span className="font-mono opacity-70 ml-1">{aura.toLocaleString()}</span>
      )}
    </span>
  )
}
