import { Nav } from "@/components/nav"
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view"

export const metadata = {
  title: "leaderboard — RankedIn",
  description: "u of guelph CS. sorted by aura. no mercy.",
}

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-ri-white">
      <Nav />
      <LeaderboardView />
    </main>
  )
}
