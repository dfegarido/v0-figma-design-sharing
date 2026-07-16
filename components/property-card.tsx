"use client";

import React from "react"

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Bed, Bath, Car, Ruler, MapPin, LandPlot, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PropertyType = "House" | "Apartment" | "Townhouse" | "Unit" | "Land"

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
  landSize?: number;
  propertyType?: PropertyType;
  tags?: string[];
  specialConditions?: string;
  verified?: boolean;
  matchScore?: number;
  ownerName: string;
  ownerImage?: string;
  description?: string;
  matchDate?: string;
}

interface PropertyCardProps {
  property: Property;
  showOwner?: boolean;
  onTap?: () => void;
}

export function PropertyCard({ property, showOwner = true, onTap }: PropertyCardProps) {
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
      <div className="relative h-[58%] w-full">
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

        {/* Match score badge */}
        {property.matchScore != null && property.matchScore > 0 && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground backdrop-blur-sm px-2.5 py-1 text-sm font-semibold">
            {property.matchScore}% match
          </Badge>
        )}

        {/* Price badge */}
        <Badge className="absolute top-4 right-4 bg-card/90 text-foreground backdrop-blur-sm px-3 py-1.5 text-lg font-semibold">
          {formatPrice(property.price)}
        </Badge>
      </div>

      {/* Property info */}
      <div className="p-4 space-y-2.5">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xl font-semibold text-foreground leading-tight">
              {property.suburb}
            </h3>
            <p className="text-xs text-muted-foreground">{property.location}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{property.parking}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{property.sqm}m²</span>
          </div>
          {property.landSize && (
            <div className="flex items-center gap-1.5">
              <LandPlot className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">{property.landSize}m²</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {property.tags && property.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {property.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[11px] rounded-full px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {property.tags.length > 4 && (
              <Badge variant="outline" className="text-[11px] rounded-full px-2 py-0.5 text-muted-foreground">
                +{property.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Owner */}
        {showOwner && (
          <div className="flex items-center gap-2.5 pt-0.5">
            <div className="h-9 w-9 rounded-full bg-secondary overflow-hidden">
              {property.ownerImage ? (
                <Image
                  src={property.ownerImage || "/placeholder.svg"}
                  alt={property.ownerName}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {property.ownerName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs font-medium">{property.ownerName}</p>
                <p className="text-xs text-muted-foreground">Property Owner</p>
              </div>
              {property.verified && (
                <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
