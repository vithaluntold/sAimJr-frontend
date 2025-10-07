// Enhanced interfaces for sophisticated AI categorization system

// Business Context for Enhanced AI Categorization
export interface BusinessContext {
  contactName: string
  businessNature: string
  relationshipType: string
  industry: string
  typicalAmountRange: string
  transactionFrequency: 'low' | 'medium' | 'high'
  preferredAccounts: string[]
  businessKeywords: string[]
  confidenceScore: number
}

// Enhanced Transaction Categorization Result
export interface TransactionCategorization {
  accountId: string
  accountName: string
  confidence: number
  reasoning: string
  alternativeOptions: {
    accountId: string
    accountName: string
    confidence: number
    reasoning: string
  }[]
  businessLogic: string
  warningFlags?: string[]
}

// Pattern Match Result with Enhanced Analytics
export interface PatternMatchResult {
  contactSimilarity: number
  amountRange: {
    min: number
    max: number
  }
  transactionType: 'CR' | 'DR'
  descriptionPattern: string
  accountId: string
  confidence: number
  frequency: number
  lastSeen: string
  historicalContext?: string
  amountAnalysis?: {
    withinRange: boolean
    expectedRange: { min: number, max: number }
    variance: number
  }
}

// Account Category Pattern with Amount Analysis
export interface AccountCategoryPattern {
  contact: string
  accountCode: string
  accountName: string
  transactionCount: number
  avgAmount: number
  minAmount: number
  maxAmount: number
  amountVariance: number
  descriptions: string[]
  confidence: number
  lastUsed: string
  consistencyScore: number
}

// Contact Summary for UI Analytics
export interface ContactSummary {
  contactName: string
  businessNature: string
  relationshipType: string
  transactionCount: number
  totalAmount: number
  avgConfidence: number
  warningCount: number
  transactions: CategorizationResultItem[]
}

// Categorization Results Item for UI
export interface CategorizationResultItem {
  id: string
  date: string
  description: string
  amount: number
  type: 'CR' | 'DR'
  contact?: string
  businessContext: BusinessContext
  categorization: TransactionCategorization
  patterns: PatternMatchResult[]
  isEdited?: boolean
  originalCategorization?: TransactionCategorization
}