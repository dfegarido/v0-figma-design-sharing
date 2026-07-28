"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  Heart,
  Star,
  MapPin,
  Home,
  Bed,
  Bath,
  Ruler,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { fetchLikedProperties, type SwipeWithProperty, firstImageUrl, formatPrice } from "@/lib/matches"

interface LikedScreenProps {
  onBack: () => void
  onNavigate?: (screen: string, propertyId?: string) => void
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Liked today"
  if (diffDays === 1) return "Liked 1 day ago"
  if (diffDays <= 30) return `Liked ${diffDays} days ago`
  const months = Math.floor(diffDays / 30)
  return months === 1 ? "Liked 1 month ago" : `Liked ${months} months ago`
}

export function LikedScreen({ onBack, onNavigate }: LikedScreenProps) {
  const [activeTab, setActiveTab] = useState<"all" | "super">("all")
  const [properties, setProperties] = useState<SwipeWithProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || cancelled) {
          if (!cancelled) setLoading(false)
          return
        }

        const data = await fetchLikedProperties(user.id)
        if (cancelled) return
        setProperties(data)
      } catch (error) {
        console.error("Failed to load likes:", error)
        toast.error("Failed to load liked properties.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProperties =
    activeTab === "super"
      ? properties.filter((p) => p.direction === "up")
      : properties

  const cardGap = 16

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/95 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Liked Properties</h2>
            <p className="text-sm text-muted-foreground">{properties.length} properties</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0 gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground"
          }`}
        >
          <Heart className="h-4 w-4" />
          All Likes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("super")}
          className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
            activeTab === "super"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground"
          }`}
        >
          <Star className="h-4 w-4" />
          Super Likes
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[0.82] overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Heart className="h-10 w-10 text-border" />
            <p className="text-center text-muted-foreground">
              {activeTab === "super" ? "No super likes yet" : "No liked properties yet"}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {activeTab === "super"
                ? "Swipe up to super like a property"
                : "Start swiping to find properties you love"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProperties.map((item, index) => {
              const property = item.swiped_property
              if (!property) return null
              const imageUrl = firstImageUrl(property.property_images)
              const isSuperLike = item.direction === "up"

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 28, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  onClick={() => onNavigate?.("property-detail", property.id)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-transform active:scale-[0.98]"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={property.address}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Home className="h-7 w-7 text-muted-foreground" />
                      </div>
                    )}

                    {/* Bottom gradient + price */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-3 pt-10">
                      <p className="text-sm font-bold text-white drop-shadow">
                        {formatPrice(property.price)}
                      </p>
                    </div>

                    {/* Super like star */}
                    {isSuperLike && (
                      <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                        <Star className="h-3.5 w-3.5 text-white" fill="white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 p-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <p className="truncate text-sm font-semibold">{property.suburb}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5 text-primary" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5 text-primary" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3.5 w-3.5 text-primary" />
                        <span>{property.sqm ?? 0}</span>
                      </div>
                    </div>

                    {(property.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(property.tags || []).slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="default" className="rounded-md px-2 py-0.5 text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">{formatRelativeTime(item.created_at)}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
