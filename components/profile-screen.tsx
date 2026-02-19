"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface ProfileScreenProps {
  onNavigate: (screen: string) => void
}

interface UserListing {
  id: string
  image: string
  address: string
  city: string
  price: number
  beds: number
  baths: number
  sqft: number
  status: "active" | "pending" | "matched"
  matches: number
  views: number
}

const userListings: UserListing[] = [
  {
    id: "1",
    image: "/houses/house-2.jpg",
    address: "123 Your Street",
    city: "Portland, OR",
    price: 1000000,
    beds: 3,
    baths: 2,
    sqft: 2000,
    status: "active",
    matches: 12,
    views: 247,
  },
]

const profileStats = {
  swipes: 156,
  matches: 12,
  conversations: 8,
}

interface MenuItem {
  icon: typeof Bell
  label: string
  badge?: string
  highlight?: boolean
  danger?: boolean
  screen?: string
}

const menuItems: MenuItem[] = [
  { icon: Target, label: "My Criteria", screen: "criteria" },
  { icon: ShieldCheck, label: "Verify Ownership", screen: "verification" },
  { icon: Lock, label: "Unlock Chat", screen: "unlock" },
  { icon: Bell, label: "Notifications", badge: "3", screen: "notifications" },
  { icon: Shield, label: "Privacy & Security", screen: "privacy" },
  { icon: Star, label: "Switch Premium", highlight: true, screen: "premium" },
  { icon: HelpCircle, label: "Help Center", screen: "help" },
  { icon: FlaskConical, label: "Testing", screen: "testing" },
  { icon: LogOut, label: "Log Out", danger: true },
]

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "liked">("listings")

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }

  const getStatusColor = (status: UserListing["status"]) => {
    switch (status) {
      case "active":
        return "bg-chart-1 text-white"
      case "pending":
        return "bg-chart-4 text-foreground"
      case "matched":
        return "bg-primary text-primary-foreground"
    }
  }

  return (
    <div className="h-full overflow-auto pb-4">
      {/* Profile header */}
      <div className="relative">
        {/* Background gradient */}
        <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20" />

        {/* Profile content */}
        <div className="px-4 -mt-16">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-card shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
                alt="Profile"
                width={112}
                height={112}
                className="object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>

          {/* Name and location */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Alex Thompson</h2>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                Portland, OR
              </p>
            </div>
            <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary rounded-2xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-foreground">{profileStats.swipes}</p>
              <p className="text-xs text-muted-foreground">Swipes</p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onNavigate("matches")}
              className="bg-secondary rounded-2xl p-4 text-center hover:bg-secondary/80 transition-colors"
            >
              <p className="text-2xl font-bold text-primary">{profileStats.matches}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => onNavigate("messages")}
              className="bg-secondary rounded-2xl p-4 text-center hover:bg-secondary/80 transition-colors"
            >
              <p className="text-2xl font-bold text-foreground">{profileStats.conversations}</p>
              <p className="text-xs text-muted-foreground">Chats</p>
            </motion.button>
          </div>

          {/* Tabs */}
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

          {/* Listings */}
          {activeTab === "listings" && (
            <div className="space-y-4 mb-6">
              {userListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border"
                >
                  <div className="flex">
                    {/* Image */}
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

                    {/* Content */}
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

                  {/* Stats bar */}
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
              ))}

              {/* Add listing CTA */}
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-dashed border-2 bg-transparent"
                onClick={() => onNavigate("add")}
              >
                <Home className="w-5 h-5 mr-2" />
                Add Another Listing
              </Button>
            </div>
          )}

          {/* Liked homes */}
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
                4 properties you have liked
              </p>
            </motion.button>
          )}

          {/* Menu items */}
          <div className="space-y-1 mb-8">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => item.screen && onNavigate(item.screen)}
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

          {/* App version */}
          <p className="text-center text-xs text-muted-foreground mb-4">
            Switch My House v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}
