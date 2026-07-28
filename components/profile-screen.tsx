"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from "framer-motion"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import { useUserData } from "@/context/user-data-context"
import type { BuyerCriteria } from "@/components/buyer-criteria-screen"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import type { LikedProperty, ProfileListing } from "@/lib/profile"
import {
  Camera,
  Pencil,
  MapPin,
  Heart,
  Home,
  Bed,
  Bath,
  Ruler,
  Eye,
  LogOut,
  ChevronRight,
  Target,
  Bell,
  Shield,
  Star,
  HelpCircle,
  Trash2,
} from "lucide-react"

interface ProfileScreenProps {
  onNavigate: (screen: string, propertyId?: string) => void
}

interface MenuItemConfig {
  icon: typeof Home
  label: string
  screen?: string
  badgeCount?: number
  isNew?: boolean
  isHighlighted?: boolean
  danger?: boolean
}

function AnimatedStatValue({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { damping: 20, stiffness: 100 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return () => unsubscribe()
  }, [springValue])

  useEffect(() => {
    if (isInView) {
      motionValue.set(0)
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  return <span ref={ref} className={`text-2xl font-bold ${color}`}>{displayValue}</span>
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`
  return `$${Math.round(price / 1_000)}K`
}

function ListingCard({
  property,
  index,
  onPress,
  onEditPress,
}: {
  property: ProfileListing
  index: number
  onPress?: () => void
  onEditPress?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35 }}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <button
        onClick={onPress}
        className="flex w-full text-left"
        aria-label={`View details for ${property.address}`}
      >
        <div className="relative w-[40%] flex-shrink-0">
          {property.image && property.image !== "/placeholder.svg" ? (
            <Image
              src={property.image}
              alt={property.address}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center bg-muted">
              <Home className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {property.status}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1 p-3">
          <p className="line-clamp-1 text-sm font-semibold text-foreground">
            {property.address}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {property.city}
          </div>
          <p className="text-sm font-bold text-primary">{formatPrice(property.price)}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Bed className="h-3 w-3" /> {property.beds}
            </span>
            <span className="flex items-center gap-0.5">
              <Bath className="h-3 w-3" /> {property.baths}
            </span>
            <span className="flex items-center gap-0.5">
              <Ruler className="h-3 w-3" /> {property.sqft}
            </span>
          </div>
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
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onEditPress?.()
          }}
        >
          Edit
        </Button>
      </div>
    </motion.div>
  )
}

function LikedCard({
  property,
  index,
  onPress,
}: {
  property: LikedProperty
  index: number
  onPress?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35 }}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <button
        onClick={onPress}
        className="flex w-full text-left"
        aria-label={`View details for ${property.address}`}
      >
        <div className="relative w-[40%] flex-shrink-0">
          {property.image && property.image !== "/placeholder.svg" ? (
            <Image
              src={property.image}
              alt={property.address}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center bg-muted">
              <Home className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1 p-3">
          <p className="text-sm font-bold text-primary">{formatPrice(property.price)}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {property.suburb}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
            <div className="flex flex-wrap gap-1">
              {property.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-md px-1.5 py-0 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </button>
    </motion.div>
  )
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { signOut } = useAuth()
  const { loading, profile, stats, listings, likedProperties, notificationCount, buyerCriteria } = useUserData()
  const [activeTab, setActiveTab] = useState<"listings" | "liked">("listings")
  const [loggingOut, setLoggingOut] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [tabFading, setTabFading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: scrollRef })
  const bannerHeight = useTransform(scrollY, [0, 120], [140, 80])
  const bannerOpacity = useTransform(scrollY, [0, 120], [1, 0.7])
  const avatarScale = useTransform(scrollY, [0, 120], [1, 0.72])
  const avatarTranslateY = useTransform(scrollY, [0, 120], [0, -16])

  // Entrance spring for avatar.
  const avatarEntranceScale = useSpring(1, { damping: 12, stiffness: 120 })
  const avatarEntranceOpacity = useMotionValue(1)

  useEffect(() => {
    if (!loading) {
      avatarEntranceScale.set(0.6)
      avatarEntranceOpacity.set(0)
      const timer = setTimeout(() => {
        avatarEntranceScale.set(1)
        avatarEntranceOpacity.set(1)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [loading, avatarEntranceScale, avatarEntranceOpacity])

  const handleTabChange = useCallback((tab: "listings" | "liked") => {
    setTabFading(true)
    const timer = setTimeout(() => {
      setActiveTab(tab)
      setTabFading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } catch {
      toast.error("Failed to log out. Please try again.")
    } finally {
      setLoggingOut(false)
    }
  }

  const displayName = profile?.full_name || "User"
  const avatarUrl = profile?.avatar_url || ""
  const firstSuburb = buyerCriteria?.suburbs?.[0]
  const location =
    profile?.address || listings[0]?.address || profile?.suburb || firstSuburb || ""

  const statsItems = useMemo(
    () => [
      { label: "Swipes", value: stats.swipes, color: "text-foreground" },
      { label: "Matches", value: stats.matches, color: "text-primary" },
      { label: "Chats", value: stats.conversations, color: "text-foreground" },
    ],
    [stats]
  )

  const menuItems: MenuItemConfig[] = [
    { icon: Target, label: "My Criteria", screen: "criteria" },
    {
      icon: Bell,
      label: "Notifications",
      screen: "notifications",
      badgeCount: notificationCount,
    },
    { icon: Shield, label: "Privacy & Security", screen: "privacy" },
    {
      icon: Star,
      label: "Switch Premium",
      screen: "premium",
      isNew: true,
      isHighlighted: true,
    },
    { icon: HelpCircle, label: "Help Center", screen: "help" },
  ]

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div className="relative pb-8">
        {/* Banner */}
        <motion.div
          style={{ height: bannerHeight, opacity: bannerOpacity }}
          className="overflow-hidden"
        >
          <div className="h-[140px] w-full bg-gradient-to-br from-[#fceae7] to-[#e8f7ef]" />
        </motion.div>

        {/* Avatar */}
        <div className="px-4 -mt-16">
          <div className="relative inline-block">
            {loading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <motion.div
                style={{
                  scale: avatarEntranceScale,
                  opacity: avatarEntranceOpacity,
                }}
                className="relative inline-block"
              >
                <motion.div
                  style={{
                    scale: avatarScale,
                    y: avatarTranslateY,
                  }}
                  className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-card shadow-lg"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </motion.div>
                <button
                  onClick={() => onNavigate("upload-photo")}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-card bg-primary shadow-md"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Name + Location + Edit */}
        <div className="mt-3 flex items-start justify-between px-4">
          <div className="flex-1 min-w-0 pr-2">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                {location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </div>
                )}
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-border bg-card shadow-sm"
            onClick={() => onNavigate("edit-profile")}
            aria-label="Edit profile"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 px-4">
          {loading
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-secondary p-3"
                >
                  <Skeleton className="h-7 w-8" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            : statsItems.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                  className="rounded-2xl bg-secondary p-3 text-center"
                >
                  <AnimatedStatValue value={stat.value} color={stat.color} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-3 px-4">
          <button
            onClick={() => handleTabChange("listings")}
            aria-selected={activeTab === "listings"}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors ${
              activeTab === "listings"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            My Listings
          </button>
          <button
            onClick={() => handleTabChange("liked")}
            aria-selected={activeTab === "liked"}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors ${
              activeTab === "liked"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground"
            }`}
          >
            <Heart className="h-4 w-4" />
            Liked
          </button>
        </div>

        {/* Tab content */}
        <motion.div
          animate={{ opacity: tabFading ? 0 : 1 }}
          transition={{ duration: 0.15 }}
          className="mt-4 space-y-4 px-4"
        >
          {loading ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex">
                <Skeleton className="h-[120px] w-[40%] rounded-none" />
                <div className="flex-1 space-y-2 p-3">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-[60%]" />
                </div>
              </div>
              <div className="h-10 border-t border-border bg-secondary/50" />
            </div>
          ) : activeTab === "listings" ? (
            <div className="space-y-4">
              {listings[0] && (
                <ListingCard
                  property={listings[0]}
                  index={0}
                  onPress={() => onNavigate("property-detail")}
                  onEditPress={() => onNavigate("edit-property", listings[0].id)}
                />
              )}

              {listings.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full rounded-2xl"
                  onClick={() => onNavigate("my-listings")}
                >
                  <span className="text-sm font-medium">
                    View All Listings ({listings.length})
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {listings.length === 0 && (
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-dashed border-2 bg-transparent"
                  onClick={() => onNavigate("add")}
                >
                  <Home className="h-4 w-4" />
                  Add Your First Listing
                </Button>
              )}
            </div>
          ) : likedProperties.length > 0 ? (
            <div className="space-y-4">
              {likedProperties[0] && (
                <LikedCard
                  property={likedProperties[0]}
                  index={0}
                  onPress={() => onNavigate("liked")}
                />
              )}
              {likedProperties.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full rounded-2xl"
                  onClick={() => onNavigate("liked")}
                >
                  <span className="text-sm font-medium">
                    View All Liked ({likedProperties.length})
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Heart className="h-10 w-10 text-border" />
              <p className="text-foreground">No liked properties yet</p>
              <p className="text-sm text-muted-foreground">Start swiping to find properties you love</p>
            </div>
          )}
        </motion.div>

        {/* Menu */}
        <div className="mt-6 space-y-1 px-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + index * 0.06 }}
              onClick={() => {
                if (item.screen) onNavigate(item.screen)
              }}
              className="flex w-full items-center justify-between rounded-2xl p-4 text-left text-foreground transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`h-5 w-5 ${
                    item.isHighlighted ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className={`font-medium ${item.isHighlighted ? "text-primary" : ""}`}>
                  {item.label}
                </span>
                {item.isNew && (
                  <Badge className="rounded-md bg-primary/10 px-1.5 py-0 text-[10px] text-primary">
                    NEW
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {item.badgeCount ? (
                  <Badge className="rounded-full bg-primary px-1.5 py-0 text-[10px] text-primary-foreground">
                    {item.badgeCount}
                  </Badge>
                ) : null}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </motion.button>
          ))}

          {/* Log Out */}
          <motion.button
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + menuItems.length * 0.06 }}
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            className="flex w-full items-center justify-between rounded-2xl p-4 text-left text-destructive transition-colors hover:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Log Out</span>
            </div>
            <ChevronRight className="h-5 w-5 text-destructive" />
          </motion.button>

          {/* Delete Account */}
          <motion.button
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + (menuItems.length + 1) * 0.06 }}
            onClick={() => setDeleteOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl p-4 text-left text-destructive transition-colors hover:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">Delete Account</span>
            </div>
            <ChevronRight className="h-5 w-5 text-destructive" />
          </motion.button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Switch My House v1.0.0
        </p>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          void signOut()
        }}
      />
    </div>
  )
}
