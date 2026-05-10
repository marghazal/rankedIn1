import { getTierForAura } from "@/lib/ranks"
import type { LeaderboardEntry } from "@/lib/leaderboard-data"
import { normalizeAuraScore } from "@/lib/aura"

type UnknownRecord = Record<string, unknown>

const IMAGE_KEYS = [
  "avatar",
  "profilePicture",
  "profile_picture",
  "imageUrl",
  "image",
  "photo",
  "picture",
  "thumbnail",
  "url",
]

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function stableHash(value: string): number {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }

  return hash
}

function cleanImageUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("//")) return `https:${trimmed}`
  return trimmed.replaceAll("&amp;", "&")
}

function looksLikeImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) && (
    /licdn\.com|media\./i.test(value) ||
    /\.(png|jpe?g|webp|gif)(\?|$)/i.test(value) ||
    /profile|photo|avatar|image/i.test(value)
  )
}

export function getAvatarUrl(source: unknown): string {
  if (!source) return ""

  if (typeof source === "string") {
    const url = cleanImageUrl(source)
    return looksLikeImageUrl(url) ? url : ""
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const url = getAvatarUrl(item)
      if (url) return url
    }

    return ""
  }

  if (!isRecord(source)) return ""

  for (const key of IMAGE_KEYS) {
    const url = getAvatarUrl(source[key])
    if (url) return url
  }

  for (const value of Object.values(source)) {
    const url = getAvatarUrl(value)
    if (url) return url
  }

  return ""
}

export function getGeneratedAvatarUrl(name: string, username = ""): string {
  const label = (name || username || "RankedIn").trim()
  const initials = label
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "RI"
  const hue = stableHash(label) % 360
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="64" fill="hsl(${hue} 18% 88%)"/>
      <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle"
        font-family="Inter, Arial, sans-serif" font-size="42" font-weight="600"
        fill="hsl(${hue} 9% 34%)">${initials}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function getBestAvatarUrl(source: unknown, name: string, username = ""): string {
  return getAvatarUrl(source) || getGeneratedAvatarUrl(name, username)
}

export function formatProfileName(nameOrHandle: string, fallback = "anon"): string {
  const raw = (nameOrHandle || fallback).trim()
  if (!raw) return fallback

  const hasHandleShape = raw.includes("-") || /\d/.test(raw)
  if (!hasHandleShape) return raw

  const words = raw
    .replace(/^@/, "")
    .split(/[\s_-]+/)
    .filter((part) => part && !/\d/.test(part))
    .slice(0, 3)

  if (words.length === 0) return raw.replace(/^@/, "")

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function getScanLeaderboardEntry(scan: UnknownRecord): LeaderboardEntry | null {
  const ai = isRecord(scan.aiResult) ? scan.aiResult : null
  const linkedinData = isRecord(scan.linkedinData) ? scan.linkedinData : {}
  const aura = normalizeAuraScore(ai?.aura)

  if (!aura) return null

  const username = String(scan.username || linkedinData.username || "anon")
  const rawName = String(
    linkedinData.fullName ||
    linkedinData.name ||
    scan.username ||
    username
  )
  const name = formatProfileName(rawName, username)
  const university = String(scan.university || linkedinData.university || "")
  const tier = String((aura > 100 && (ai?.tier || ai?.rank)) || getTierForAura(aura).name)

  return {
    id: String(scan.id || ""),
    rank: 0,
    username,
    name,
    school: university || String(linkedinData.headline || ""),
    university,
    aura,
    tier,
    delta: 0,
    avatar: getBestAvatarUrl(linkedinData, name, username),
    linkedinUrl: String(scan.linkedinUrl || linkedinData.profileUrl || "#"),
  }
}
