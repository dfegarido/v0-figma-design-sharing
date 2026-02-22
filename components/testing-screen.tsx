"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, RotateCcw, ShieldCheck, Lock, Target, Users, Home, MessageCircle, Bell, Sparkles, ToggleLeft, ToggleRight, Crown } from "lucide-react"
import { motion } from "framer-motion"

interface TestingScreenProps {
  onBack: () => void
  onNavigate: (screen: string) => void
  verificationStatus: string
  chatUnlocked: boolean
  onResetVerification: () => void
  onResetChat: () => void
  onResetAll: () => void
  onSetVerification: (status: string) => void
  onSetChatUnlocked: (unlocked: boolean) => void
  onSetPremiumPlan?: (plan: "monthly" | "yearly" | null) => void
}

interface TestItem {
  icon: typeof Play
  label: string
  description: string
  screen: string
  color: string
}

const testItems: TestItem[] = [
  {
    icon: Play,
    label: "Simulate Onboarding",
    description: "Run through the full 8-step onboarding flow",
    screen: "onboarding",
    color: "text-primary",
  },
  {
    icon: ShieldCheck,
    label: "Ownership Verification",
    description: "Test the document upload and verification flow",
    screen: "verification",
    color: "text-emerald-500",
  },
  {
    icon: Lock,
    label: "Unlock Chat / Paywall",
    description: "Test the premium paywall and chat unlock flow",
    screen: "unlock",
    color: "text-amber-500",
  },
  {
    icon: Target,
    label: "Buyer Criteria",
    description: "Set and edit your ideal property preferences",
    screen: "criteria",
    color: "text-blue-500",
  },
  {
    icon: MessageCircle,
    label: "Chat with Rep Request",
    description: "Open a chat and test the representative request",
    screen: "test-chat",
    color: "text-violet-500",
  },
  {
    icon: Home,
    label: "Add Listing (4-step)",
    description: "Test the updated property listing form",
    screen: "add",
    color: "text-rose-500",
  },
  {
    icon: Bell,
    label: "Notifications",
    description: "View all notification types including new ones",
    screen: "notifications",
    color: "text-orange-500",
  },
  {
    icon: Sparkles,
    label: "Premium Screen",
    description: "View the Switch Premium upgrade screen",
    screen: "premium",
    color: "text-yellow-500",
  },
]

export function TestingScreen({
  onBack,
  onNavigate,
  verificationStatus,
  chatUnlocked,
  onResetVerification,
  onResetChat,
  onResetAll,
  onSetVerification,
  onSetChatUnlocked,
  onSetPremiumPlan,
}: TestingScreenProps) {
  const isPremium = verificationStatus === "verified" && chatUnlocked
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Testing</h1>
          <p className="text-xs text-muted-foreground">Simulate and test all app flows</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
        {/* Premium toggle */}
        <button
          onClick={() => {
            if (isPremium) {
              onSetVerification("unverified")
              onSetChatUnlocked(false)
              onSetPremiumPlan?.(null)
            } else {
              onSetVerification("verified")
              onSetChatUnlocked(true)
              onSetPremiumPlan?.("monthly")
            }
          }}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            isPremium
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/50"
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isPremium ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}>
            <Crown className="h-6 w-6" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">
              {isPremium ? "Premium Active" : "Enable Premium"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPremium ? "Verified + Chat Unlocked" : "Sets verified & unlocks chat in one tap"}
            </p>
          </div>
          {isPremium ? (
            <ToggleRight className="h-8 w-8 text-primary flex-shrink-0" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {/* Individual state toggles */}
        <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Individual Toggles</h3>

          <button
            onClick={() =>
              onSetVerification(verificationStatus === "verified" ? "unverified" : "verified")
            }
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className={`h-4 w-4 ${verificationStatus === "verified" ? "text-emerald-500" : "text-muted-foreground"}`} />
              <span className="text-sm text-foreground">Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${
                verificationStatus === "verified" ? "text-emerald-500" :
                verificationStatus === "pending" ? "text-amber-500" :
                "text-muted-foreground"
              }`}>
                {verificationStatus}
              </span>
              {verificationStatus === "verified" ? (
                <ToggleRight className="h-6 w-6 text-emerald-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </button>

          <div className="border-t border-border" />

          <button
            onClick={() => onSetChatUnlocked(!chatUnlocked)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-3">
              <Lock className={`h-4 w-4 ${chatUnlocked ? "text-emerald-500" : "text-muted-foreground"}`} />
              <span className="text-sm text-foreground">Chat Unlocked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${chatUnlocked ? "text-emerald-500" : "text-muted-foreground"}`}>
                {chatUnlocked ? "Yes" : "No"}
              </span>
              {chatUnlocked ? (
                <ToggleRight className="h-6 w-6 text-emerald-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </button>

          <div className="border-t border-border" />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <MessageCircle className={`h-4 w-4 ${isPremium ? "text-emerald-500" : "text-muted-foreground"}`} />
              <span className="text-sm text-foreground">Can Chat</span>
            </div>
            <span className={`text-xs font-medium ${isPremium ? "text-emerald-500" : "text-muted-foreground"}`}>
              {isPremium ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Reset buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Reset State</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-transparent"
              onClick={onResetVerification}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Verification
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-transparent"
              onClick={onResetChat}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Chat Lock
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-transparent text-destructive border-destructive/30"
              onClick={onResetAll}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Everything
            </Button>
          </div>
        </div>

        {/* Test flows */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Test Flows</h3>
          <div className="space-y-2">
            {testItems.map((item, index) => (
              <motion.button
                key={item.screen}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onNavigate(item.screen)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border hover:bg-secondary/50 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
