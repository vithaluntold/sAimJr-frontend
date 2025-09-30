export interface FileUploadPromptContent {
  title: string
  description: string
  fileType: "coa" | "contacts" | "bank_statement"
  accept: string // e.g., ".csv,.xlsx,.pdf"
  sampleDownloadLink?: string
  optional?: boolean
}

export type OutputContentType =
  | "coa"
  | "transactions"
  | "contacts"
  | "exceptions"
  | "final_report"
  | "rules"
  | "company_profile"
  | "processing_history"
  | null

export interface Message {
  id: string
  sender: "user" | "saim"
  text?: string
  options?: { label: string; action: string; payload?: any }[]
  componentType?: "file_upload_prompt"
  componentProps?: FileUploadPromptContent
  isProcessing?: boolean
  processingStartTime?: number
  estimatedDuration?: number
  expectsDateInput?: "from" | "to" | null
  currentException?: TransactionException
  ruleCreationState?: RuleCreationState
}

export interface ChartOfAccount {
  code: string
  name: string
  category: string
  class: string
  statement: string
}

export interface Contact {
  id: string
  name: string
  type: "Client" | "Vendor" | "Other"
  email?: string
  phone?: string
  address?: string
}

export interface TransactionException {
  id: string
  date: string
  description: string
  amount: number
  reason: string
  suggestedAccount?: string
  isResolved?: boolean
  runId?: string // Link to specific processing run
}

export interface FinalReportData {
  reportUrl?: string
  summary: string
  periodFrom: string
  periodTo: string
  runId: string
}

// Enhanced Company Profile with multi-tenant support
export interface CompanyProfile {
  id: string
  userId: string // Owner of the company
  businessName: string
  natureOfBusiness: string
  industry: string
  location: string
  reportingFramework: string
  statutoryCompliances: string[]
  createdAt: string
  updatedAt: string
  lastAccessedAt: string // Track when user last worked on this company
  chartOfAccounts: ChartOfAccount[]
  contacts: Contact[]
  isSetupComplete: boolean
  // AI Learning Stats
  totalTransactionsProcessed: number
  totalRulesCreated: number
  averageAccuracy: number
  // Chat state
  currentStep: number
  completedSteps: number[]
  hasActiveChat: boolean
}

// Processing Run - Each bank statement processing session
export interface ProcessingRun {
  id: string
  companyId: string
  fileName: string
  fileType: string
  periodFrom: string
  periodTo: string
  processedAt: string
  status: "completed" | "in_progress" | "failed"
  transactionCount: number
  exceptionsCount: number
  rulesApplied: string[] // Rule IDs that were applied
  summary: string
  tokensUsed: number // Track tokens consumed
  cost: number // Cost in USD
  aiAccuracy: number // AI prediction accuracy for this run
}

// Enhanced Historical Transaction with vector embeddings
export interface HistoricalTransaction {
  id: string
  companyId: string
  runId: string
  date: string
  description: string
  amount: number
  category: string
  accountId: string
  accountName: string
  payee?: string
  confidence: number // AI confidence in categorization
  wasException: boolean
  ruleApplied?: string // Rule ID if applied
  vectorEmbedding?: number[] // Simulated vector embedding
  // Enhanced fields for better AI learning
  merchantCategory?: string
  transactionType: "debit" | "credit"
  isRecurring: boolean
  similarityScore?: number // Similarity to other transactions
  userFeedback?: "correct" | "incorrect" | "partial" // User validation
}

// Rule Management with enhanced AI suggestions
export type RuleConditionField = "description" | "amount" | "payee" | "merchant_category"
export type RuleConditionOperator =
  | "contains"
  | "equals"
  | "greater_than"
  | "less_than"
  | "is_between"
  | "starts_with"
  | "ends_with"

export interface RuleCondition {
  field: RuleConditionField
  operator: RuleConditionOperator
  value: string | number | [number, number]
}

export interface TransactionRule {
  id: string
  companyId: string
  name: string
  conditions: RuleCondition[]
  applyToAccountId: string
  applyToAccountName: string
  isPermanent: boolean
  isEnabled: boolean
  createdAt: string
  timesApplied: number
  accuracy: number // Success rate of this rule
  // Enhanced AI features
  suggestedBySaim: boolean // Whether S(ai)m Jr suggested this rule
  basedOnTransactionIds: string[] // Transactions this rule was learned from
  confidence: number // AI confidence in this rule
  lastAppliedAt?: string
  userValidated: boolean // Whether user has validated this rule
}

// For multi-step rule creation in chat
export interface RuleCreationState {
  step: "name" | "condition_field" | "condition_operator" | "condition_value" | "account" | "confirm"
  exception?: TransactionException
  ruleName?: string
  conditions?: RuleCondition[]
  currentCondition?: Partial<RuleCondition>
  targetAccountId?: string
  targetAccountName?: string
  suggestedByAI?: boolean
  basedOnTransactions?: HistoricalTransaction[]
}

// Enhanced AI Learning Context with vector similarity
export interface AIContext {
  companyProfile: CompanyProfile
  historicalTransactions: HistoricalTransaction[]
  activeRules: TransactionRule[]
  processingHistory: ProcessingRun[]
  similarTransactionPatterns: TransactionPattern[]
  suggestedRules: SuggestedRule[]
  vectorSimilarities: VectorSimilarity[]
}

// New types for enhanced AI features
export interface TransactionPattern {
  pattern: string
  frequency: number
  suggestedAccount: string
  confidence: number
  exampleTransactions: string[] // Transaction IDs
  merchantCategory?: string
}

export interface SuggestedRule {
  id: string
  name: string
  conditions: RuleCondition[]
  targetAccount: string
  confidence: number
  basedOnTransactions: string[]
  potentialMatches: number // How many future transactions this might match
  estimatedAccuracy: number
}

export interface VectorSimilarity {
  transactionId: string
  similarTransactions: {
    id: string
    similarity: number
    description: string
    category: string
  }[]
}

// Chat Session Management
export interface ChatSession {
  id: string
  companyId: string
  userId: string
  messages: Message[]
  currentStep: number
  completedSteps: number[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastMessageAt: string
}

// User and Authentication Types (enhanced)
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  createdAt: string
  emailVerified: boolean
  companies: string[] // Company IDs user has access to
  defaultCompanyId?: string // Last accessed company
  preferences: {
    theme: "light" | "dark" | "system"
    notifications: boolean
    autoSaveRules: boolean
  }
}

// Subscription and Billing Types
export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise"

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number // Monthly price in USD
  tokensIncluded: number // Monthly token allowance
  features: string[]
  maxCompanies: number
  maxTransactionsPerRun: number
  prioritySupport: boolean
  customRules: boolean
  apiAccess: boolean
  vectorDbAccess: boolean // Access to advanced AI features
  unlimitedHistory: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: "active" | "canceled" | "past_due" | "trialing"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
}

// Token and Usage Types
export interface TokenWallet {
  id: string
  userId: string
  balance: number // Current token balance
  totalPurchased: number // Lifetime tokens purchased
  totalUsed: number // Lifetime tokens used
  lastUpdated: string
}

export interface TokenTransaction {
  id: string
  userId: string
  companyId?: string // Track which company used tokens
  type: "purchase" | "usage" | "refund" | "bonus"
  amount: number // Positive for purchases/bonuses, negative for usage
  description: string
  processingRunId?: string // If related to a processing run
  createdAt: string
  metadata?: Record<string, any>
}

export interface TokenPackage {
  id: string
  name: string
  tokens: number
  price: number // Price in USD
  bonus: number // Bonus tokens (e.g., buy 1000, get 100 free)
  popular?: boolean
}

// Payment Types
export interface PaymentMethod {
  id: string
  userId: string
  type: "card" | "bank_account"
  last4: string
  brand?: string // For cards: visa, mastercard, etc.
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  stripePaymentMethodId: string
}

export interface PaymentIntent {
  id: string
  userId: string
  amount: number // Amount in cents
  currency: string
  status: "requires_payment_method" | "requires_confirmation" | "processing" | "succeeded" | "canceled"
  description: string
  tokenPackageId?: string
  subscriptionId?: string
  stripePaymentIntentId: string
  createdAt: string
}

// Usage Analytics (per company)
export interface UsageAnalytics {
  userId: string
  companyId: string
  period: string // YYYY-MM format
  tokensUsed: number
  transactionsProcessed: number
  rulesCreated: number
  rulesApplied: number
  averageTokensPerTransaction: number
  topCategories: { category: string; count: number }[]
  costSavings: number // Estimated cost savings vs manual processing
  aiAccuracyTrend: { date: string; accuracy: number }[]
}

// Token Pricing Configuration
export interface TokenPricing {
  baseTransactionCost: number // Base tokens per transaction
  complexTransactionMultiplier: number // Multiplier for complex transactions
  exceptionHandlingCost: number // Extra tokens for exception handling
  ruleCreationCost: number // Tokens for creating new rules
  reportGenerationCost: number // Tokens for generating reports
  coaGenerationCost: number // Tokens for COA generation
  vectorSearchCost: number // Tokens for vector similarity search
  aiSuggestionCost: number // Tokens for AI rule suggestions
}


