"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import { toast } from "sonner"
import { AuthLayout } from "./auth/auth-layout"
import { AuthFormField } from "./auth/auth-form-field"
import { AuthPrimaryButton } from "./auth/auth-primary-button"
import { AuthOutlineButton } from "./auth/auth-outline-button"
import { requestPasswordReset } from "@/lib/password-reset"

interface ResetPasswordScreenProps {
  onBack: () => void
  initialEmail?: string
}

export function ResetPasswordScreen({ onBack, initialEmail = "" }: ResetPasswordScreenProps) {
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    const { error } = await requestPasswordReset(email)
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setSent(true)
    toast.success("Check your email for a reset link")
  }

  return (
    <AuthLayout
      title={sent ? "Check Your Email" : "Reset Password"}
      subtitle={
        sent
          ? "If an account exists for that email, we've sent a link to reset your password."
          : "Enter your email and we'll send you a link to reset your password."
      }
      cardFooter={
        sent ? (
          <AuthPrimaryButton onClick={onBack} className="mt-2">
            Back to Log In
          </AuthPrimaryButton>
        ) : (
          <div className="mt-2 flex gap-3">
            <AuthOutlineButton soft onClick={onBack} className="flex-1">
              Back
            </AuthOutlineButton>
            <AuthPrimaryButton onClick={handleSubmit} loading={loading} className="flex-1">
              {loading ? "Sending..." : "Send Reset Link"}
            </AuthPrimaryButton>
          </div>
        )
      }
    >
      {!sent && (
        <AuthFormField
          label="Email Address"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          leftIcon={<Mail className="h-5 w-5 text-[#717171]" />}
        />
      )}
    </AuthLayout>
  )
}
