"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Link as LinkIcon, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { Flame } from "@/components/flame"
import type { ProfileData } from "@/lib/demo-profile"

interface ShareCardModalProps {
  profile: ProfileData
  open: boolean
  onClose: () => void
}

export function ShareCardModal({ profile, open, onClose }: ShareCardModalProps) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [profile.avatar, open])

  const handleCopy = async () => {
    const profileUrl = window.location.href
    const text = `my linkedin aura score is ${profile.aura.toLocaleString()} (${profile.tier}) on RankedIn — can you beat it?\n${profileUrl}`

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[360px]">
              {/* Card */}
              <div className="relative bg-ri-black rounded-3xl overflow-hidden">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors duration-150"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>

                {/* Card content */}
                <div className="px-8 pt-12 pb-10 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-5">
                    {profile.avatar && !imgError ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-[96px] h-[96px] rounded-full object-cover ring-2 ring-white/10"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-[96px] h-[96px] rounded-full bg-white/10 text-white/50 flex items-center justify-center text-[34px] font-[500] ring-2 ring-white/10">
                        {profile.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    {/* Flame badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <Flame aura={profile.aura} size={28} />
                    </div>
                  </div>

                  {/* Name */}
                  <p className="text-white/50 text-[13px] font-[400] mt-3 mb-1 tracking-wide">
                    @{profile.username}
                  </p>
                  {profile.school && (
                    <p className="text-white/30 text-[12px] mb-6">{profile.school}</p>
                  )}
                  {!profile.school && <div className="mb-6" />}

                  {/* Aura score */}
                  <p className="font-mono text-[56px] font-[600] text-white leading-none tabular-nums tracking-tight">
                    {profile.aura.toLocaleString()}
                  </p>

                  {/* Label */}
                  <p className="text-white/40 text-[11px] uppercase tracking-[0.15em] mt-2 mb-2">
                    aura score
                  </p>

                  {/* Tier */}
                  <p className="font-serif italic text-[18px] text-white/70 mb-8">
                    {profile.tier}
                  </p>

                  {/* Divider */}
                  <div className="w-full h-px bg-white/10 mb-6" />

                  {/* App name */}
                  <p className="font-serif italic text-[22px] text-white font-[500] tracking-tight mb-1">
                    RankedIn
                  </p>
                  <p className="text-white/30 text-[12px]">linkedin, but with receipts.</p>
                </div>
              </div>

              {/* Copy link button — outside card */}
              <button
                onClick={handleCopy}
                className={`mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-[500] transition-all duration-200 ${
                  copied
                    ? "bg-white text-ri-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={15} />
                    link copied
                  </>
                ) : (
                  <>
                    <LinkIcon size={15} />
                    copy link
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
