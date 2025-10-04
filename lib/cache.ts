// Cache utility untuk optimasi performance
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clear expired items
  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }
}

// Global cache instance
export const cache = new CacheManager()

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  APPS_LIST: 'apps_list',
  CATEGORIES: 'categories',
  GROUPS: 'groups',
  USER_STATS: 'user_stats'
} as const

// Helper functions
export const getCachedData = <T>(key: string): T | null => {
  return cache.get<T>(key)
}

export const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
  cache.set(key, data, ttl)
}

export const invalidateCache = (key: string): void => {
  cache.delete(key)
}

export const invalidateUserCache = (): void => {
  cache.delete(CACHE_KEYS.USER_PROFILE)
  cache.delete(CACHE_KEYS.USER_STATS)
}

// Cleanup expired items every 5 minutes
setInterval(() => {
  cache.cleanup()
}, 5 * 60 * 1000)
