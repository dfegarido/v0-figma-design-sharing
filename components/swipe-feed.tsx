"use client"

import { useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { SwipeCard } from "./swipe-card"
import { PropertyCard, type Property } from "./property-card"
import { SwipeActions } from "./swipe-actions"
import { MatchModal } from "./match-modal"
import { FilterSheet, type FilterValues } from "./filter-sheet"
import { Home, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

// Sample properties data
const sampleProperties: Property[] = [
  {
    id: "1",
    images: ["/houses/house-1.jpg", "/houses/house-2.jpg"],
    location: "123 Ocean Drive, Bondi Beach",
    suburb: "Bondi Beach",
    price: 2500000,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    sqm: 320,
    ownerName: "Sarah Mitchell",
  },
  {
    id: "2",
    images: ["/houses/house-2.jpg", "/houses/house-3.jpg"],
    location: "45 Maple Street, Paddington",
    suburb: "Paddington",
    price: 1800000,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    sqm: 180,
    ownerName: "James Wilson",
  },
  {
    id: "3",
    images: ["/houses/house-3.jpg", "/houses/house-4.jpg"],
    location: "789 Harbour View, Darling Point",
    suburb: "Darling Point",
    price: 4200000,
    bedrooms: 5,
    bathrooms: 4,
    parking: 3,
    sqm: 450,
    ownerName: "Emma Thompson",
  },
  {
    id: "4",
    images: ["/houses/house-4.jpg", "/houses/house-5.jpg"],
    location: "12 Garden Lane, Mosman",
    suburb: "Mosman",
    price: 3100000,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    sqm: 380,
    ownerName: "Michael Chen",
  },
  {
    id: "5",
    images: ["/houses/house-5.jpg", "/houses/house-6.jpg"],
    location: "56 Sunset Boulevard, Manly",
    suburb: "Manly",
    price: 2200000,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    sqm: 250,
    ownerName: "Lisa Anderson",
  },
  {
    id: "6",
    images: ["/houses/house-6.jpg", "/houses/house-1.jpg"],
    location: "88 Palm Avenue, Double Bay",
    suburb: "Double Bay",
    price: 5500000,
    bedrooms: 6,
    bathrooms: 5,
    parking: 4,
    sqm: 550,
    ownerName: "Robert Taylor",
  },
]

// User's property for matching
const userProperty: Property = {
  id: "user",
  images: ["/houses/house-3.jpg"],
  location: "22 Rose Street, Surry Hills",
  suburb: "Surry Hills",
  price: 1500000,
  bedrooms: 2,
  bathrooms: 1,
  parking: 1,
  sqm: 120,
  ownerName: "You",
}

interface SwipeFeedProps {
  onNavigate?: (screen: string) => void
}

export function SwipeFeed({ onNavigate }: SwipeFeedProps) {
  const [properties, setProperties] = useState<Property[]>(sampleProperties)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState<{ property: Property; action: string }[]>([])
  const [showMatch, setShowMatch] = useState(false)
  const [matchedProperty, setMatchedProperty] = useState<Property | null>(null)
  const [filters, setFilters] = useState<FilterValues>({
    suburb: "",
    minPrice: 0,
    maxPrice: 5000000,
    minBeds: 0,
    minBaths: 0,
    minParking: 0,
  })

  const currentProperty = properties[currentIndex]
  const remainingCards = properties.length - currentIndex

  const handleSwipe = useCallback((direction: "left" | "right" | "up") => {
    if (!currentProperty) return

    setHistory((prev) => [...prev, { property: currentProperty, action: direction }])

    // 30% chance of match on right swipe or super like
    if ((direction === "right" || direction === "up") && Math.random() < 0.3) {
      setMatchedProperty(currentProperty)
      setShowMatch(true)
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 300)
  }, [currentProperty])

  const handleUndo = useCallback(() => {
    if (history.length === 0 || currentIndex === 0) return
    setHistory((prev) => prev.slice(0, -1))
    setCurrentIndex((prev) => prev - 1)
  }, [history.length, currentIndex])

  const handleReset = () => {
    setProperties(sampleProperties)
    setCurrentIndex(0)
    setHistory([])
  }

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    const filtered = sampleProperties.filter((p) => {
      if (newFilters.suburb && !p.suburb.toLowerCase().includes(newFilters.suburb.toLowerCase())) return false
      if (p.price < newFilters.minPrice || p.price > newFilters.maxPrice) return false
      if (p.bedrooms < newFilters.minBeds) return false
      if (p.bathrooms < newFilters.minBaths) return false
      if (p.parking < newFilters.minParking) return false
      return true
    })
    setProperties(filtered)
    setCurrentIndex(0)
    setHistory([])
  }

  const handleResetFilters = () => {
    setFilters({
      suburb: "",
      minPrice: 0,
      maxPrice: 5000000,
      minBeds: 0,
      minBaths: 0,
      minParking: 0,
    })
    setProperties(sampleProperties)
    setCurrentIndex(0)
    setHistory([])
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header with filter */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {remainingCards} {remainingCards === 1 ? "home" : "homes"} left
          </span>
        </div>
        <FilterSheet
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Cards stack */}
      <div className="flex-1 min-h-0 relative px-4">
        {remainingCards > 0 ? (
          <div className="relative h-full w-full">
            <AnimatePresence mode="popLayout">
              {properties.slice(currentIndex, currentIndex + 3).map((property, index) => (
                <SwipeCard
                  key={property.id}
                  index={index}
                  onSwipeLeft={index === 0 ? () => handleSwipe("left") : undefined}
                  onSwipeRight={index === 0 ? () => handleSwipe("right") : undefined}
                  onSwipeUp={index === 0 ? () => handleSwipe("up") : undefined}
                >
                  <PropertyCard property={property} />
                </SwipeCard>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Home className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No more homes</h3>
            <p className="text-muted-foreground mb-6">
              {"You've seen all the homes in your area. Try adjusting your filters or check back later."}
            </p>
            <Button onClick={handleReset} className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {remainingCards > 0 && (
        <div className="flex-shrink-0 px-4 pb-4">
          <SwipeActions
            onNope={() => handleSwipe("left")}
            onLike={() => handleSwipe("right")}
            onSuperLike={() => handleSwipe("up")}
            onUndo={handleUndo}
            canUndo={history.length > 0}
          />
        </div>
      )}

      {/* Match modal */}
      {matchedProperty && (
        <MatchModal
          isOpen={showMatch}
          onClose={() => setShowMatch(false)}
          onMessage={() => {
            setShowMatch(false)
            onNavigate?.("messages")
          }}
          yourProperty={userProperty}
          matchedProperty={matchedProperty}
        />
      )}
    </div>
  )
}
