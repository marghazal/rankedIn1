import { Nav } from "@/components/nav"
import { BattleView } from "@/components/battle/battle-view"
import { Suspense } from "react"

export const metadata = {
  title: "battle — RankedIn",
  description: "compare two aura scores. the verdict is final.",
}

export default function BattlePage() {
  return (
    <main className="min-h-screen bg-ri-white">
      <Nav />
      <Suspense>
        <BattleView />
      </Suspense>
    </main>
  )
}
