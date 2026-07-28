const CACHE_PREFIX = "switch_cache_"
const DEFAULT_TTL_MS = 30 * 60 * 1000 // 30 minutes

export const CACHE_KEYS = {
  PROFILE: "profile",
  CONVERSATIONS: "conversations",
  NOTIFICATIONS: "notifications",
} as const

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttlMs?: number
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > (entry.ttlMs ?? DEFAULT_TTL_MS)) return null
    return entry.data
  } catch {
    return null
  }
}

export function setCache<T>(key: string, data: T, ttlMs?: number): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttlMs }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Silently fail — cache is best-effort
  }
}

export function isCacheEntryExpired<T>(entry: CacheEntry<T>): boolean {
  const ttl = entry.ttlMs ?? DEFAULT_TTL_MS
  return Date.now() - entry.timestamp > ttl
}

export function clearCache(key?: string): void {
  try {
    if (key) {
      localStorage.removeItem(CACHE_PREFIX + key)
    } else {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX))
      for (const cacheKey of cacheKeys) {
        localStorage.removeItem(cacheKey)
      }
    }
  } catch {
    // Silently fail
  }
}
