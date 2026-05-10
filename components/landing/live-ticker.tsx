"use client"

const TICKER_ITEMS = [
  "alex_c just hit FAANG Platinum",
  "jane_d dropped to Resume Silver",
  "mike_t entered the leaderboard",
  "priya_k gained +80 aura from new internship",
  "dev_boy's aura took an L",
  "sarah_m ascended to Internship Gold",
  "liu_w calculating aura...",
  "tom_g challenged the #1 spot",
  "kat_r just got roasted by AI",
  "marcus_p's github streak: respect",
]

export function LiveTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="w-full overflow-hidden border-y border-ri-gray-100 py-3 bg-ri-white">
      <div className="flex animate-ticker whitespace-nowrap" aria-hidden="true">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center shrink-0">
            <span className="text-[12px] font-[500] text-ri-gray-400 uppercase tracking-[0.08em] px-6">
              {item}
            </span>
            <span className="text-ri-gray-200 select-none">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
