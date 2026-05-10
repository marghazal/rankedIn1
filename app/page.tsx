import { Nav } from "@/components/nav"
import { HeroSection } from "@/components/landing/hero-section"
import { LeaderboardPreview } from "@/components/landing/leaderboard-preview"
import { AnalyticsBadge } from "@/components/landing/analytics-badge"
import { RanksSection } from "@/components/landing/ranks-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ri-white">
      <Nav />
      <HeroSection />
      <LeaderboardPreview />
      <AnalyticsBadge />
      <RanksSection />
      <HowItWorksSection />

      {/* Footer */}
      <footer className="border-t border-ri-gray-100 py-8 px-6 bg-ri-white">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <p className="text-[13px] text-ri-gray-400">
            RankedIn — not affiliated with LinkedIn. the aura is yours.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/scan" className="text-[13px] text-ri-gray-400 hover:text-ri-black transition-colors duration-150">
              get ranked
            </Link>
            <Link href="/leaderboard" className="text-[13px] text-ri-gray-400 hover:text-ri-black transition-colors duration-150">
              leaderboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
