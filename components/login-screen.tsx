"use client"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { AuthLayout } from "./auth/auth-layout"
import { AuthFormField } from "./auth/auth-form-field"
import { AuthPrimaryButton } from "./auth/auth-primary-button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"

interface LoginScreenProps {
  onNavigateSignup: () => void
}

export function LoginScreen({ onNavigateSignup }: LoginScreenProps) {
  const { startLoginTransition, endLoginTransition, cancelLoginTransition } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password")
      return
    }

    startLoginTransition()
    setLoading(true)

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 2000))
    const loginPromise = supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    const [, { error }] = await Promise.all([minDelay, loginPromise])
    setLoading(false)

    if (error) {
      cancelLoginTransition()
      toast.error(error.message)
      return
    }

    endLoginTransition()
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Continue your home swapping journey."
      cardFooter={
        <AuthPrimaryButton onClick={handleLogin} loading={loading} className="mt-2">
          {loading ? "Logging in..." : "Log In"}
        </AuthPrimaryButton>
      }
      footer={
        <div className="flex justify-center gap-1 text-sm">
          <span className="text-[#717171]">Don&apos;t have an account?</span>
          <button
            type="button"
            onClick={onNavigateSignup}
            className="font-medium text-[#FF5A5F] hover:underline"
          >
            Sign Up
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <AuthFormField
          label="Email Address"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          leftIcon={<Mail className="h-5 w-5 text-[#717171]" />}
        />

        <AuthFormField
          label="Password"
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          leftIcon={<Lock className="h-5 w-5 text-[#717171]" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="p-1 text-[#717171]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
        />

        <button
          type="button"
          className="ml-auto block text-sm font-medium text-[#FF5A5F] hover:underline"
          onClick={() => toast.message("Password reset flow is on the way.")}
        >
          Forgot Password?
        </button>
      </div>
    </AuthLayout>
  )
}
