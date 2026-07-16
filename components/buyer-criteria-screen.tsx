"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, MapPin, X, Check } from "lucide-react"
import { motion } from "framer-motion"
import type { PropertyType } from "./property-card"

export interface BuyerCriteria {
  suburbs: string[]
  minPrice: number
  maxPrice: number
  minBeds: number
  minBaths: number
  minParking: number
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
  "Pool", "Garden", "Ocean View", "City View", "Mountain View",
  "Granny Flat", "Garage", "Solar Panels", "Renovated", "Heritage",
  "Smart Home", "Fireplace", "Pet Friendly", "Quiet Street", "Gated",
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
]

export function BuyerCriteriaScreen({ onBack, criteria, onSave }: BuyerCriteriaScreenProps) {
  const [local, setLocal] = useState<BuyerCriteria>(criteria)
  const [suburbInput, setSuburbInput] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocal(criteria)
  }, [criteria])

  const addSuburb = () => {
    const trimmed = suburbInput.trim()
    if (trimmed && !local.suburbs.includes(trimmed)) {
      setLocal({ ...local, suburbs: [...local.suburbs, trimmed] })
      setSuburbInput("")
    }
  }

  const removeSuburb = (suburb: string) => {
    setLocal({ ...local, suburbs: local.suburbs.filter((s) => s !== suburb) })
  }

  const togglePropertyType = (type: PropertyType) => {
    if (local.propertyTypes.includes(type)) {
      setLocal({ ...local, propertyTypes: local.propertyTypes.filter((t) => t !== type) })
    } else {
      setLocal({ ...local, propertyTypes: [...local.propertyTypes, type] })
    }
  }

  const toggleFeature = (feature: string) => {
    if (local.features.includes(feature)) {
      setLocal({ ...local, features: local.features.filter((f) => f !== feature) })
    } else {
      setLocal({ ...local, features: [...local.features, feature] })
    }
  }

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    return `$${(value / 1000).toFixed(0)}K`
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
        <Button variant="ghost" size="sm" onClick={() => setLocal(defaultBuyerCriteria)} className="text-muted-foreground">
          Reset
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
        {/* Preferred Suburbs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Label className="text-base font-semibold">Preferred Suburbs</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Add a suburb..."
                value={suburbInput}
                onChange={(e) => setSuburbInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSuburb()}
                className="pl-10 rounded-xl"
              />
            </div>
            <Button onClick={addSuburb} size="sm" className="rounded-xl px-4">Add</Button>
          </div>
          {local.suburbs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {local.suburbs.map((suburb) => (
                <Badge key={suburb} variant="secondary" className="gap-1 pl-3 pr-1.5 py-1.5">
                  {suburb}
                  <button onClick={() => removeSuburb(suburb)} className="ml-1 rounded-full hover:bg-foreground/10 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </motion.div>

        {/* Budget Range */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Budget Range</Label>
            <span className="text-sm text-muted-foreground">
              {formatPrice(local.minPrice)} - {formatPrice(local.maxPrice)}
            </span>
          </div>
          <Slider
            value={[local.minPrice, local.maxPrice]}
            min={0}
            max={5000000}
            step={50000}
            onValueChange={([min, max]) => setLocal({ ...local, minPrice: min, maxPrice: max })}
            className="py-2"
          />
        </motion.div>

        {/* Property Type */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <Label className="text-base font-semibold">Property Type</Label>
          <div className="flex flex-wrap gap-2">
            {propertyTypeOptions.map((type) => (
              <Button
                key={type}
                variant={local.propertyTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => togglePropertyType(type)}
                className="rounded-full bg-transparent"
              >
                {local.propertyTypes.includes(type) && <Check className="h-3 w-3 mr-1" />}
                {type}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Bedrooms */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          <Label className="text-base font-semibold">Minimum Bedrooms</Label>
          <div className="flex flex-wrap gap-2">
            {bedOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={local.minBeds === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setLocal({ ...local, minBeds: opt.value })}
                className="rounded-full min-w-12 bg-transparent"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Bathrooms */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <Label className="text-base font-semibold">Minimum Bathrooms</Label>
          <div className="flex flex-wrap gap-2">
            {bathOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={local.minBaths === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setLocal({ ...local, minBaths: opt.value })}
                className="rounded-full min-w-12 bg-transparent"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Parking */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
          <Label className="text-base font-semibold">Minimum Parking</Label>
          <div className="flex flex-wrap gap-2">
            {parkingOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={local.minParking === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setLocal({ ...local, minParking: opt.value })}
                className="rounded-full min-w-12 bg-transparent"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Land Size */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Land Size</Label>
            <span className="text-sm text-muted-foreground">
              {local.minLandSize}m² - {local.maxLandSize}m²
            </span>
          </div>
          <Slider
            value={[local.minLandSize, local.maxLandSize]}
            min={0}
            max={2000}
            step={50}
            onValueChange={([min, max]) => setLocal({ ...local, minLandSize: min, maxLandSize: max })}
            className="py-2"
          />
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-3">
          <Label className="text-base font-semibold">Desired Features</Label>
          <div className="flex flex-wrap gap-2">
            {featureOptions.map((feature) => (
              <Badge
                key={feature}
                variant={local.features.includes(feature) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  local.features.includes(feature)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
                onClick={() => toggleFeature(feature)}
              >
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
