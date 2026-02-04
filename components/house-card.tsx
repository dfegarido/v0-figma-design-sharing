"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Square, ArrowLeftRight } from "lucide-react"

export interface House {
  id: string
  image: string
  address: string
  city: string
  price: number
  beds: number
  baths: number
  sqft: number
  ownerName: string
  ownerImage: string
  lookingFor: string
  tags: string[]
}

interface HouseCardProps {
  house: House
}

export function HouseCard({ house }: HouseCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }

  return (
    <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl bg-card">
      {/* Main house image */}
      <Image
        src={house.image || "/placeholder.svg"}
        alt={house.address}
        fill
        className="object-cover"
        priority
        draggable={false}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Price badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-primary text-primary-foreground text-lg font-bold px-4 py-2 rounded-full shadow-lg">
          {formatPrice(house.price)}
        </Badge>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {/* Owner info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/50">
            <Image
              src={house.ownerImage || "/placeholder.svg"}
              alt={house.ownerName}
              fill
              className="object-cover"
              draggable={false}
            />
          </div>
          <div>
            <p className="font-semibold">{house.ownerName}</p>
            <p className="text-sm text-white/70 flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" />
              Looking for: {house.lookingFor}
            </p>
          </div>
        </div>

        {/* Address */}
        <h2 className="text-2xl font-bold mb-1 text-balance">{house.address}</h2>
        <p className="flex items-center gap-1 text-white/80 mb-4">
          <MapPin className="w-4 h-4" />
          {house.city}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Bed className="w-5 h-5 text-white/70" />
            <span className="font-semibold">{house.beds}</span>
            <span className="text-white/70 text-sm">beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-5 h-5 text-white/70" />
            <span className="font-semibold">{house.baths}</span>
            <span className="text-white/70 text-sm">baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-5 h-5 text-white/70" />
            <span className="font-semibold">{house.sqft.toLocaleString()}</span>
            <span className="text-white/70 text-sm">sqft</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {house.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
