import { supabase } from "@/lib/supabase"

export type VerificationDocumentType =
  | "title-deed"
  | "rates-notice"
  | "utility-bill"

export type VerificationReviewStatus = "pending" | "approved" | "rejected"

export interface PropertyVerification {
  id: string
  propertyId: string
  documentType: VerificationDocumentType
  documentUrl: string
  status: VerificationReviewStatus
  submittedAt: string
  reviewedAt?: string
  reviewerNotes?: string
}

const DOCUMENT_BUCKET = "property-documents"

export async function fetchCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user.id
}

export async function fetchVerificationsForProperty(
  propertyId: string
): Promise<PropertyVerification[]> {
  const { data, error } = await supabase
    .from("verifications")
    .select(
      "id, property_id, document_type, document_url, status, submitted_at, reviewed_at, reviewer_notes"
    )
    .eq("property_id", propertyId)
    .order("submitted_at", { ascending: false })

  if (error) throw error

  return (data || []).map((row) => ({
    id: row.id,
    propertyId: row.property_id,
    documentType: row.document_type,
    documentUrl: row.document_url,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at || undefined,
    reviewerNotes: row.reviewer_notes || undefined,
  }))
}

export async function fetchLatestVerificationStatus(
  propertyId: string
): Promise<VerificationReviewStatus | null> {
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

export async function uploadDocument(
  propertyId: string,
  file: File
): Promise<string> {
  const userId = await fetchCurrentUserId()
  if (!userId) {
    throw new Error("You must be signed in to upload documents.")
  }

  const arrayBuffer = await file.arrayBuffer()
  const timestamp = Date.now()
  const path = `${userId}/${propertyId}/${timestamp}.jpg`

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, arrayBuffer, { contentType: "image/jpeg" })

  if (uploadError) {
    const msg = uploadError.message || ""
    const isBucketMissing =
      msg.toLowerCase().includes("bucket not found") ||
      msg.toLowerCase().includes("does not exist")
    const isRls =
      msg.toLowerCase().includes("row-level security") ||
      msg.toLowerCase().includes("violates row-level")

    if (isBucketMissing) {
      throw new Error(
        "Supabase Storage bucket 'property-documents' does not exist. " +
          "Apply migration 010_property_documents_bucket.sql in the Supabase dashboard."
      )
    }
    if (isRls) {
      throw new Error(
        "Upload blocked by Supabase RLS. Check the storage policies for 'property-documents'."
      )
    }
    throw new Error(uploadError.message || "Document upload failed. Please try again.")
  }

  const { data: urlData } = supabase.storage.from(DOCUMENT_BUCKET).getPublicUrl(path)
  return urlData.publicUrl
}

export async function submitPropertyVerification(
  propertyId: string,
  documentType: VerificationDocumentType,
  file: File
): Promise<PropertyVerification> {
  const userId = await fetchCurrentUserId()
  if (!userId) {
    throw new Error("You must be signed in to submit verification.")
  }

  const documentUrl = await uploadDocument(propertyId, file)

  const { data, error } = await supabase
    .from("verifications")
    .insert({
      user_id: userId,
      property_id: propertyId,
      document_type: documentType,
      document_url: documentUrl,
      status: "pending",
    })
    .select(
      "id, property_id, document_type, document_url, status, submitted_at, reviewed_at, reviewer_notes"
    )
    .single()

  if (error || !data) {
    throw error || new Error("Failed to submit verification.")
  }

  return {
    id: data.id,
    propertyId: data.property_id,
    documentType: data.document_type,
    documentUrl: data.document_url,
    status: data.status,
    submittedAt: data.submitted_at,
    reviewedAt: data.reviewed_at || undefined,
    reviewerNotes: data.reviewer_notes || undefined,
  }
}

