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
        <h1 className="font-serif text-[42px] font-[800] text-ri-black leading-tight mb-6">
          What is Aura?
        </h1>

        {/* Plain-language definition */}
        <div className="bg-ri-gray-50 border border-ri-gray-100 rounded-2xl p-6 mb-10">
          <p className="text-[15px] text-ri-black font-[600] mb-3">Simple definition</p>
          <p className="text-[15px] text-ri-gray-600 leading-relaxed">
            <strong className="text-ri-black">Aura</strong> is a composite career score (0 – 2,500) calculated from a person's public LinkedIn profile. It quantifies how strong, complete, and credible that profile appears to a recruiter or hiring manager — turning a subjective impression into a measurable number.
          </p>
          <p className="text-[15px] text-ri-gray-600 leading-relaxed mt-3">
            Think of it like a <strong className="text-ri-black">credit score, but for your career</strong>. Just as a credit score aggregates financial behaviour into a single number, Aura aggregates professional signals — experience quality, education prestige, skills depth, project proof, and communication clarity — into one score that anyone can understand instantly.
          </p>
        </div>

        <div className="space-y-3 mb-16">
          <div className="flex gap-3 items-start">
            <span className="text-[#E8A020] font-[700] text-[13px] mt-0.5 shrink-0">→</span>
            <p className="text-[14px] text-ri-gray-600"><strong className="text-ri-black">It is not AI-generated.</strong> Every point comes from a transparent, rule-based formula applied to real profile data. Same inputs always produce the same score.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-[#E8A020] font-[700] text-[13px] mt-0.5 shrink-0">→</span>
            <p className="text-[14px] text-ri-gray-600"><strong className="text-ri-black">It is actionable.</strong> The breakdown tells you exactly which dimension is holding your score down and by how much — so you know what to fix.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-[#E8A020] font-[700] text-[13px] mt-0.5 shrink-0">→</span>
            <p className="text-[14px] text-ri-gray-600"><strong className="text-ri-black">It is competitive.</strong> All scores are on a public leaderboard. Career growth becomes a sport you can track and compare.</p>
          </div>
        </div>

        <hr className="border-ri-gray-100 mb-16" />

        {/* Why the name */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-4">Why we chose the name "Aura"</h2>
          <div className="space-y-4 text-[15px] text-ri-gray-600 leading-relaxed">
            <p>
              In everyday language, <em>aura</em> refers to the intangible quality that surrounds a person — the impression they give off before they even speak. In a hiring context, that impression is formed the moment a recruiter opens your LinkedIn profile.
            </p>
            <p>
              We chose the name because it accurately describes what we are measuring: not just your credentials on paper, but the <strong className="text-ri-black">overall signal strength</strong> of your professional presence. A profile with high aura is one where every section — headline, experience, education, projects, and summary — works together to make a recruiter stop scrolling.
            </p>
            <p>
              We also chose it because it resonates with a younger audience. Framing career development as something you can <strong className="text-ri-black">level up</strong> — the same way you would in a game — makes the process less intimidating and more motivating.
            </p>
          </div>
        </section>

        {/* How scoring works */}
        <section className="mb-14">
          <h2 className="text-[13px] font-[700] text-ri-gray-400 uppercase tracking-[0.12em] mb-3">How the score is calculated</h2>
          <p className="text-[15px] text-ri-gray-600 leading-relaxed mb-4">
            Aura is the sum of 8 independently scored dimensions. Each dimension has a defined maximum. The final score is capped at <strong className="text-ri-black">2,500 points</strong>.
          </p>

          {/* Master formula */}
          <div className="bg-ri-black rounded-xl px-5 py-4 mb-8">
            <p className="font-mono text-[11px] text-ri-gray-400 mb-1">MASTER FORMULA</p>
            <p className="font-mono text-[13px] text-[#FAF6EF] leading-relaxed">
              Aura = H + E + Ed + Sk + Ab + Pr + C + R
            </p>
            <p className="font-mono text-[11px] text-ri-gray-400 mt-2 leading-relaxed">
              max = 250 + 650 + 350 + 450 + 200 + 300 + 300 + 150 = <span className="text-[#E8A020]">2,500</span>
            </p>
          </div>

          <div className="space-y-5">

            {/* H - Headline */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">H</span>
                  <span className="text-[13px] font-[700] text-ri-black">Headline clarity</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 250 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">H = min(80 + L + R + B + T + Co + Sc, 250)</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>L  = 50 if headline length ≥ 40 chars, else 25 if ≥ 25, else 0</p>
                  <p>R  = 90 if [CTO / VP / Director / Head of]</p>
                  <p>   = 70 if [Lead / Senior / Architect / Founder]</p>
                  <p>   = 60 if [Engineer / Developer / Scientist / Analyst]</p>
                  <p>   = 35 if [Intern / Student / Graduate]</p>
                  <p>   = 15 if [Seeking / Aspiring / Passionate]</p>
                  <p>B  = 55 if ["building", "launching", "scaling", "founded"]</p>
                  <p>T  = 30 if any tech keyword found in headline</p>
                  <p>Co = 50 if prestige company name found</p>
                  <p>Sc = 50 if elite school name found</p>
                </div>
              </div>
            </div>

            {/* E - Experience */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">E</span>
                  <span className="text-[13px] font-[700] text-ri-black">Experience signal</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 650 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">E = min(n×140 + Sr + Co + Rs + Iv + Mt, 650)</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>n  = number of structured job entries</p>
                  <p>Sr = 180 if [CTO / VP / Director / Head of]</p>
                  <p>   = 130 if [Principal / Staff / Architect / Quant Researcher]</p>
                  <p>   = 80  if [Senior / Lead / Manager / Tech Lead]</p>
                  <p>Co = 200 if 2+ prestige companies found, else 140 if 1</p>
                  <p>Rs = 100 if research signal [IEEE / NeurIPS / ICML / thesis / lab…]</p>
                  <p>Iv = 70  if impact verbs [built / shipped / led / reduced…]</p>
                  <p>Mt = 100 if metric found [30% / 2M users / $1M / 10x…]</p>
                </div>
              </div>
            </div>

            {/* Ed - Education */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">Ed</span>
                  <span className="text-[13px] font-[700] text-ri-black">Education fit</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 350 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">Ed = min(base + El + F + Dg + Hn + Re, 350)</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>base = 160 + min((entries−1)×40, 100) if any education found</p>
                  <p>El = if elite school: max(base, 220) + 80</p>
                  <p>F  = 100 if [CS / Software Eng / AI / Data Science]</p>
                  <p>   = 80  if [Engineering / Mathematics / Statistics / Physics]</p>
                  <p>   = 55  if [Business / Economics / Finance / Design]</p>
                  <p>Dg = 90 if PhD, else 60 if Master's/MBA, else 30 if Bachelor's</p>
                  <p>Hn = 60 if [GPA 3.x+ / Dean's list / Cum Laude / Honours]</p>
                  <p>Re = 50 if [research / thesis / fellowship / NSF / grant]</p>
                </div>
              </div>
            </div>

            {/* Sk - Skills */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">Sk</span>
                  <span className="text-[13px] font-[700] text-ri-black">Skills depth</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 450 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">Sk = min(min(s×22, 220) + T1 + T4 + T8 + S12, 450)</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>s   = total unique skills listed</p>
                  <p>T1  = 80 if tech_skills ≥ 1</p>
                  <p>T4  = 70 if tech_skills ≥ 4</p>
                  <p>T8  = 60 if tech_skills ≥ 8</p>
                  <p>S12 = 50 if total skills ≥ 12</p>
                  <p>tech_skills = unique matches against 50+ language/framework regex</p>
                </div>
              </div>
            </div>

            {/* Ab - About */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">Ab</span>
                  <span className="text-[13px] font-[700] text-ri-black">About / Summary</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 200 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">Ab = 0 if absent; else min(40 + Ln + Tk + Av + Pj + Ti + Mt, 200)</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>Ln = 25 if length {">"} 150 chars, +25 if {">"} 400 chars</p>
                  <p>Tk = 40 if 3+ tech skills, else 20 if 1+</p>
                  <p>Av = 35 if action verbs [built / shipped / led / published…]</p>
                  <p>Pj = 35 if project signal [github / portfolio / hackathon / paper…]</p>
                  <p>Ti = 20 if time mentioned [X years / X months]</p>
                  <p>Mt = 20 if metric found [% / users / $]</p>
                </div>
              </div>
            </div>

            {/* Pr - Projects */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">Pr</span>
                  <span className="text-[13px] font-[700] text-ri-black">Projects proof</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 300 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">Pr = min(p×90 + Po + Sh + Tk, 300)</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>p  = number of structured project/cert entries</p>
                  <p>Po = 100 if portfolio signal [github.com / hackathon / open source…]</p>
                  <p>Sh = 90  if shipped signal [deployed / won / 1st place / published…]</p>
                  <p>Tk = 40  if 3+ tech skills in project descriptions</p>
                </div>
              </div>
            </div>

            {/* C - Completeness */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">C</span>
                  <span className="text-[13px] font-[700] text-ri-black">Profile completeness</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 300 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">C = (filled / 7) × 300</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>filled = count of present sections out of 7:</p>
                  <p>  [name, headline, avatar, experience, education, skills, about]</p>
                  <p>each section is binary: 1 if present, 0 if missing</p>
                </div>
              </div>
            </div>

            {/* R - Recruiter */}
            <div className="border border-ri-gray-100 rounded-xl overflow-hidden">
              <div className="bg-ri-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-[700] text-[#C07010]">R</span>
                  <span className="text-[13px] font-[700] text-ri-black">Recruiter signal</span>
                </div>
                <span className="text-[12px] font-[600] text-ri-gray-400">max 150 pts</span>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-[12px] text-ri-black mb-3">R = f(H + E + Ed + Sk + Ab + Pr + C)</p>
                <div className="space-y-1 font-mono text-[11px] text-ri-gray-500">
                  <p>let sub = sum of all 7 categories above</p>
                  <p>R = 150 if sub ≥ 1800</p>
                  <p>  = 110 if sub ≥ 1300</p>
                  <p>  = 70  if sub ≥ 850</p>
                  <p>  = 40  if sub ≥ 450</p>
                  <p>  = 15  otherwise</p>
                </div>
              </div>
            </div>

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
