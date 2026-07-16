"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useUserData } from "@/context/user-data-context"

interface SearchResult {
  id: string
  image: string
  address: string
  city: string
  price: number
  beds: number
  baths: number
  sqft: number
  tags: string[]
}

const sampleResults: SearchResult[] = [
  {
    id: "1",
    image: "/houses/house-1.jpg",
    address: "42 Maple Grove Drive",
    city: "San Francisco, CA",
    price: 2500000,
    beds: 4,
    baths: 3,
    sqft: 3200,
    tags: ["Modern", "Pool"],
  },
  {
    id: "2",
    image: "/houses/house-3.jpg",
    address: "1200 Skyline Tower",
    city: "Seattle, WA",
    price: 1200000,
    beds: 2,
    baths: 2,
    sqft: 1400,
    tags: ["City Views", "Gym"],
  },
  {
    id: "3",
    image: "/houses/house-4.jpg",
    address: "15 Costa del Sol Ave",
    city: "Miami, FL",
    price: 3200000,
    beds: 5,
    baths: 4,
    sqft: 4500,
    tags: ["Pool", "Ocean View"],
  },
  {
    id: "4",
    image: "/houses/house-6.jpg",
    address: "99 Ocean Breeze Way",
    city: "San Diego, CA",
    price: 4500000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    tags: ["Beachfront", "Modern"],
  },
]

export function SearchScreen() {
  const { isPremium } = useUserData()
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([500000, 5000000])
  const [bedsFilter, setBedsFilter] = useState<number | null>(null)
  const [likedHouses, setLikedHouses] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }

  const toggleLike = (id: string) => {
    setLikedHouses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const filteredResults = sampleResults.filter((house) => {
    const matchesSearch =
      house.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = !isPremium
      ? true
      : house.price >= priceRange[0] && house.price <= priceRange[1]
    const matchesBeds = !isPremium
      ? true
      : bedsFilter === null || house.beds >= bedsFilter
    return matchesSearch && matchesPrice && matchesBeds
  })

  return (
    <div className="h-full overflow-auto pb-4 relative">
      {/* Search header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 rounded-xl bg-secondary border-0"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl border-border bg-transparent"
            onClick={() => {
              if (!isPremium) {
                toast.message("Filters are a Premium feature.")
                return
              }
              setShowFilters(true)
            }}
            disabled={!isPremium}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick filters */}
        {isPremium && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {["Pool", "Modern", "Ocean View", "Garden", "City Views"].map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-secondary whitespace-nowrap"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && isPremium && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
              style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto", zIndex: 9998 }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border"
              style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto", zIndex: 9999 }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-4 pb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-6 px-4 pb-6">
                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={100000}
                    max={10000000}
                    step={100000}
                    className="py-4"
                  />
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <Label>Bedrooms</Label>
                  <div className="flex gap-2">
                    {[null, 1, 2, 3, 4, 5].map((beds) => (
                      <Button
                        key={beds ?? "any"}
                        variant={bedsFilter === beds ? "default" : "outline"}
                        size="sm"
                        className="flex-1 rounded-xl bg-transparent"
                        onClick={() => setBedsFilter(beds)}
                      >
                        {beds === null ? "Any" : `${beds}+`}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-12 rounded-xl" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredResults.length} homes found
        </p>
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {filteredResults.map((house, index) => (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={house.image || "/placeholder.svg"}
                    alt={house.address}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => toggleLike(house.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedHouses.has(house.id)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  <Badge className="absolute bottom-2 left-2 bg-card/90 text-foreground font-bold">
                    {formatPrice(house.price)}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-semibold text-foreground text-sm truncate mb-1">
                    {house.address}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {house.city}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Bed className="w-3 h-3" />
                      {house.beds}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Bath className="w-3 h-3" />
                      {house.baths}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Square className="w-3 h-3" />
                      {house.sqft.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
