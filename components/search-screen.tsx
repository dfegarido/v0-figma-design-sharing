"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Heart,
  X,
  Crown,
  Home,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useUserData } from "@/context/user-data-context"
import { supabase } from "@/lib/supabase"
import {
  fetchSearchProperties,
  recordSwipe,
  deleteSwipe,
} from "@/lib/properties"
import { fetchLikedPropertyIds } from "@/lib/matches"
import type { Property } from "@/components/property-card"

const FEATURE_CHIPS = [
  "Pool",
  "Modern",
  "Ocean View",
  "Garden",
  "City Views",
  "Waterfront",
  "Renovated",
]

const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Townhouse",
  "Unit",
  "Land",
] as const
type PropertyType = (typeof PROPERTY_TYPES)[number]

interface FilterState {
  location: string
  minPrice: number
  maxPrice: number
  minBeds: number
  minBaths: number
  minParking: number
  propertyTypes: PropertyType[]
  minLandSize: number
  maxLandSize: number
  features: string[]
}

const defaultFilters: FilterState = {
  location: "",
  minPrice: 0,
  maxPrice: 5_000_000,
  minBeds: 0,
  minBaths: 0,
  minParking: 0,
  propertyTypes: [],
  minLandSize: 0,
  maxLandSize: 2000,
  features: [],
}

interface SearchScreenProps {
  onOpenPropertyDetail?: (property: Property) => void
}

function formatPrice(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${Math.round(value / 1_000)}K`
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  )
}

export function SearchScreen({ onOpenPropertyDetail }: SearchScreenProps) {
  const { isPremium } = useUserData()
  const [query, setQuery] = useState("")
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false)
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(defaultFilters)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const loadLikedIds = useCallback(async (uid: string) => {
    try {
      const ids = await fetchLikedPropertyIds(uid)
      setLiked(new Set(ids))
    } catch (error) {
      console.warn("Search: failed to load likes:", error)
    }
  }, [])

  const loadProperties = useCallback(async (uid: string) => {
    setLoading(true)
    try {
      const data = await fetchSearchProperties(uid)
      setProperties(data)
    } catch (error) {
      console.error("Failed to load search results:", error)
      toast.error("Failed to load properties.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAll = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    setUserId(user.id)
    await Promise.all([loadProperties(user.id), loadLikedIds(user.id)])
  }, [loadProperties, loadLikedIds])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const persistLike = async (propertyId: string, like: boolean) => {
    if (!userId) return
    try {
      if (like) {
        await recordSwipe(userId, propertyId, "right")
      } else {
        await deleteSwipe(userId, propertyId)
      }
    } catch (error) {
      console.warn("Search: failed to persist like:", error)
    }
  }

  const toggleLike = useCallback(
    (id: string) => {
      setLiked((prev) => {
        const next = new Set(prev)
        const isLiked = next.has(id)
        if (isLiked) {
          next.delete(id)
        } else {
          next.add(id)
        }
        persistLike(id, !isLiked)
        return next
      })
    },
    [userId]
  )

  const toggleChip = (chip: string) => {
    if (!isPremium) {
      setShowPremiumUpsell(true)
      return
    }
    setActiveChips((prev) => {
      const next = new Set(prev)
      if (next.has(chip)) next.delete(chip)
      else next.add(chip)
      return next
    })
  }

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const textMatch =
        p.location.toLowerCase().includes(query.toLowerCase()) ||
        p.suburb.toLowerCase().includes(query.toLowerCase()) ||
        (p.tags || []).some((t) =>
          t.toLowerCase().includes(query.toLowerCase())
        )
      const chipMatch =
        activeChips.size === 0 ||
        (p.tags || []).some((t) =>
          Array.from(activeChips).some(
            (c) => c.toLowerCase() === t.toLowerCase()
          )
        )
      const filterMatch =
        (appliedFilters.location === "" ||
          p.suburb
            .toLowerCase()
            .includes(appliedFilters.location.toLowerCase()) ||
          p.location
            .toLowerCase()
            .includes(appliedFilters.location.toLowerCase())) &&
        p.price >= appliedFilters.minPrice &&
        p.price <= appliedFilters.maxPrice &&
        (appliedFilters.minBeds === 0 ||
          (p.bedrooms || 0) >= appliedFilters.minBeds) &&
        (appliedFilters.minBaths === 0 ||
          (p.bathrooms || 0) >= appliedFilters.minBaths) &&
        (appliedFilters.minParking === 0 ||
          (p.parking || 0) >= appliedFilters.minParking) &&
        (appliedFilters.propertyTypes.length === 0 ||
          appliedFilters.propertyTypes.includes(
            p.propertyType as PropertyType
          )) &&
        (p.landSize ?? 0) >= appliedFilters.minLandSize &&
        (p.landSize ?? 0) <= appliedFilters.maxLandSize &&
        (appliedFilters.features.length === 0 ||
          appliedFilters.features.some((f) =>
            (p.tags || []).some(
              (t) => t.toLowerCase() === f.toLowerCase()
            )
          ))
      return textMatch && chipMatch && filterMatch
    })
  }, [properties, query, activeChips, appliedFilters])

  const results = useMemo(
    () => shuffle(filtered).slice(0, 10),
    [filtered]
  )

  const handleCardClick = (property: Property) => {
    if (!isPremium) {
      setShowPremiumUpsell(true)
      return
    }
    onOpenPropertyDetail?.(property)
  }

  return (
    <div className="h-full overflow-auto pb-4 relative">
      {/* Search header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <div
              className="flex-1"
              onClick={() => {
                if (!isPremium) setShowPremiumUpsell(true)
              }}
            >
              <Input
                placeholder={
                  isPremium ? "Search by location..." : "Search (Premium)"
                }
                value={query}
                onChange={(e) => isPremium && setQuery(e.target.value)}
                readOnly={!isPremium}
                className="h-12 pl-10 rounded-xl bg-secondary border-0"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl border-border bg-transparent"
            onClick={() => {
              if (!isPremium) {
                setShowPremiumUpsell(true)
                return
              }
              setShowFilters(true)
            }}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Feature chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {FEATURE_CHIPS.map((tag) => {
            const active = activeChips.has(tag)
            return (
              <Badge
                key={tag}
                variant={active ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap ${
                  active ? "" : "hover:bg-secondary"
                }`}
                onClick={() => toggleChip(tag)}
              >
                {tag}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${results.length} homes found`}
        </p>
      </div>

      {/* Grid */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SearchResultSkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No properties found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {results.map((property, index) => (
                <SearchResultCard
                  key={property.id}
                  property={property}
                  index={index}
                  isLiked={liked.has(property.id)}
                  onToggleLike={() => toggleLike(property.id)}
                  onPress={() => handleCardClick(property)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && isPremium && (
          <FilterPanel
            filters={appliedFilters}
            onClose={() => setShowFilters(false)}
            onApply={(filters) => {
              setAppliedFilters(filters)
              setShowFilters(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Premium Upsell Panel */}
      <AnimatePresence>
        {showPremiumUpsell && (
          <PremiumUpsellPanel
            onClose={() => setShowPremiumUpsell(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchResultSkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.6) }}
      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
    >
      <div className="relative aspect-[4/3] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-1/2 h-4 rounded-sm bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-3 rounded-sm bg-muted" />
          <div className="w-10 h-3 rounded-sm bg-muted" />
          <div className="w-12 h-3 rounded-sm bg-muted" />
        </div>
      </div>
    </motion.div>
  )
}

function SearchResultCard({
  property,
  isLiked,
  onToggleLike,
  onPress,
  index,
}: {
  property: Property
  isLiked: boolean
  onToggleLike: () => void
  onPress: () => void
  index: number
}) {
  const imageUri = property.images?.[0]
  const priceLabel = formatPrice(property.price)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onPress}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onPress()
          }
        }}
        className="block w-full text-left cursor-pointer"
      >
        {/* Image */}
        <div className="relative aspect-[4/3]">
          {imageUri ? (
            <Image
              src={imageUri}
              alt={property.suburb}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Home className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleLike()
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked
                  ? "fill-destructive text-destructive"
                  : "text-muted-foreground"
              }`}
            />
          </button>
          <Badge className="absolute bottom-2 left-2 bg-card/90 text-foreground font-bold">
            {priceLabel}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" />
            {property.suburb}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Bed className="w-3 h-3" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-0.5">
              <Bath className="w-3 h-3" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-0.5">
              <Ruler className="w-3 h-3" />
              {property.sqm?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FilterPanel({
  filters: initialFilters,
  onClose,
  onApply,
}: {
  filters: FilterState
  onClose: () => void
  onApply: (filters: FilterState) => void
}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const update = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const togglePropertyType = (type: PropertyType) => {
    setFilters((prev) => {
      const exists = prev.propertyTypes.includes(type)
      return {
        ...prev,
        propertyTypes: exists
          ? prev.propertyTypes.filter((t) => t !== type)
          : [...prev.propertyTypes, type],
      }
    })
  }

  const toggleFeature = (feature: string) => {
    setFilters((prev) => {
      const exists = prev.features.includes(feature)
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      }
    })
  }

  const handleReset = () => setFilters(defaultFilters)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        style={{
          maxWidth: "32rem",
          marginLeft: "auto",
          marginRight: "auto",
          zIndex: 9998,
        }}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border flex flex-col"
        style={{
          maxWidth: "32rem",
          marginLeft: "auto",
          marginRight: "auto",
          zIndex: 9999,
          height: "92%",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
          <h2 className="text-xl font-semibold">Filter Properties</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-muted-foreground"
            >
              Reset
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto px-4 py-6 space-y-8">
          {/* Location */}
          <div className="space-y-3">
            <Label className="font-semibold">Location</Label>
            <div className="flex items-center gap-2 px-3 h-12 rounded-xl bg-secondary border border-border">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter suburb or city..."
                value={filters.location}
                onChange={(e) => update({ location: e.target.value })}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Price Range</Label>
              <span className="text-sm text-muted-foreground">
                {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
              </span>
            </div>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={(value) =>
                update({ minPrice: value[0], maxPrice: value[1] })
              }
              min={0}
              max={5_000_000}
              step={50_000}
              className="py-4"
            />
          </div>

          {/* Bedrooms */}
          <div className="space-y-3">
            <Label className="font-semibold">Minimum Bedrooms</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <FilterChip
                  key={n}
                  label={`${n}+`}
                  selected={filters.minBeds === n}
                  onClick={() =>
                    update({ minBeds: filters.minBeds === n ? 0 : n })
                  }
                />
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="space-y-3">
            <Label className="font-semibold">Minimum Bathrooms</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((n) => (
                <FilterChip
                  key={n}
                  label={`${n}+`}
                  selected={filters.minBaths === n}
                  onClick={() =>
                    update({ minBaths: filters.minBaths === n ? 0 : n })
                  }
                />
              ))}
            </div>
          </div>

          {/* Parking */}
          <div className="space-y-3">
            <Label className="font-semibold">Minimum Parking</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((n) => (
                <FilterChip
                  key={n}
                  label={`${n}+`}
                  selected={filters.minParking === n}
                  onClick={() =>
                    update({ minParking: filters.minParking === n ? 0 : n })
                  }
                />
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="font-semibold">Property Type</Label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  selected={filters.propertyTypes.includes(type)}
                  onClick={() => togglePropertyType(type)}
                />
              ))}
            </div>
          </div>

          {/* Land Size */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Land Size</Label>
              <span className="text-sm text-muted-foreground">
                {filters.minLandSize}m² - {filters.maxLandSize}m²
              </span>
            </div>
            <Slider
              value={[filters.minLandSize, filters.maxLandSize]}
              onValueChange={(value) =>
                update({ minLandSize: value[0], maxLandSize: value[1] })
              }
              min={0}
              max={2000}
              step={10}
              className="py-4"
            />
          </div>

          {/* Must-Have Features */}
          <div className="space-y-3">
            <Label className="font-semibold">Must-Have Features</Label>
            <div className="flex flex-wrap gap-2">
              {FEATURE_CHIPS.map((feature) => (
                <FilterChip
                  key={feature}
                  label={feature}
                  selected={filters.features.includes(feature)}
                  onClick={() => toggleFeature(feature)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full h-12 rounded-xl"
            onClick={() => onApply(filters)}
          >
            Apply Filters
          </Button>
        </div>
      </motion.div>
    </>
  )
}

function PremiumUpsellPanel({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        style={{
          maxWidth: "32rem",
          marginLeft: "auto",
          marginRight: "auto",
          zIndex: 9998,
        }}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border"
        style={{
          maxWidth: "32rem",
          marginLeft: "auto",
          marginRight: "auto",
          zIndex: 9999,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <h2 className="text-xl font-semibold">Switch Premium</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Hero */}
        <div className="px-4 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Crown className="h-8 w-8 text-card" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            Unlock Search & Filters
          </h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to Premium to search by location, use advanced filters, and
            view property details.
          </p>
        </div>

        {/* CTA */}
        <div className="px-4 pb-6">
          <Button className="w-full h-12 rounded-xl text-lg font-semibold">
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Premium
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 text-sm text-muted-foreground"
          >
            Not now
          </button>
        </div>
      </motion.div>
    </>
  )
}
