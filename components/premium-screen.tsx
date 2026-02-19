"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Star, Zap, Eye, Undo2, Heart, Crown, Check, CalendarDays, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type PremiumPlan = "monthly" | "yearly" | null

interface PremiumScreenProps {
  onBack: () => void
  isPremium: boolean
  activePlan: PremiumPlan
  onSubscribe: (plan: PremiumPlan) => void
  onCancel: () => void
}

const features = [
  { icon: Eye, title: "See Who Likes You", description: "View all users who have liked your property" },
  { icon: Undo2, title: "Unlimited Rewinds", description: "Take back accidental swipes anytime" },
  { icon: Zap, title: "Priority Matching", description: "Get shown to more potential swappers" },
  { icon: Heart, title: "5 Super Likes Daily", description: "Stand out with special interest indicators" },
  { icon: Star, title: "Advanced Filters", description: "Filter by more specific criteria" },
  { icon: Crown, title: "Premium Badge", description: "Show others you are a serious swapper" },
]

const plans = [
  { id: "monthly" as const, name: "Monthly", price: 29.99, period: "month", popular: false },
  { id: "yearly" as const, name: "Yearly", price: 199.99, period: "year", popular: true, savings: "Save 44%" },
]

export function PremiumScreen({ onBack, isPremium, activePlan, onSubscribe, onCancel }: PremiumScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(activePlan === "yearly" ? "yearly" : "monthly")
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const currentPlanData = plans.find((p) => p.id === activePlan)
  const renewalDate = new Date()
  renewalDate.setMonth(renewalDate.getMonth() + (activePlan === "yearly" ? 12 : 1))

  if (isPremium) {
    return (
      <div className="h-full overflow-auto pb-6">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold text-foreground">Manage Subscription</h2>
          </div>
        </div>

        {/* Active plan badge */}
        <div className="px-4 py-8 text-center bg-gradient-to-b from-primary/10 to-transparent">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <Crown className="h-10 w-10 text-card" />
          </motion.div>
          <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm mb-3">
            Premium Active
          </Badge>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {currentPlanData?.name} Plan
          </h1>
          <p className="text-muted-foreground text-sm">
            ${currentPlanData?.price}/{currentPlanData?.period}
          </p>
        </div>

        {/* Account details */}
        <div className="px-4 py-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">SUBSCRIPTION DETAILS</h3>

          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Next renewal</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {renewalDate.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Current plan</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {currentPlanData?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Switch plan */}
        <div className="px-4 py-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">CHANGE PLAN</h3>
          <div className="space-y-3">
            {plans.map((plan) => {
              const isActive = plan.id === activePlan
              return (
                <motion.button
                  key={plan.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isActive) {
                      setSelectedPlan(plan.id)
                      onSubscribe(plan.id)
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left relative transition-all ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {isActive && (
                    <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground text-[10px]">
                      CURRENT
                    </Badge>
                  )}
                  {!isActive && plan.popular && (
                    <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground text-[10px]">
                      BEST VALUE
                    </Badge>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{plan.name}</p>
                      {plan.savings && (
                        <p className="text-sm text-primary font-medium">{plan.savings}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">${plan.price}</p>
                        <p className="text-sm text-muted-foreground">per {plan.period}</p>
                      </div>
                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Features reminder */}
        <div className="px-4 py-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">YOUR PREMIUM FEATURES</h3>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border"
              >
                <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel */}
        <div className="px-4 py-6">
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 bg-transparent"
            onClick={() => setShowCancelConfirm(true)}
          >
            Cancel Subscription
          </Button>
        </div>

        {/* Cancel confirmation dialog */}
        <AnimatePresence>
          {showCancelConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[9998]"
                style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto" }}
                onClick={() => setShowCancelConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-card rounded-2xl p-6 shadow-2xl z-[9999]"
                style={{ maxWidth: "calc(32rem - 2rem)", marginLeft: "auto", marginRight: "auto" }}
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-7 w-7 text-destructive" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Cancel Subscription?</h3>
                  <p className="text-sm text-muted-foreground">
                    {"You'll lose access to all premium features at the end of your billing period. You can always resubscribe later."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl bg-transparent"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Keep Plan
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      setShowCancelConfirm(false)
                      onCancel()
                      onBack()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // --- Upgrade view (not premium) ---
  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Switch Premium</h2>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 py-8 text-center bg-gradient-to-b from-primary/10 to-transparent">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center shadow-lg"
        >
          <Crown className="h-10 w-10 text-card" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Upgrade to Premium</h1>
        <p className="text-muted-foreground">Unlock all features and find your perfect swap faster</p>
      </div>

      {/* Features */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">PREMIUM FEATURES</h3>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">CHOOSE YOUR PLAN</h3>
        <div className="space-y-3">
          {plans.map((plan) => (
            <motion.button
              key={plan.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full p-4 rounded-2xl border-2 text-left relative transition-all ${
                selectedPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                  BEST VALUE
                </Badge>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{plan.name}</p>
                  {plan.savings && (
                    <p className="text-sm text-primary font-medium">{plan.savings}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">${plan.price}</p>
                    <p className="text-sm text-muted-foreground">per {plan.period}</p>
                  </div>
                  {selectedPlan === plan.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-6">
        <Button
          className="w-full h-14 rounded-2xl text-lg font-semibold"
          onClick={() => onSubscribe(selectedPlan)}
        >
          <Crown className="h-5 w-5 mr-2" />
          Start Free Trial
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-3">
          7-day free trial, cancel anytime
        </p>
      </div>
    </div>
  )
}
