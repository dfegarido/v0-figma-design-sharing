"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { SwipeCard, type SwipeCardHandle, type SwipeDirection } from "./swipe-card"
import { PropertyCard, type Property } from "./property-card"
import { SwipeActions } from "./swipe-actions"
import { MatchModal } from "./match-modal"
import { FilterSheet, type FilterValues, defaultFilters } from "./filter-sheet"
import { Home, RefreshCw, HelpCircle, Crown, SlidersHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import type { BuyerCriteria } from "./buyer-criteria-screen"
import {
  fetchDiscoverProperties,
  deleteSwipe,
  mapDbPropertyToUi,
  type Property as DbProperty,
} from "@/lib/properties"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { findConversationForProperty } from "@/lib/matches"

const DISCOVER_BATCH_SIZE = 16
const REFETCH_COOLDOWN_MS = 5_000

function calculateMatchScore(property: Property, criteria: BuyerCriteria): number {
  let score = 0
  let totalWeight = 0

  totalWeight += 25
  if (property.price >= criteria.minPrice && property.price <= criteria.maxPrice) {
    score += 25
  } else {
    const midBudget = (criteria.minPrice + criteria.maxPrice) / 2
    const priceDiff = Math.abs(property.price - midBudget) / midBudget
    score += Math.max(0, 25 * (1 - priceDiff))
  }

  totalWeight += 20
  if (criteria.suburbs.length === 0) {
    score += 20
  } else if (
    criteria.suburbs.some((s) => property.suburb.toLowerCase().includes(s.toLowerCase()))
  ) {
    score += 20
  }

  totalWeight += 15
  if (criteria.minBeds === 0 || property.bedrooms >= criteria.minBeds) {
    score += 15
  } else if (property.bedrooms === criteria.minBeds - 1) {
    score += 8
  }

  totalWeight += 10
  if (criteria.minBaths === 0 || property.bathrooms >= criteria.minBaths) {
    score += 10
  }

  totalWeight += 5
  if (criteria.minParking === 0 || property.parking >= criteria.minParking) {
    score += 5
  }

  totalWeight += 10
  if (criteria.propertyTypes.length === 0) {
    score += 10
  } else if (
    property.propertyType && criteria.propertyTypes.includes(property.propertyType)
  ) {
    score += 10
  }

  totalWeight += 5
  const land = property.landSize || 0
  if (land >= criteria.minLandSize && land <= criteria.maxLandSize) {
    score += 5
  }

  totalWeight += 5
  const sqm = property.sqm || 0
  if (criteria.minSqm === 0 || sqm >= criteria.minSqm) {
    score += 5
  }

  totalWeight += 10
  if (criteria.features.length === 0) {
    score += 10
  } else {
    const overlap = (property.tags || []).filter((t) => criteria.features.includes(t)).length
    score += Math.round((overlap / criteria.features.length) * 10)
  }

  return Math.round((score / totalWeight) * 100)
}

function propertyMatchesFilters(property: Property, filters: FilterValues): boolean {
  if (
    filters.suburb &&
    !property.suburb.toLowerCase().includes(filters.suburb.toLowerCase()) &&
    !property.location.toLowerCase().includes(filters.suburb.toLowerCase())
  )
    return false
  if (property.price < filters.minPrice || property.price > filters.maxPrice) return false
  if (filters.minBeds > 0 && property.bedrooms < filters.minBeds) return false
  if (filters.minBaths > 0 && property.bathrooms < filters.minBaths) return false
  if (filters.minParking > 0 && property.parking < filters.minParking) return false
  if (
    filters.propertyTypes.length > 0 &&
    property.propertyType &&
    !filters.propertyTypes.includes(property.propertyType)
  )
    return false
  const land = property.landSize ?? 0
  if (land < filters.minLandSize || land > filters.maxLandSize) return false
  return true
}

function applyScoresAndSort(properties: Property[], criteria: BuyerCriteria | null | undefined): Property[] {
  if (!criteria) return properties
  return properties
    .map((p) => ({ ...p, matchScore: calculateMatchScore(p, criteria) }))
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
}

function mapToUi(db: DbProperty): Property {
  return {
    ...mapDbPropertyToUi(db),
    landSize: db.land_size,
  }
}

interface SwipeFeedProps {
  onNavigate?: (screen: string, chatId?: string) => void
  buyerCriteria?: BuyerCriteria | null
  canChat?: boolean
  onNavigateUnlock?: () => void
  isPremium?: boolean
}

export function SwipeFeed({
  onNavigate,
  buyerCriteria,
  canChat = true,
  onNavigateUnlock,
  isPremium = false,
}: SwipeFeedProps) {
  const [displayProperties, setDisplayProperties] = useState<Property[]>([])
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRemoved, setLastRemoved] = useState<Property | null>(null)
  const [showMatch, setShowMatch] = useState(false)
  const [matchChatId, setMatchChatId] = useState<string | null>(null)
  const [matchedProperty, setMatchedProperty] = useState<Property | null>(null)
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  const allPropertiesRef = useRef<Property[]>([])
  const filtersRef = useRef<FilterValues>(filters)
  const activeCardAnimateRef = useRef<SwipeCardHandle>(null)
  const lastFetchAtRef = useRef<number>(0)
  const isSwiping = useRef(false)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    const initFilters = buyerCriteria
      ? {
          suburb: buyerCriteria.suburbs.join(", ") || "",
          minPrice: buyerCriteria.minPrice,
          maxPrice: buyerCriteria.maxPrice,
          minBeds: buyerCriteria.minBeds,
          minBaths: buyerCriteria.minBaths,
          minParking: buyerCriteria.minParking,
          minLandSize: buyerCriteria.minLandSize,
          maxLandSize: buyerCriteria.maxLandSize,
          propertyTypes: buyerCriteria.propertyTypes,
        }
      : defaultFilters
    setFilters(initFilters)
    filtersRef.current = initFilters
  }, [buyerCriteria])

  const loadProperties = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    setUserId(user.id)

    setLoading(true)
    try {
      const data = await fetchDiscoverProperties(user.id, DISCOVER_BATCH_SIZE)
      const mapped = applyScoresAndSort(data.map(mapToUi), buyerCriteria)
      allPropertiesRef.current = mapped
      setAllProperties(mapped)
      setDisplayProperties(mapped.filter((p) => propertyMatchesFilters(p, filtersRef.current)))
      lastFetchAtRef.current = Date.now()
    } catch (error) {
      console.error("Failed to load discover properties:", error)
      toast.error("Failed to load properties.")
    } finally {
      setLoading(false)
    }
  }, [buyerCriteria])

  useEffect(() => {
    void loadProperties()
  }, [loadProperties])

  useEffect(() => {
    const onFocus = () => {
      const now = Date.now()
      if (now - lastFetchAtRef.current > REFETCH_COOLDOWN_MS) {
        lastFetchAtRef.current = now
        void loadProperties()
      }
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [loadProperties])

  useEffect(() => {
    setDisplayProperties(
      applyScoresAndSort(
        allPropertiesRef.current.filter((p) => propertyMatchesFilters(p, filters)),
        buyerCriteria
      )
    )
  }, [filters, buyerCriteria])

  const recordSwipe = useCallback(
    async (propertyId: string, direction: "left" | "right" | "up") => {
      if (!userId) return { success: false, error: "Not signed in" }
      try {
        const { error } = await supabase.from("swipes").upsert(
          {
            swiper_id: userId,
            swiped_property_id: propertyId,
            direction,
          },
          { onConflict: "swiper_id, swiped_property_id" }
        )
        if (error) throw error
        return { success: true }
      } catch (error: any) {
        console.warn("Failed to record swipe:", error)
        return { success: false, error: error?.message || "Failed to save swipe" }
      }
    },
    [userId]
  )

  const handleSwipe = useCallback(
    async (direction: "left" | "right" | "up") => {
      const p = displayProperties[0]
      if (!p || isSwiping.current) return
      isSwiping.current = true

      setDisplayProperties((prev) => prev.filter((prop) => prop.id !== p.id))
      allPropertiesRef.current = allPropertiesRef.current.filter((prop) => prop.id !== p.id)
      setAllProperties(allPropertiesRef.current)

      const result = await recordSwipe(p.id, direction)

      if (result.success) {
        setLastRemoved(p)
        if (direction === "right" || direction === "up") {
          const convoId = await findConversationForProperty(userId || "", p.id)
          if (convoId) {
            setMatchChatId(convoId)
            setMatchedProperty(p)
            setShowMatch(true)
          }
        }
      } else {
        setDisplayProperties((prev) => [p, ...prev])
        allPropertiesRef.current = [p, ...allPropertiesRef.current]
        setAllProperties(allPropertiesRef.current)
        toast.error(direction === "left" ? "Couldn't save pass" : "Couldn't save like")
      }

      setTimeout(() => {
        isSwiping.current = false
      }, 300)
    },
    [displayProperties, userId, recordSwipe]
  )

  const handleUndo = useCallback(async () => {
    if (!lastRemoved || !userId) return
    try {
      await deleteSwipe(userId, lastRemoved.id)
      setDisplayProperties((prev) => [lastRemoved, ...prev])
      allPropertiesRef.current = [lastRemoved, ...allPropertiesRef.current]
      setAllProperties(allPropertiesRef.current)
      setLastRemoved(null)
    } catch (error) {
      console.error("Failed to undo swipe:", error)
      toast.error("Failed to undo swipe.")
    }
  }, [lastRemoved, userId])

  const handleOpenFilter = useCallback(() => {
    if (isPremium) {
      // The FilterSheet owns its own open state; we render it below.
    } else {
      setShowPremiumUpsell(true)
    }
  }, [isPremium])

  const handleCloseMatch = useCallback(() => {
    setShowMatch(false)
    setMatchChatId(null)
    setMatchedProperty(null)
  }, [])

  const handleStartChat = useCallback(() => {
    if (matchChatId) {
      onNavigate?.("chat", matchChatId)
    }
    handleCloseMatch()
  }, [matchChatId, onNavigate, handleCloseMatch])

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const hasActiveFilters =
    filters.suburb.trim() !== "" ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000000 ||
    filters.minBeds > 0 ||
    filters.minBaths > 0 ||
    filters.minParking > 0 ||
    filters.minLandSize > 0 ||
    filters.maxLandSize < 2000 ||
    filters.propertyTypes.length > 0

  const topProperty = displayProperties[0]

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {displayProperties.length} {displayProperties.length === 1 ? "home" : "homes"} left
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
          {isPremium ? (
            <FilterSheet
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
              buyerCriteria={buyerCriteria}
            />
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-card border-border hover:bg-secondary"
              onClick={handleOpenFilter}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Cards stack */}
      <div className="flex-1 min-h-0 relative px-4">
        {loading ? (
          <DiscoverSkeleton />
        ) : displayProperties.length > 0 ? (
          <div className="relative h-full w-full">
            <AnimatePresence mode="popLayout">
              {displayProperties
                .slice(0, 2)
                .reverse()
                .map((property, index, arr) => (
                  <SwipeCard
                    key={property.id}
                    ref={index === arr.length - 1 ? activeCardAnimateRef : undefined}
                    index={arr.length - 1 - index}
                    onSwipeLeft={() => handleSwipe("left")}
                    onSwipeRight={() => handleSwipe("right")}
                    onSwipeUp={() => handleSwipe("up")}
                  >
                    <PropertyCard
                      property={{
                        ...property,
                        matchScore:
                          buyerCriteria && property.matchScore != null
                            ? property.matchScore
                            : undefined,
                      }}
                    />
                  </SwipeCard>
                ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Home className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? "No matches found" : "Come back later"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? "Try updating your buyer preferences or filters to match more properties."
                : "No more properties to swipe right now. New homes are added daily — check back soon."}
            </p>
            <Button onClick={loadProperties} className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {displayProperties.length > 0 && !loading && (
        <div className="flex-shrink-0 px-4 pb-4">
          <SwipeActions
            onNope={() => activeCardAnimateRef.current?.swipe("left")}
            onLike={() => activeCardAnimateRef.current?.swipe("right")}
            onSuperLike={() => activeCardAnimateRef.current?.swipe("up")}
            onUndo={handleUndo}
            canUndo={!!lastRemoved}
          />
        </div>
      )}

      {topProperty && (
        <MatchModal
          isOpen={showMatch}
          onClose={handleCloseMatch}
          onMessage={canChat ? handleStartChat : undefined}
          onUnlock={canChat ? undefined : onNavigateUnlock}
          canChat={canChat}
          yourProperty={topProperty}
          matchedProperty={matchedProperty}
        />
      )}

      {/* Help dialog */}
      <AnimatePresence>
        {helpOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full space-y-4">
              <h3 className="text-lg font-semibold">How Discover works</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li>Swipe right to like a property.</li>
                <li>Swipe left to pass.</li>
                <li>Swipe up to super like.</li>
                <li>Use filters to narrow matches (premium).</li>
                <li>If both owners like each other, it's a match!</li>
              </ul>
              <Button className="w-full rounded-xl" onClick={() => setHelpOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium upsell dialog */}
      <AnimatePresence>
        {showPremiumUpsell && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Crown className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Filters are a Premium feature</h3>
              <p className="text-sm text-muted-foreground">
                Upgrade to premium to unlock advanced filters and find your perfect swap faster.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowPremiumUpsell(false)}>
                  Not now
                </Button>
                <Button className="flex-1 rounded-xl" onClick={() => {
                  setShowPremiumUpsell(false)
                  onNavigateUnlock?.()
                }}>
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DiscoverSkeleton() {
  return (
    <div className="relative h-full w-full rounded-3xl bg-muted/30 shadow-xl overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-[58%] w-full">
        <Skeleton className="absolute inset-0 rounded-none bg-muted" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Skeleton className="h-6 w-20 rounded-md bg-muted-foreground/20" />
          <Skeleton className="h-6 w-16 rounded-md bg-muted-foreground/20" />
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          <Skeleton className="h-1.5 w-6 rounded-full bg-muted-foreground/30" />
          <Skeleton className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
          <Skeleton className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded bg-muted-foreground/20" />
          <Skeleton className="h-5 w-32 rounded bg-muted-foreground/20" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl bg-muted-foreground/20" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full bg-muted-foreground/20" />
          <Skeleton className="h-5 w-20 rounded-full bg-muted-foreground/20" />
          <Skeleton className="h-5 w-16 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-9 w-9 rounded-full bg-muted-foreground/20" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-20 rounded bg-muted-foreground/20" />
            <Skeleton className="h-3 w-24 rounded bg-muted-foreground/20" />
          </div>
          <Skeleton className="h-4 w-4 rounded bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  )
}
