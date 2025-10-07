// Load balancing and service discovery for microservices
export interface ServiceInstance {
  id: string
  host: string
  port: number
  health: "healthy" | "unhealthy" | "unknown"
  lastHealthCheck: Date
  responseTime: number
  activeConnections: number
  cpuUsage: number
  memoryUsage: number
}

export class LoadBalancer {
  private services = new Map<string, ServiceInstance[]>()
  private roundRobinCounters = new Map<string, number>()

  constructor() {
    this.startHealthChecking()
  }

  // Register a service instance
  registerService(
    serviceName: string,
    instance: Omit<
      ServiceInstance,
      "health" | "lastHealthCheck" | "responseTime" | "activeConnections" | "cpuUsage" | "memoryUsage"
    >,
  ): void {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, [])
    }

    const fullInstance: ServiceInstance = {
      ...instance,
      health: "unknown",
      lastHealthCheck: new Date(),
      responseTime: 0,
      activeConnections: 0,
      cpuUsage: 0,
      memoryUsage: 0,
    }

    this.services.get(serviceName)!.push(fullInstance)
  }

  // Get next service instance using round-robin
  getServiceInstance(serviceName: string): ServiceInstance | null {
    const instances = this.getHealthyInstances(serviceName)
    if (instances.length === 0) return null

    const counter = this.roundRobinCounters.get(serviceName) || 0
    const instance = instances[counter % instances.length]

    this.roundRobinCounters.set(serviceName, counter + 1)
    return instance
  }

  // Get service instance using weighted round-robin (based on performance)
  getServiceInstanceWeighted(serviceName: string): ServiceInstance | null {
    const instances = this.getHealthyInstances(serviceName)
    if (instances.length === 0) return null

    // Calculate weights based on inverse of response time and resource usage
    const weights = instances.map((instance) => {
      const responseWeight = 1000 / Math.max(instance.responseTime, 1)
      const cpuWeight = 100 / Math.max(instance.cpuUsage, 1)
      const memoryWeight = 100 / Math.max(instance.memoryUsage, 1)
      return responseWeight * cpuWeight * memoryWeight
    })

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    for (let i = 0; i < instances.length; i++) {
      currentWeight += weights[i]
      if (random <= currentWeight) {
        return instances[i]
      }
    }

    return instances[0] // Fallback
  }

  // Get service instance with least connections
  getServiceInstanceLeastConnections(serviceName: string): ServiceInstance | null {
    const instances = this.getHealthyInstances(serviceName)
    if (instances.length === 0) return null

    return instances.reduce((least, current) => (current.activeConnections < least.activeConnections ? current : least))
  }

  // Get healthy service instances
  private getHealthyInstances(serviceName: string): ServiceInstance[] {
    const instances = this.services.get(serviceName) || []
    return instances.filter((instance) => instance.health === "healthy")
  }

  // Health checking
  private async startHealthChecking(): Promise<void> {
    setInterval(async () => {
      for (const [, instances] of this.services.entries()) {
        for (const instance of instances) {
          await this.checkInstanceHealth(instance)
        }
      }
    }, 30000) // Check every 30 seconds
  }

  private async checkInstanceHealth(instance: ServiceInstance): Promise<void> {
    const start = Date.now()

    try {
      const response = await fetch(`http://${instance.host}:${instance.port}/health`, {
        // timeout: 5000, // Not supported in fetch
      })

      const responseTime = Date.now() - start

      if (response.ok) {
        const healthData = await response.json()

        instance.health = "healthy"
        instance.responseTime = responseTime
        instance.cpuUsage = healthData.cpu || 0
        instance.memoryUsage = healthData.memory || 0
        instance.activeConnections = healthData.connections || 0
      } else {
        instance.health = "unhealthy"
      }
    } catch {
      instance.health = "unhealthy"
      instance.responseTime = Date.now() - start
    }

    instance.lastHealthCheck = new Date()
  }

  // Get load balancer statistics
  getStats(): Record<string, Record<string, unknown>> {
    const stats: Record<string, Record<string, unknown>> = {}

    for (const [serviceName, instances] of this.services.entries()) {
      const healthy = instances.filter((i) => i.health === "healthy").length
      const unhealthy = instances.filter((i) => i.health === "unhealthy").length
      const avgResponseTime = instances.reduce((sum, i) => sum + i.responseTime, 0) / instances.length

      stats[serviceName] = {
        total: instances.length,
        healthy,
        unhealthy,
        avgResponseTime: avgResponseTime || 0,
        instances: instances.map((i) => ({
          id: i.id,
          host: i.host,
          port: i.port,
          health: i.health,
          responseTime: i.responseTime,
          activeConnections: i.activeConnections,
          cpuUsage: i.cpuUsage,
          memoryUsage: i.memoryUsage,
        })),
      }
    }

    return stats
  }

  // Remove unhealthy instances
  removeUnhealthyInstances(): void {
    for (const [serviceName, instances] of this.services.entries()) {
      const healthyInstances = instances.filter(
        (instance) => instance.health === "healthy" || Date.now() - instance.lastHealthCheck.getTime() < 300000, // Keep if checked within 5 minutes
      )

      this.services.set(serviceName, healthyInstances)
    }
  }
}

// Circuit breaker pattern for service resilience
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: "closed" | "open" | "half-open" = "closed"

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000, // 1 minute
    private monitoringPeriod = 300000, // 5 minutes
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = "half-open"
      } else {
        throw new Error("Circuit breaker is open")
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = "closed"
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = "open"
    }
  }

  getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    }
  }
}
