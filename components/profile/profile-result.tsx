"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { AuraCounter } from "@/components/profile/aura-counter"
import { ShareCardModal } from "@/components/profile/share-card-modal"
import { TierBadge } from "@/components/profile/tier-badge"
import { type AuraItem, type Improvement, type ProfileChange, type ProfileData } from "@/lib/demo-profile"
import { formatProfileName, getBestAvatarUrl, getGeneratedAvatarUrl } from "@/lib/profile-utils"
import { getAuraTier, normalizeAuraScore } from "@/lib/aura"

interface ProfileResultProps {
  profile: ProfileData
}

function scoreBand(value: number, max: number) {
  const pct = max > 0 ? value / max : 0
  if (pct >= 0.75) return "strong"
  if (pct >= 0.5) return "decent"
  if (pct >= 0.25) return "weak"
  return "missing"
}

function defaultActions(item: AuraItem): ProfileChange[] {
  switch (item.label) {
    case "Headline clarity":
      return [{
        section: "Headline",
        change: "Make the headline say exactly what role you want, what proof you already have, and what field you are in. Avoid broad lines that only say student, aspiring, passionate, or open to work.",
        example: "Computer Science student | Full-stack developer building React + Node apps | Seeking 2026 software internships",
        why: "Headline points come from clarity, role fit, credible keywords, and proof. A recruiter should understand your lane without reading the rest of the page.",
      }]
    case "Experience signal":
      return [
        {
          section: "Experience",
          change: "Prioritize depth in roles related to your major or profession. A long, relevant role with strong bullets should look bigger than several unrelated jobs. Put unrelated roles lower and keep them to one short bullet.",
          example: "Software Developer, ABC Lab - Built a Python data pipeline used by 8 researchers, cutting weekly cleanup time by 6 hours.",
          why: "This score rewards relevant work, long tenure, seniority, strong companies, action verbs, and measurable outcomes. Job quantity alone is not enough.",
        },
        {
          section: "Experience bullets",
          change: "Rewrite each important role with 2-4 bullets that include what you built, the tools used, who benefited, and a number.",
          example: "Led a 4-person team to ship a React dashboard for 300+ users; improved load time by 42% using API caching.",
          why: "Specific impact proves quality. A 20-year role in the same field should beat scattered unrelated jobs when the profile shows progression and outcomes.",
        },
      ]
    case "Education fit":
      return [{
        section: "Education",
        change: "Show the exact degree, major, school, graduation year, and 3-5 courses or achievements that match the career direction.",
        example: "B.Comp, Computer Science, University of Guelph, 2027 | Coursework: Data Structures, Databases, Software Design, Machine Learning",
        why: "Education points come from school signal, degree level, field relevance, honors, research, and coursework that supports the target role.",
      }]
    case "Skills depth":
      return [{
        section: "Skills",
        change: "Add a focused skill stack. Use fewer, stronger skills that match your target role instead of a long mixed list of tools you barely use.",
        example: "Python, TypeScript, React, Node.js, SQL, PostgreSQL, Git, Docker, AWS",
        why: "Quality over quantity matters here. The best skills section tells a coherent story about the work you can actually do.",
      }]
    case "About / Summary":
      return [{
        section: "About",
        change: "Write 4-5 sentences that connect your target role, relevant experience, strongest project or role, tools, and measurable proof.",
        example: "I am a Computer Science student focused on full-stack software engineering. I build React, TypeScript, and Node.js apps, including a scheduling tool used by 120+ students. My strongest work is turning messy workflows into clean products with measurable outcomes. I am looking for software internships where I can contribute to production web apps.",
        why: "The About section should connect the dots. It raises the score when it has direction, proof, tools, and outcomes instead of generic motivation.",
      }]
    case "Projects proof":
      return [{
        section: "Featured / Projects",
        change: "Add 2-3 strong projects with a live link or GitHub link. Each project should state the problem, stack, your personal contribution, and result.",
        example: "RankedIn Aura Scanner - Built a Next.js app that analyzes LinkedIn profiles, scores experience quality, and stores leaderboard results with Supabase.",
        why: "Projects are strongest when they prove shipped work. Two polished, relevant projects beat ten tiny unfinished experiments.",
      }]
    case "Profile completeness":
      return [{
        section: "Profile basics",
        change: "Complete the basics: name, clear photo, headline, About, Experience, Education, Skills, and projects or featured links.",
        example: "Use a front-facing profile photo, a target-role headline, complete dates, and links to the best proof of work.",
        why: "Completeness points are about trust. Missing sections make even good achievements feel harder to verify.",
      }]
    default:
      return [{
        section: "Whole profile",
        change: "Make the profile point toward one career direction. Expand relevant proof and compress unrelated details.",
        example: "Lead with software experience, CS coursework, deployed projects, and a focused technical stack.",
        why: "Recruiters reward a clear pattern. Depth in one relevant path beats a scattered profile.",
      }]
  }
}

function explainScore(item: AuraItem) {
  const band = scoreBand(item.value, item.max)
  const pct = Math.round((item.value / item.max) * 100)

  const bandText = {
    strong: "This is a strong category.",
    decent: "This category has useful signal, but it is leaving points on the table.",
    weak: "This category is weak right now.",
    missing: "This category is basically missing from the scan.",
  }[band]

  switch (item.label) {
    case "Experience signal":
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) because the scanner found some work-related signal, but it needs structured roles with relevant depth, clear dates, action bullets, tools, and measurable outcomes. Quality matters more than quantity here: one long role tied to the person’s major or profession can score better than several disconnected jobs if it shows progression, ownership, and impact.`
    case "Skills depth":
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) because the scan did not find enough focused, role-relevant skills. The goal is not to stuff the profile with random keywords. A tight stack of tools the person actually used in projects or work is stronger than a huge unfocused list.`
    case "Education fit":
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) based on school, degree, major relevance, coursework, honors, research, and how clearly education supports the target profession. Add the missing details so the reader can see why the background fits the career path.`
    case "Headline clarity":
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) based on whether the headline quickly explains the person’s target role, current status, skills, and strongest proof. A good headline is specific enough that a recruiter immediately knows where this person belongs.`
    case "About / Summary":
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) because the About section needs to explain the professional story in full sentences: target role, relevant experience, best proof, tools, and outcomes. Generic motivation does not help much unless it is backed by evidence.`
    case "Projects proof":
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) based on shipped projects, portfolio links, hackathons, awards, technical detail, and proof that the person can build. A few complete, relevant projects are worth more than many vague project names.`
    case "Profile completeness":
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) based on how many core LinkedIn sections the scan could verify. Missing basics reduce trust because the profile asks the recruiter to fill in too many blanks.`
    default:
      return `${bandText} It scored ${item.value}/${item.max} (${pct}%) because this section affects how quickly a recruiter can understand the profile’s direction, proof, and fit.`
  }
}

function expandImprovement(imp: Improvement): Improvement {
  const pseudoItem: AuraItem = {
    label: imp.area,
    value: Math.max(0, 100 - imp.potentialGain),
    max: 100,
    positive: false,
    reason: imp.suggestion,
  }

  return {
    ...imp,
    suggestion: `${imp.suggestion} Be specific and prioritize quality over quantity: expand the roles, projects, and skills that match the target profession, then shorten anything unrelated.`,
    changes: imp.changes && imp.changes.length > 0 ? imp.changes : defaultActions(pseudoItem),
  }
}

export function ProfileResult({ profile: serverProfile }: ProfileResultProps) {
  const [profile, setProfile] = useState<ProfileData>(serverProfile)
  const [showShareCard, setShowShareCard] = useState(false)
  const [imgError, setImgError] = useState(false)
  const exactChanges = profile.profileChanges && profile.profileChanges.length > 0
    ? profile.profileChanges
    : profile.breakdown
      .slice()
      .sort((a, b) => (a.value / a.max) - (b.value / b.max))
      .slice(0, 4)
      .flatMap((item) =>
        defaultActions(item).map((action) => ({
          ...action,
          area: item.label,
          potentialGain: Math.max(40, item.max - item.value),
        }))
      )

  useEffect(() => {
    setImgError(false)
  }, [profile.avatar])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rankedin_last_scan")
      if (!raw) return
      const scan = JSON.parse(raw)

      // Only apply if this scan matches the current profile id
      if (!scan.id || scan.id !== serverProfile.id) return

      const ai = scan.aiResult
      if (!ai || typeof ai.aura !== "number") return

      const aura = normalizeAuraScore(ai.aura)
      const linkedinData = scan.linkedinData || {}

      // Extract name properly
      const displayName = linkedinData.fullName || 
        (linkedinData.first_name && linkedinData.last_name ? `${linkedinData.first_name} ${linkedinData.last_name}` : "") ||
        linkedinData.firstName || 
        scan.username || 
        serverProfile.name || "";
      const cleanDisplayName = formatProfileName(displayName, scan.username || serverProfile.username)
      const avatarUrl = getBestAvatarUrl(linkedinData, cleanDisplayName, scan.username || serverProfile.username)
      
      // ONLY use real data - no DEMO_PROFILE fallback
      setProfile({
        id: scan.id,
        username: scan.username ?? "",
        name: cleanDisplayName,
        school: scan.university || linkedinData.headline || serverProfile.school || "",
        aura,
        tier: getAuraTier(ai.aura, ai.tier ?? ai.rank),
        breakdown: (ai.breakdown || serverProfile.breakdown || []).filter((item: { label?: string }) => item.label !== "GitHub"),
        roasts: ai.roasts || serverProfile.roasts || [],
        jobMatches: ai.jobMatches || serverProfile.jobMatches || [],
        improvements: (ai.improvements || serverProfile.improvements || []).map(expandImprovement),
        profileChanges: ai.profileChanges || serverProfile.profileChanges || [],
        avatar: avatarUrl,
      })
    } catch (e) {
      console.error("[v0] Failed to read AI result from localStorage:", e)
    }
  }, [serverProfile.id, serverProfile.username, serverProfile.school, serverProfile.name, serverProfile.avatar, serverProfile.breakdown, serverProfile.roasts, serverProfile.jobMatches, serverProfile.improvements, serverProfile.profileChanges])



  return (
    <>
    <ShareCardModal
      profile={profile}
      open={showShareCard}
      onClose={() => setShowShareCard(false)}
    />
    <div className="max-w-[720px] mx-auto px-6 py-16">
      {/* Hero: Profile card + Score + Meme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-12">
          {imgError || !profile.avatar ? (
            <div className="w-[64px] h-[64px] rounded-full bg-ri-gray-100 flex items-center justify-center text-ri-gray-400 text-[24px] font-[500]">
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          ) : (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-[64px] h-[64px] rounded-full object-cover"
              onError={(event) => {
                const fallback = getGeneratedAvatarUrl(profile.name, profile.username)
                if (event.currentTarget.src !== fallback) {
                  event.currentTarget.src = fallback
                  return
                }
                setImgError(true)
              }}
            />
          )}
          <div>
            <h1 className="text-[20px] font-[500] text-ri-black">{profile.name}</h1>
            <p className="text-[13px] text-ri-gray-500">@{profile.username}</p>
            {profile.school && <p className="text-[12px] text-ri-gray-400 mt-1">{profile.school}</p>}
          </div>
        </div>

        {/* Aura + Tier in a row */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <p className="text-[12px] text-ri-gray-400 uppercase tracking-[0.1em] mb-3">aura score</p>
            <AuraCounter
              value={profile.aura}
              className="tabular-nums leading-none text-ri-black block"
              style={{ fontSize: "3.5rem" } as React.CSSProperties}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col items-center justify-center"
          >
            <p className="text-[12px] text-ri-gray-400 uppercase tracking-[0.1em] mb-3">your tier</p>
            <TierBadge tier={profile.tier} size="lg" />
          </motion.div>
        </div>

      </motion.div>

      {/* Score breakdown */}
      {profile.breakdown && profile.breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.12em] mb-5">score breakdown</p>
          <div className="flex flex-col gap-3">
            {profile.breakdown.map((item) => {
              const pct = Math.round((item.value / item.max) * 100)
              const actions = item.actionItems && item.actionItems.length > 0 ? item.actionItems : defaultActions(item)
              return (
                <div key={item.label} className="bg-ri-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-[500] text-ri-black">{item.label}</span>
                    <span className="text-[13px] font-[600] tabular-nums text-ri-black">{item.value}<span className="text-ri-gray-400 font-[400]">/{item.max}</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-ri-gray-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`h-full rounded-full ${pct >= 60 ? "bg-[#E8A020]" : pct >= 30 ? "bg-ri-gray-300" : "bg-ri-gray-200"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[12px] text-ri-gray-500 leading-relaxed mb-3">{item.reason}</p>
                  <div className="rounded-lg bg-ri-white/70 border border-ri-gray-100 p-3">
                    <p className="text-[11px] font-[700] text-ri-gray-500 uppercase tracking-[0.08em] mb-1">why this score</p>
                    <p className="text-[12px] text-ri-gray-600 leading-relaxed">{explainScore(item)}</p>
                  </div>
                  {actions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-ri-gray-100 flex flex-col gap-3">
                      {actions.slice(0, 2).map((action, i) => (
                        <div key={`${action.section}-${i}`}>
                          <p className="text-[11px] font-[700] text-ri-gray-500 uppercase tracking-[0.08em] mb-1">
                            change in {action.section}
                          </p>
                          <p className="text-[12px] text-ri-black leading-relaxed mb-2">{action.change}</p>
                          <div className="rounded-lg bg-ri-white border border-ri-gray-100 p-3">
                            <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.08em] mb-1">example wording</p>
                            <p className="text-[12px] text-ri-gray-600 leading-relaxed">{action.example}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Roast */}
      {profile.roasts && profile.roasts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">the verdict</p>
          <div className="bg-ri-black rounded-xl p-5 flex flex-col gap-3">
            {profile.roasts.map((roast: string, i: number) => (
              <p key={i} className="text-[13px] text-[#FAF6EF] leading-relaxed">{roast}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* How to improve */}
      {profile.improvements && profile.improvements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.12em] mb-5">how to increase your aura</p>
          <div className="flex flex-col gap-3">
            {profile.improvements.map((rawImp, i) => {
              const imp = expandImprovement(rawImp)
              return (
              <div key={i} className="border border-ri-gray-100 rounded-xl p-4 flex gap-4 items-start">
                <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#E8A020]/15 flex items-center justify-center">
                  <span className="text-[11px] font-[700] text-[#C07010]">+{imp.potentialGain}</span>
                </div>
                <div>
                  <p className="text-[13px] font-[600] text-ri-black mb-1">{imp.area}</p>
                  <p className="text-[12px] text-ri-gray-500 leading-relaxed">{imp.suggestion}</p>
                  {imp.changes && imp.changes.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3">
                      {imp.changes.slice(0, 2).map((change, changeIndex) => (
                        <div key={`${change.section}-${changeIndex}`} className="rounded-lg bg-ri-gray-50 p-3">
                          <p className="text-[12px] font-[600] text-ri-black mb-1">{change.section}</p>
                          <p className="text-[12px] text-ri-gray-600 leading-relaxed mb-2">{change.change}</p>
                          <p className="text-[12px] text-ri-gray-400 leading-relaxed italic">{change.example}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Exact LinkedIn edits */}
      {exactChanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mb-12"
        >
          <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.12em] mb-5">exact linkedin changes</p>
          <div className="flex flex-col gap-3">
            {exactChanges.slice(0, 6).map((change, i) => (
              <div key={`${change.section}-${i}`} className="bg-ri-black text-ri-white rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[11px] font-[600] text-white/45 uppercase tracking-[0.12em] mb-1">{change.area || "profile"}</p>
                    <p className="text-[14px] font-[600]">{change.section}</p>
                  </div>
                  {change.potentialGain && (
                    <span className="shrink-0 text-[11px] font-[700] text-[#E8A020]">+{change.potentialGain}</span>
                  )}
                </div>
                <p className="text-[13px] text-white/85 leading-relaxed mb-3">{change.change}</p>
                <div className="rounded-lg bg-white/8 border border-white/10 p-3 mb-3">
                  <p className="text-[11px] font-[600] text-white/40 uppercase tracking-[0.08em] mb-1">write this kind of line</p>
                  <p className="text-[13px] text-[#FAF6EF] leading-relaxed">{change.example}</p>
                </div>
                <p className="text-[12px] text-white/50 leading-relaxed">{change.why}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-20 pt-12 border-t border-ri-gray-100"
      >
        <div className="flex flex-col gap-2">
            <Link
              href="/scan"
              className="block w-full py-3.5 rounded-full bg-ri-black text-ri-white text-[15px] font-[500] text-center hover:bg-ri-gray-800 active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              scan another profile
            </Link>
            <Link
              href={`/battle?a=${profile.id}`}
              className="block w-full py-3 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] text-center hover:border-ri-black active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              battle with a friend
            </Link>
            <button
              onClick={() => setShowShareCard(true)}
              className="w-full py-3 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] hover:border-ri-black active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              share your result
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=just%20got%20ranked%20%F0%9F%94%A5%0AI%27m%20${profile.tier.replace(/ /g, "%20")}%20on%20%40RankedIn%0AMy%20aura%3A%20${profile.aura.toLocaleString()}%20%7C%20${profile.tier}%0A%0Awhat%27s%20your%20aura%3F&url=https://rankedin.app`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] text-center hover:border-ri-black active:scale-[0.98] transition-[colors,transform] duration-100"
            >
              post on 𝕏
            </a>
        </div>
      </motion.div>
    </div>
    </>
  )
}
