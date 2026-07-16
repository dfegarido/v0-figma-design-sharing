"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2 } from "lucide-react"

interface AuthTransitionScreenProps {
  mode: "loading" | "success"
  transitionMode?: "signup" | "login" | null
  onFinish?: () => void
}

export function AuthTransitionScreen({
  mode,
  transitionMode,
  onFinish,
}: AuthTransitionScreenProps) {
  useEffect(() => {
    if (mode !== "success") return
    const timer = setTimeout(() => onFinish?.(), 2800)
    return () => clearTimeout(timer)
  }, [mode, onFinish])

  const loadingText =
    transitionMode === "login" ? "Logging you in..." : "Creating your account..."
  const successText =
    transitionMode === "login" ? "Welcome back" : "You're all set"
  const successSubtext =
    transitionMode === "login"
      ? "Good to see you again"
      : "Welcome to Switch My House"

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FFF8F6] to-[#FFEFEB] items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {mode === "loading" ? (
          <Loader2 className="w-20 h-20 text-primary animate-spin" />
        ) : (
          <CheckCircle2 className="w-20 h-20 text-primary" />
        )}

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {mode === "loading" ? loadingText : successText}
          </h1>
          {mode === "success" && (
            <p className="text-muted-foreground">{successSubtext}</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
