/**
 * Simple in-memory cache for Firebase queries
 * Reduces unnecessary Firestore reads and improves performance
 */

class QueryCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  /**
   * Get cached data if not expired
   * @param {string} key - Cache key
   * @param {number} maxAge - Max age in milliseconds (default: 5 minutes)
   * @returns {any} Cached data or null
   */
  get(key, maxAge = 5 * 60 * 1000) {
    const timestamp = this.timestamps.get(key)
    
    if (!timestamp) {
      return null
    }

    const age = Date.now() - timestamp
    
    if (age > maxAge) {
      // Cache expired
      this.cache.delete(key)
      this.timestamps.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, data)
    this.timestamps.set(key, Date.now())
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear()
    this.timestamps.clear()
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size
  }
}

// Create singleton instance
export const queryCache = new QueryCache()

/**
 * Cache decorator for async functions
 * @param {Function} fn - Function to wrap
 * @param {string} cacheKey - Cache key
 * @param {number} maxAge - Cache max age in ms
 * @returns {Function} Wrapped function
 */
export function withCache(fn, cacheKey, maxAge = 5 * 60 * 1000) {
  return async (...args) => {
    // Generate unique key with args
    const key = `${cacheKey}:${JSON.stringify(args)}`
    
    // Check cache first
    const cached = queryCache.get(key, maxAge)
    if (cached) {
      console.log(`✅ Cache HIT: ${cacheKey}`)
      return cached
    }

    console.log(`❌ Cache MISS: ${cacheKey}`)
    
    // Execute function
    const result = await fn(...args)
    
    // Store in cache
    queryCache.set(key, result)
    
    return result
  }
}

export default queryCache
