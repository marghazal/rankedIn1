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

        {/* Formula breakdown */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-2">The formula</h2>
          <p className="text-[14px] text-ri-gray-500 mb-8">Every point is deterministic — no AI, no randomness. Same inputs always produce the same score.</p>

          <div className="space-y-6">

            {/* Headline */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">Headline clarity</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 250 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>base score = 80</p>
                <p>+ 50 &nbsp;if length ≥ 40 chars &nbsp;(else +25 if ≥ 25)</p>
                <p>+ 90 &nbsp;if C-suite / VP / Director / Head of</p>
                <p>+ 70 &nbsp;if Lead / Senior / Architect / Founder</p>
                <p>+ 60 &nbsp;if Engineer / Developer / Scientist / Analyst</p>
                <p>+ 35 &nbsp;if Intern / Student / Graduate</p>
                <p>+ 55 &nbsp;if builder signal (building, launching, scaling, founded)</p>
                <p>+ 30 &nbsp;if tech skill detected in headline</p>
                <p>+ 50 &nbsp;if prestige company detected</p>
                <p>+ 50 &nbsp;if elite school detected</p>
                <p className="text-ri-gray-400 pt-1">→ capped at 250</p>
              </div>
            </div>

            {/* Experience */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">Experience signal</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 650 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>base = number of positions × 140</p>
                <p>+ 180 if C-suite / VP / Director / Head of</p>
                <p>+ 130 if Principal / Staff / Architect / Quant Researcher</p>
                <p>+ 80 &nbsp;if Senior / Lead / Manager / Tech Lead</p>
                <p>+ 200 if 2+ prestige companies detected</p>
                <p>+ 140 if 1 prestige company detected</p>
                <p>+ 100 if research signal (IEEE, NeurIPS, ICML, thesis, lab…)</p>
                <p>+ 70 &nbsp;if impact verbs (built, shipped, led, reduced, improved…)</p>
                <p>+ 100 if quantified metric (30%, 2M users, $1M, 10x…)</p>
                <p>if no structured data: text-mining fallback applies</p>
                <p className="text-ri-gray-400 pt-1">→ capped at 650</p>
              </div>
            </div>

            {/* Education */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">Education fit</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 350 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>base = 160 if any education found (+ 40 per additional degree)</p>
                <p>if elite school detected: max(base, 220) + 80</p>
                <p>+ 100 if CS / Software Engineering / AI / Data Science</p>
                <p>+ 80 &nbsp;if Engineering / Mathematics / Statistics / Physics</p>
                <p>+ 55 &nbsp;if Business / Economics / Finance / Design</p>
                <p>+ 90 &nbsp;if PhD / Doctorate</p>
                <p>+ 60 &nbsp;if Master's / MBA</p>
                <p>+ 30 &nbsp;if Bachelor's</p>
                <p>+ 60 &nbsp;if GPA ≥ 3.x / Dean's list / Honours / Cum Laude</p>
                <p>+ 50 &nbsp;if research / thesis / fellowship / NSF / NSERC</p>
                <p className="text-ri-gray-400 pt-1">→ capped at 350</p>
              </div>
            </div>

            {/* Skills */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">Skills depth</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 450 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>base = min(220, total_skills × 22)</p>
                <p>+ 80 &nbsp;if tech skills ≥ 1</p>
                <p>+ 70 &nbsp;if tech skills ≥ 4</p>
                <p>+ 60 &nbsp;if tech skills ≥ 8</p>
                <p>+ 50 &nbsp;if total skills ≥ 12</p>
                <p className="text-ri-gray-400 pt-1">tech skills = unique matches against 50+ lang/framework regex</p>
                <p className="text-ri-gray-400">→ capped at 450</p>
              </div>
            </div>

            {/* Summary */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">About / Summary</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 200 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>0 if no about section or under 30 chars</p>
                <p>base = 40 if present</p>
                <p>+ 25 &nbsp;if length {">"} 150 chars</p>
                <p>+ 25 &nbsp;if length {">"} 400 chars</p>
                <p>+ 40 &nbsp;if 3+ tech skills mentioned</p>
                <p>+ 35 &nbsp;if action verbs (built, shipped, led, published…)</p>
                <p>+ 35 &nbsp;if project signal (github, portfolio, hackathon, paper…)</p>
                <p>+ 20 &nbsp;if time mentioned (X years, X months)</p>
                <p>+ 20 &nbsp;if quantified metric (%, users, $)</p>
                <p className="text-ri-gray-400 pt-1">→ capped at 200</p>
              </div>
            </div>

            {/* Projects */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">Projects proof</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 300 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>base = number of projects × 90</p>
                <p>+ 100 if portfolio signal (github.com, hackathon, open source…)</p>
                <p>+ 90 &nbsp;if shipped signal (deployed, won, 1st place, published…)</p>
                <p>+ 40 &nbsp;if 3+ tech skills in project descriptions</p>
                <p className="text-ri-gray-400 pt-1">→ capped at 300</p>
              </div>
            </div>

            {/* Completeness */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">Profile completeness</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 300 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>sections checked: name, headline, avatar, experience,</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; education, skills, about</p>
                <p>score = (filled_sections / 7) × 300</p>
                <p className="text-ri-gray-400 pt-1">→ capped at 300</p>
              </div>
            </div>

            {/* Recruiter signal */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-[13px] font-[700] text-ri-black">Recruiter signal</span>
                <span className="text-[12px] font-[600] text-[#C07010]">max 150 pts</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 font-mono text-[12px] text-ri-gray-600 leading-relaxed">
                <p>subtotal = sum of all 7 categories above</p>
                <p>if subtotal ≥ 1800 → +150</p>
                <p>if subtotal ≥ 1300 → +110</p>
                <p>if subtotal ≥ 850 &nbsp;→ +70</p>
                <p>if subtotal ≥ 450 &nbsp;→ +40</p>
                <p>else &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ +15</p>
                <p className="text-ri-gray-400 pt-1">→ capped at 150</p>
              </div>
            </div>

            {/* Total */}
            <div className="bg-ri-black rounded-xl px-5 py-4">
              <p className="font-mono text-[13px] text-[#FAF6EF] leading-relaxed">
                <span className="text-[#E8A020] font-[700]">AURA</span> = Headline + Experience + Education + Skills + About + Projects + Completeness + Recruiter
              </p>
              <p className="font-mono text-[12px] text-ri-gray-400 mt-1">max = 250 + 650 + 350 + 450 + 200 + 300 + 300 + 150 = <span className="text-[#E8A020]">2,500</span></p>
            </div>

          </div>
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
