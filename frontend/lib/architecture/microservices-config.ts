// Microservices configuration and service discovery
export interface ServiceConfig {
  name: string
  version: string
  port: number
  healthCheck: string
  dependencies: string[]
  scaling: {
    minInstances: number
    maxInstances: number
    cpuThreshold: number
    memoryThreshold: number
  }
}

export const MICROSERVICES_CONFIG: Record<string, ServiceConfig> = {
  authService: {
    name: "auth-service",
    version: "1.0.0",
    port: 3001,
    healthCheck: "/health",
    dependencies: ["database", "redis"],
    scaling: {
      minInstances: 2,
      maxInstances: 10,
      cpuThreshold: 70,
      memoryThreshold: 80,
    },
  },
  userService: {
    name: "user-service",
    version: "1.0.0",
    port: 3002,
    healthCheck: "/health",
    dependencies: ["database", "authService"],
    scaling: {
      minInstances: 2,
      maxInstances: 8,
      cpuThreshold: 70,
      memoryThreshold: 80,
    },
  },
  chatService: {
    name: "chat-service",
    version: "1.0.0",
    port: 3003,
    healthCheck: "/health",
    dependencies: ["database", "redis", "messageQueue"],
    scaling: {
      minInstances: 3,
      maxInstances: 15,
      cpuThreshold: 60,
      memoryThreshold: 75,
    },
  },
  fileProcessingService: {
    name: "file-processing-service",
    version: "1.0.0",
    port: 3004,
    healthCheck: "/health",
    dependencies: ["database", "s3Storage", "aiService"],
    scaling: {
      minInstances: 2,
      maxInstances: 20,
      cpuThreshold: 80,
      memoryThreshold: 85,
    },
  },
  billingService: {
    name: "billing-service",
    version: "1.0.0",
    port: 3005,
    healthCheck: "/health",
    dependencies: ["database", "stripe", "userService"],
    scaling: {
      minInstances: 2,
      maxInstances: 6,
      cpuThreshold: 70,
      memoryThreshold: 80,
    },
  },
  notificationService: {
    name: "notification-service",
    version: "1.0.0",
    port: 3006,
    healthCheck: "/health",
    dependencies: ["database", "messageQueue", "emailProvider"],
    scaling: {
      minInstances: 2,
      maxInstances: 8,
      cpuThreshold: 70,
      memoryThreshold: 80,
    },
  },
  analyticsService: {
    name: "analytics-service",
    version: "1.0.0",
    port: 3007,
    healthCheck: "/health",
    dependencies: ["database", "clickhouse"],
    scaling: {
      minInstances: 1,
      maxInstances: 5,
      cpuThreshold: 75,
      memoryThreshold: 85,
    },
  },
  adminService: {
    name: "admin-service",
    version: "1.0.0",
    port: 3008,
    healthCheck: "/health",
    dependencies: ["database", "authService", "userService"],
    scaling: {
      minInstances: 1,
      maxInstances: 3,
      cpuThreshold: 70,
      memoryThreshold: 80,
    },
  },
}

export class ServiceDiscovery {
  private services = new Map<string, ServiceConfig>()
  private healthChecks = new Map<string, boolean>()

  constructor() {
    this.initializeServices()
    this.startHealthChecking()
  }

  private initializeServices() {
    Object.entries(MICROSERVICES_CONFIG).forEach(([key, config]) => {
      this.services.set(key, config)
      this.healthChecks.set(key, false)
    })
  }

  private async startHealthChecking() {
    setInterval(async () => {
      for (const [serviceName, config] of this.services.entries()) {
        try {
          const response = await fetch(`http://localhost:${config.port}${config.healthCheck}`)
          this.healthChecks.set(serviceName, response.ok)
        } catch (error) {
          this.healthChecks.set(serviceName, false)
          console.error(`Health check failed for ${serviceName}:`, error)
        }
      }
    }, 30000) // Check every 30 seconds
  }

  getServiceUrl(serviceName: string): string | null {
    const config = this.services.get(serviceName)
    const isHealthy = this.healthChecks.get(serviceName)

    if (!config || !isHealthy) {
      return null
    }

    return `http://localhost:${config.port}`
  }

  getHealthyServices(): string[] {
    return Array.from(this.healthChecks.entries())
      .filter(([, isHealthy]) => isHealthy)
      .map(([serviceName]) => serviceName)
  }
}
