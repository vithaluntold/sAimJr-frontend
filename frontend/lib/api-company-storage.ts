// API-enabled company storage with localStorage fallback for caching
import type {
  CompanyProfile,
  ProcessingRun,
  HistoricalTransaction,
  TransactionRule,
  ChatSession,
} from "./types"
import { apiClient } from "./api-client"

export class APICompanyStorage {
  // Company profiles
  static async getCompanyProfile(companyId: string): Promise<CompanyProfile | null> {
    try {
      // Try API first
      const profile = await apiClient.getCompanyProfile(companyId)
      
      // Cache in localStorage
      localStorage.setItem(`saimJr_companyProfile_${companyId}`, JSON.stringify(profile))
      
      return profile
    } catch (error) {
      console.error("Failed to fetch company profile from API, trying localStorage:", error)
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`saimJr_companyProfile_${companyId}`)
      return stored ? JSON.parse(stored) : null
    }
  }

  static async saveCompanyProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    try {
      // Update last accessed time
      profile.lastAccessedAt = new Date().toISOString()
      
      let savedProfile: CompanyProfile
      
      if (profile.id && profile.id !== "temp") {
        // Update existing profile
        savedProfile = await apiClient.updateCompanyProfile(profile.id, profile)
      } else {
        // Create new profile
        savedProfile = await apiClient.createCompanyProfile(profile)
      }
      
      // Cache in localStorage
      localStorage.setItem(`saimJr_companyProfile_${savedProfile.id}`, JSON.stringify(savedProfile))
      localStorage.setItem("saimJr_currentCompanyId", savedProfile.id)
      
      return savedProfile
    } catch (error) {
      console.error("Failed to save company profile to API, saving to localStorage:", error)
      
      // Fallback to localStorage
      profile.lastAccessedAt = new Date().toISOString()
      localStorage.setItem(`saimJr_companyProfile_${profile.id}`, JSON.stringify(profile))
      localStorage.setItem("saimJr_currentCompanyId", profile.id)
      
      return profile
    }
  }

  // Chat sessions
  static async getChatSession(companyId: string): Promise<ChatSession | null> {
    try {
      // Try to get the most recent chat session for the company
      const sessions = await apiClient.getChatSessions(companyId)
      const activeSession = sessions.find((s: ChatSession) => s.isActive) || sessions[0]
      
      if (activeSession) {
        // Cache in localStorage
        localStorage.setItem(`saimJr_chatSessions_${companyId}`, JSON.stringify(activeSession))
        return activeSession
      }
      
      return null
    } catch (error) {
      console.error("Failed to fetch chat session from API, trying localStorage:", error)
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`saimJr_chatSessions_${companyId}`)
      return stored ? JSON.parse(stored) : null
    }
  }

  static async saveChatSession(session: ChatSession): Promise<ChatSession> {
    try {
      session.updatedAt = new Date().toISOString()
      session.lastMessageAt = new Date().toISOString()
      
      let savedSession: ChatSession
      
      if (session.id && !session.id.startsWith("chat_")) {
        // Update existing session via API (not implemented in current backend)
        // For now, just cache locally
        savedSession = session
      } else {
        // Create new session
        savedSession = await apiClient.createChatSession(session.companyId, session)
      }
      
      // Cache in localStorage
      localStorage.setItem(`saimJr_chatSessions_${session.companyId}`, JSON.stringify(savedSession))
      
      return savedSession
    } catch (error) {
      console.error("Failed to save chat session to API, saving to localStorage:", error)
      
      // Fallback to localStorage
      session.updatedAt = new Date().toISOString()
      session.lastMessageAt = new Date().toISOString()
      localStorage.setItem(`saimJr_chatSessions_${session.companyId}`, JSON.stringify(session))
      
      return session
    }
  }

  static async createChatSession(companyId: string, userId: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `chat_${Date.now()}`,
      companyId,
      userId,
      messages: [],
      currentStep: 1,
      completedSteps: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    }
    
    return this.saveChatSession(session)
  }

  // File uploads
  static async uploadFile(companyId: string, file: File, fileType: string = "bank_statement"): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      return await apiClient.uploadFile(companyId, file, fileType)
    } catch (error) {
      console.error("Failed to upload file to API:", error)
      throw error
    }
  }

  // Transactions
  static async getTransactions(companyId: string): Promise<HistoricalTransaction[]> {
    try {
      const transactions = await apiClient.getTransactions(companyId)
      
      // Cache in localStorage
      localStorage.setItem(`saimJr_historicalTransactions_${companyId}`, JSON.stringify(transactions))
      
      return transactions
    } catch (error) {
      console.error("Failed to fetch transactions from API, trying localStorage:", error)
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`saimJr_historicalTransactions_${companyId}`)
      return stored ? JSON.parse(stored) : []
    }
  }

  static async saveTransaction(companyId: string, transaction: HistoricalTransaction): Promise<HistoricalTransaction> {
    try {
      let savedTransaction: HistoricalTransaction
      
      if (transaction.id && !transaction.id.startsWith("temp_")) {
        // Update existing
        savedTransaction = await apiClient.updateTransaction(companyId, transaction.id, transaction)
      } else {
        // Create new
        savedTransaction = await apiClient.createTransaction(companyId, transaction)
      }
      
      return savedTransaction
    } catch (error) {
      console.error("Failed to save transaction to API:", error)
      throw error
    }
  }

  // Rules
  static async getTransactionRules(companyId: string): Promise<TransactionRule[]> {
    try {
      const rules = await apiClient.getRules(companyId)
      
      // Cache in localStorage
      localStorage.setItem(`saimJr_transactionRules_${companyId}`, JSON.stringify(rules))
      
      return rules
    } catch (error) {
      console.error("Failed to fetch rules from API, trying localStorage:", error)
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`saimJr_transactionRules_${companyId}`)
      return stored ? JSON.parse(stored) : []
    }
  }

  static async saveTransactionRule(rule: TransactionRule): Promise<TransactionRule> {
    try {
      let savedRule: TransactionRule
      
      if (rule.id && !rule.id.startsWith("temp_")) {
        // Update existing
        savedRule = await apiClient.updateRule(rule.companyId, rule.id, rule)
      } else {
        // Create new
        savedRule = await apiClient.createRule(rule.companyId, rule)
      }
      
      return savedRule
    } catch (error) {
      console.error("Failed to save rule to API:", error)
      throw error
    }
  }

  // Processing runs
  static async getProcessingRuns(companyId: string): Promise<ProcessingRun[]> {
    try {
      const runs = await apiClient.getProcessingRuns(companyId)
      
      // Cache in localStorage
      localStorage.setItem(`saimJr_processingRuns_${companyId}`, JSON.stringify(runs))
      
      return runs
    } catch (error) {
      console.error("Failed to fetch processing runs from API, trying localStorage:", error)
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`saimJr_processingRuns_${companyId}`)
      return stored ? JSON.parse(stored) : []
    }
  }

  // Utility methods for backward compatibility
  static getCurrentCompanyId(): string | null {
    return localStorage.getItem("saimJr_currentCompanyId")
  }

  static setCurrentCompanyId(companyId: string): void {
    localStorage.setItem("saimJr_currentCompanyId", companyId)
  }
}

// Export both for gradual migration
export { CompanyStorage } from "./company-storage"
export default APICompanyStorage