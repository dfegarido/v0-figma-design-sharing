"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Star, Zap, Eye, Undo2, Heart, Crown, Check } from "lucide-react"
import { motion } from "framer-motion"

interface PremiumScreenProps {
  onBack: () => void
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
  { id: "monthly", name: "Monthly", price: 29.99, period: "month", popular: false },
  { id: "yearly", name: "Yearly", price: 199.99, period: "year", popular: true, savings: "Save 44%" },
]

export function PremiumScreen({ onBack }: PremiumScreenProps) {
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
              className={`w-full p-4 rounded-2xl border-2 text-left relative ${
                plan.popular 
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
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">${plan.price}</p>
                  <p className="text-sm text-muted-foreground">per {plan.period}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-6">
        <Button className="w-full h-14 rounded-2xl text-lg font-semibold">
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
