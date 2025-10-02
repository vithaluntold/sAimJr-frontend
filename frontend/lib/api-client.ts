// Enhanced API client for S(ai)m Jr FastAPI Backend
// Point to FastAPI backend server running on port 8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message)
    this.name = "APIError"
  }
}

interface User {
  // Define the User interface here based on your application's requirements
  id: string
  email: string
  firstName: string
  lastName: string
  // Add other properties as needed
}

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Get token from localStorage or cookies
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(response.status, errorData.message || "Request failed", errorData)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(0, "Network error", { originalError: error })
    }
  }



  // Subscription Management
  async getSubscriptionPlans() {
    return this.request<any[]>("/billing/plans")
  }

  async getCurrentSubscription() {
    return this.request<any>("/billing/subscription")
  }

  async createSubscription(planId: string, paymentMethodId: string) {
    return this.request<any>("/billing/subscription", {
      method: "POST",
      body: JSON.stringify({ planId, paymentMethodId }),
    })
  }

  async updateSubscription(planId: string) {
    return this.request<any>("/billing/subscription", {
      method: "PUT",
      body: JSON.stringify({ planId }),
    })
  }

  async cancelSubscription() {
    return this.request<any>("/billing/subscription/cancel", {
      method: "POST",
    })
  }

  // Token Management
  async getTokenWallet() {
    return this.request<any>("/tokens/wallet")
  }

  async getTokenPackages() {
    return this.request<any[]>("/tokens/packages")
  }

  async purchaseTokens(packageId: string, paymentMethodId: string) {
    return this.request<any>("/tokens/purchase", {
      method: "POST",
      body: JSON.stringify({ packageId, paymentMethodId }),
    })
  }

  async getTokenTransactions(limit = 50, offset = 0) {
    return this.request<any>(`/tokens/transactions?limit=${limit}&offset=${offset}`)
  }

  async getUsageAnalytics(period?: string) {
    const query = period ? `?period=${period}` : ""
    return this.request<any>(`/analytics/usage${query}`)
  }

  // Payment Methods
  async getPaymentMethods() {
    return this.request<any[]>("/billing/payment-methods")
  }

  async addPaymentMethod(paymentMethodId: string) {
    return this.request<any>("/billing/payment-methods", {
      method: "POST",
      body: JSON.stringify({ paymentMethodId }),
    })
  }

  async deletePaymentMethod(paymentMethodId: string) {
    return this.request<any>(`/billing/payment-methods/${paymentMethodId}`, {
      method: "DELETE",
    })
  }

  async setDefaultPaymentMethod(paymentMethodId: string) {
    return this.request<any>(`/billing/payment-methods/${paymentMethodId}/default`, {
      method: "POST",
    })
  }

  // Stripe Integration
  async createSetupIntent() {
    return this.request<{ client_secret: string }>("/billing/setup-intent", {
      method: "POST",
    })
  }

  async createPaymentIntent(amount: number, description: string, metadata?: any) {
    return this.request<{ client_secret: string }>("/billing/payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount, description, metadata }),
    })
  }

  // Company Profile (with token cost estimation)
  async estimateTokenCost(operation: string, metadata: any) {
    return this.request<{ estimatedTokens: number; estimatedCost: number }>("/tokens/estimate", {
      method: "POST",
      body: JSON.stringify({ operation, metadata }),
    })
  }

  async createCompanyProfile(profileData: any) {
    return this.request<any>("/api/companies", {
      method: "POST",
      body: JSON.stringify(profileData),
    })
  }

  async getCompanyProfile(companyId: string) {
    return this.request<any>(`/api/companies/${companyId}`)
  }

  async updateCompanyProfile(companyId: string, updates: any) {
    return this.request<any>(`/api/companies/${companyId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  // Chart of Accounts (with token tracking)
  async generateCOA(companyId: string, industry: string, businessType: string) {
    return this.request<any>(`/api/companies/${companyId}/coa/generate`, {
      method: "POST",
      body: JSON.stringify({ industry, businessType }),
    })
  }

  async uploadCOA(companyId: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return this.request<any>(`/api/companies/${companyId}/files`, {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }

  // Processing Runs (with token consumption)
  async createProcessingRun(companyId: string, runData: any) {
    return this.request<any>(`/companies/${companyId}/runs`, {
      method: "POST",
      body: JSON.stringify(runData),
    })
  }

  async uploadBankStatement(runId: string, file: File, periodFrom: string, periodTo: string) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("period_from", periodFrom)
    formData.append("period_to", periodTo)

    return this.request<any>(`/runs/${runId}/upload-statement`, {
      method: "POST",
      body: formData,
      headers: {},
    })
  }

  async getProcessingStatus(runId: string) {
    return this.request<any>(`/runs/${runId}/status`)
  }

  async startPartyMapping(runId: string) {
    return this.request<any>(`/runs/${runId}/map-parties`, {
      method: "POST",
    })
  }

  async startCategorization(runId: string) {
    return this.request<any>(`/runs/${runId}/categorize`, {
      method: "POST",
    })
  }

  async getExceptions(runId: string) {
    return this.request<any>(`/runs/${runId}/exceptions`)
  }

  async resolveException(runId: string, exceptionId: string, resolution: any) {
    return this.request<any>(`/runs/${runId}/exceptions/${exceptionId}/resolve`, {
      method: "POST",
      body: JSON.stringify(resolution),
    })
  }

  async generateReport(runId: string) {
    return this.request<any>(`/runs/${runId}/generate-report`, {
      method: "POST",
    })
  }

  // Rules
  async createRule(companyId: string, ruleData: any) {
    return this.request<any>(`/api/companies/${companyId}/rules`, {
      method: "POST",
      body: JSON.stringify(ruleData),
    })
  }

  async getRules(companyId: string) {
    return this.request<any>(`/api/companies/${companyId}/rules`)
  }

  async updateRule(companyId: string, ruleId: string, updates: any) {
    return this.request<any>(`/api/companies/${companyId}/rules/${ruleId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  // Chat Sessions
  async createChatSession(companyId: string, sessionData: any) {
    return this.request<any>(`/api/companies/${companyId}/chat-sessions`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    })
  }

  async getChatSessions(companyId: string) {
    return this.request<any>(`/api/companies/${companyId}/chat-sessions`)
  }

  async getChatSession(companyId: string, sessionId: string) {
    return this.request<any>(`/api/companies/${companyId}/chat-sessions/${sessionId}`)
  }

  async addChatMessage(companyId: string, sessionId: string, messageData: any) {
    return this.request<any>(`/api/companies/${companyId}/chat-sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify(messageData),
    })
  }

  // Transactions
  async getTransactions(companyId: string) {
    return this.request<any>(`/api/companies/${companyId}/transactions`)
  }

  async createTransaction(companyId: string, transactionData: any) {
    return this.request<any>(`/api/companies/${companyId}/transactions`, {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  async updateTransaction(companyId: string, transactionId: string, updates: any) {
    return this.request<any>(`/api/companies/${companyId}/transactions/${transactionId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  // File Management
  async uploadFile(companyId: string, file: File, fileType: string = "bank_statement") {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("file_type", fileType)

    return this.request<any>(`/api/companies/${companyId}/files`, {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }

  async getFiles(companyId: string) {
    return this.request<any>(`/api/companies/${companyId}/files`)
  }

  // Processing Runs
  async getProcessingRuns(companyId: string) {
    return this.request<any>(`/api/companies/${companyId}/processing-runs`)
  }

  // WebSocket for real-time updates (disabled for now)
  // createWebSocket(runId: string) {
  //   const wsUrl = this.baseURL.replace("http", "ws")
  //   return new WebSocket(`${wsUrl}/ws/runs/${runId}?token=${this.token}`)
  // }
}

export const apiClient = new APIClient()
