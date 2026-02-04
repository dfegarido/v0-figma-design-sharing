"use client";

import React from "react"

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Bed, Bath, Car, Ruler, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Property {
  id: string;
  images: string[];
  location: string;
  suburb: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  sqm: number;
  ownerName: string;
  ownerImage?: string;
  description?: string;
  matchDate?: string;
}

interface PropertyCardProps {
  property: Property;
  showOwner?: boolean;
}

export function PropertyCard({ property, showOwner = true }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-xl">
      {/* Image carousel */}
      <div className="relative h-[65%] w-full">
        <Image
          src={property.images[currentImageIndex] || "/placeholder.svg"}
          alt={property.location}
          fill
          className="object-cover"
          priority
        />

        {/* Image navigation */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-all hover:bg-card hover:scale-110"
              type="button"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-all hover:bg-card hover:scale-110"
              type="button"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            {/* Image dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {property.images.map((_, i) => (
                <div
                  key={`dot-${property.id}-${i}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentImageIndex
                      ? "w-6 bg-card"
                      : "w-1.5 bg-card/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Price badge */}
        <Badge className="absolute top-4 right-4 bg-card/90 text-foreground backdrop-blur-sm px-3 py-1.5 text-lg font-semibold">
          {formatPrice(property.price)}
        </Badge>
      </div>

      {/* Property info */}
      <div className="p-5 space-y-3">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xl font-semibold text-foreground leading-tight">
              {property.suburb}
            </h3>
            <p className="text-sm text-muted-foreground">{property.location}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-2xl p-3">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{property.parking}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{property.sqm}m²</span>
          </div>
        </div>

        {/* Owner */}
        {showOwner && (
          <div className="flex items-center gap-3 pt-1">
            <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
              {property.ownerImage ? (
                <Image
                  src={property.ownerImage || "/placeholder.svg"}
                  alt={property.ownerName}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {property.ownerName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{property.ownerName}</p>
              <p className="text-xs text-muted-foreground">Property Owner</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
