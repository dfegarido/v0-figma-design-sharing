import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_KEY

let client: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (client) return client

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings (Environment Variables), then redeploy."
    )
  }

  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Implicit flow puts tokens in the URL hash so reset links work when
      // opened from email (PKCE requires the same browser that requested reset).
      flowType: "implicit",
    },
  })

  return client
}

/**
 * Lazy proxy so Next.js can import this module during static prerender
 * without requiring env vars at module-evaluation time.
 * The real client is created on first use (browser / runtime).
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabase() as object, prop, receiver)
    return typeof value === "function" ? value.bind(getSupabase()) : value
  },
})
