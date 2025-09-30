// Admin-specific types
import type { UserRole, SubscriptionTier } from "./someModule" // Assuming these types are declared in another module

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: "active" | "suspended" | "pending" | "deleted"
  createdAt: string
  lastLoginAt?: string
  lastLoginIP?: string
  emailVerified: boolean
  twoFactorEnabled: boolean
  companies: string[]
  subscription?: {
    planId: string
    status: string
    currentPeriodEnd: string
  }
  tokenWallet: {
    balance: number
    totalPurchased: number
    totalUsed: number
  }
  securityFlags: {
    suspiciousActivity: boolean
    multipleFailedLogins: boolean
    unusualLocation: boolean
  }
}

export interface AdminSubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number
  currency: string
  interval: "month" | "year"
  tokensIncluded: number
  features: string[]
  maxCompanies: number
  maxTransactionsPerRun: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  stripeProductId?: string
  stripePriceId?: string
}

export interface SystemNotification {
  id: string
  type: "info" | "warning" | "error" | "success" | "maintenance"
  title: string
  message: string
  targetUsers: "all" | "subscribers" | "free_users" | "specific"
  targetUserIds?: string[]
  isActive: boolean
  scheduledAt?: string
  expiresAt?: string
  createdBy: string
  createdAt: string
  readBy: string[] // User IDs who have read the notification
}

export interface SystemAnnouncement {
  id: string
  title: string
  content: string
  type: "feature" | "maintenance" | "security" | "general"
  priority: "low" | "medium" | "high" | "critical"
  isPublished: boolean
  publishedAt?: string
  expiresAt?: string
  targetAudience: "all" | "subscribers" | "admins"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  timestamp: string
  action: string
  userId: string
  userEmail: string
  targetUserId?: string
  targetUserEmail?: string
  details: string
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  totalCompanies: number
  totalTransactions: number
  totalRevenue: number
  monthlyRevenue: number
  tokenUsage: {
    total: number
    thisMonth: number
    averagePerUser: number
  }
  subscriptionBreakdown: {
    [key: string]: number
  }
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
  }
}

export interface SecurityAlert {
  id: string
  type: "failed_login" | "suspicious_activity" | "data_breach" | "unauthorized_access"
  severity: "low" | "medium" | "high" | "critical"
  userId?: string
  userEmail?: string
  ipAddress: string
  description: string
  timestamp: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  actions: string[]
}
