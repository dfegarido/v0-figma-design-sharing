"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Check } from "lucide-react"
import { motion } from "framer-motion"
import type { PropertyType } from "./property-card"

export interface BuyerCriteria {
  suburbs: string[]
  minPrice: number
  maxPrice: number
  minBeds: number
  minBaths: number
  minParking: number
  minSqm: number
  minLandSize: number
  maxLandSize: number
  propertyTypes: PropertyType[]
  features: string[]
}

export const defaultBuyerCriteria: BuyerCriteria = {
  suburbs: [],
  minPrice: 0,
  maxPrice: 5000000,
  minBeds: 0,
  minBaths: 0,
  minParking: 0,
  minSqm: 0,
  minLandSize: 0,
  maxLandSize: 2000,
  propertyTypes: [],
  features: [],
}

interface BuyerCriteriaScreenProps {
  onBack: () => void
  criteria: BuyerCriteria
  onSave: (criteria: BuyerCriteria) => void | Promise<void>
}

const propertyTypeOptions: PropertyType[] = ["House", "Apartment", "Townhouse", "Unit", "Land"]

const featureOptions = [
  "Pool",
  "Garden",
  "Ocean View",
  "Harbour View",
  "City View",
  "Mountain View",
  "Granny Flat",
  "Garage",
  "Solar Panels",
  "Renovated",
  "Heritage",
  "Smart Home",
  "Fireplace",
  "Pet Friendly",
  "Quiet Street",
  "Gated",
  "Courtyard",
  "City Fringe",
  "Close to Schools",
  "Balcony",
  "Beachside",
  "Close to Transport",
  "Investment",
  "Rooftop Terrace",
  "Home Theatre",
  "Wine Cellar",
  "Tennis Court",
  "Verandah",
  "Close to Parks",
  "Close to Shops",
  "Energy Efficient",
  "Low Maintenance",
  "Concierge",
  "Gym",
  "Valet Parking",
]

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
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
]

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${value}`
}

export function BuyerCriteriaScreen({ onBack, criteria, onSave }: BuyerCriteriaScreenProps) {
  const [local, setLocal] = useState<BuyerCriteria>(criteria)
  const [suburbInput, setSuburbInput] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocal(criteria)
    setSuburbInput(criteria.suburbs.join(", "))
  }, [criteria])

  const setSuburbs = (value: string) => {
    setSuburbInput(value)
    const suburbs = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    setLocal((prev) => ({ ...prev, suburbs }))
  }

  const setMinSqm = (value: string) => {
    const num = value === "" ? 0 : Number(value)
    setLocal((prev) => ({
      ...prev,
      minSqm: isNaN(num) ? prev.minSqm : num,
    }))
  }

  const togglePropertyType = (type: PropertyType) => {
    setLocal((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }))
  }

  const toggleFeature = (feature: string) => {
    setLocal((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(local)
      onBack()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">My Criteria</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
        {/* Property Type */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Label className="text-base font-semibold">Property Type</Label>
          <div className="flex flex-wrap gap-2">
            {propertyTypeOptions.map((type) => (
              <Button
                key={type}
                variant={local.propertyTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => togglePropertyType(type)}
                className="rounded-full"
              >
                {local.propertyTypes.includes(type) && <Check className="h-3 w-3 mr-1" />}
                {type}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Location */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-3">
          <Label className="text-base font-semibold">Location</Label>
          <Input
            placeholder="Enter suburbs (comma separated)"
            value={suburbInput}
            onChange={(e) => setSuburbs(e.target.value)}
          />
        </motion.div>

        {/* Price Range */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <Label className="text-base font-semibold">Price Range</Label>
          <Slider
            value={[local.minPrice, local.maxPrice]}
            min={0}
            max={5000000}
            step={50000}
            onValueChange={([min, max]) => setLocal({ ...local, minPrice: min, maxPrice: max })}
            className="py-2"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(local.minPrice)}</span>
            <span>{formatCurrency(local.maxPrice)}</span>
          </div>
        </motion.div>

        {/* Bedrooms */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          <Label className="text-base font-semibold">Bedrooms</Label>
          <div className="flex flex-wrap gap-2">
            {bedOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={local.minBeds === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setLocal((prev) => ({ ...prev, minBeds: opt.value }))}
                className="rounded-full min-w-14"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Bathrooms */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <Label className="text-base font-semibold">Bathrooms</Label>
          <div className="flex flex-wrap gap-2">
            {bathOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={local.minBaths === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setLocal((prev) => ({ ...prev, minBaths: opt.value }))}
                className="rounded-full min-w-14"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Parking */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
          <Label className="text-base font-semibold">Parking</Label>
          <div className="flex flex-wrap gap-2">
            {parkingOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={local.minParking === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setLocal((prev) => ({ ...prev, minParking: opt.value }))}
                className="rounded-full min-w-14"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Internal Size */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <Label className="text-base font-semibold">Internal Size (m²)</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={local.minSqm === 0 ? "" : local.minSqm.toString()}
            onChange={(e) => setMinSqm(e.target.value)}
          />
        </motion.div>

        {/* Land Size */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-4">
          <Label className="text-base font-semibold">Land Size (m²)</Label>
          <Slider
            value={[local.minLandSize, local.maxLandSize]}
            min={0}
            max={2000}
            step={50}
            onValueChange={([min, max]) => setLocal({ ...local, minLandSize: min, maxLandSize: max })}
            className="py-2"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{local.minLandSize} m²</span>
            <span>{local.maxLandSize} m²</span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <Label className="text-base font-semibold">Must-Have Features</Label>
          <div className="flex flex-wrap gap-2">
            {featureOptions.map((feature) => (
              <Badge
                key={feature}
                variant={local.features.includes(feature) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  local.features.includes(feature)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-secondary"
                }`}
                onClick={() => toggleFeature(feature)}
              >
                {local.features.includes(feature) && <Check className="h-3 w-3 mr-1" />}
                {feature}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="flex-shrink-0 p-4 border-t border-border">
        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-12 text-base font-medium">
          {saving ? "Saving..." : "Save Criteria"}
        </Button>
      </div>
    </div>
  )
}
