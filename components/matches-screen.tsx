"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  RotateCcw,
  MessageCircle,
  Lock,
  Crown,
  MapPin,
  Bed,
  Bath,
  Square,
  Shield,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { getCache, setCache } from "@/lib/cache"
import { fetchMatches, getOrCreateConversation, type MatchWithDetails, formatPrice } from "@/lib/matches"
import { isSubscriptionActive } from "@/lib/subscription"
import { MatchCardSkeleton } from "@/components/ui/match-card-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type MatchStatus = "new" | "locked" | "verification_used" | "messaged"

const FADE_DURATION = 0.22
const CACHE_KEY = "matches_screen"

interface MatchListItem extends MatchWithDetails {
  status: MatchStatus
  otherFirstName: string
  otherAvatar: string
  otherImage: string
  imageCount: number
}

interface MatchesScreenProps {
  onBack: () => void
  onOpenChat: (chatId: string) => void
  onOpenVerification?: (propertyId?: string) => void
  onOpenPremium?: () => void
}

const statusPill: Record<
  MatchStatus,
  { label: string; icon: typeof Shield; colorClass: string; bgClass: string }
> = {
  new: {
    label: "New",
    icon: CheckCircle2,
    colorClass: "text-green-500",
    bgClass: "bg-green-500/15",
  },
  locked: {
    label: "Free Verification",
    icon: Shield,
    colorClass: "text-violet-400",
    bgClass: "bg-violet-500/15",
  },
  verification_used: {
    label: "Premium Required",
    icon: Crown,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/15",
  },
  messaged: {
    label: "Messaged",
    icon: MessageCircle,
    colorClass: "text-primary",
    bgClass: "bg-primary/15",
  },
}

function firstName(fullName: string | null | undefined): string {
  if (!fullName) return "Unknown"
  return fullName.split(" ")[0] || "Unknown"
}

function firstImageUrl(
  images: { url: string; sort_order: number }[] | null | undefined
): string {
  if (!images || images.length === 0) return "/placeholder.svg"
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0].url
}

export function MatchesScreen({
  onBack,
  onOpenChat,
  onOpenVerification,
  onOpenPremium,
}: MatchesScreenProps) {
  const [items, setItems] = useState<MatchListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const mapMatches = useCallback((data: MatchWithDetails[], premium: boolean): MatchListItem[] => {
    return data.map((match) => {
      const otherUser = match.other_user
      const otherProperty = match.other_property
      const myProperty = match.my_property
      const otherName = firstName(otherUser?.full_name)
      const images = otherProperty?.property_images || []
      const imageCount = images.length

      const locked = !myProperty?.verified && !premium
      let status: MatchStatus = "new"
      if (locked && !premium) status = "locked"
      else if (locked && premium) status = "verification_used"
      else if (match.conversation_id) status = "messaged"

      return {
        ...match,
        status,
        otherFirstName: otherName,
        otherAvatar: otherUser?.avatar_url || "/placeholder.svg",
        otherImage: firstImageUrl(images),
        imageCount,
      }
    })
  }, [])

  const fetchList = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)

    const activeRef = { current: true }
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        activeRef.current = false
        reject(new Error("Request timed out. Please try again."))
      }, 10000)
    })

    const runFetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!activeRef.current) return
      if (!user) {
        if (!silent) setLoading(false)
        return
      }

      const userId = user.id
      setUserId(userId)

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_plan, is_premium, premium_expires_at, subscription_status")
        .eq("id", user.id)
        .single()

      if (!activeRef.current) return

      const premium = profile
        ? isSubscriptionActive({
            is_premium: Boolean(profile.is_premium),
            premium_expires_at: (profile.premium_expires_at as string | null) || null,
            subscription_status: (profile.subscription_status as string) || "free",
          })
        : false
      setIsPremium(premium)

      const matches = await fetchMatches(user.id)
      if (!activeRef.current) return

      const mapped = mapMatches(matches, premium)
      setItems(mapped)
      setCache(CACHE_KEY, { items: mapped, userId: user.id, isPremium: premium })
    }

    try {
      await Promise.race([runFetch(), timeoutPromise])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load matches."
      console.error("Failed to load matches:", err)
      setError(message)
    } finally {
      if (!silent) setLoading(false)
      setRefreshing(false)
    }
  }, [mapMatches])

  const loadCached = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const userId = user?.id
      const cached = getCache<{ items: MatchListItem[]; userId: string; isPremium: boolean }>(CACHE_KEY)
      if (cached && cached.userId === userId) {
        setItems(cached.items)
        setIsPremium(cached.isPremium)
        setLoading(false)
        return true
      }
    } catch {
      // ignore cache errors
    }
    return false
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const hadCache = await loadCached()
      if (cancelled) return
      await fetchList(hadCache)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [fetchList, loadCached])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    void fetchList(true)
  }, [fetchList])

  const showRetry = !!error && items.length === 0
  const showSkeleton = loading && items.length === 0

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">My Matches</h2>
              <p className="text-sm text-muted-foreground">Properties you matched with</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
            className={`rounded-xl ${refreshing ? "opacity-60" : ""}`}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {showRetry ? (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Couldn&apos;t load matches</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">{error}</p>
          <Button onClick={() => fetchList()} className="rounded-xl">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          {showSkeleton && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <MatchCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No matches yet.{"\n"}We&apos;ll notify you when someone matches with your property.
              </p>
            </div>
          )}

          {items.map((match, index) => {
            const pill = statusPill[match.status]
            const PillIcon = pill.icon

            const cta =
              match.status === "new" || match.status === "messaged"
                ? { variant: "default" as const, label: "Message", icon: MessageCircle }
                : match.status === "locked"
                ? { variant: "secondary" as const, label: "Verify to Message", icon: Lock }
                : { variant: "outline" as const, label: "Upgrade to Premium", icon: Crown }

            const handlePress = async () => {
              if (match.status === "locked") {
                if (isPremium) {
                  onOpenVerification?.(match.my_property_id)
                } else {
                  onOpenPremium?.()
                }
              } else if (match.status === "verification_used") {
                onOpenPremium?.()
              } else if (match.conversation_id) {
                onOpenChat(match.conversation_id)
              } else if (userId) {
                try {
                  const chatId = await getOrCreateConversation(match.id, userId)
                  // Optimistically update this card so subsequent taps go straight to chat.
                  setItems((prev) =>
                    prev.map((m) =>
                      m.id === match.id
                        ? { ...m, conversation_id: chatId, status: "messaged" }
                        : m
                    )
                  )
                  onOpenChat(chatId)
                } catch (err) {
                  console.error("Failed to create conversation:", err)
                  toast.error("Failed to open chat. Please try again.")
                }
              } else {
                toast.error("No conversation available yet.")
              }
            }

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: FADE_DURATION }}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={match.otherAvatar} alt={match.otherFirstName} />
                      <AvatarFallback>{match.otherFirstName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{match.otherFirstName}</p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{match.other_property?.suburb || "Unknown suburb"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mb-3" />

                {/* Property thumbnail + details */}
                <div className="flex gap-3 mb-3">
                  <div className="relative h-[72px] w-[72px] rounded-lg overflow-hidden shrink-0 bg-muted">
                    <Image
                      src={match.otherImage}
                      alt={match.other_property?.address || "Property"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5" />
                        {match.other_property?.bedrooms ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" />
                        {match.other_property?.bathrooms ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Square className="h-3.5 w-3.5" />
                        {match.other_property?.sqm ?? 0} sqm
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(match.other_property?.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <p className="text-xl font-bold text-foreground mb-3">
                  {formatPrice(match.other_property?.price || 0)}
                </p>

                {/* Status pill */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full mb-3 ${pill.bgClass}`}
                >
                  <PillIcon className={`h-3 w-3 ${pill.colorClass}`} />
                  <span className={`text-xs font-medium ${pill.colorClass}`}>{pill.label}</span>
                </div>

                {/* CTA */}
                <Button
                  variant={cta.variant}
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={handlePress}
                >
                  <cta.icon className="h-4 w-4 mr-2" />
                  {cta.label}
                </Button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
