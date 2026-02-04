"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Camera, X, Upload, Home, DollarSign, MapPin, Bed, Bath, Square, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AddListingFormProps {
  onSuccess?: () => void
}

const propertyTags = [
  "Modern", "Vintage", "Pool", "Garden", "Smart Home", "Renovated",
  "Ocean View", "Mountain View", "City View", "Quiet Street", "Gated",
  "Garage", "Fireplace", "Hardwood Floors", "Open Concept", "Pet Friendly"
]

const lookingForOptions = [
  "Larger family home",
  "Smaller home to downsize",
  "Urban apartment",
  "Suburban house",
  "Countryside retreat",
  "Beachfront property",
  "Mountain cabin",
  "Condo for retirement",
]

export function AddListingForm({ onSuccess }: AddListingFormProps) {
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    lookingFor: "",
    description: "",
  })

  const handleImageUpload = () => {
    // Simulate image upload - in real app would use file input
    const placeholderImages = [
      "/houses/house-1.jpg",
      "/houses/house-2.jpg",
      "/houses/house-3.jpg",
    ]
    if (images.length < 6) {
      setImages([...images, placeholderImages[images.length % 3]])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    onSuccess?.()
  }

  const isStep1Valid = images.length >= 1
  const isStep2Valid = formData.address && formData.city && formData.price
  const isStep3Valid = formData.beds && formData.baths && formData.sqft && formData.lookingFor

  return (
    <div className="h-full overflow-auto pb-6">
      {/* Progress indicator */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-foreground">List Your Home</h2>
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Photos */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Add Photos</h3>
                <p className="text-muted-foreground text-sm">
                  Add at least 1 photo of your home. Great photos get 3x more matches!
                </p>
              </div>

              {/* Image grid */}
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
                    <img src={img || "/placeholder.svg"} alt={`Home ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 bg-primary text-xs">Main</Badge>
                    )}
                  </div>
                ))}
                {images.length < 6 && (
                  <button
                    onClick={handleImageUpload}
                    className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-medium">Add Photo</span>
                  </button>
                )}
              </div>

              {/* Tips */}
              <div className="bg-secondary/50 rounded-2xl p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Photo Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Use natural lighting</li>
                  <li>Show the exterior and key rooms</li>
                  <li>Declutter before shooting</li>
                </ul>
              </div>

              <Button
                className="w-full h-14 rounded-2xl text-lg font-semibold"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Property Details</h3>
                <p className="text-muted-foreground text-sm">
                  Tell potential swappers about your home
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    City, State
                  </Label>
                  <Input
                    id="city"
                    placeholder="San Francisco, CA"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Estimated Value
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="1,000,000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl bg-transparent"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-14 rounded-2xl text-lg font-semibold"
                  disabled={!isStep2Valid}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Details & Preferences */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">More Details</h3>
                <p className="text-muted-foreground text-sm">
                  Help us find your perfect match
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="beds" className="flex items-center gap-1 text-xs">
                    <Bed className="w-3 h-3" />
                    Beds
                  </Label>
                  <Select
                    value={formData.beds}
                    onValueChange={(v) => setFormData({ ...formData, beds: v })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baths" className="flex items-center gap-1 text-xs">
                    <Bath className="w-3 h-3" />
                    Baths
                  </Label>
                  <Select
                    value={formData.baths}
                    onValueChange={(v) => setFormData({ ...formData, baths: v })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sqft" className="flex items-center gap-1 text-xs">
                    <Square className="w-3 h-3" />
                    Sqft
                  </Label>
                  <Input
                    id="sqft"
                    type="number"
                    placeholder="2000"
                    value={formData.sqft}
                    onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* What you're looking for */}
              <div className="space-y-2">
                <Label>{"What you're looking for"}</Label>
                <Select
                  value={formData.lookingFor}
                  onValueChange={(v) => setFormData({ ...formData, lookingFor: v })}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lookingForOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label>Property Features (up to 5)</Label>
                <div className="flex flex-wrap gap-2">
                  {propertyTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell potential swappers what makes your home special..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-24 rounded-xl resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl bg-transparent"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-14 rounded-2xl text-lg font-semibold"
                  disabled={!isStep3Valid || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Upload className="w-5 h-5 animate-pulse" />
                      Listing...
                    </span>
                  ) : (
                    "List My Home"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
