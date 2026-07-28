"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  MapPin,
  Bed,
  Bath,
  Car,
  Ruler,
  Heart,
  Share2,
  MessageCircle,
  Pencil,
  Trash2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { fetchPropertyById, deleteProperty, recordSwipe, mapDbPropertyToUi } from "@/lib/properties"
import { findConversationForProperty } from "@/lib/matches"

interface PropertyDetailScreenProps {
  propertyId?: string
  property?: ReturnType<typeof mapDbPropertyToUi>
  onBack: () => void
  onEdit?: (propertyId: string) => void
  onMessage?: (chatId: string) => void
  onPublicProfile?: (userId: string) => void
}

type UiProperty = ReturnType<typeof mapDbPropertyToUi> & {
  ownerId?: string
  status?: string
}

export function PropertyDetailScreen({
  propertyId,
  property: initialProperty,
  onBack,
  onEdit,
  onMessage,
  onPublicProfile,
}: PropertyDetailScreenProps) {
  const [property, setProperty] = useState<UiProperty | null>(initialProperty || null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(!initialProperty)
  const [error, setError] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [hasExistingChat, setHasExistingChat] = useState(false)
  const [requestingSwap, setRequestingSwap] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!propertyId) return

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const data = await fetchPropertyById(propertyId)
        if (!data || cancelled) {
          if (!cancelled) {
            setError(!data)
            setLoading(false)
          }
          return
        }

        const mapped = mapDbPropertyToUi(data) as UiProperty
        mapped.ownerId = data.owner_id
        mapped.status = data.status

        if (!cancelled) {
          setProperty(mapped)
          setIsOwner(user?.id === data.owner_id)
        }

        if (user) {
          const [convoId, existingSwipe] = await Promise.all([
            findConversationForProperty(user.id, data.id),
            supabase
              .from("swipes")
              .select("id")
              .eq("swiper_id", user.id)
              .eq("swiped_property_id", data.id)
              .in("direction", ["right", "up"])
              .maybeSingle(),
          ])

          if (!cancelled) {
            setHasExistingChat(!!convoId)
            setLiked(!!existingSwipe.data)
          }
        }
      } catch (err) {
        console.error("Failed to load property:", err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [propertyId, initialProperty])

  const images = property && property.images.length > 0 ? property.images : ["/placeholder.svg"]
  const heroHeight = "38vh"

  const handleScroll = () => {
    if (!scrollRef.current) return
    const scrollLeft = scrollRef.current.scrollLeft
    const width = scrollRef.current.offsetWidth
    const idx = Math.round(scrollLeft / width)
    setCurrentImageIndex(idx)
  }

  const toggleStatus = async () => {
    if (!property || !isOwner) return
    const newStatus = property.status === "active" ? "inactive" : "active"
    setTogglingStatus(true)
    try {
      const { error } = await supabase.from("properties").update({ status: newStatus }).eq("id", property.id)
      if (!error) {
        setProperty((prev) => (prev ? { ...prev, status: newStatus } : prev))
      } else {
        toast.error("Could not update status.")
      }
    } finally {
      setTogglingStatus(false)
    }
  }

  const handleMessage = async () => {
    if (!property) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const convoId = await findConversationForProperty(user.id, property.id)
    if (convoId) {
      onMessage?.(convoId)
    }
  }

  const handleRequestSwap = async () => {
    if (!property || requestingSwap || liked) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please sign in to request a swap.")
      return
    }

    setRequestingSwap(true)
    try {
      const { error } = await supabase.from("swipes").insert({
        swiper_id: user.id,
        swiped_property_id: property.id,
        direction: "right",
      })

      const isDuplicate = error?.code === "23505"

      if (error && !isDuplicate) {
        toast.error("Could not send swap request. Please try again.")
        return
      }

      const convoId = await findConversationForProperty(user.id, property.id)
      if (convoId) {
        setHasExistingChat(true)
        toast.success("It's a match! You can now message the owner.")
        return
      }

      if (isDuplicate) {
        setLiked(true)
        toast.info("You've already requested a swap for this property.")
        return
      }

      setLiked(true)
      toast.success("Swap request sent — the owner has been notified.")
    } catch (err) {
      toast.error("Could not send swap request. Please try again.")
    } finally {
      setRequestingSwap(false)
    }
  }

  const handleDelete = async () => {
    if (!property || !isOwner) return
    if (!window.confirm("Are you sure you want to delete this property? This cannot be undone.")) return
    setDeleting(true)
    try {
      await deleteProperty(property.id)
      toast.success("Property deleted.")
      onBack()
    } catch (err) {
      toast.error("Could not delete property.")
    } finally {
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    if (!property) return
    const url = typeof window !== "undefined" ? `${window.location.origin}/?property=${property.id}` : ""
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Property link copied to clipboard.")
    } catch {
      toast.error("Could not copy link.")
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="absolute left-4 top-4 rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <p className="text-center text-muted-foreground">Property not found.</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* Hero carousel */}
      <div className="relative w-full shrink-0" style={{ height: heroHeight }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((uri, index) => (
            <div key={`${uri}-${index}`} className="relative h-full w-full shrink-0 snap-center">
              <Image src={uri} alt={property.location} fill className="object-cover" priority={index === 0} />
            </div>
          ))}
        </div>

        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-black/30 text-white hover:bg-black/40"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLiked(!liked)}
              className="rounded-full bg-black/30 text-white hover:bg-black/40"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="rounded-full bg-black/30 text-white hover:bg-black/40"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Pagination bars */}
        {images.length > 1 && (
          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative -mt-6 rounded-t-3xl bg-background px-5 pb-6 pt-4">
          {/* Grab handle */}
          <div className="flex justify-center pb-3">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Price + status + actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">${property.price.toLocaleString()}</h2>
              <div className="flex items-center gap-2">
                {property.verified && (
                  <Badge variant="default" className="rounded-md">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {isOwner ? (
                  <button
                    type="button"
                    onClick={toggleStatus}
                    disabled={togglingStatus}
                    className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold capitalize text-white ${
                      property.status === "active" ? "bg-accent" : "bg-muted-foreground"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white" />
                    {property.status}
                  </button>
                ) : (
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold capitalize text-white ${
                      property.status === "active"
                        ? "bg-accent"
                        : property.status === "sold"
                        ? "bg-destructive"
                        : "bg-muted-foreground"
                    }`}
                  >
                    {property.status}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.suburb}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
            {[
              { icon: Bed, value: property.bedrooms, label: "Beds" },
              { icon: Bath, value: property.bathrooms, label: "Baths" },
              { icon: Car, value: property.parking, label: "Parking" },
              { icon: Ruler, value: `${property.sqm}m²`, label: "Size" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center gap-1 py-2 ${
                  i < 3 ? "border-r border-border" : ""
                }`}
              >
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Property type */}
          {property.propertyType && (
            <Badge variant="outline" className="mt-4 rounded-full">
              {property.propertyType}
            </Badge>
          )}

          {/* Description */}
          {property.description && (
            <div className="mt-4 space-y-1">
              <p className="font-semibold">Description</p>
              <p className="text-sm text-muted-foreground">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {property.tags && property.tags.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-semibold">Features</p>
              <div className="flex flex-wrap gap-2">
                {property.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Special conditions */}
          {property.specialConditions && (
            <div className="mt-4 space-y-2">
              <p className="font-semibold">Special Conditions</p>
              <div className="rounded-xl bg-secondary/50 p-3 text-sm text-muted-foreground">
                {property.specialConditions}
              </div>
            </div>
          )}

          {/* Owner card */}
          {!isOwner && (
            <div className="mt-4 space-y-2">
              <p className="font-semibold">Owner</p>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
                {property.ownerImage ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src={property.ownerImage} alt={property.ownerName} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                    {property.ownerName?.charAt(0) || "O"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{property.ownerName?.split(" ")[0] || "Owner"}</p>
                  <p className="text-xs text-muted-foreground">Property Owner</p>
                </div>
                {(property as UiProperty).ownerId && onPublicProfile && (
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => onPublicProfile((property as UiProperty).ownerId!)} >
                    View Profile
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Spacer for fixed bottom bar */}
          <div className="h-24" />
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-border bg-card p-4">
        {!isOwner ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-xl text-base"
              onClick={handleMessage}
              disabled={!hasExistingChat}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Message
            </Button>
            <Button
              className="flex-1 h-14 rounded-xl text-base"
              onClick={handleRequestSwap}
              disabled={liked || requestingSwap}
            >
              {requestingSwap ? (
                <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Heart className="mr-2 h-5 w-5" />
              )}
              {liked ? "Swap Requested" : "Request Swap"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-xl text-base"
              onClick={() => onEdit?.(property.id)}
            >
              <Pencil className="mr-2 h-5 w-5" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-14 rounded-xl text-base"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
