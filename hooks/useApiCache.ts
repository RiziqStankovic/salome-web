import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { cache, CACHE_KEYS } from '@/lib/cache'
import { debounce } from '@/lib/debounce'

interface UseApiCacheOptions {
  cacheKey: string
  ttl?: number // Time to live in milliseconds
  debounceMs?: number // Debounce delay in milliseconds
  enabled?: boolean // Whether to enable the hook
}

interface UseApiCacheReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  invalidate: () => void
}

export function useApiCache<T>(
  apiCall: () => Promise<T>,
  options: UseApiCacheOptions
): UseApiCacheReturn<T> {
  const { cacheKey, ttl = 5 * 60 * 1000, debounceMs = 0, enabled = true } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const hasFetched = useRef(false)
  const isFetching = useRef(false)

  const fetchData = useCallback(async () => {
    if (!enabled || isFetching.current) return

    // Check cache first
    const cachedData = cache.get<T>(cacheKey)
    if (cachedData) {
      setData(cachedData)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      isFetching.current = true
      hasFetched.current = true

      const result = await apiCall()
      
      // Cache the result
      cache.set(cacheKey, result, ttl)
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      console.error(`Error fetching data for ${cacheKey}:`, error)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [apiCall, cacheKey, ttl, enabled])

  // Debounced fetch function
  const debouncedFetch = useMemo(
    () => debounceMs > 0 ? debounce(fetchData, debounceMs) : fetchData,
    [fetchData, debounceMs]
  )

  // Initial fetch
  useEffect(() => {
    if (enabled && !hasFetched.current) {
      debouncedFetch()
    }
  }, [enabled, debouncedFetch])

  const refetch = useCallback(async () => {
    // Invalidate cache and fetch fresh data
    cache.delete(cacheKey)
    hasFetched.current = false
    await fetchData()
  }, [cacheKey, fetchData])

  const invalidate = useCallback(() => {
    cache.delete(cacheKey)
    setData(null)
    hasFetched.current = false
  }, [cacheKey])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  }
}

// Predefined hooks for common API calls
export function useAppsCache(searchTerm?: string, category?: string) {
  const cacheKey = `${CACHE_KEYS.APPS_LIST}_${searchTerm || 'default'}_${category || 'all'}`
  
  return useApiCache(
    () => appAPI.getApps({
      page: 1,
      page_size: 12,
      popular: true,
      q: searchTerm || undefined,
      category: category || undefined
    }).then(res => res.data.apps),
    {
      cacheKey,
      ttl: 2 * 60 * 1000, // 2 minutes
      debounceMs: 500
    }
  )
}

export function useCategoriesCache() {
  return useApiCache(
    () => appAPI.getAppCategories().then(res => res.data.categories),
    {
      cacheKey: CACHE_KEYS.CATEGORIES,
      ttl: 10 * 60 * 1000, // 10 minutes
    }
  )
}

// Import appAPI if not already imported
import { appAPI } from '@/lib/api'
