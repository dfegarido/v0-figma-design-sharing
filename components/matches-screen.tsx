"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, MessageCircle, ArrowLeftRight, MapPin, Bed, Bath, Square } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface MatchesScreenProps {
  onBack: () => void
  onOpenChat: (chatId: string) => void
}

interface Match {
  id: string
  name: string
  avatar: string
  property: {
    image: string
    address: string
    suburb: string
    price: number
    beds: number
    baths: number
    sqm: number
  }
  matchedAt: string
  priceDiff: number
}

const matches: Match[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    property: {
      image: "/houses/house-1.jpg",
      address: "123 Ocean Drive",
      suburb: "Bondi Beach",
      price: 2500000,
      beds: 4,
      baths: 3,
      sqm: 320,
    },
    matchedAt: "2 hours ago",
    priceDiff: 1000000,
  },
  {
    id: "2",
    name: "James Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    property: {
      image: "/houses/house-2.jpg",
      address: "45 Maple Street",
      suburb: "Paddington",
      price: 1800000,
      beds: 3,
      baths: 2,
      sqm: 180,
    },
    matchedAt: "1 day ago",
    priceDiff: 300000,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    property: {
      image: "/houses/house-3.jpg",
      address: "789 Harbour View",
      suburb: "Darling Point",
      price: 4200000,
      beds: 5,
      baths: 4,
      sqm: 450,
    },
    matchedAt: "3 days ago",
    priceDiff: 2700000,
  },
]

export function MatchesScreen({ onBack, onOpenChat }: MatchesScreenProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    return `$${(price / 1000).toFixed(0)}K`
  }

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">My Matches</h2>
            <p className="text-sm text-muted-foreground">{matches.length} matches</p>
          </div>
        </div>
      </div>

      {/* Matches list */}
      <div className="px-4 py-4 space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Property Image */}
            <div className="relative h-40">
              <Image
                src={match.property.image || "/placeholder.svg"}
                alt={match.property.address}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Match badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-primary rounded-full">
                <ArrowLeftRight className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Matched</span>
              </div>

              {/* Price diff */}
              <div className="absolute top-3 right-3 px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-full">
                <span className="text-sm font-semibold text-foreground">
                  {match.priceDiff > 0 ? "+" : "-"}{formatPrice(Math.abs(match.priceDiff))}
                </span>
              </div>

              {/* Address overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-semibold text-white">{match.property.address}</p>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.property.suburb}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image src={match.avatar || "/placeholder.svg"} alt={match.name} width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{match.name}</p>
                    <p className="text-xs text-muted-foreground">Matched {match.matchedAt}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary">{formatPrice(match.property.price)}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {match.property.beds} beds
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {match.property.baths} baths
                </span>
                <span className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  {match.property.sqm} sqm
                </span>
              </div>

              {/* Action */}
              <Button 
                className="w-full rounded-xl" 
                onClick={() => onOpenChat(match.id)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
