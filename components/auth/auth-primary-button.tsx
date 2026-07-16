"use client"

import { motion } from "framer-motion"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface AuthPrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

export function AuthPrimaryButton({
  loading,
  children,
  className = "",
  disabled,
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      disabled={disabled || loading}
      className={`w-full rounded-[28px] bg-gradient-to-br from-[#FF8A8F] to-[#FF5A5F] px-7 py-4 text-base font-semibold text-white shadow-[0_8px_24px_rgba(255,90,95,0.25)] transition-opacity disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
