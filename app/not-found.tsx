import { Nav } from "@/components/nav"
import Link from "next/link"
import { Flame } from "@/components/flame"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ri-white flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-lg">
          <div className="mb-8 flex justify-center">
            <Flame aura={404} size={72} />
          </div>

          <h1 className="font-serif text-[56px] md:text-[72px] font-[500] text-ri-black mb-4 leading-tight">
            404
          </h1>

          <p className="text-[20px] font-serif italic text-ri-gray-600 mb-3">
            page not found.
          </p>

          <p className="text-[15px] text-ri-gray-500 mb-8 leading-relaxed">
            this profile doesn't exist or was deleted. check the url and try again, or explore the leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-ri-black text-ri-white text-[14px] font-[500] hover:bg-ri-gray-800 transition-colors duration-150"
            >
              go home
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 rounded-full border border-ri-gray-200 text-ri-black text-[14px] font-[500] hover:border-ri-black transition-colors duration-150"
            >
              see leaderboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
