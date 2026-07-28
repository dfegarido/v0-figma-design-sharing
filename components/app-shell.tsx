"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { AuthTransitionScreen } from "@/components/auth-transition-screen"
import { LandingScreen } from "@/components/landing-screen"
import { LoginScreen } from "@/components/login-screen"
import { ResetPasswordScreen } from "@/components/reset-password-screen"
import { SignupScreen } from "@/components/signup-screen"
import { SwitchMyHouseApp } from "@/components/switch-my-house-app"
import { UserDataProvider } from "@/context/user-data-context"

type AuthScreen = "landing" | "login" | "signup" | "reset-password"

function AppContent() {
  const {
    status,
    transitionPhase,
    transitionMode,
    finishTransition,
    cancelLoginTransition,
    cancelSignupTransition,
  } = useAuth()
  const [authScreen, setAuthScreen] = useState<AuthScreen>("landing")
  const [resetPasswordEmail, setResetPasswordEmail] = useState("")

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FFF8F6] to-[#FFEFEB]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF5A5F] border-t-transparent" />
      </div>
    )
  }

  if (transitionPhase === "loading" || transitionPhase === "success") {
    return (
      <AuthTransitionScreen
        mode={transitionPhase}
        transitionMode={transitionMode}
        onFinish={() => {
          if (transitionMode === "login") {
            cancelLoginTransition()
          } else {
            cancelSignupTransition()
          }
          finishTransition()
        }}
      />
    )
  }

  if (status === "authed") {
    return (
      <UserDataProvider>
        <SwitchMyHouseApp />
      </UserDataProvider>
    )
  }

  const renderAuthScreen = () => {
    switch (authScreen) {
      case "login":
        return (
          <LoginScreen
            onNavigateSignup={() => setAuthScreen("signup")}
            onNavigateForgotPassword={(email) => {
              setResetPasswordEmail(email)
              setAuthScreen("reset-password")
            }}
          />
        )
      case "reset-password":
        return (
          <ResetPasswordScreen
            initialEmail={resetPasswordEmail}
            onBack={() => setAuthScreen("login")}
          />
        )
      case "signup":
        return (
          <SignupScreen
            onBack={() => setAuthScreen("landing")}
            onNavigateLogin={() => setAuthScreen("login")}
          />
        )
      default:
        return (
          <LandingScreen
            onLogin={() => setAuthScreen("login")}
            onSignup={() => setAuthScreen("signup")}
          />
        )
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={authScreen}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {renderAuthScreen()}
      </motion.div>
    </AnimatePresence>
  )
}

export function AppShell() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
