"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, X, Zap, Eye, Undo2, Heart, Crown, Check, ShieldCheck, SlidersHorizontal, TrendingUp, Handshake, Repeat } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePurchases } from "@/hooks/usePurchases"

export type PremiumPlan = "monthly" | "yearly" | null

interface PremiumScreenProps {
  onBack: () => void
}

const benefits = [
  { icon: Eye, title: "See Interested Homeowners", description: "See who has liked your property so you can connect directly, even if you haven't matched." },
  { icon: ShieldCheck, title: "Verified Homeowner", description: "Stand out as a verified homeowner who is actively looking to move." },
  { icon: SlidersHorizontal, title: "Advanced Search Filters", description: "Filter by location, budget, property type, block size and the features that matter most." },
  { icon: TrendingUp, title: "Priority Matching", description: "Get your property shown to more compatible homeowners." },
  { icon: Zap, title: "Move Ready Boost", description: "Show you're ready to move now and increase your visibility to motivated homeowners." },
  { icon: Handshake, title: "Serious Switch Signal", description: "Highlight that you're serious about switching homes." },
  { icon: Repeat, title: "Unlimited Changes", description: "Change your preferences and revisit properties anytime." },
]

function AppIcon({ size = 72 }: { size?: number }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ width: size, height: size }}>
      <Image src="/app-icon.png" alt="Switch My House" fill className="object-cover" />
    </div>
  )
}

export function PremiumScreen({ onBack }: PremiumScreenProps) {
  const {
    packages,
    selectedPackage,
    setSelectedPackage,
    customerInfo,
    isPro,
    isLoading,
    isPurchasing,
    purchase,
    presentRevenueCatPaywall,
  } = usePurchases()

  useEffect(() => {
    if (isPro) {
      const timer = setTimeout(() => onBack(), 1200)
      return () => clearTimeout(timer)
    }
  }, [isPro, onBack])

  if (isPro) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center">
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
      <p className="text-muted-foreground text-sm">Returning to your profile...</p>
    </div>
  )
  }

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">Switch My House Pro</h2>
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-4 flex items-center justify-center"
        >
          <AppIcon size={80} />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Switch My House Pro</h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Find your next home faster with tools designed for serious movers.
        </p>
      </div>

      {/* Benefits */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">PREMIUM FEATURES</h3>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`flex items-center gap-3 ${index !== benefits.length - 1 ? "pb-4 border-b border-border" : ""}`}
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{benefit.title}</p>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">CHOOSE A PLAN</h3>
        {packages.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">No plans available. Try again later.</p>
        )}
        <div className="space-y-3">
          {packages.map((pkg) => {
            const product = pkg.webBillingProduct
            const isSelected = selectedPackage?.identifier === pkg.identifier
            const isYearly =
              pkg.identifier.toLowerCase().includes("year") ||
              pkg.packageType === "$rc_annual"
            return (
              <motion.button
                key={pkg.identifier}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPackage(pkg)}
                className={`w-full p-4 rounded-2xl border-2 text-left relative transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {isYearly && (
                  <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground text-[10px]">
                    BEST VALUE
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{product.title ?? pkg.identifier}</p>
                      {isYearly && (
                        <span className="text-xs font-medium text-primary-foreground bg-primary px-2 py-0.5 rounded-md">
                          Best value
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-1">{product.currentPrice.formattedPrice}</p>
                    {product.description ? (
                      <p className="text-xs text-muted-foreground">{product.description}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">per {isYearly ? "year" : "month"}</p>
                    )}
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 sticky bottom-0 bg-card border-t border-border">
        <Button
          className="w-full h-14 rounded-2xl text-lg font-semibold"
          disabled={isPurchasing || packages.length === 0}
          onClick={presentRevenueCatPaywall}
        >
          <Crown className="h-5 w-5 mr-2" />
          {isPurchasing ? "Loading checkout..." : "Subscribe Now"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-3">Cancel anytime. Managed through RevenueCat.</p>
      </div>
    </div>
  )
}
