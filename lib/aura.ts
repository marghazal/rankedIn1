import { getTierForAura } from "@/lib/ranks"

export const AURA_MAX = 2500
export const LEADERBOARD_RESET_AT = "2026-05-10T11:06:14Z"

export function normalizeAuraScore(aura: unknown): number {
  if (typeof aura !== "number" || !Number.isFinite(aura)) return 0
  if (aura > 0 && aura <= 100) return Math.round(aura * 20)
  return Math.max(0, Math.min(AURA_MAX, Math.round(aura)))
}

export function getAuraTier(aura: unknown, providedTier?: unknown): string {
  const normalizedAura = normalizeAuraScore(aura)
  const tier = typeof providedTier === "string" ? providedTier.trim() : ""

  if (tier && normalizedAura > 100) return tier
  return getTierForAura(normalizedAura).name
}

export function isAfterLeaderboardReset(value: unknown): boolean {
  if (!value) return true
  const time = typeof value === "number" ? value : Date.parse(String(value))
  const resetTime = Date.parse(LEADERBOARD_RESET_AT)
  return Number.isFinite(time) && time >= resetTime
}
