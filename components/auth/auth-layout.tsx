"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { AuthBlobs } from "./auth-blobs"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  cardTop?: ReactNode
  children: ReactNode
  footer?: ReactNode
  cardFooter?: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  cardTop,
  children,
  footer,
  cardFooter,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#FFF8F6] to-[#FFEFEB]">
      <AuthBlobs />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: "easeOut" }}
          className="flex flex-1 flex-col gap-6"
        >
          {cardTop}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="mb-2 text-[34px] font-bold leading-10 text-[#222222]">{title}</h1>
            {subtitle && (
              <p className="text-base leading-[22px] text-[#717171]">{subtitle}</p>
            )}
          </motion.div>

          <div className="flex flex-1 flex-col justify-between gap-6">
            <div className="space-y-6">{children}</div>
            {cardFooter}
          </div>
        </motion.div>

        {footer && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="mt-8 text-center"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  )
}
