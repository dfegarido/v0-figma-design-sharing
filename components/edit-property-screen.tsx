"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  Camera,
  X,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useUserData } from "@/context/user-data-context"
import {
  fetchPropertyById,
  fetchLatestVerificationStatus,
  fetchVerifiedPropertyCount,
  updateProperty,
  PROPERTY_TYPE_OPTIONS,
  FEATURE_OPTIONS,
  type PropertyType,
  type Property,
  type UpdatePropertyInput,
} from "@/lib/properties"

interface EditPropertyScreenProps {
  propertyId: string
  onBack: () => void
  onNavigate?: (screen: string, propertyId?: string) => void
}

type VerificationStatus = "unverified" | "pending" | "approved" | "rejected"

export function EditPropertyScreen({
  propertyId,
  onBack,
  onNavigate,
}: EditPropertyScreenProps) {
  const { isPremium } = useUserData()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])

  const [address, setAddress] = useState("")
  const [suburb, setSuburb] = useState("")
  const [stateValue, setStateValue] = useState("")
  const [price, setPrice] = useState("")
  const [propertyType, setPropertyType] = useState<PropertyType | "">("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [parking, setParking] = useState("")
  const [sqm, setSqm] = useState("")
  const [landSize, setLandSize] = useState("")
  const [description, setDescription] = useState("")
  const [specialConditions, setSpecialConditions] = useState("")
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unverified")
  const [verifiedPropertyCount, setVerifiedPropertyCount] = useState(0)

  const toggleFeature = useCallback((feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    )
  }, [])

  const parseNumber = (value: string) => {
    const num = value ? parseInt(value.replace(/\D/g, ""), 10) : NaN
    return isNaN(num) ? null : num
  }

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ""), 10)
    return isNaN(num) ? "" : num.toLocaleString()
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const property = await fetchPropertyById(propertyId)
        if (!property || cancelled) {
          if (!cancelled) {
            toast.error("Failed to load property.")
            onBack()
          }
          return
        }

        setAddress(property.address || "")
        setSuburb(property.suburb || "")
        setStateValue(property.state || "")
        setPrice(property.price ? property.price.toLocaleString() : "")
        setPropertyType((property.property_type as PropertyType) || "")
        setBedrooms(property.bedrooms !== null ? String(property.bedrooms) : "")
        setBathrooms(property.bathrooms !== null ? String(property.bathrooms) : "")
        setParking(property.parking !== null ? String(property.parking) : "")
        setSqm(property.sqm !== null ? String(property.sqm) : "")
        setLandSize(property.land_size !== null ? String(property.land_size) : "")
        setDescription(property.description || "")
        setSpecialConditions(property.special_conditions || "")
        setSelectedFeatures(property.tags || [])
        setIsActive(property.status !== "inactive")
        setExistingImages(
          (property.property_images || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img) => ({ id: img.id, url: img.url }))
        )

        const latest = await fetchLatestVerificationStatus(propertyId)
        setVerificationStatus(latest || (property.verified ? "approved" : "unverified"))

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const count = await fetchVerifiedPropertyCount(user.id)
          setVerifiedPropertyCount(count)
        }
      } catch (err) {
        console.error("Failed to load property:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [propertyId, onBack])

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file))
    setPhotoPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photos])

  const pickPhotos = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const remaining = 6 - existingImages.length - photos.length
    const toAdd = selected.slice(0, remaining)
    setPhotos((prev) => [...prev, ...toAdd])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
    setRemovedImageIds((prev) => [...prev, id])
  }

  const removeNewPhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!address.trim() || !suburb.trim() || !price.trim()) {
      toast.error("Address, suburb, and price are required.")
      return
    }

    setSaving(true)
    try {
      const input: UpdatePropertyInput = {
        address: address.trim(),
        suburb: suburb.trim(),
        state: stateValue.trim(),
        price: parseInt(price.replace(/\D/g, ""), 10),
        property_type: propertyType,
        bedrooms: parseNumber(bedrooms),
        bathrooms: parseNumber(bathrooms),
        parking: parseNumber(parking),
        sqm: parseNumber(sqm),
        land_size: parseNumber(landSize),
        description: description.trim() || null,
        special_conditions: specialConditions.trim() || null,
        tags: selectedFeatures,
        status: isActive ? "active" : "inactive",
      }

      await updateProperty(propertyId, input, removedImageIds, photos)
      toast.success("Property updated.")
      onBack()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update property."
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleVerificationPress = () => {
    if (
      !isPremium &&
      verifiedPropertyCount >= 1 &&
      verificationStatus !== "approved"
    ) {
      onNavigate?.("premium")
    } else {
      onNavigate?.("verification", propertyId)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center gap-3 px-4 py-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 space-y-6 px-4 py-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Edit Property</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-8 pb-8">
          {/* Photos */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Photos</h3>

            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative h-20 w-20">
                  <Image
                    src={img.url}
                    alt="Property"
                    fill
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photoPreviews.map((url, index) => (
                <div key={`new-${index}`} className="relative h-20 w-20">
                  <Image
                    src={url}
                    alt="New property"
                    fill
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeNewPhoto(index)}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={pickPhotos}
              type="button"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary text-sm font-medium text-muted-foreground"
            >
              <Camera className="h-4 w-4" />
              Add Photos
            </button>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Property Details</h3>

            <FormField label="Address *">
              <Input
                placeholder="Full property address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-lg"
              />
            </FormField>

            <FormField label="Suburb *">
              <Input
                placeholder="e.g. Manly"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                className="rounded-lg"
              />
            </FormField>

            <FormField label="State">
              <Input
                placeholder="e.g. NSW"
                maxLength={3}
                value={stateValue}
                onChange={(e) => setStateValue(e.target.value.toUpperCase())}
                className="rounded-lg"
              />
            </FormField>

            <FormField label="Price *">
              <Input
                placeholder="e.g. 1,500,000"
                value={price}
                onChange={(e) => setPrice(formatPrice(e.target.value))}
                className="rounded-lg"
              />
            </FormField>

            <FormField label="Property Type">
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      propertyType === type
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Bedrooms">
                <Input
                  placeholder="3"
                  maxLength={2}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value.replace(/\D/g, ""))}
                  className="rounded-lg"
                />
              </FormField>
              <FormField label="Bathrooms">
                <Input
                  placeholder="2"
                  maxLength={2}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value.replace(/\D/g, ""))}
                  className="rounded-lg"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Parking">
                <Input
                  placeholder="1"
                  maxLength={2}
                  value={parking}
                  onChange={(e) => setParking(e.target.value.replace(/\D/g, ""))}
                  className="rounded-lg"
                />
              </FormField>
              <FormField label="Sqm">
                <Input
                  placeholder="180"
                  maxLength={4}
                  value={sqm}
                  onChange={(e) => setSqm(e.target.value.replace(/\D/g, ""))}
                  className="rounded-lg"
                />
              </FormField>
            </div>

            <FormField label="Land Size">
              <Input
                placeholder="e.g. 500"
                maxLength={5}
                value={landSize}
                onChange={(e) => setLandSize(e.target.value.replace(/\D/g, ""))}
                className="rounded-lg"
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                placeholder="Tell buyers about your property..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] rounded-lg"
              />
            </FormField>

            <FormField label="Special Conditions">
              <Textarea
                placeholder="Any special conditions or notes..."
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                className="min-h-[64px] rounded-lg"
              />
            </FormField>

            <FormField label="Features">
              <div className="flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedFeatures.includes(feature)
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          {/* Verification */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Verification</h3>
            <VerificationStatusCard
              status={verificationStatus}
              onPress={handleVerificationPress}
            />
          </div>

          {/* Listing Status */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Listing Status</h3>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div className="flex-1 space-y-1 pr-4">
                <p className="font-semibold">{isActive ? "Active" : "Inactive"}</p>
                <p className="text-sm text-muted-foreground">
                  {isActive
                    ? "Your property is publicly visible and can be matched."
                    : "Your property is hidden from public view and matching."}
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                aria-label="Toggle property active status"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              className="w-full rounded-xl"
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              size="lg"
              onClick={onBack}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}

function VerificationStatusCard({
  status,
  onPress,
}: {
  status: VerificationStatus
  onPress: () => void
}) {
  const config = {
    approved: {
      icon: ShieldCheck,
      classes: "bg-accent/20 text-accent",
      title: "Verified",
      subtitle: "You can message matches for this property.",
      action: "View details",
    },
    pending: {
      icon: Clock,
      classes: "bg-primary/20 text-primary",
      title: "Pending review",
      subtitle: "Your document is under review. Chat will unlock once approved.",
      action: "View details",
    },
    rejected: {
      icon: ShieldAlert,
      classes: "bg-destructive/20 text-destructive",
      title: "Verification rejected",
      subtitle: "Upload a new document to unlock messaging.",
      action: "Upload new document",
    },
    unverified: {
      icon: ShieldAlert,
      classes: "bg-muted text-muted-foreground",
      title: "Not verified",
      subtitle: "Upload proof of ownership to unlock messaging for this property.",
      action: "Verify now",
    },
  }

  const safeStatus = config[status] ? status : "unverified"
  const { icon: Icon, classes, title, subtitle, action } = config[safeStatus]

  return (
    <button
      onClick={onPress}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${classes}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-1 text-xs font-semibold text-primary">{action}</p>
      </div>
    </button>
  )
}
