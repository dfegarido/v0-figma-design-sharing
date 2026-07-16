"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { AuthBlobs } from "./auth/auth-blobs"
import { AuthPrimaryButton } from "./auth/auth-primary-button"
import { AuthOutlineButton } from "./auth/auth-outline-button"

interface LandingScreenProps {
  onLogin: () => void
  onSignup: () => void
}

const TRUST_PILLS = ["Verified Owners", "Secure Messaging", "Trusted Swaps"]

export function LandingScreen({ onLogin, onSignup }: LandingScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#FFF8F6] to-[#FFEFEB]">
      <AuthBlobs />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-between px-6 py-12">
        <div className="mt-12 flex flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-[140px] w-[140px] items-center justify-center rounded-full bg-white shadow-[0_12px_40px_rgba(255,90,95,0.12)]"
            >
              <Image
                src="/logo.png"
                alt="Switch My House"
                width={80}
                height={80}
                className="object-contain"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-center"
          >
            <h1 className="text-[38px] font-bold leading-[44px] text-[#222222]">
              Find Your Perfect
              <br />
              Home Swap
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="max-w-[300px] text-center text-base leading-6 text-[#717171]"
          >
            Stay anywhere with verified homeowners around the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {TRUST_PILLS.map((pill) => (
              <div
                key={pill}
                className="flex items-center gap-1.5 rounded-full border border-[#E8E8E8] bg-white px-3.5 py-1.5 shadow-sm"
              >
                <Check className="h-3 w-3 text-[#FF5A5F]" />
                <span className="text-xs font-medium text-[#717171]">{pill}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.48 }}
          className="w-full space-y-3"
        >
          <AuthPrimaryButton onClick={onLogin}>Log In</AuthPrimaryButton>
          <AuthOutlineButton onClick={onSignup}>Create Account</AuthOutlineButton>
        </motion.div>
      </div>
    </div>
  )
}
