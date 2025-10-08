// Enhanced company data storage with multi-tenant support
import type {
  CompanyProfile,
  ProcessingRun,
  HistoricalTransaction,
  TransactionRule,
  AIContext,
  ChatSession,
  TransactionPattern,
  SuggestedRule,
  VectorSimilarity,
} from "./types"

const STORAGE_KEYS = {
  USER_COMPANIES: "saimJr_userCompanies",
  COMPANY_PROFILE: "saimJr_companyProfile",
  PROCESSING_RUNS: "saimJr_processingRuns",
  HISTORICAL_TRANSACTIONS: "saimJr_historicalTransactions",
  TRANSACTION_RULES: "saimJr_transactionRules",
  CHAT_SESSIONS: "saimJr_chatSessions",
  CURRENT_COMPANY_ID: "saimJr_currentCompanyId",
  AI_PATTERNS: "saimJr_aiPatterns",
  SUGGESTED_RULES: "saimJr_suggestedRules",
  VECTOR_SIMILARITIES: "saimJr_vectorSimilarities",
}

export class CompanyStorage {
  // User's companies management
  static getUserCompanies(userId: string): string[] {
    const stored = localStorage.getItem(`${STORAGE_KEYS.USER_COMPANIES}_${userId}`)
    return stored ? JSON.parse(stored) : []
  }

  static addUserCompany(userId: string, companyId: string): void {
    const companies = this.getUserCompanies(userId)
    if (!companies.includes(companyId)) {
      companies.push(companyId)
      localStorage.setItem(`${STORAGE_KEYS.USER_COMPANIES}_${userId}`, JSON.stringify(companies))
    }
  }

  static removeUserCompany(userId: string, companyId: string): void {
    const companies = this.getUserCompanies(userId).filter((id) => id !== companyId)
    localStorage.setItem(`${STORAGE_KEYS.USER_COMPANIES}_${userId}`, JSON.stringify(companies))
  }

  // Current company context
  static getCurrentCompanyId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_COMPANY_ID)
  }

  static setCurrentCompanyId(companyId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_COMPANY_ID, companyId)
  }

  // Company profiles
  static getCompanyProfile(companyId?: string): CompanyProfile | null {
    const id = companyId || this.getCurrentCompanyId()
    if (!id) return null

    const stored = localStorage.getItem(`${STORAGE_KEYS.COMPANY_PROFILE}_${id}`)
    return stored ? JSON.parse(stored) : null
  }

  static saveCompanyProfile(profile: CompanyProfile): void {
    // Update last accessed time
    profile.lastAccessedAt = new Date().toISOString()
    localStorage.setItem(`${STORAGE_KEYS.COMPANY_PROFILE}_${profile.id}`, JSON.stringify(profile))
    this.setCurrentCompanyId(profile.id)
    this.addUserCompany(profile.userId, profile.id)
  }

  static getAllUserCompanyProfiles(userId: string): CompanyProfile[] {
    const companyIds = this.getUserCompanies(userId)
    return (companyIds.map((id) => this.getCompanyProfile(id)).filter((profile) => profile !== null) as CompanyProfile[])
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
  }

  // Processing runs (per company)
  static getProcessingRuns(companyId?: string): ProcessingRun[] {
    const id = companyId || this.getCurrentCompanyId()
    if (!id) return []

    const stored = localStorage.getItem(`${STORAGE_KEYS.PROCESSING_RUNS}_${id}`)
    return stored ? JSON.parse(stored) : []
  }

  static saveProcessingRun(run: ProcessingRun): void {
    const runs = this.getProcessingRuns(run.companyId)
    const updatedRuns = [...runs.filter((r) => r.id !== run.id), run]
    localStorage.setItem(`${STORAGE_KEYS.PROCESSING_RUNS}_${run.companyId}`, JSON.stringify(updatedRuns))
  }

  // Historical transactions (per company with vector embeddings)
  static getHistoricalTransactions(companyId?: string): HistoricalTransaction[] {
    const id = companyId || this.getCurrentCompanyId()
    if (!id) return []

    const stored = localStorage.getItem(`${STORAGE_KEYS.HISTORICAL_TRANSACTIONS}_${id}`)
    return stored ? JSON.parse(stored) : []
  }

  static saveHistoricalTransactions(transactions: HistoricalTransaction[], companyId?: string): void {
    const id = companyId || this.getCurrentCompanyId()
    if (!id) return

    const existing = this.getHistoricalTransactions(id)
    const combined = [...existing, ...transactions]
    localStorage.setItem(`${STORAGE_KEYS.HISTORICAL_TRANSACTIONS}_${id}`, JSON.stringify(combined))

    // Update company stats
    this.updateCompanyStats(id)
  }

  // Transaction rules (per company)
  static getTransactionRules(companyId?: string): TransactionRule[] {
    const id = companyId || this.getCurrentCompanyId()
    if (!id) return []

    const stored = localStorage.getItem(`${STORAGE_KEYS.TRANSACTION_RULES}_${id}`)
    return stored ? JSON.parse(stored) : []
  }

  static saveTransactionRule(rule: TransactionRule): void {
    const rules = this.getTransactionRules(rule.companyId)
    const updatedRules = [...rules.filter((r) => r.id !== rule.id), rule]
    localStorage.setItem(`${STORAGE_KEYS.TRANSACTION_RULES}_${rule.companyId}`, JSON.stringify(updatedRules))

    // Update company stats
    this.updateCompanyStats(rule.companyId)
  }

  // Chat sessions (per company)
  static getChatSession(companyId: string): ChatSession | null {
    const stored = localStorage.getItem(`${STORAGE_KEYS.CHAT_SESSIONS}_${companyId}`)
    return stored ? JSON.parse(stored) : null
  }

  static saveChatSession(session: ChatSession): void {
    session.updatedAt = new Date().toISOString()
    session.lastMessageAt = new Date().toISOString()
    localStorage.setItem(`${STORAGE_KEYS.CHAT_SESSIONS}_${session.companyId}`, JSON.stringify(session))
  }

  static createChatSession(companyId: string, userId: string): ChatSession {
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
    this.saveChatSession(session)
    return session
  }

  // AI Patterns and Learning (per company)
  static getAIPatterns(companyId: string): TransactionPattern[] {
    const stored = localStorage.getItem(`${STORAGE_KEYS.AI_PATTERNS}_${companyId}`)
    return stored ? JSON.parse(stored) : []
  }

  static saveAIPatterns(patterns: TransactionPattern[], companyId: string): void {
    localStorage.setItem(`${STORAGE_KEYS.AI_PATTERNS}_${companyId}`, JSON.stringify(patterns))
  }

  static getSuggestedRules(companyId: string): SuggestedRule[] {
    const stored = localStorage.getItem(`${STORAGE_KEYS.SUGGESTED_RULES}_${companyId}`)
    return stored ? JSON.parse(stored) : []
  }

  static saveSuggestedRules(rules: SuggestedRule[], companyId: string): void {
    localStorage.setItem(`${STORAGE_KEYS.SUGGESTED_RULES}_${companyId}`, JSON.stringify(rules))
  }

  static getVectorSimilarities(companyId: string): VectorSimilarity[] {
    const stored = localStorage.getItem(`${STORAGE_KEYS.VECTOR_SIMILARITIES}_${companyId}`)
    return stored ? JSON.parse(stored) : []
  }

  static saveVectorSimilarities(similarities: VectorSimilarity[], companyId: string): void {
    localStorage.setItem(`${STORAGE_KEYS.VECTOR_SIMILARITIES}_${companyId}`, JSON.stringify(similarities))
  }

  // Enhanced AI Context building
  static buildAIContext(companyId?: string): AIContext | null {
    const id = companyId || this.getCurrentCompanyId()
    if (!id) return null

    const companyProfile = this.getCompanyProfile(id)
    if (!companyProfile) return null

    const historicalTransactions = this.getHistoricalTransactions(id)
    const activeRules = this.getTransactionRules(id).filter((r) => r.isEnabled)
    const processingHistory = this.getProcessingRuns(id)
    const similarTransactionPatterns = this.getAIPatterns(id)
    const suggestedRules = this.getSuggestedRules(id)
    const vectorSimilarities = this.getVectorSimilarities(id)

    return {
      companyProfile,
      historicalTransactions,
      activeRules,
      processingHistory,
      similarTransactionPatterns,
      suggestedRules,
      vectorSimilarities,
    }
  }

  // Vector similarity search simulation
  static findSimilarTransactions(
    description: string,
    amount: number,
    companyId: string,
    limit = 5,
  ): HistoricalTransaction[] {
    const transactions = this.getHistoricalTransactions(companyId)

    // Simple similarity scoring based on description keywords and amount
    const scored = transactions.map((t) => {
      const descWords = description.toLowerCase().split(/\s+/)
      const transWords = t.description.toLowerCase().split(/\s+/)

      // Keyword similarity
      const commonWords = descWords.filter((word) =>
        transWords.some((tWord) => tWord.includes(word) || word.includes(tWord)),
      )
      const keywordScore = commonWords.length / Math.max(descWords.length, transWords.length)

      // Amount similarity (closer amounts get higher scores)
      const amountDiff = Math.abs(amount - t.amount)
      const maxAmount = Math.max(Math.abs(amount), Math.abs(t.amount))
      const amountScore = maxAmount > 0 ? 1 - amountDiff / maxAmount : 1

      // Combined score
      const similarity = keywordScore * 0.7 + amountScore * 0.3

      return { ...t, similarityScore: similarity }
    })

    return scored
      .filter((t) => t.similarityScore > 0.3) // Minimum similarity threshold
      .sort((a, b) => b.similarityScore! - a.similarityScore!)
      .slice(0, limit)
  }

  // AI Rule Suggestions based on transaction patterns
  static generateRuleSuggestions(companyId: string): SuggestedRule[] {
    const transactions = this.getHistoricalTransactions(companyId)
    const existingRules = this.getTransactionRules(companyId)

    // Group transactions by similar patterns
    const patterns: Record<string, HistoricalTransaction[]> = {}

    transactions.forEach((t) => {
      // Group by payee or description keywords
      const key = t.payee || t.description.split(" ")[0].toLowerCase()
      if (!patterns[key]) patterns[key] = []
      patterns[key].push(t)
    })

    const suggestions: SuggestedRule[] = []

    Object.entries(patterns).forEach(([pattern, patternTransactions]) => {
      if (patternTransactions.length >= 3) {
        // Need at least 3 similar transactions
        // Check if most transactions go to the same account
        const accountCounts: Record<string, number> = {}
        patternTransactions.forEach((t) => {
          accountCounts[t.accountName] = (accountCounts[t.accountName] || 0) + 1
        })

        const mostCommonAccount = Object.entries(accountCounts).sort(([, a], [, b]) => b - a)[0]

        if (mostCommonAccount && mostCommonAccount[1] / patternTransactions.length >= 0.8) {
          // 80% of transactions go to the same account
          const ruleExists = existingRules.some((rule) =>
            rule.conditions.some(
              (c) =>
                c.field === "description" &&
                typeof c.value === "string" &&
                c.value.toLowerCase().includes(pattern.toLowerCase()),
            ),
          )

          if (!ruleExists) {
            suggestions.push({
              id: `suggested_${Date.now()}_${pattern}`,
              name: `Auto-categorize ${pattern} transactions`,
              conditions: [
                {
                  field: "description",
                  operator: "contains",
                  value: pattern,
                },
              ],
              targetAccount: mostCommonAccount[0],
              confidence: mostCommonAccount[1] / patternTransactions.length,
              basedOnTransactions: patternTransactions.map((t) => t.id),
              potentialMatches: patternTransactions.length,
              estimatedAccuracy: mostCommonAccount[1] / patternTransactions.length,
            })
          }
        }
      }
    })

    this.saveSuggestedRules(suggestions, companyId)
    return suggestions
  }

  // Update company statistics
  private static updateCompanyStats(companyId: string): void {
    const profile = this.getCompanyProfile(companyId)
    if (!profile) return

    const transactions = this.getHistoricalTransactions(companyId)
    const rules = this.getTransactionRules(companyId)
    const runs = this.getProcessingRuns(companyId)

    const updatedProfile: CompanyProfile = {
      ...profile,
      totalTransactionsProcessed: transactions.length,
      totalRulesCreated: rules.length,
      averageAccuracy: runs.length > 0 ? runs.reduce((sum, run) => sum + run.aiAccuracy, 0) / runs.length : 0,
      updatedAt: new Date().toISOString(),
    }

    this.saveCompanyProfile(updatedProfile)
  }

  // Cleanup and data management
  static clearCompanyData(companyId: string): void {
    localStorage.removeItem(`${STORAGE_KEYS.COMPANY_PROFILE}_${companyId}`)
    localStorage.removeItem(`${STORAGE_KEYS.PROCESSING_RUNS}_${companyId}`)
    localStorage.removeItem(`${STORAGE_KEYS.HISTORICAL_TRANSACTIONS}_${companyId}`)
    localStorage.removeItem(`${STORAGE_KEYS.TRANSACTION_RULES}_${companyId}`)
    localStorage.removeItem(`${STORAGE_KEYS.CHAT_SESSIONS}_${companyId}`)
    localStorage.removeItem(`${STORAGE_KEYS.AI_PATTERNS}_${companyId}`)
    localStorage.removeItem(`${STORAGE_KEYS.SUGGESTED_RULES}_${companyId}`)
    localStorage.removeItem(`${STORAGE_KEYS.VECTOR_SIMILARITIES}_${companyId}`)
  }

  static exportCompanyData(companyId: string): {
    profile: CompanyProfile | null;
    runs: ProcessingRun[];
    transactions: HistoricalTransaction[];
    rules: TransactionRule[];
    chatSession: ChatSession | null;
    [key: string]: unknown;
  } {
    return {
      profile: this.getCompanyProfile(companyId),
      runs: this.getProcessingRuns(companyId),
      transactions: this.getHistoricalTransactions(companyId),
      rules: this.getTransactionRules(companyId),
      chatSession: this.getChatSession(companyId),
      aiPatterns: this.getAIPatterns(companyId),
      suggestedRules: this.getSuggestedRules(companyId),
      vectorSimilarities: this.getVectorSimilarities(companyId),
    }
  }

  static importCompanyData(companyId: string, data: Record<string, unknown>): void {
    if (data.profile) this.saveCompanyProfile(data.profile as CompanyProfile)
    if (data.runs) (data.runs as ProcessingRun[]).forEach((run: ProcessingRun) => this.saveProcessingRun(run))
    if (data.transactions) this.saveHistoricalTransactions(data.transactions as HistoricalTransaction[], companyId)
    if (data.rules) (data.rules as TransactionRule[]).forEach((rule: TransactionRule) => this.saveTransactionRule(rule))
    if (data.chatSession) this.saveChatSession(data.chatSession as ChatSession)
    if (data.aiPatterns) this.saveAIPatterns(data.aiPatterns as TransactionPattern[], companyId)
    if (data.suggestedRules) this.saveSuggestedRules(data.suggestedRules as SuggestedRule[], companyId)
    if (data.vectorSimilarities) this.saveVectorSimilarities(data.vectorSimilarities as VectorSimilarity[], companyId)
  }

  // Clear all cached data - useful for starting fresh sessions
  static clearAllData(): void {
    console.log('🧹 CLEARING ALL localStorage data for S(ai)m Jr')
    Object.values(STORAGE_KEYS).forEach(key => {
      // Find all keys that start with our storage keys
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i)
        if (storageKey && (storageKey.includes('saimJr_') || storageKey.includes(key))) {
          keysToRemove.push(storageKey)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
    })
    console.log('✅ All S(ai)m Jr data cleared from localStorage')
  }
}
