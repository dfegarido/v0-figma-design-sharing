"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  Check,
  Zap,
  Crown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { VerificationStatus } from "./verification-screen"

interface UnlockChatScreenProps {
  onBack: () => void
  verificationStatus: VerificationStatus
  chatUnlocked: boolean
  onNavigateVerification: () => void
  onUnlockChat: () => void
}

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    period: "month",
    features: [
      "Unlock messaging with matches",
      "See who liked your property",
      "5 super likes per month",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    period: "month",
    features: [
      "Everything in Basic",
      "Unlimited super likes",
      "Priority in swipe feed",
      "Request a representative",
      "Advanced match analytics",
    ],
    popular: true,
  },
  {
    id: "one-time",
    name: "Single Unlock",
    price: 4.99,
    period: "one-time",
    features: [
      "Unlock messaging for 1 match",
      "Valid for 30 days",
    ],
    popular: false,
  },
]

export function UnlockChatScreen({
  onBack,
  verificationStatus,
  chatUnlocked,
  onNavigateVerification,
  onUnlockChat,
}: UnlockChatScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const isVerified = verificationStatus === "verified"

  const handlePurchase = async () => {
    setProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setProcessing(false)
    setSuccess(true)
    setTimeout(() => {
      onUnlockChat()
      onBack()
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">Unlock Communication</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Success State */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 flex items-center justify-center bg-card z-50"
              style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto" }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <Unlock className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Communication Unlocked!</h2>
                <p className="text-muted-foreground">You can now message your matches.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requirements Checklist */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="font-semibold text-foreground">Requirements</h3>

          {/* Verification */}
          <button
            onClick={() => !isVerified && onNavigateVerification()}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              isVerified ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-destructive flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">Verify Property Ownership</p>
              <p className="text-sm text-muted-foreground">
                {isVerified ? "Ownership verified" : "Required before you can communicate"}
              </p>
            </div>
            {isVerified ? (
              <Check className="h-5 w-5 text-primary" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
            )}
          </button>

          {/* Chat Unlock */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
            chatUnlocked ? "border-primary bg-primary/5" : "border-border"
          }`}>
            {chatUnlocked ? (
              <Unlock className="h-6 w-6 text-primary flex-shrink-0" />
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">Unlock Communication</p>
              <p className="text-sm text-muted-foreground">
                {chatUnlocked ? "Communication unlocked" : "Choose a plan below"}
              </p>
            </div>
            {chatUnlocked && <Check className="h-5 w-5 text-primary" />}
          </div>
        </motion.div>

        {/* Pricing Plans */}
        {!chatUnlocked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
            <h3 className="font-semibold text-foreground">Choose a Plan</h3>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 right-3 bg-primary text-primary-foreground text-xs">
                    Most Popular
                  </Badge>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {plan.popular ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Zap className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-foreground">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-xs text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                <div className="space-y-1.5 mt-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Purchase Button */}
      {!chatUnlocked && (
        <div className="flex-shrink-0 p-4 border-t border-border">
          <Button
            onClick={handlePurchase}
            disabled={!isVerified || processing}
            className="w-full rounded-xl h-12 text-base font-medium"
          >
            {processing ? (
              "Processing..."
            ) : !isVerified ? (
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Verify First to Unlock
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Unlock for ${plans.find((p) => p.id === selectedPlan)?.price}
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
