// Comprehensive caching strategy for scalability
import Redis from "ioredis"

export class CacheManager {
  private redis: Redis
  private localCache = new Map<string, { data: any; expires: number }>()

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl)
  }

  // Multi-level caching strategy
  async get<T>(key: string): Promise<T | null> {
    // Level 1: Local memory cache (fastest)
    const localData = this.localCache.get(key)
    if (localData && localData.expires > Date.now()) {
      return localData.data
    }

    // Level 2: Redis cache (fast)
    try {
      const redisData = await this.redis.get(key)
      if (redisData) {
        const parsed = JSON.parse(redisData)
        // Store in local cache for next time
        this.localCache.set(key, {
          data: parsed,
          expires: Date.now() + 60000, // 1 minute local cache
        })
        return parsed
      }
    } catch (error) {
      console.error("Redis get error:", error)
    }

    return null
  }

  async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    // Store in both levels
    this.localCache.set(key, {
      data: value,
      expires: Date.now() + Math.min(ttlSeconds * 1000, 60000),
    })

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error("Redis set error:", error)
    }
  }

  async delete(key: string): Promise<void> {
    this.localCache.delete(key)
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error("Redis delete error:", error)
    }
  }

  // Cache patterns for different data types
  async cacheUserSession(userId: string, sessionData: any): Promise<void> {
    await this.set(`session:${userId}`, sessionData, 1800) // 30 minutes
  }

  async getCachedUserSession(userId: string): Promise<any> {
    return this.get(`session:${userId}`)
  }

  async cacheCompanyData(companyId: string, data: any): Promise<void> {
    await this.set(`company:${companyId}`, data, 3600) // 1 hour
  }

  async getCachedCompanyData(companyId: string): Promise<any> {
    return this.get(`company:${companyId}`)
  }

  async cacheProcessingResult(runId: string, result: any): Promise<void> {
    await this.set(`processing:${runId}`, result, 86400) // 24 hours
  }

  async getCachedProcessingResult(runId: string): Promise<any> {
    return this.get(`processing:${runId}`)
  }

  // Cache invalidation patterns
  async invalidateUserCache(userId: string): Promise<void> {
    const pattern = `*:${userId}:*`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }

    // Clear local cache entries
    for (const [key] of this.localCache.entries()) {
      if (key.includes(userId)) {
        this.localCache.delete(key)
      }
    }
  }

  async invalidateCompanyCache(companyId: string): Promise<void> {
    const pattern = `*:${companyId}:*`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }

    // Clear local cache entries
    for (const [key] of this.localCache.entries()) {
      if (key.includes(companyId)) {
        this.localCache.delete(key)
      }
    }
  }

  // Cleanup expired local cache entries
  private cleanupLocalCache(): void {
    const now = Date.now()
    for (const [key, value] of this.localCache.entries()) {
      if (value.expires <= now) {
        this.localCache.delete(key)
      }
    }
  }

  // Start cleanup interval
  startCleanup(): void {
    setInterval(() => {
      this.cleanupLocalCache()
    }, 60000) // Clean every minute
  }
}

// Cache key patterns
export const CACHE_KEYS = {
  USER_SESSION: (userId: string) => `session:${userId}`,
  USER_PROFILE: (userId: string) => `user:${userId}`,
  COMPANY_PROFILE: (companyId: string) => `company:${companyId}`,
  COMPANY_COA: (companyId: string) => `coa:${companyId}`,
  COMPANY_RULES: (companyId: string) => `rules:${companyId}`,
  PROCESSING_RUN: (runId: string) => `run:${runId}`,
  CHAT_SESSION: (sessionId: string) => `chat:${sessionId}`,
  USER_PERMISSIONS: (userId: string) => `permissions:${userId}`,
  SUBSCRIPTION_PLANS: () => "subscription:plans",
  SYSTEM_SETTINGS: () => "system:settings",
  ANALYTICS_DATA: (userId: string, period: string) => `analytics:${userId}:${period}`,
}
