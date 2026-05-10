"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import type { LeaderboardEntry } from "@/lib/leaderboard-data"
import { formatProfileName, getBestAvatarUrl, getScanLeaderboardEntry } from "@/lib/profile-utils"
import { useAuth } from "@/lib/auth-context"
import { getAuraTier, isAfterLeaderboardReset, normalizeAuraScore } from "@/lib/aura"

type UnknownRecord = Record<string, unknown>
type BattleEntry = LeaderboardEntry & {
  facts: string[]
  headline?: string
}

interface FightEvent {
  attacker: "player" | "opponent"
  damage: number
  text: string
}

const MAX_AURA = 2500
const MAX_HEALTH = 100
const ROUND_SECONDS = 3
const MAX_ROUNDS = 7

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function entryKey(entry: LeaderboardEntry) {
  return entry.id || entry.linkedinUrl || entry.username
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeFact(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function addFact(facts: string[], value: string) {
  const clean = normalizeFact(value)
  if (!clean || clean.length < 3) return
  if (facts.some((fact) => fact.toLowerCase() === clean.toLowerCase())) return
  facts.push(clean)
}

function getItemName(item: unknown, keys: string[]) {
  if (typeof item === "string") return item
  if (!isRecord(item)) return ""

  for (const key of keys) {
    const value = asText(item[key])
    if (value) return value
  }

  return ""
}

function getScanFacts(scan: UnknownRecord, entry: LeaderboardEntry): string[] {
  const facts: string[] = []
  const linkedinData = isRecord(scan.linkedinData) ? scan.linkedinData : {}
  const aiResult = isRecord(scan.aiResult) ? scan.aiResult : {}
  const headline = asText(linkedinData.headline) || asText(linkedinData.tagline)
  const university = asText(scan.university) || asText(linkedinData.university) || asText(entry.university)
  const school = asText(entry.school)

  if (headline) addFact(facts, `${entry.name} is ${headline}.`)
  if (university) addFact(facts, `${entry.name} goes to ${university}.`)
  else if (school && !/contender|silver|bronze|gold|platinum/i.test(school)) addFact(facts, `${entry.name} is connected to ${school}.`)

  const education = Array.isArray(linkedinData.education)
    ? linkedinData.education
    : Array.isArray(linkedinData.educations)
      ? linkedinData.educations
      : []
  for (const item of education.slice(0, 2)) {
    const name = getItemName(item, ["schoolName", "school", "name", "title", "university"])
    if (name) addFact(facts, `${entry.name} studied at ${name}.`)
  }

  const experience = Array.isArray(linkedinData.experience)
    ? linkedinData.experience
    : Array.isArray(linkedinData.experiences)
      ? linkedinData.experiences
      : Array.isArray(linkedinData.positions)
        ? linkedinData.positions
        : []
  for (const item of experience.slice(0, 3)) {
    const company = getItemName(item, ["companyName", "company", "organization", "name"])
    const title = getItemName(item, ["title", "position", "role"])
    if (company && title) addFact(facts, `${entry.name} worked as ${title} at ${company}.`)
    else if (company) addFact(facts, `${entry.name} worked at ${company}.`)
    else if (title) addFact(facts, `${entry.name} has ${title} experience.`)
  }

  const skills = Array.isArray(linkedinData.skills)
    ? linkedinData.skills
    : Array.isArray(linkedinData.topSkills)
      ? linkedinData.topSkills
      : []
  const skillNames = skills
    .map((skill) => getItemName(skill, ["name", "title", "skill"]))
    .filter(Boolean)
    .slice(0, 4)
  if (skillNames.length > 0) addFact(facts, `${entry.name} has ${skillNames.join(", ")}.`)

  const strengths = Array.isArray(aiResult.strengths) ? aiResult.strengths : []
  for (const strength of strengths.slice(0, 2)) {
    if (
      typeof strength === "string" &&
      !/profile exists|keep improving|decent profile/i.test(strength)
    ) {
      addFact(facts, `${entry.name}: ${strength}.`)
    }
  }

  addFact(facts, `${entry.name} has ${entry.aura.toLocaleString()} aura.`)
  addFact(facts, `${entry.name} is ${entry.tier}.`)

  return facts.slice(0, 8)
}

function normalizeEntry(entry: LeaderboardEntry, scan?: UnknownRecord): BattleEntry {
  const name = formatProfileName(entry.name || entry.username, entry.username)
  const aura = normalizeAuraScore(entry.aura)
  const normalized = {
    ...entry,
    name,
    aura,
    tier: getAuraTier(entry.aura, entry.tier),
    avatar: entry.avatar || getBestAvatarUrl(scan?.linkedinData || entry, name, entry.username),
  }

  return {
    ...normalized,
    headline: isRecord(scan?.linkedinData) ? asText(scan.linkedinData.headline) : "",
    facts: scan ? getScanFacts(scan, normalized) : [
      `${name} has ${entry.aura.toLocaleString()} aura.`,
      `${name} is ${entry.tier}.`,
    ],
  }
}

function getSavedBattleEntries(): BattleEntry[] {
  const raw = localStorage.getItem("rankedin_last_scan")
  const historyRaw = localStorage.getItem("rankedin_scan_history")
  const lastScan = raw ? JSON.parse(raw) : null
  const history = historyRaw ? JSON.parse(historyRaw) : []
  const scans = (Array.isArray(history) ? history : []).filter((scan) => isAfterLeaderboardReset(scan?.scannedAt || scan?.created_at))
  if (lastScan && isAfterLeaderboardReset(lastScan.scannedAt || lastScan.created_at)) scans.push(lastScan)

  const entriesByKey = new Map<string, BattleEntry>()
  for (const scan of scans) {
    if (!isRecord(scan)) continue
    const entry = getScanLeaderboardEntry(scan)
    if (!entry) continue
    const battleEntry = normalizeEntry(entry, scan)
    const key = (battleEntry.linkedinUrl || battleEntry.username || battleEntry.name).toLowerCase().trim()
    const existing = entriesByKey.get(key)
    if (!existing || battleEntry.aura > existing.aura) entriesByKey.set(key, battleEntry)
  }

  return [...entriesByKey.values()].sort((a, b) => b.aura - a.aura)
}

function getLastScanEntryKey(): string | null {
  try {
    const raw = localStorage.getItem("rankedin_last_scan")
    const lastScan = raw ? JSON.parse(raw) : null
    if (!isRecord(lastScan)) return null

    const entry = getScanLeaderboardEntry(lastScan)
    return entry ? entryKey(entry) : null
  } catch {
    return null
  }
}

function getAiOpponent(player: BattleEntry, entries: BattleEntry[]): BattleEntry {
  const auraBoost = player.aura >= 1800 ? -240 : 260
  const aura = Math.max(80, Math.min(MAX_AURA, player.aura + auraBoost))
  const name = player.aura >= 1800 ? "AI Underdog" : "AI Final Boss"

  return {
    id: "ai-opponent",
    rank: 0,
    username: "ai-opponent",
    name,
    school: "simulation",
    university: "",
    aura,
    tier: aura >= 1500 ? "FAANG Contender" : "New Grad Silver",
    delta: 0,
    avatar: getBestAvatarUrl(null, name, "ai-opponent"),
    linkedinUrl: "#",
    facts: [
      `${name} mirrors your strongest profile points.`,
      `${name} counters with ${aura.toLocaleString()} aura.`,
      player.facts[0] || `${player.name} has to defend the resume.`,
    ],
  }
}

function getDamage(attacker: BattleEntry, defender: BattleEntry, index: number) {
  const base = 10 + Math.round(attacker.aura / 180)
  const swing = attacker.aura >= defender.aura ? 5 : -1
  return Math.max(8, Math.min(24, base + swing + (index % 3)))
}

function buildFightEvents(player: BattleEntry, opponent: BattleEntry): FightEvent[] {
  const events: FightEvent[] = []
  const firstAttacker: "player" | "opponent" = player.aura >= opponent.aura ? "player" : "opponent"

  for (let i = 0; i < 8; i++) {
    const attackerSide = i % 2 === 0 ? firstAttacker : firstAttacker === "player" ? "opponent" : "player"
    const attacker = attackerSide === "player" ? player : opponent
    const defender = attackerSide === "player" ? opponent : player
    const fact = defender.facts[i % Math.max(1, defender.facts.length)] || `${defender.name} takes the hit.`
    events.push({
      attacker: attackerSide,
      damage: getDamage(attacker, defender, i),
      text: fact,
    })
  }

  return events
}

function getHealth(side: "player" | "opponent", events: FightEvent[], activeIndex: number) {
  const damageTaken = events
    .slice(0, activeIndex + 1)
    .filter((event) => event.attacker !== side)
    .reduce((total, event) => total + event.damage, 0)

  return Math.max(0, MAX_HEALTH - damageTaken)
}

export function BattleView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const selectedIdA = searchParams.get("a")
  const selectedIdB = searchParams.get("b")
  const [entries, setEntries] = useState<BattleEntry[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(selectedIdA)
  const [selectedOpponent, setSelectedOpponent] = useState<string>(selectedIdB || "ai-opponent")
  const [fightRun, setFightRun] = useState(0)
  const [round, setRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [playerHealth, setPlayerHealth] = useState(MAX_HEALTH)
  const [opponentHealth, setOpponentHealth] = useState(MAX_HEALTH)
  const [currentEvent, setCurrentEvent] = useState<FightEvent | null>(null)
  const [fightStatus, setFightStatus] = useState<"fighting" | "finished">("fighting")

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(`/battle${window.location.search}`)
      router.replace(`/login?next=${next}`)
    }
  }, [loading, router, user])

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const savedEntries = getSavedBattleEntries()
        if (savedEntries.length > 0) {
          setEntries(savedEntries)
          setSelectedPlayer((current) => current || getLastScanEntryKey() || entryKey(savedEntries[0]))
          return
        }

        const res = await fetch("/api/leaderboard")
        const data = await res.json()
        if (Array.isArray(data)) {
          const apiEntries = data.map((entry) => normalizeEntry(entry)).sort((a, b) => b.aura - a.aura)
          setEntries(apiEntries)
          setSelectedPlayer((current) => current || (apiEntries[0] ? entryKey(apiEntries[0]) : null))
        }
      } catch {
        setEntries([])
      }
    }

    loadEntries()
  }, [])

  const player = useMemo(() => {
    if (entries.length === 0) return null
    return selectedPlayer
      ? entries.find((entry) => entryKey(entry) === selectedPlayer || entry.id === selectedPlayer || entry.username === selectedPlayer) || entries[0]
      : entries[0]
  }, [entries, selectedPlayer])

  const opponent = useMemo(() => {
    if (!player) return null
    if (selectedOpponent !== "ai-opponent") {
      const realOpponent = entries.find((entry) => entryKey(entry) === selectedOpponent)
      if (realOpponent && entryKey(realOpponent) !== entryKey(player)) return realOpponent
    }

    return getAiOpponent(player, entries)
  }, [entries, player, selectedOpponent])

  const opponentOptions = useMemo(() => {
    if (!player) return []
    return entries.filter((entry) => entryKey(entry) !== entryKey(player))
  }, [entries, player])

  useEffect(() => {
    setRound(1)
    setTimeLeft(ROUND_SECONDS)
    setPlayerHealth(MAX_HEALTH)
    setOpponentHealth(MAX_HEALTH)
    setCurrentEvent(null)
    setFightStatus("fighting")
  }, [player?.username, opponent?.username, fightRun])

  const winner = player && opponent
    ? playerHealth === opponentHealth
      ? player.aura >= opponent.aura ? player : opponent
      : playerHealth > opponentHealth ? player : opponent
    : null
  const fightEnded = fightStatus === "finished"

  const finishFight = useCallback((nextPlayerHealth: number, nextOpponentHealth: number) => {
    setFightStatus("finished")
    setPlayerHealth(nextPlayerHealth)
    setOpponentHealth(nextOpponentHealth)
  }, [])

  const resolveRound = useCallback((playerHit: boolean) => {
    if (!player || !opponent || fightStatus !== "fighting") return

    if (playerHit) {
      const damage = getDamage(player, opponent, round)
      const nextOpponentHealth = Math.max(0, opponentHealth - damage)
      const text = opponent.facts[(round - 1) % Math.max(1, opponent.facts.length)] || `${opponent.name} takes the hit.`

      setCurrentEvent({ attacker: "player", damage, text })
      setOpponentHealth(nextOpponentHealth)

      if (nextOpponentHealth <= 0 || round >= MAX_ROUNDS) {
        finishFight(playerHealth, nextOpponentHealth)
        return
      }
    } else {
      const damage = getDamage(opponent, player, round)
      const nextPlayerHealth = Math.max(0, playerHealth - damage)
      const text = player.facts[(round - 1) % Math.max(1, player.facts.length)] || `${player.name} takes the hit.`

      setCurrentEvent({ attacker: "opponent", damage, text })
      setPlayerHealth(nextPlayerHealth)

      if (nextPlayerHealth <= 0 || round >= MAX_ROUNDS) {
        finishFight(nextPlayerHealth, opponentHealth)
        return
      }
    }

    setRound((current) => current + 1)
    setTimeLeft(ROUND_SECONDS)
  }, [fightStatus, finishFight, opponent, opponentHealth, player, playerHealth, round])

  useEffect(() => {
    if (!player || !opponent || fightStatus !== "fighting") return
    if (timeLeft <= 0) {
      resolveRound(false)
      return
    }

    const timeout = window.setTimeout(() => {
      setTimeLeft((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [fightStatus, opponent, player, resolveRound, timeLeft])

  const rerunFight = () => setFightRun((current) => current + 1)

  if (loading || !user) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-24 text-center">
        <p className="text-[12px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">
          battle locked
        </p>
        <h1 className="font-serif text-[36px] md:text-[52px] leading-tight text-ri-black mb-4">
          sign in to battle with your scans.
        </h1>
        <p className="text-[15px] text-ri-gray-500">
          your scanned LinkedIn profile becomes your fighter.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <p className="text-[12px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">
          timed battle
        </p>
        <h1 className="font-serif text-[42px] md:text-[64px] leading-[0.95] font-[500] text-ri-black text-balance max-w-[780px]">
          hit before the clock hits zero.
        </h1>
      </motion.div>

      {entries.length === 0 || !player || !opponent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <p className="font-serif text-[20px] italic text-ri-gray-400 mb-6">
            no profiles yet. scan someone to start.
          </p>
          <a
            href="/scan"
            className="inline-block px-6 py-3 rounded-full bg-ri-black text-ri-white text-[14px] font-[600] hover:bg-ri-gray-800 transition-colors duration-150"
          >
            scan a profile
          </a>
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
            <div className="w-full md:max-w-[420px]">
              <label className="text-[12px] font-[700] text-ri-gray-500 uppercase tracking-[0.1em] block mb-3">
                your locked fighter
              </label>
              <div className="w-full px-4 py-4 rounded-lg border border-ri-black bg-ri-off-white text-ri-black">
                <p className="text-[15px] font-[800]">
                  {player.name} ({player.aura.toLocaleString()} aura)
                </p>
                <p className="text-[12px] text-ri-gray-500 mt-1">
                  locked from your latest scanned LinkedIn
                </p>
              </div>
            </div>

            <div className="w-full md:max-w-[420px]">
              <label className="text-[12px] font-[700] text-ri-gray-500 uppercase tracking-[0.1em] block mb-3">
                choose opponent
              </label>
              <select
                value={selectedOpponent}
                onChange={(event) => {
                  setSelectedOpponent(event.target.value)
                  setFightRun((current) => current + 1)
                }}
                disabled={!fightEnded && round > 1}
                className="w-full px-4 py-4 rounded-lg border border-ri-gray-200 text-[15px] font-[600] text-ri-black bg-ri-white hover:border-ri-gray-300 focus:border-ri-black outline-none transition-colors disabled:opacity-60"
              >
                <option value="ai-opponent">AI opponent ({getAiOpponent(player, entries).aura.toLocaleString()} aura)</option>
                {opponentOptions.map((entry) => (
                  <option key={entryKey(entry)} value={entryKey(entry)}>
                    {entry.name} ({entry.aura.toLocaleString()} aura)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={rerunFight}
              className="self-start md:self-auto px-6 py-4 rounded-full bg-ri-black text-ri-white text-[14px] font-[700] hover:bg-ri-gray-800 transition-colors duration-150"
            >
              run fight again
            </button>
          </div>

          <div className="rounded-xl border border-ri-black bg-ri-off-white shadow-[5px_5px_0_#0A0A0A] overflow-hidden">
            <div className="border-b border-ri-gray-100 bg-ri-white p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="text-[12px] font-[800] uppercase tracking-[0.13em] text-ri-gray-400 mb-1">
                    round {round} of {MAX_ROUNDS}
                  </p>
                  <p className="font-serif text-[26px] text-ri-black">
                    {fightEnded ? "fight complete" : "your move"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-[76px] h-[76px] rounded-full border border-ri-black bg-ri-off-white flex items-center justify-center shadow-[3px_3px_0_#0A0A0A]">
                    <span className="font-serif italic text-[34px] text-ri-black tabular-nums">
                      {fightEnded ? "0" : timeLeft}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => resolveRound(true)}
                    disabled={fightEnded}
                    className="px-7 py-4 rounded-full bg-ri-black text-ri-white text-[15px] font-[800] hover:bg-ri-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    hit opponent
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_140px_1fr] min-h-[520px]">
              <FighterPanel
                entry={player}
                side="player"
                health={playerHealth}
                isHit={currentEvent?.attacker === "opponent"}
                hitText={currentEvent?.attacker === "opponent" ? currentEvent.text : ""}
              />

              <div className="border-y lg:border-y-0 lg:border-x border-ri-gray-100 bg-ri-white flex lg:flex-col items-center justify-center gap-4 p-5">
                <div className="font-serif italic text-[34px] text-ri-black">vs</div>
                <div className="hidden lg:block h-16 w-px bg-ri-gray-100" />
                <div className="w-3 h-3 rounded-full bg-ri-black" aria-hidden="true" />
              </div>

              <FighterPanel
                entry={opponent}
                side="opponent"
                health={opponentHealth}
                isHit={currentEvent?.attacker === "player"}
                hitText={currentEvent?.attacker === "player" ? currentEvent.text : ""}
              />
            </div>

            <div className="border-t border-ri-gray-100 bg-ri-white p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <p className="text-[12px] font-[700] uppercase tracking-[0.13em] text-ri-gray-400 mb-1">
                    last exchange
                  </p>
                  <p className="font-serif text-[26px] text-ri-black">
                    {currentEvent
                      ? currentEvent.attacker === "player" ? `${player.name} landed the hit.` : `${opponent.name} punished the miss.`
                      : "hit the button before time runs out."}
                  </p>
                </div>
                <p className="font-mono text-[18px] text-ri-black tabular-nums">
                  -{currentEvent?.damage || 0} hp
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${fightRun}-${round}-${currentEvent?.attacker || "ready"}`}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-lg border border-ri-gray-100 bg-ri-off-white p-4 md:p-5"
                >
                  <p className="text-[19px] md:text-[24px] leading-snug text-ri-black">
                    {currentEvent?.text || "If you hit in time, you block the counter. If you miss, the opponent gets a free shot."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-ri-gray-100 bg-ri-white p-6">
            <p className="text-[12px] font-[700] uppercase tracking-[0.13em] text-ri-gray-400 mb-2">
              {fightEnded ? "results" : "current leader"}
            </p>
            <p className="font-serif text-[30px] leading-tight text-ri-black">
              {fightEnded
                ? `${winner?.name} wins with ${Math.max(playerHealth, opponentHealth)} hp left.`
                : `${winner?.name} is ahead right now.`}
            </p>
            {fightEnded && (
              <button
                type="button"
                onClick={rerunFight}
                className="mt-5 px-6 py-3 rounded-full bg-ri-black text-ri-white text-[14px] font-[700] hover:bg-ri-gray-800 transition-colors duration-150"
              >
                play again
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function FighterPanel({
  entry,
  side,
  health,
  isHit,
  hitText,
}: {
  entry: BattleEntry
  side: "player" | "opponent"
  health: number
  isHit: boolean
  hitText: string
}) {
  const [failed, setFailed] = useState(false)
  const initial = entry.name?.charAt(0)?.toUpperCase() || "?"
  const auraPercent = Math.min(100, Math.max(5, (entry.aura / MAX_AURA) * 100))

  return (
    <div className={`relative overflow-hidden p-6 md:p-8 ${side === "opponent" ? "lg:text-right" : ""}`}>
      <div className="flex items-start justify-between gap-4 mb-7">
        <p className="text-[12px] font-[700] uppercase tracking-[0.14em] text-ri-gray-400">
          {side === "player" ? "you" : "ai opponent"}
        </p>
        <span className="px-3 py-1 rounded-full bg-ri-white border border-ri-gray-100 text-[11px] font-[700] uppercase tracking-[0.12em] text-ri-gray-500">
          {entry.tier}
        </span>
      </div>

      <motion.div
        animate={{
          x: isHit ? side === "player" ? [-10, 8, 0] : [10, -8, 0] : 0,
          scale: isHit ? [1, 0.96, 1] : 1,
        }}
        transition={{ duration: 0.28 }}
        className={`flex flex-col items-center ${side === "opponent" ? "lg:items-end" : "lg:items-start"}`}
      >
        <div className="relative h-[190px] w-[170px] mb-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-2 -translate-x-1/2"
          >
            {entry.avatar && !failed ? (
              <img
                src={entry.avatar}
                alt={entry.name}
                className="w-[86px] h-[86px] rounded-full object-cover border-2 border-ri-black bg-ri-gray-50 shadow-[3px_3px_0_#0A0A0A]"
                onError={() => setFailed(true)}
              />
            ) : (
              <div className="w-[86px] h-[86px] rounded-full border-2 border-ri-black bg-ri-gray-50 shadow-[3px_3px_0_#0A0A0A] flex items-center justify-center text-ri-gray-500 text-[30px] font-[800]">
                {initial}
              </div>
            )}
          </motion.div>

          <div className="absolute left-1/2 top-[90px] -translate-x-1/2 w-[78px] h-[86px] rounded-t-full border-2 border-ri-black bg-ri-white shadow-[3px_3px_0_#0A0A0A]" />
          <div className="absolute left-[28px] top-[112px] w-[42px] h-[16px] rounded-full border-2 border-ri-black bg-ri-white rotate-[-22deg]" />
          <div className="absolute right-[28px] top-[112px] w-[42px] h-[16px] rounded-full border-2 border-ri-black bg-ri-white rotate-[22deg]" />
          <div className="absolute left-[54px] bottom-0 w-[18px] h-[52px] rounded-full border-2 border-ri-black bg-ri-white" />
          <div className="absolute right-[54px] bottom-0 w-[18px] h-[52px] rounded-full border-2 border-ri-black bg-ri-white" />

          <AnimatePresence>
            {isHit && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.86 }}
                animate={{ opacity: 1, y: -60, scale: 1 }}
                exit={{ opacity: 0, y: -86, scale: 0.94 }}
                transition={{ duration: 0.55 }}
                className="absolute left-1/2 top-[88px] z-10 -translate-x-1/2 w-[220px] rounded-lg border border-ri-black bg-ri-white px-3 py-2 text-center text-[12px] font-[800] leading-snug text-ri-black shadow-[3px_3px_0_#0A0A0A]"
              >
                {hitText}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full">
          <div className={`flex items-center gap-2 mb-2 ${side === "opponent" ? "lg:justify-end" : ""}`}>
            <h2 className="text-[24px] md:text-[30px] leading-tight font-[800] text-ri-black truncate">
              {entry.name}
            </h2>
          </div>
          {entry.headline && (
            <p className="text-[14px] text-ri-gray-500 leading-snug mb-5 line-clamp-2">
              {entry.headline}
            </p>
          )}

          <HealthBar value={health} />

          <div className="mt-5 grid gap-3">
            <Meter label="aura" value={auraPercent} />
            <Meter label="damage" value={Math.min(100, 28 + entry.aura / 32)} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function HealthBar({ value }: { value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] font-[800] uppercase tracking-[0.14em] text-ri-gray-500">
          health
        </span>
        <span className="font-mono text-[12px] text-ri-black tabular-nums">
          {value}
        </span>
      </div>
      <div className="h-4 rounded-full bg-ri-gray-50 border border-ri-gray-100 overflow-hidden">
        <motion.div
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.35 }}
          className="h-full bg-ri-black rounded-full"
        />
      </div>
    </div>
  )
}

function Meter({ label, value }: { label: string; value: number }) {
  const width = Math.min(100, Math.max(5, value))

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-[11px] font-[800] uppercase tracking-[0.14em] text-ri-gray-500">
          {label}
        </span>
        <span className="font-mono text-[11px] text-ri-gray-400 tabular-nums">
          {Math.round(width)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ri-gray-50 border border-ri-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.55 }}
          className="h-full bg-ri-black rounded-full"
        />
      </div>
    </div>
  )
}
