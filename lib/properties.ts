import { supabase } from "@/lib/supabase"

export const PROPERTY_TYPE_OPTIONS: PropertyType[] = [
  "House",
  "Apartment",
  "Townhouse",
  "Unit",
  "Land",
]

export type PropertyType = "House" | "Apartment" | "Townhouse" | "Unit" | "Land"

export const FEATURE_OPTIONS = [
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

export interface PropertyImage {
  id: string
  url: string
  sort_order: number
}

export interface Property {
  id: string
  owner_id: string
  address: string
  suburb: string
  state: string | null
  price: number
  property_type: string
  bedrooms: number
  bathrooms: number
  parking: number
  sqm: number | null
  land_size: number
  description: string | null
  special_conditions: string | null
  tags: string[]
  verified: boolean
  status: string
  created_at: string
  property_images: PropertyImage[]
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

export interface UpdatePropertyInput {
  address: string
  suburb: string
  state?: string
  price: number
  property_type: string
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  sqm: number | null
  land_size: number | null
  description: string | null
  special_conditions: string | null
  tags: string[]
  status: string
}

export interface ExistingPropertyImage {
  id: string
  url: string
  sort_order: number
}

export async function fetchPropertyById(propertyId: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      owner_id,
      address,
      suburb,
      state,
      price,
      property_type,
      bedrooms,
      bathrooms,
      parking,
      sqm,
      land_size,
      description,
      special_conditions,
      tags,
      verified,
      status,
      created_at,
      property_images(id, url, sort_order),
      profiles(full_name, avatar_url)
    `
    )
    .eq("id", propertyId)
    .single()

  if (error) {
    console.warn("fetchPropertyById error:", error)
    return null
  }

  return (data || null) as unknown as Property | null
}

export async function updateProperty(
  propertyId: string,
  input: UpdatePropertyInput,
  removedImageIds: string[],
  newImageFiles: File[] = []
): Promise<Property | null> {
  const { error: updateError } = await supabase
    .from("properties")
    .update({
      address: input.address.trim(),
      suburb: input.suburb.trim(),
      state: input.state?.trim() || null,
      price: input.price,
      property_type: input.property_type || null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      parking: input.parking,
      sqm: input.sqm,
      land_size: input.land_size,
      description: input.description?.trim() || null,
      special_conditions: input.special_conditions?.trim() || null,
      tags: input.tags,
      status: input.status,
    })
    .eq("id", propertyId)

  if (updateError) {
    throw updateError
  }

  if (removedImageIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("property_images")
      .delete()
      .in("id", removedImageIds)
    if (deleteError) {
      console.warn("Failed to delete removed images:", deleteError)
    }
  }

  if (newImageFiles.length > 0) {
    const existing = await supabase
      .from("property_images")
      .select("id, sort_order")
      .eq("property_id", propertyId)

    const maxSort =
      (existing.data || []).reduce((max, img) => Math.max(max, img.sort_order), -1) + 1

    const urls = await uploadPropertyImages(propertyId, newImageFiles)
    if (urls.length > 0) {
      const { error: insertError } = await supabase.from("property_images").insert(
        urls.map((url, index) => ({
          property_id: propertyId,
          url,
          sort_order: maxSort + index,
        }))
      )
      if (insertError) {
        console.warn("Failed to insert new images:", insertError)
      }
    }
  }

  return fetchPropertyById(propertyId)
}

export async function deletePropertyImage(imageId: string): Promise<void> {
  const { error } = await supabase.from("property_images").delete().eq("id", imageId)
  if (error) throw error
}

export async function deleteProperty(propertyId: string): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", propertyId)
  if (error) throw error
}

export async function fetchLatestVerificationStatus(
  propertyId: string
): Promise<"pending" | "approved" | "rejected" | null> {
  const { data, error } = await supabase
    .from("verifications")
    .select("status")
    .eq("property_id", propertyId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  const status = data?.status
  if (status === "pending" || status === "approved" || status === "rejected") return status
  return null
}

export async function fetchVerifiedPropertyCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("properties")
    .select("id, verified")
    .eq("owner_id", userId)

  if (error) {
    console.warn("fetchVerifiedPropertyCount error:", error)
    return 0
  }

  return (data || []).filter((p) => p.verified).length
}

export async function fetchActiveProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      owner_id,
      address,
      suburb,
      state,
      price,
      property_type,
      bedrooms,
      bathrooms,
      parking,
      sqm,
      land_size,
      description,
      special_conditions,
      tags,
      verified,
      status,
      created_at,
      property_images(id, url, sort_order),
      profiles(full_name, avatar_url)
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data || []) as unknown as Property[]
}

export async function fetchPropertiesForOwner(ownerId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      owner_id,
      address,
      suburb,
      state,
      price,
      property_type,
      bedrooms,
      bathrooms,
      parking,
      sqm,
      land_size,
      description,
      special_conditions,
      tags,
      verified,
      status,
      created_at,
      property_images(id, url, sort_order)
    `
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data || []) as unknown as Property[]
}

export async function insertProperty(
  ownerId: string,
  input: UpdatePropertyInput,
  imageFiles: File[] = []
): Promise<Property> {
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({
      owner_id: ownerId,
      address: input.address,
      suburb: input.suburb,
      state: input.state || null,
      price: input.price,
      property_type: input.property_type,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      parking: input.parking ?? 0,
      sqm: input.sqm ?? null,
      land_size: input.land_size ?? 0,
      description: input.description || null,
      special_conditions: input.special_conditions || null,
      tags: input.tags || [],
      status: "pending",
    })
    .select()
    .single()

  if (propertyError || !property) {
    throw propertyError || new Error("Failed to create property")
  }

  const uploadedUrls = await uploadPropertyImages(property.id, imageFiles)

  return {
    ...(property as unknown as Property),
    property_images: uploadedUrls.map((url, index) => ({
      id: "",
      url,
      sort_order: index,
    })),
    profiles: null,
  }
}

export async function uploadPropertyImages(propertyId: string, files: File[]): Promise<string[]> {
  if (files.length === 0) return []

  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = `properties/${propertyId}/${Date.now()}-${i}.${file.name.split(".").pop() || "jpg"}`
    const { error: uploadError } = await supabase.storage.from("property-images").upload(path, file)

    if (uploadError) {
      console.warn("Image upload failed:", uploadError)
      continue
    }

    const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path)
    if (urlData?.publicUrl) {
      urls.push(urlData.publicUrl)
    }
  }

  if (urls.length > 0) {
    const { error: imageInsertError } = await supabase.from("property_images").insert(
      urls.map((url, index) => ({
        property_id: propertyId,
        url,
        sort_order: index,
      }))
    )

    if (imageInsertError) {
      console.warn("Failed to save image rows:", imageInsertError)
    }
  }

  return urls
}

export async function recordSwipe(
  swiperId: string,
  swipedPropertyId: string,
  direction: "left" | "right" | "up"
): Promise<void> {
  const { error } = await supabase.from("swipes").upsert(
    {
      swiper_id: swiperId,
      swiped_property_id: swipedPropertyId,
      direction,
    },
    { onConflict: "swiper_id, swiped_property_id" }
  )

  if (error) throw error
}

export async function deleteSwipe(swiperId: string, swipedPropertyId: string): Promise<void> {
  const { error } = await supabase
    .from("swipes")
    .delete()
    .eq("swiper_id", swiperId)
    .eq("swiped_property_id", swipedPropertyId)

  if (error) throw error
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export async function fetchSearchProperties(userId: string) {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      owner_id,
      address,
      suburb,
      state,
      price,
      property_type,
      bedrooms,
      bathrooms,
      parking,
      sqm,
      land_size,
      description,
      special_conditions,
      tags,
      verified,
      status,
      created_at,
      property_images(id, url, sort_order),
      profiles(full_name, avatar_url)
    `
    )
    .eq("status", "active")
    .neq("owner_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return ((data || []) as unknown as Property[]).map(mapDbPropertyToUi)
}

export async function fetchDiscoverProperties(
  userId: string,
  limit = 16
): Promise<Property[]> {
  const { data: swipedData, error: swipesError } = await supabase
    .from("swipes")
    .select("swiped_property_id")
    .eq("swiper_id", userId)

  if (swipesError) {
    console.warn("fetchDiscoverProperties: failed to load swipes:", swipesError)
  }

  const swipedIds = (swipedData || [])
    .map((s: any) => s.swiped_property_id)
    .filter(Boolean)

  let query = supabase
    .from("properties")
    .select(
      `
      id,
      owner_id,
      address,
      suburb,
      state,
      price,
      property_type,
      bedrooms,
      bathrooms,
      parking,
      sqm,
      land_size,
      description,
      special_conditions,
      tags,
      verified,
      status,
      created_at,
      property_images(id, url, sort_order),
      profiles(full_name, avatar_url)
    `
    )
    .eq("status", "active")
    .neq("owner_id", userId)
    .order("created_at", { ascending: false })

  if (swipedIds.length > 0) {
    query = query.not("id", "in", `(${swipedIds.join(",")})`)
  }

  const { data, error } = await query

  if (error) throw error
  return shuffleArray((data || []) as unknown as Property[]).slice(0, limit)
}

export function mapDbPropertyToUi(db: Property): {
  id: string
  images: string[]
  location: string
  suburb: string
  price: number
  bedrooms: number
  bathrooms: number
  parking: number
  sqm: number
  landSize?: number
  propertyType?: "House" | "Apartment" | "Townhouse" | "Unit" | "Land"
  tags?: string[]
  specialConditions?: string
  verified?: boolean
  ownerName: string
  ownerImage?: string
  description?: string
} {
  const images = (db.property_images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url)
  return {
    id: db.id,
    images: images.length > 0 ? images : ["/placeholder.svg"],
    location: `${db.address}${db.state ? `, ${db.state}` : ""}`,
    suburb: db.suburb,
    price: db.price,
    bedrooms: db.bedrooms,
    bathrooms: db.bathrooms,
    parking: db.parking,
    sqm: db.sqm || 0,
    landSize: db.land_size,
    propertyType: db.property_type as "House" | "Apartment" | "Townhouse" | "Unit" | "Land",
    tags: db.tags,
    specialConditions: db.special_conditions || undefined,
    verified: db.verified,
    ownerName: db.profiles?.full_name || "Owner",
    ownerImage: db.profiles?.avatar_url || undefined,
    description: db.description || undefined,
  }
}
