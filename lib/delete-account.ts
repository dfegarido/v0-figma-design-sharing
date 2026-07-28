import { supabase } from "@/lib/supabase"

export interface DeleteAccountFeedback {
  reason?: string
  optionalText?: string
}

export interface DeleteAccountResult {
  success: boolean
  error?: string
}

export async function deleteAccount(feedback?: DeleteAccountFeedback): Promise<DeleteAccountResult> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return { success: false, error: "You are not signed in." }
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL
  const functionUrl = `${supabaseUrl}/functions/v1/delete-account`

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        reason: feedback?.reason,
        optional_text: feedback?.optionalText,
      }),
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Account deletion failed. Please try again later.",
      }
    }

    try {
      await supabase.auth.signOut({ scope: "global" })
    } catch {
      // User no longer exists; session invalidation already happened server-side.
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Account deletion failed. Please try again later."
    return { success: false, error: message }
  }
}

export const DELETE_REASONS = [
  "I bought or sold a property.",
  "I'm no longer planning to move.",
  "I wasn't finding suitable property matches.",
  "There weren't enough properties in my preferred area.",
  "I found another way to buy or sell.",
  "The app didn't meet my expectations.",
  "I have privacy or security concerns.",
  "Other",
] as const

export type DeleteReason = (typeof DELETE_REASONS)[number]
