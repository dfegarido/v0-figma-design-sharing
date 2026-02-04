"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Heart, MapPin, Bed, Bath, Square, Star } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface LikedScreenProps {
  onBack: () => void
}

interface LikedProperty {
  id: string
  image: string
  address: string
  suburb: string
  price: number
  beds: number
  baths: number
  sqm: number
  likedAt: string
  isSuperLike: boolean
  ownerName: string
  ownerAvatar: string
}

const likedProperties: LikedProperty[] = [
  {
    id: "1",
    image: "/houses/house-1.jpg",
    address: "123 Ocean Drive",
    suburb: "Bondi Beach",
    price: 2500000,
    beds: 4,
    baths: 3,
    sqm: 320,
    likedAt: "Today",
    isSuperLike: true,
    ownerName: "Sarah Mitchell",
    ownerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    id: "2",
    image: "/houses/house-4.jpg",
    address: "12 Garden Lane",
    suburb: "Mosman",
    price: 3100000,
    beds: 4,
    baths: 3,
    sqm: 380,
    likedAt: "Yesterday",
    isSuperLike: false,
    ownerName: "Michael Chen",
    ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  },
  {
    id: "3",
    image: "/houses/house-5.jpg",
    address: "56 Sunset Boulevard",
    suburb: "Manly",
    price: 2200000,
    beds: 3,
    baths: 2,
    sqm: 250,
    likedAt: "2 days ago",
    isSuperLike: true,
    ownerName: "Lisa Anderson",
    ownerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  },
  {
    id: "4",
    image: "/houses/house-6.jpg",
    address: "88 Palm Avenue",
    suburb: "Double Bay",
    price: 5500000,
    beds: 6,
    baths: 5,
    sqm: 550,
    likedAt: "3 days ago",
    isSuperLike: false,
    ownerName: "Robert Taylor",
    ownerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  },
]

export function LikedScreen({ onBack }: LikedScreenProps) {
  const [activeTab, setActiveTab] = useState<"all" | "superlike">("all")

  const filteredProperties = activeTab === "superlike" 
    ? likedProperties.filter(p => p.isSuperLike)
    : likedProperties

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    return `$${(price / 1000).toFixed(0)}K`
  }

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Liked Properties</h2>
            <p className="text-sm text-muted-foreground">{likedProperties.length} properties</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setActiveTab("all")}
          >
            <Heart className="h-4 w-4 mr-1" />
            All Likes
          </Button>
          <Button
            variant={activeTab === "superlike" ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setActiveTab("superlike")}
          >
            <Star className="h-4 w-4 mr-1" />
            Super Likes
          </Button>
        </div>
      </div>

      {/* Properties grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.address}
                  fill
                  className="object-cover"
                />
                {property.isSuperLike && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary-foreground fill-current" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-semibold text-sm drop-shadow-lg">
                    {formatPrice(property.price)}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="font-medium text-foreground text-sm truncate">{property.address}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" />
                  {property.suburb}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Bed className="h-3 w-3" />
                    {property.beds}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Bath className="h-3 w-3" />
                    {property.baths}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Square className="h-3 w-3" />
                    {property.sqm}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Liked {property.likedAt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
