"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Bed, Bath, Car, Ruler, LandPlot, MapPin, ShieldCheck, Heart, Share2, X } from "lucide-react"
import { motion } from "framer-motion"
import type { Property } from "./property-card"

interface PropertyDetailScreenProps {
  property: Property
  onBack: () => void
  onLike?: () => void
  onPass?: () => void
}

function formatPrice(price: number) {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
  return `$${(price / 1000).toFixed(0)}K`
}

export function PropertyDetailScreen({ property, onBack, onLike, onPass }: PropertyDetailScreenProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [liked, setLiked] = useState(false)

  const images = property.images.length > 0 ? property.images : ["/placeholder.svg"]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Image gallery */}
      <div className="relative w-full aspect-[4/3] flex-shrink-0">
        <Image
          src={images[imgIndex]}
          alt={property.location}
          fill
          className="object-cover"
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4" style={{ zIndex: 10 }}>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-card/80 backdrop-blur-sm"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-card/80 backdrop-blur-sm"
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-card/80 backdrop-blur-sm"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Match score */}
        {property.matchScore != null && property.matchScore > 0 && (
          <Badge className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
            {property.matchScore}% match
          </Badge>
        )}

        {/* Price */}
        <Badge className="absolute bottom-4 right-4 bg-card/90 text-foreground backdrop-blur-sm px-3 py-1.5 text-lg font-semibold">
          {formatPrice(property.price)}
        </Badge>

        {/* Image navigation */}
        {images.length > 1 && (
          <>
            {imgIndex > 0 && (
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/70 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setImgIndex((i) => i - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {imgIndex < images.length - 1 && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/70 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setImgIndex((i) => i + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{property.suburb}</h2>
              {property.verified && <ShieldCheck className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.location}</span>
            </div>
          </div>

          {/* Property type badge */}
          {property.propertyType && (
            <Badge variant="outline" className="rounded-full">
              {property.propertyType}
            </Badge>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-5 gap-2">
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-xl p-3">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.bedrooms}</span>
              <span className="text-[10px] text-muted-foreground">Beds</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-xl p-3">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.bathrooms}</span>
              <span className="text-[10px] text-muted-foreground">Baths</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-xl p-3">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.parking}</span>
              <span className="text-[10px] text-muted-foreground">Cars</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-xl p-3">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{property.sqm}</span>
              <span className="text-[10px] text-muted-foreground">m²</span>
            </div>
            {property.landSize && (
              <div className="flex flex-col items-center gap-1 bg-secondary/50 rounded-xl p-3">
                <LandPlot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{property.landSize}</span>
                <span className="text-[10px] text-muted-foreground">Land</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {property.tags && property.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Features</h3>
              <div className="flex flex-wrap gap-2">
                {property.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Special conditions */}
          {property.specialConditions && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Special Conditions</h3>
              <p className="text-sm text-muted-foreground bg-secondary/50 rounded-xl p-3">
                {property.specialConditions}
              </p>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Owner */}
          <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground">
              {property.ownerName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{property.ownerName}</p>
              <p className="text-xs text-muted-foreground">Property Owner</p>
            </div>
            {property.verified && (
              <Badge className="ml-auto bg-primary/10 text-primary text-xs">Verified</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bottom action buttons */}
      <div className="flex-shrink-0 border-t border-border p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-14 rounded-2xl text-lg bg-transparent"
            onClick={onPass}
          >
            <X className="h-5 w-5 mr-2" />
            Pass
          </Button>
          <Button
            className="flex-1 h-14 rounded-2xl text-lg"
            onClick={() => {
              setLiked(true)
              onLike?.()
            }}
          >
            <Heart className="h-5 w-5 mr-2" />
            Like
          </Button>
        </div>
      </div>
    </div>
  )
}
