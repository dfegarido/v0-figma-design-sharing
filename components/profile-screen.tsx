"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useUserData } from "@/context/user-data-context"
import {
  Edit3,
  MapPin,
  Home,
  Heart,
  ArrowLeftRight,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Star,
  Bed,
  Bath,
  Square,
  Camera,
  Target,
  ShieldCheck,
  Lock,
  FlaskConical,
} from "lucide-react"
import { motion } from "framer-motion"
import type { ProfileListing } from "@/lib/profile"

interface ProfileScreenProps {
  onNavigate: (screen: string) => void
}

interface MenuItem {
  icon: typeof Bell
  label: string
  badge?: string
  highlight?: boolean
  danger?: boolean
  screen?: string
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { signOut } = useAuth()
  const { loading, profile, stats, listings, notificationCount } = useUserData()
  const [activeTab, setActiveTab] = useState<"listings" | "liked">("listings")
  const [loggingOut, setLoggingOut] = useState(false)

  const menuItems: MenuItem[] = [
    { icon: Target, label: "My Criteria", screen: "criteria" },
    { icon: ShieldCheck, label: "Verify Ownership", screen: "verification" },
    { icon: Lock, label: "Unlock Chat", screen: "unlock" },
    {
      icon: Bell,
      label: "Notifications",
      badge: notificationCount > 0 ? String(notificationCount) : undefined,
      screen: "notifications",
    },
    { icon: Shield, label: "Privacy & Security", screen: "privacy" },
    { icon: Star, label: "Switch Premium", highlight: true, screen: "premium" },
    { icon: HelpCircle, label: "Help Center", screen: "help" },
    { icon: FlaskConical, label: "Testing", screen: "testing" },
    { icon: LogOut, label: "Log Out", danger: true },
  ]

  const displayName = profile?.full_name || "Your Profile"
  const location = profile?.suburb || profile?.address || "Add your location"
  const avatarUrl =
    profile?.avatar_url ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"

  const handleMenuClick = async (item: MenuItem) => {
    if (item.label === "Log Out") {
      setLoggingOut(true)
      try {
        await signOut()
      } catch {
        toast.error("Failed to log out. Please try again.")
      } finally {
        setLoggingOut(false)
      }
      return
    }

    if (item.screen) {
      onNavigate(item.screen)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }

  const getStatusColor = (status: ProfileListing["status"]) => {
    switch (status) {
      case "active":
        return "bg-chart-1 text-white"
      case "pending":
        return "bg-chart-4 text-foreground"
      case "matched":
        return "bg-primary text-primary-foreground"
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto pb-4">
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20" />

        <div className="px-4 -mt-16">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-card shadow-xl">
              <Image
                src={avatarUrl}
                alt={displayName}
                width={112}
                height={112}
                className="object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {location}
              </p>
            </div>
            <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary rounded-2xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-foreground">{stats.swipes}</p>
              <p className="text-xs text-muted-foreground">Swipes</p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onNavigate("matches")}
              className="bg-secondary rounded-2xl p-4 text-center hover:bg-secondary/80 transition-colors"
            >
              <p className="text-2xl font-bold text-primary">{stats.matches}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => onNavigate("messages")}
              className="bg-secondary rounded-2xl p-4 text-center hover:bg-secondary/80 transition-colors"
            >
              <p className="text-2xl font-bold text-foreground">{stats.conversations}</p>
              <p className="text-xs text-muted-foreground">Chats</p>
            </motion.button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === "listings" ? "default" : "outline"}
              className="flex-1 rounded-xl"
              onClick={() => setActiveTab("listings")}
            >
              <Home className="w-4 h-4 mr-2" />
              My Listings
            </Button>
            <Button
              variant={activeTab === "liked" ? "default" : "outline"}
              className="flex-1 rounded-xl"
              onClick={() => setActiveTab("liked")}
            >
              <Heart className="w-4 h-4 mr-2" />
              Liked
            </Button>
          </div>

          {activeTab === "listings" && (
            <div className="space-y-4 mb-6">
              {listings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  <Home className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="font-medium text-foreground">No listings yet</p>
                  <p className="text-sm mt-1">Add your first property to start matching.</p>
                </div>
              ) : (
                listings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl overflow-hidden border border-border"
                  >
                    <div className="flex">
                      <div className="relative w-28 aspect-square flex-shrink-0">
                        <Image
                          src={listing.image || "/placeholder.svg"}
                          alt={listing.address}
                          fill
                          className="object-cover"
                        />
                        <Badge className={`absolute top-2 left-2 text-xs ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </Badge>
                      </div>

                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {listing.address}
                          </h3>
                          <p className="text-xs text-muted-foreground">{listing.city}</p>
                          <p className="text-sm font-bold text-primary mt-1">
                            {formatPrice(listing.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Bed className="w-3 h-3" />
                            {listing.beds}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Bath className="w-3 h-3" />
                            {listing.baths}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Square className="w-3 h-3" />
                            {listing.sqft}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-t border-border">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ArrowLeftRight className="w-3 h-3 text-primary" />
                          <span className="font-semibold text-foreground">{listing.matches}</span> matches
                        </span>
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{listing.views}</span> views
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        Edit
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}

              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl border-dashed border-2 bg-transparent"
                onClick={() => onNavigate("add")}
              >
                <Home className="w-5 h-5 mr-2" />
                {listings.length === 0 ? "Add Your First Listing" : "Add Another Listing"}
              </Button>
            </div>
          )}

          {activeTab === "liked" && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onNavigate("liked")}
              className="w-full flex flex-col items-center justify-center h-40 text-center bg-secondary/50 rounded-2xl hover:bg-secondary transition-colors mb-6"
            >
              <Heart className="w-10 h-10 text-primary mb-2" />
              <p className="text-foreground font-medium">View Liked Properties</p>
              <p className="text-muted-foreground text-sm">
                {stats.liked} {stats.liked === 1 ? "property" : "properties"} you have liked
              </p>
            </motion.button>
          )}

          <div className="space-y-1 mb-8">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleMenuClick(item)}
                disabled={loggingOut && item.label === "Log Out"}
                className={`w-full flex items-center justify-between p-4 rounded-2xl hover:bg-secondary transition-colors ${
                  item.danger ? "text-destructive" : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.highlight ? "text-primary" : ""}`} />
                  <span className={`font-medium ${item.highlight ? "text-primary" : ""}`}>
                    {item.label}
                  </span>
                  {item.highlight && (
                    <Badge className="bg-primary/10 text-primary text-xs">NEW</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mb-4">
            Switch My House v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}
