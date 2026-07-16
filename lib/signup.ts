import { supabase } from "@/lib/supabase"
import type { BuyerCriteria } from "@/components/buyer-criteria-screen"

export interface SignupCredentials {
  email: string
  password: string
}

export interface SignupProfileData {
  firstName: string
  lastName: string
  address: string
  ownsHome: boolean
  regionSuburb: string
  minBedrooms: string
  minBathrooms: string
  minCarBays: string
  minSqm2: string
  costLow: number
  costHigh: number
  propertyTypes: string[]
  landSizeLow: number
  landSizeHigh: number
  features: string[]
}

function parseMin(val: string) {
  const num = parseInt(val.replace(/\D/g, ""), 10)
  return Number.isNaN(num) ? 0 : num
}

export async function completeSignup(
  credentials: SignupCredentials,
  profile: SignupProfileData
) {
  const fullName = `${profile.firstName.trim()} ${profile.lastName.trim()}`

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password.trim(),
    options: {
      data: {
        full_name: fullName,
        address: profile.address.trim() || null,
        owns_home: profile.ownsHome,
        region_suburb: profile.regionSuburb.trim() || null,
        min_bedrooms: profile.minBedrooms.trim() || null,
        min_bathrooms: profile.minBathrooms.trim() || null,
        min_car_bays: profile.minCarBays.trim() || null,
        min_sqm2: profile.minSqm2.trim() || null,
        cost_low: profile.costLow,
        cost_high: profile.costHigh,
        property_types: profile.propertyTypes,
        land_size_low: profile.landSizeLow,
        land_size_high: profile.landSizeHigh,
        features: profile.features,
      },
    },
  })

  if (error) {
    return { error }
  }

  if (data.user) {
    const userId = data.user.id
    const criteria: BuyerCriteria = {
      suburbs: profile.regionSuburb.trim() ? [profile.regionSuburb.trim()] : [],
      minPrice: profile.costLow,
      maxPrice: profile.costHigh,
      minBeds: parseMin(profile.minBedrooms),
      minBaths: parseMin(profile.minBathrooms),
      minParking: parseMin(profile.minCarBays),
      minSqm: parseMin(profile.minSqm2),
      minLandSize: profile.landSizeLow,
      maxLandSize: profile.landSizeHigh,
      propertyTypes: profile.propertyTypes as BuyerCriteria["propertyTypes"],
      features: profile.features,
    }

    try {
      await Promise.all([
        supabase.from("profiles").upsert(
          {
            id: userId,
            full_name: fullName,
            address: profile.address.trim() || null,
            owns_home: profile.ownsHome,
          },
          { onConflict: "id" }
        ),
        supabase.from("buyer_criteria").upsert(
          {
            user_id: userId,
            suburbs: criteria.suburbs,
            min_price: criteria.minPrice,
            max_price: criteria.maxPrice,
            min_beds: criteria.minBeds,
            min_baths: criteria.minBaths,
            min_parking: criteria.minParking,
            min_sqm: criteria.minSqm,
            min_land_size: criteria.minLandSize,
            max_land_size: criteria.maxLandSize,
            property_types: criteria.propertyTypes,
            features: criteria.features,
          },
          { onConflict: "user_id" }
        ),
      ])
    } catch (syncError) {
      console.warn("Signup post-sync failed:", syncError)
    }
  }

  return { data, error: null }
}
