import { supabase } from "@/lib/supabase"
import type { BuyerCriteria } from "@/components/buyer-criteria-screen"
import { defaultBuyerCriteria } from "@/components/buyer-criteria-screen"

export function mapBuyerCriteriaRow(data: Record<string, unknown>): BuyerCriteria {
  return {
    suburbs: (data.suburbs as string[]) || [],
    minPrice: (data.min_price as number) ?? defaultBuyerCriteria.minPrice,
    maxPrice: (data.max_price as number) ?? defaultBuyerCriteria.maxPrice,
    minBeds: (data.min_beds as number) ?? 0,
    minBaths: (data.min_baths as number) ?? 0,
    minParking: (data.min_parking as number) ?? 0,
    minSqm: (data.min_sqm as number) ?? 0,
    minLandSize: (data.min_land_size as number) ?? 0,
    maxLandSize: (data.max_land_size as number) ?? defaultBuyerCriteria.maxLandSize,
    propertyTypes: (data.property_types as BuyerCriteria["propertyTypes"]) || [],
    features: (data.features as string[]) || [],
  }
}

export async function fetchBuyerCriteria(userId: string): Promise<BuyerCriteria | null> {
  const { data, error } = await supabase
    .from("buyer_criteria")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }

  return data ? mapBuyerCriteriaRow(data) : null
}

export async function saveBuyerCriteria(userId: string, criteria: BuyerCriteria) {
  const { error } = await supabase.from("buyer_criteria").upsert(
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
  )

  if (error) throw error
}
