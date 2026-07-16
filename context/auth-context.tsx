"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { supabase } from "@/lib/supabase"

type AuthStatus = "loading" | "guest" | "authed"
type TransitionPhase = null | "loading" | "success"
type TransitionMode = "signup" | "login"

interface AuthContextValue {
  status: AuthStatus
  transitionPhase: TransitionPhase
  transitionMode: TransitionMode | null
  startLoginTransition: () => void
  endLoginTransition: () => void
  cancelLoginTransition: () => void
  startSignupTransition: () => void
  endSignupTransition: () => void
  cancelSignupTransition: () => void
  finishTransition: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(null)
  const [transitionMode, setTransitionMode] = useState<TransitionMode | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setStatus(session ? "authed" : "guest")
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "authed" : "guest")
    })

    return () => subscription.unsubscribe()
  }, [])

  const startLoginTransition = useCallback(() => {
    setTransitionMode("login")
    setTransitionPhase("loading")
  }, [])

  const endLoginTransition = useCallback(() => {
    setTransitionPhase("success")
  }, [])

  const cancelLoginTransition = useCallback(() => {
    setTransitionPhase(null)
    setTransitionMode(null)
  }, [])

  const startSignupTransition = useCallback(() => {
    setTransitionMode("signup")
    setTransitionPhase("loading")
  }, [])

  const endSignupTransition = useCallback(() => {
    setTransitionPhase("success")
  }, [])

  const cancelSignupTransition = useCallback(() => {
    setTransitionPhase(null)
    setTransitionMode(null)
  }, [])

  const finishTransition = useCallback(() => {
    setTransitionPhase(null)
    setTransitionMode(null)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        status,
        transitionPhase,
        transitionMode,
        startLoginTransition,
        endLoginTransition,
        cancelLoginTransition,
        startSignupTransition,
        endSignupTransition,
        cancelSignupTransition,
        finishTransition,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
