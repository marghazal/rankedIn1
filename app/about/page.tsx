import Link from "next/link"
import { Nav } from "@/components/nav"

export const metadata = {
  title: "About — RankedIn",
  description: "What is Aura, how we score it, and why we built RankedIn.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ri-white">
      <Nav />
      <div className="max-w-[680px] mx-auto px-6 py-20">

        {/* Header */}
        <p className="text-[11px] font-[600] text-ri-gray-400 uppercase tracking-[0.14em] mb-4">methodology</p>
        <h1 className="font-serif text-[42px] font-[800] text-ri-black leading-tight mb-4">
          What is Aura?
        </h1>
        <p className="text-[16px] text-ri-gray-500 leading-relaxed mb-16">
          Aura is your career signal — a single score that reflects how strong, credible, and recruiter-ready your LinkedIn profile actually is.
        </p>

        <hr className="border-ri-gray-100 mb-16" />

        {/* Why Aura */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">Why we chose "Aura"</h2>
          <div className="space-y-4 text-[15px] text-ri-gray-600 leading-relaxed">
            <p>
              Recruiters make split-second decisions. Within seconds of opening a LinkedIn profile, they have already formed a judgment — a gut feeling about whether this person has it or not. We wanted to name that feeling something real.
            </p>
            <p>
              <strong className="text-ri-black">Aura</strong> captures that. It is not just a score — it is the sum of your presence: what you have built, where you have studied, what you have shipped, and how clearly you communicate all of it. High aura means a recruiter cannot close the tab.
            </p>
            <p>
              We also chose it because it makes career evaluation <strong className="text-ri-black">feel like a sport</strong>. You can improve it, compare it, and compete on it — which is exactly what a generation raised on leaderboards responds to.
            </p>
          </div>
        </section>

        {/* How scoring works */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-6">How the score is calculated</h2>
          <p className="text-[15px] text-ri-gray-600 leading-relaxed mb-6">
            The aura score is built from 8 weighted dimensions, each reflecting a real signal that recruiters and hiring managers actually care about. Maximum score is 2,500.
          </p>

          <div className="space-y-4">
            {[
              {
                label: "Headline clarity",
                max: "250 pts",
                desc: "Does your headline immediately tell a recruiter who you are? We score for role specificity, seniority signals (Senior, Staff, Director, Founder), company prestige, and tech keywords. A vague headline like 'passionate about technology' scores near zero.",
              },
              {
                label: "Experience signal",
                max: "650 pts",
                desc: "The largest category. We do not just count jobs — we read them. We extract role descriptions and look for impact language (built, shipped, led, reduced, improved), quantified outcomes (30% faster, 2M users, $1M revenue), seniority tier (intern vs. staff vs. VP), and prestige companies (Google, Citadel, YC, McKinsey, etc.).",
              },
              {
                label: "Education fit",
                max: "350 pts",
                desc: "School prestige, degree relevance (CS and engineering score highest), and degree level (PhD > Master > Bachelor). We maintain a curated list of elite institutions globally — from MIT and Stanford to Waterloo, ETH Zurich, IIT, and NUS. Honors, GPA mentions, and research fellowships add bonus points.",
              },
              {
                label: "Skills depth",
                max: "450 pts",
                desc: "We count unique, verified technical skills — not soft skills like 'communication'. The score scales with breadth: 1 skill gets partial credit, 4+ unlocks a bonus tier, 8+ unlocks another. We recognize 50+ languages, frameworks, and tools.",
              },
              {
                label: "About / Summary",
                max: "200 pts",
                desc: "The About section is the most human part of a LinkedIn profile and the most neglected. We score for length, specificity, tech mentions, action verbs, links to projects, and quantified achievements. A blank About is a missed opportunity.",
              },
              {
                label: "Projects proof",
                max: "300 pts",
                desc: "Shipped work is the strongest credibility signal. We look for GitHub links, portfolio URLs, hackathon wins, open source contributions, published work, and production deployments.",
              },
              {
                label: "Profile completeness",
                max: "300 pts",
                desc: "7 sections checked: name, headline, avatar, experience, education, skills, and summary. Each missing section is a signal that the profile was not taken seriously.",
              },
              {
                label: "Recruiter signal",
                max: "150 pts",
                desc: "An overall impression bonus that scales with the sum of all other categories. Represents the gut-check: would a recruiter shortlist this profile in the first 10 seconds?",
              },
            ].map((item) => (
              <div key={item.label} className="border border-ri-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-[600] text-ri-black">{item.label}</span>
                  <span className="text-[12px] font-[600] text-[#C07010] bg-[#E8A020]/10 px-2 py-0.5 rounded-full">{item.max}</span>
                </div>
                <p className="text-[13px] text-ri-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scraping methodology */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">Scraping — quality over quantity</h2>
          <div className="space-y-4 text-[15px] text-ri-gray-600 leading-relaxed">
            <p>
              Most LinkedIn scrapers stop at the surface: they grab the job title and move on. We extract the full depth of each profile section.
            </p>
            <p>
              For every <strong className="text-ri-black">experience entry</strong>, we capture the role title, company name, employment type, duration, and — most importantly — the full description. This is where the real signal lives: the bullet points where someone says "reduced API latency by 40%" or "led a team of 8 engineers." Without the description, the job is just a label.
            </p>
            <p>
              For <strong className="text-ri-black">education</strong>, we capture the school name, degree type, field of study, GPA or grade if listed, and any activities or descriptions — including research projects and extracurriculars.
            </p>
            <p>
              We also extract <strong className="text-ri-black">certifications, publications, honors, awards, and volunteer experience</strong> — all with their descriptions. A research paper published at NeurIPS is not just a line item; the abstract tells us what the person worked on.
            </p>
            <p>
              The <strong className="text-ri-black">About section</strong> is treated as its own scoring category. It is the only part of LinkedIn where someone writes in their own voice — and it is the highest-signal input for distinguishing two candidates with identical job histories.
            </p>
            <p>
              We run three scraping layers in sequence: a primary structured API, an enrichment fallback, and an HTML parser — ensuring coverage even for profiles with privacy restrictions.
            </p>
          </div>
        </section>

        {/* Tiers */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">Tiers</h2>
          <div className="space-y-2">
            {[
              { tier: "Offer Magnet", range: "2,000 – 2,500", desc: "Recruiters reach out to you." },
              { tier: "FAANG Contender", range: "1,600 – 1,999", desc: "Strong candidate. Multiple offers likely." },
              { tier: "Recruiter Bait", range: "1,200 – 1,599", desc: "Solid profile. Standing out from the crowd." },
              { tier: "New Grad Silver", range: "800 – 1,199", desc: "Good foundation. Gaps are closeable." },
              { tier: "Internship Bronze", range: "400 – 799", desc: "Early career. Resume needs more substance." },
              { tier: "Resume Rookie", range: "0 – 399", desc: "The aura is still loading." },
            ].map((t) => (
              <div key={t.tier} className="flex items-start gap-4 py-3 border-b border-ri-gray-100 last:border-0">
                <span className="text-[13px] font-[700] text-ri-black w-44 shrink-0">{t.tier}</span>
                <span className="text-[12px] text-[#C07010] font-[600] w-32 shrink-0 tabular-nums">{t.range}</span>
                <span className="text-[13px] text-ri-gray-500">{t.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Built at */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">Built at GDGHack</h2>
          <p className="text-[15px] text-ri-gray-600 leading-relaxed">
            RankedIn was built in a single hackathon sprint. The stack: <strong className="text-ri-black">Next.js 15</strong> (App Router, server components), <strong className="text-ri-black">TypeScript</strong>, <strong className="text-ri-black">Tailwind CSS v4</strong>, <strong className="text-ri-black">Framer Motion</strong>, and <strong className="text-ri-black">Supabase</strong> (Postgres + Auth). The scoring engine is a custom-built text-mining pipeline — no AI APIs, no black box. Every point is explainable.
          </p>
        </section>

        <div className="pt-8 border-t border-ri-gray-100">
          <Link
            href="/scan"
            className="inline-flex items-center px-6 py-3 rounded-full bg-ri-black text-[#FAF6EF] text-[14px] font-[600] hover:bg-ri-gray-800 active:scale-[0.97] transition-[colors,transform] duration-100"
          >
            calculate your aura
          </Link>
        </div>

      </div>
    </main>
  )
}
