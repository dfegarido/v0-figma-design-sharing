"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Camera,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Car,
  Ruler,
  Plus,
  X,
  Check,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { insertProperty } from "@/lib/properties"
import { supabase } from "@/lib/supabase"

interface AddPropertyScreenProps {
  onComplete?: () => void
}

export function AddPropertyScreen({ onComplete }: AddPropertyScreenProps) {
  const [images, setImages] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    address: "",
    suburb: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    parking: "",
    sqm: "",
    description: "",
  })
  const [step, setStep] = useState<"photos" | "details" | "preview">("photos")

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const remainingSlots = 6 - images.length
    const toAdd = selected.slice(0, remainingSlots)
    const newPreviews = toAdd.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...newPreviews])
    setFiles((prev) => [...prev, ...toAdd])

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    const url = images[index]
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
    setImages(images.filter((_, i) => i !== index))
    setFiles(files.filter((_, i) => i !== index))
  }

  React.useEffect(() => {
    return () => {
      images.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error("You must be signed in to list a property.")
      return
    }

    setIsSubmitting(true)
    try {
      await insertProperty(
        user.id,
        {
          address: formData.address,
          suburb: formData.suburb,
          price: Number(formData.price.replace(/\D/g, "")),
          property_type: "House",
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          parking: Number(formData.parking) || 0,
          sqm: Number(formData.sqm) || undefined,
          description: formData.description,
        },
        files
      )
      toast.success("Property listed successfully!")
      onComplete?.()
    } catch (error) {
      console.error("Failed to list property:", error)
      toast.error("Failed to list property. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ""))
    if (isNaN(num)) return ""
    return num.toLocaleString()
  }

  return (
    <div className="h-full overflow-auto pb-6 bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-4 border-b border-border z-10">
        <h2 className="text-xl font-bold text-foreground">List Your Property</h2>
        <p className="text-sm text-muted-foreground">
          Add photos and details to get started
        </p>
      </div>

      {/* Progress indicator */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          {["photos", "details", "preview"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : i < ["photos", "details", "preview"].indexOf(step)
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < ["photos", "details", "preview"].indexOf(step) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i < ["photos", "details", "preview"].indexOf(step)
                      ? "bg-accent"
                      : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Photos</span>
          <span>Details</span>
          <span>Preview</span>
        </div>
      </div>

      <div className="px-4">
        {/* Step 1: Photos */}
        {step === "photos" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="grid grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden bg-secondary"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Property ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-card/90 rounded-full flex items-center justify-center"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {images.length < 6 && (
                <button
                  onClick={handleImageUpload}
                  className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  type="button"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Add up to 6 photos. First photo will be the cover.
            </p>
            <Button
              className="w-full h-12 rounded-xl"
              onClick={() => setStep("details")}
              disabled={images.length === 0}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <div>
                <Label htmlFor="address" className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="suburb" className="flex items-center gap-2 mb-1.5">
                  <Home className="w-4 h-4 text-primary" />
                  Suburb
                </Label>
                <Input
                  id="suburb"
                  name="suburb"
                  placeholder="Bondi Beach"
                  value={formData.suburb}
                  onChange={handleInputChange}
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="price" className="flex items-center gap-2 mb-1.5">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Estimated Value
                </Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="1,500,000"
                  value={formatPrice(formData.price)}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value.replace(/\D/g, "") })
                  }
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bedrooms" className="flex items-center gap-2 mb-1.5">
                    <Bed className="w-4 h-4 text-primary" />
                    Bedrooms
                  </Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="3"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms" className="flex items-center gap-2 mb-1.5">
                    <Bath className="w-4 h-4 text-primary" />
                    Bathrooms
                  </Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="2"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="parking" className="flex items-center gap-2 mb-1.5">
                    <Car className="w-4 h-4 text-primary" />
                    Parking
                  </Label>
                  <Input
                    id="parking"
                    name="parking"
                    type="number"
                    placeholder="2"
                    value={formData.parking}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="sqm" className="flex items-center gap-2 mb-1.5">
                    <Ruler className="w-4 h-4 text-primary" />
                    Size (sqm)
                  </Label>
                  <Input
                    id="sqm"
                    name="sqm"
                    type="number"
                    placeholder="250"
                    value={formData.sqm}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="mb-1.5 block">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell potential swappers about your home..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="rounded-xl min-h-24"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl bg-transparent"
                onClick={() => setStep("photos")}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl"
                onClick={() => setStep("preview")}
                disabled={!formData.address || !formData.suburb || !formData.price}
              >
                Preview
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-card rounded-2xl overflow-hidden border border-border">
              {/* Cover image */}
              <div className="relative aspect-video">
                <Image
                  src={images[0] || "/placeholder.svg"}
                  alt="Property cover"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 right-3 flex gap-1">
                  {images.slice(1, 4).map((img, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-lg overflow-hidden border-2 border-card"
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Property ${i + 2}`}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  {images.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-card/90 flex items-center justify-center text-sm font-medium">
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{formData.address}</h3>
                    <p className="text-sm text-muted-foreground">{formData.suburb}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    ${parseInt(formData.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {formData.bedrooms} bed
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {formData.bathrooms} bath
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="w-4 h-4" />
                    {formData.parking}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    {formData.sqm}m²
                  </span>
                </div>
                {formData.description && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl bg-transparent"
                onClick={() => setStep("details")}
              >
                Edit
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                List Property
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
