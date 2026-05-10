"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export function Nav() {
  const { user, signOut, loading } = useAuth()

  return (
    <header className="w-full border-b border-ri-gray-100 bg-[#FAF6EF]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ri-black hover:opacity-70 transition-opacity duration-150"
        >
          <img src="/favicon.svg" alt="RankedIn" className="w-[28px] h-[28px]" />
          <span className="font-serif text-[17px] font-[800] tracking-tight">RankedIn</span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/leaderboard"
            className="hidden md:inline text-[14px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150"
          >
            leaderboard
          </Link>
          <Link
            href="/battle"
            className="hidden md:inline text-[14px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150"
          >
            battle
          </Link>
          <Link
            href="/about"
            className="hidden md:inline text-[14px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150"
          >
            about
          </Link>
          {user && (
            <Link
              href="/history"
              className="hidden md:inline text-[14px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150"
            >
              history
            </Link>
          )}

          {!loading && (
            user ? (
              <button
                onClick={() => signOut()}
                className="hidden md:inline text-[14px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150"
              >
                sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline text-[14px] font-[500] text-ri-gray-500 hover:text-ri-black transition-colors duration-150"
              >
                sign in
              </Link>
            )
          )}

          <Link
            href="/scan"
            className="card-raised-sm text-[12px] md:text-[13px] font-[600] px-4 py-1.5 rounded-lg bg-ri-black text-[#FAF6EF] hover:bg-ri-gray-800 transition-colors duration-150"
          >
            calculate my aura
          </Link>
        </nav>
      </div>
    </header>
  )
}
