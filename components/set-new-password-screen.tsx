"use client"

import { useEffect, useState } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { AuthLayout } from "./auth/auth-layout"
import { AuthFormField } from "./auth/auth-form-field"
import { AuthPrimaryButton } from "./auth/auth-primary-button"
import { supabase } from "@/lib/supabase"
import { establishRecoverySession, updatePassword } from "@/lib/password-reset"

type ScreenState = "checking" | "ready" | "invalid"

export function SetNewPasswordScreen() {
  const [screenState, setScreenState] = useState<ScreenState>("checking")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    establishRecoverySession().then(({ ok, error }) => {
      if (cancelled) return
      if (ok) {
        setScreenState("ready")
        return
      }
      if (error) console.warn("[password-reset]", error)
      setScreenState("invalid")
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Please enter and confirm your new password")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    await supabase.auth.signOut()
    toast.success("Password updated. You can log in with your new password.")
    window.location.href = "/"
  }

  if (screenState === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FFF8F6] to-[#FFEFEB]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF5A5F] border-t-transparent" />
      </div>
    )
  }

  if (screenState === "invalid") {
    return (
      <AuthLayout
        title="Link Expired"
        subtitle="This reset link is invalid or has expired. Request a new one from the login screen, then open the latest email."
        cardFooter={
          <AuthPrimaryButton onClick={() => (window.location.href = "/")} className="mt-2">
            Back to Log In
          </AuthPrimaryButton>
        }
      />
    )
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Choose a new password for your account."
      cardFooter={
        <AuthPrimaryButton onClick={handleSubmit} loading={loading} className="mt-2">
          {loading ? "Updating..." : "Update Password"}
        </AuthPrimaryButton>
      }
    >
      <div className="space-y-6">
        <AuthFormField
          label="New Password"
          placeholder="Enter your new password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
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

        <AuthFormField
          label="Confirm Password"
          placeholder="Confirm your new password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          leftIcon={<Lock className="h-5 w-5 text-[#717171]" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="p-1 text-[#717171]"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
        />
      </div>
    </AuthLayout>
  )
}
