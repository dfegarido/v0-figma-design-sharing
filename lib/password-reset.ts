import { supabase } from "@/lib/supabase"

export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password: password.trim() })
}

function hasRecoveryParams(): boolean {
  if (typeof window === "undefined") return false

  const { hash, search } = window.location
  const params = new URLSearchParams(search)

  return (
    hash.includes("access_token") ||
    hash.includes("type=recovery") ||
    params.has("code") ||
    (params.has("token_hash") && params.get("type") === "recovery")
  )
}

function cleanRecoveryUrl() {
  window.history.replaceState({}, "", window.location.pathname)
}

export async function establishRecoverySession(): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined") return { ok: false }

  const params = new URLSearchParams(window.location.search)
  const code = params.get("code")
  const tokenHash = params.get("token_hash")
  const type = params.get("type")

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    })
    if (!error) {
      cleanRecoveryUrl()
      return { ok: true }
    }
    return { ok: false, error: error.message }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      cleanRecoveryUrl()
      return { ok: true }
    }
  }

  // Implicit flow: detectSessionInUrl parses hash tokens on client init.
  await new Promise((resolve) => window.setTimeout(resolve, 250))

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    cleanRecoveryUrl()
    return { ok: true }
  }

  if (!hasRecoveryParams()) {
    return { ok: false, error: "No recovery token found in the link." }
  }

  return new Promise((resolve) => {
    let settled = false

    const finish = (result: { ok: boolean; error?: string }) => {
      if (settled) return
      settled = true
      subscription.unsubscribe()
      window.clearTimeout(timeout)
      if (result.ok) cleanRecoveryUrl()
      resolve(result)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        finish({ ok: true })
      }
    })

    const timeout = window.setTimeout(async () => {
      const {
        data: { session: latestSession },
      } = await supabase.auth.getSession()

      finish(
        latestSession
          ? { ok: true }
          : {
              ok: false,
              error:
                "Could not verify this reset link. Request a new one and open it in the same browser if possible.",
            }
      )
    }, 5000)
  })
}
