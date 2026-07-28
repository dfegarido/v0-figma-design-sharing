"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MapPin,
  Home,
  Heart,
  Eye,
  Bed,
  Bath,
  Ruler,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronLeft,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { deduplicateById } from "@/lib/array"
import { useUserData } from "@/context/user-data-context"

interface MyListingsScreenProps {
  onBack: () => void
  onNavigate: (screen: string, propertyId?: string) => void
}

interface ListingItem {
  id: string
  address: string
  suburb: string
  price: number
  bedrooms: number
  bathrooms: number
  parking: number
  sqm: number
  tags: string[]
  verified: boolean
  status: string
  verificationStatus: "pending" | "approved" | "rejected" | "unverified"
  ownerName: string
  ownerImage?: string
  property_images?: { url: string }[]
  matches: number
  views: number
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000) return `$${Math.round(price / 1_000)}K`
  return `$${price}`
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case "active":
      return "bg-accent text-accent-foreground"
    case "inactive":
      return "bg-chart-4 text-foreground"
    case "removed":
    case "flagged":
      return "bg-destructive text-white"
    default:
      return "bg-muted text-foreground"
  }
}

function VerificationBadge({
  status,
}: {
  status?: "pending" | "approved" | "rejected" | "unverified"
}) {
  const config = {
    approved: {
      classes: "bg-accent/20 text-accent",
      Icon: ShieldCheck,
      label: "Verified",
    },
    pending: {
      classes: "bg-primary/20 text-primary",
      Icon: Clock,
      label: "Pending",
    },
    rejected: {
      classes: "bg-destructive/20 text-destructive",
      Icon: ShieldAlert,
      label: "Rejected",
    },
    unverified: {
      classes: "bg-muted text-muted-foreground",
      Icon: ShieldAlert,
      label: "Unverified",
    },
  }

  const { classes, Icon, label } = config[status || "unverified"]

  return (
    <Badge className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${classes}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

export function MyListingsScreen({ onBack, onNavigate }: MyListingsScreenProps) {
  const { isPremium } = useUserData()
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("properties")
        .select(
          "id, address, suburb, price, bedrooms, bathrooms, parking, sqm, tags, verified, status, property_images(url), profiles!properties_owner_id_fkey(full_name, avatar_url)"
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (cancelled) return

      const propertyIds = (data || []).map((p: any) => p.id)

      let verificationMap = new Map<
        string,
        "pending" | "approved" | "rejected" | "unverified"
      >()
      if (propertyIds.length > 0) {
        const { data: verifications } = await supabase
          .from("verifications")
          .select("property_id, status, submitted_at")
          .in("property_id", propertyIds)
          .order("submitted_at", { ascending: false })

        for (const v of verifications || []) {
          if (!verificationMap.has(v.property_id)) {
            verificationMap.set(v.property_id, v.status as any)
          }
        }
      }

      const mapped: ListingItem[] = (data || []).map((p: any) => ({
        id: p.id,
        address: p.address,
        suburb: p.suburb,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        parking: p.parking,
        sqm: p.sqm,
        tags: p.tags || [],
        verified: p.verified,
        status: p.status || "active",
        verificationStatus:
          verificationMap.get(p.id) || (p.verified ? "approved" : "unverified"),
        ownerName: p.profiles?.full_name || "Owner",
        ownerImage: p.profiles?.avatar_url || undefined,
        property_images: p.property_images,
        matches: p.matches_count || p.matches || 0,
        views: p.views_count || p.views || 0,
      }))

      setListings(deduplicateById(mapped))
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleVerify = (property: ListingItem) => {
    const verifiedCount = listings.filter(
      (l) => l.verified || l.verificationStatus === "approved"
    ).length
    if (
      !isPremium &&
      verifiedCount >= 1 &&
      !property.verified &&
      property.verificationStatus !== "approved"
    ) {
      onNavigate("premium")
    } else {
      onNavigate("verification", property.id)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-4 backdrop-blur-lg">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground">My Listings</h2>
          <p className="text-sm text-muted-foreground">{listings.length} properties</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex">
                  <Skeleton className="h-[120px] w-[40%] rounded-none" />
                  <div className="flex-1 space-y-2 p-3">
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-3 w-[70%]" />
                  </div>
                </div>
                <div className="h-10 border-t border-border bg-secondary/50" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  damping: 20,
                  stiffness: 160,
                }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <button
                  onClick={() => onNavigate("property-detail", property.id)}
                  className="flex w-full text-left"
                  aria-label={`View details for ${property.address}`}
                >
                  <div className="relative w-[40%] flex-shrink-0">
                    {property.property_images?.[0]?.url ? (
                      <Image
                        src={property.property_images[0].url}
                        alt={property.address}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[120px] items-center justify-center bg-muted">
                        <Home className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusBadgeClasses(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </Badge>
                  </div>

                  <div className="flex flex-1 flex-col justify-start gap-1 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">{formatPrice(property.price)}</p>
                      <VerificationBadge status={property.verificationStatus} />
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {property.suburb}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Bed className="h-3 w-3" /> {property.bedrooms}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Bath className="h-3 w-3" /> {property.bathrooms}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Ruler className="h-3 w-3" /> {property.sqm}
                      </span>
                    </div>

                    {property.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {property.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-md px-1.5 py-0 text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>

                <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-3 py-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-foreground">{property.matches}</span> matches
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-foreground">{property.views}</span> views
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {property.verificationStatus !== "approved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVerify(property)
                        }}
                        className="text-xs font-semibold text-primary"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onNavigate("edit-property", property.id)
                      }}
                      className="text-xs font-semibold text-foreground"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Home className="h-10 w-10 text-border" />
            <p className="text-foreground">No listings yet</p>
            <p className="text-sm text-muted-foreground">Add your first property to start matching</p>
          </div>
        )}
      </div>
    </div>
  )
}
