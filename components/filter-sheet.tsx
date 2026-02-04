"use client"

import { useState, useEffect } from "react"
import { SlidersHorizontal, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"

export interface FilterValues {
  suburb: string
  minPrice: number
  maxPrice: number
  minBeds: number
  minBaths: number
  minParking: number
}

interface FilterSheetProps {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  onReset: () => void
}

const defaultFilters: FilterValues = {
  suburb: "",
  minPrice: 0,
  maxPrice: 5000000,
  minBeds: 0,
  minBaths: 0,
  minParking: 0,
}

const bedOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
]

const bathOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
]

const parkingOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
]

export function FilterSheet({ filters, onFiltersChange, onReset }: FilterSheetProps) {
  const [open, setOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleApply = () => {
    onFiltersChange(localFilters)
    setOpen(false)
  }

  const handleReset = () => {
    setLocalFilters(defaultFilters)
    onReset()
    setOpen(false)
  }

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${(value / 1000).toFixed(0)}K`
  }

  const hasActiveFilters =
    filters.suburb !== "" ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000000 ||
    filters.minBeds > 0 ||
    filters.minBaths > 0 ||
    filters.minParking > 0

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative rounded-full bg-card border-border hover:bg-secondary"
      >
        <SlidersHorizontal className="h-5 w-5" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
        )}
      </Button>

      {/* Filter Panel - fixed overlay constrained to viewport */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setOpen(false)}
              style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto", zIndex: 9998 }}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border max-h-[85%] flex flex-col"
              style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto", zIndex: 9999 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Filter Properties</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Location */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter suburb or city..."
                      value={localFilters.suburb}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, suburb: e.target.value })
                      }
                      className="pl-10 rounded-xl bg-input border-border"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(localFilters.minPrice)} - {formatPrice(localFilters.maxPrice)}
                    </span>
                  </div>
                  <Slider
                    value={[localFilters.minPrice, localFilters.maxPrice]}
                    min={0}
                    max={5000000}
                    step={50000}
                    onValueChange={([min, max]) =>
                      setLocalFilters({ ...localFilters, minPrice: min, maxPrice: max })
                    }
                    className="py-2"
                  />
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Minimum Bedrooms</Label>
                  <div className="flex flex-wrap gap-2">
                    {bedOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={localFilters.minBeds === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLocalFilters({ ...localFilters, minBeds: option.value })}
                        className="rounded-full min-w-12 bg-transparent"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Minimum Bathrooms</Label>
                  <div className="flex flex-wrap gap-2">
                    {bathOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={localFilters.minBaths === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLocalFilters({ ...localFilters, minBaths: option.value })}
                        className="rounded-full min-w-12 bg-transparent"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Parking */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Minimum Parking</Label>
                  <div className="flex flex-wrap gap-2">
                    {parkingOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={localFilters.minParking === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLocalFilters({ ...localFilters, minParking: option.value })}
                        className="rounded-full min-w-12 bg-transparent"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-4 border-t border-border bg-card">
                <Button
                  onClick={handleApply}
                  className="w-full rounded-xl h-12 text-base font-medium"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
