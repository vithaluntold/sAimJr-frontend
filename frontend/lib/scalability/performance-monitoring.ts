// Types for performance statistics
interface MetricStats {
  count: number
  avg: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number
}

interface ExpressRequest {
  method: string
  path: string
  route?: { path: string }
}

interface ExpressResponse {
  on: (event: string, callback: () => void) => void
}

type ExpressNext = () => void

// Performance monitoring utility for tracking metrics across the application
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  private startTimes = new Map<string, number>()
  private alerts: Array<{ type: string; message: string; timestamp: Date }> = []

  // Track API endpoint response times
  trackApiResponse(endpoint: string, duration: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, [])
    }

    const times = this.metrics.get(endpoint)!
    times.push(duration)

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift()
    }

    // Check for performance issues
    this.checkPerformanceThresholds(endpoint, duration)
  }

  // Track database query performance
  trackDatabaseQuery(query: string, duration: number): void {
    const key = `db:${query.split(" ")[0].toLowerCase()}` // e.g., "db:select"
    this.trackApiResponse(key, duration)
  }

  // Track memory usage
  trackMemoryUsage(): void {
    if (typeof process !== "undefined") {
      const usage = process.memoryUsage()
      this.trackApiResponse("memory:heap", usage.heapUsed / 1024 / 1024) // MB
      this.trackApiResponse("memory:rss", usage.rss / 1024 / 1024) // MB
    }
  }

  // Get performance statistics
  getStats(): Record<string, MetricStats> {
    const stats: Record<string, MetricStats> = {}

    for (const [key, values] of this.metrics.entries()) {
      if (values.length === 0) continue

      const sorted = [...values].sort((a, b) => a - b)
      stats[key] = {
        count: values.length,
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      }
    }

    return stats
  }

  // Check performance thresholds and create alerts
  private checkPerformanceThresholds(endpoint: string, duration: number): void {
    const thresholds = {
      "api:": 1000, // 1 second for API endpoints
      "db:": 500, // 500ms for database queries
      "memory:": 512, // 512MB memory usage
    }

    for (const [prefix, threshold] of Object.entries(thresholds)) {
      if (endpoint.startsWith(prefix) && duration > threshold) {
        this.alerts.push({
          type: "performance",
          message: `${endpoint} exceeded threshold: ${duration}ms > ${threshold}ms`,
          timestamp: new Date(),
        })

        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
          this.alerts.shift()
        }
        break
      }
    }
  }

  // Get recent alerts
  getAlerts(): Array<{ type: string; message: string; timestamp: Date }> {
    return [...this.alerts]
  }

  // Clear alerts
  clearAlerts(): void {
    this.alerts.length = 0
  }

  // Performance optimization suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    const stats = this.getStats()

    // Check API performance
    for (const [endpoint, stat] of Object.entries(stats)) {
      if (endpoint.startsWith("api:") && stat.avg > 500) {
        suggestions.push(`Consider optimizing ${endpoint} - average response time: ${stat.avg.toFixed(2)}ms`)
      }

      if (endpoint.startsWith("db:") && stat.avg > 200) {
        suggestions.push(`Database query ${endpoint} is slow - consider adding indexes or optimizing query`)
      }

      if (endpoint.startsWith("memory:") && stat.avg > 256) {
        suggestions.push(`High memory usage detected: ${stat.avg.toFixed(2)}MB - consider memory optimization`)
      }
    }

    return suggestions
  }
}

// Middleware for Express.js to track performance
export const performanceMiddleware = (monitor: PerformanceMonitor) => {
  return (req: ExpressRequest, res: ExpressResponse, next: ExpressNext) => {
    const start = Date.now()

    res.on("finish", () => {
      const duration = Date.now() - start
      const endpoint = `api:${req.method}:${req.route?.path || req.path}`
      monitor.trackApiResponse(endpoint, duration)
    })

    next()
  }
}

// Database query wrapper for performance tracking
export const trackDatabaseQuery = <T>(monitor: PerformanceMonitor) => {
  return async (query: string, executor: () => Promise<T>): Promise<T> => {
    const start = Date.now()
    try {
      const result = await executor()
      const duration = Date.now() - start
      monitor.trackDatabaseQuery(query, duration)
      return result
    } catch (error) {
      const duration = Date.now() - start
      monitor.trackDatabaseQuery(`${query}:error`, duration)
      throw error
    }
  }
}
