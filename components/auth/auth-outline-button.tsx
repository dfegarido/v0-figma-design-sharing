"use client"

import { motion } from "framer-motion"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface AuthOutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  soft?: boolean
}

export function AuthOutlineButton({
  children,
  soft = false,
  className = "",
  ...props
}: AuthOutlineButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      className={`w-full rounded-[28px] border px-7 py-4 text-base font-semibold shadow-sm transition-colors ${
        soft
          ? "border-transparent bg-gradient-to-br from-white to-[#FFF5F3] text-[#222222]"
          : "border-[#DDDDDD] bg-white text-[#222222]"
      } ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
