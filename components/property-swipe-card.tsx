"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Bed, Bath, Car, Maximize, Home } from "lucide-react";

export interface Property {
  id: string;
  location: string;
  address: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  sqm: number;
  price: number;
  ownerName: string;
  matchDate?: string;
}

interface PropertySwipeCardProps {
  property: Property;
  onNope: () => void;
  onYup: () => void;
}

export function PropertySwipeCard({ property, onNope, onYup }: PropertySwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="flex flex-col items-center px-4">
      <h2 className="text-xl font-semibold mb-4">{property.location}</h2>

      {/* Image Carousel */}
      <div className="relative w-full max-w-sm aspect-square bg-secondary rounded-lg overflow-hidden">
        <Image
          src={property.images[currentImageIndex] || "/placeholder.svg"}
          alt={`${property.location} image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
        />
        
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-8 h-8" strokeWidth={2} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-8 h-8" strokeWidth={2} />
            </button>
          </>
        )}

        {/* Image indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {property.images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-foreground" : "bg-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Property Stats */}
      <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Bed className="w-4 h-4" />
          <span>{property.bedrooms}</span>
        </div>
        <div className="flex items-center gap-1">
          <Bath className="w-4 h-4" />
          <span>{property.bathrooms}</span>
        </div>
        <div className="flex items-center gap-1">
          <Car className="w-4 h-4" />
          <span>{property.carSpaces}</span>
        </div>
        <div className="flex items-center gap-1">
          <Maximize className="w-4 h-4" />
          <span>{property.sqm}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-16 mt-8">
        <button
          onClick={onNope}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 8L8 24L24 40L40 24L24 8Z"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              />
              <path
                d="M24 16L16 24L24 32"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-primary"
              />
            </svg>
          </div>
          <span className="text-sm">Nope</span>
        </button>

        <button
          onClick={onYup}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 flex items-center justify-center">
            <Home className="w-12 h-12 text-accent" strokeWidth={1.5} />
          </div>
          <span className="text-sm text-accent">Yup!</span>
        </button>
      </div>

      {/* Report Link */}
      <button className="text-sm text-muted-foreground hover:text-foreground mt-6 underline">
        Report this listing
      </button>
    </div>
  );
}
