import { CategorizationResultItem, BusinessContext, PatternMatchResult } from './enhanced-types'
import type { ChartOfAccount } from './types'

// Transaction interface for categorization methods
interface TransactionInput {
  type: string
  amount: number
  description: string
  contact?: string
}

/**
 * Enhanced AI Transaction Categorizer with Business Intelligence
 * Implements sophisticated categorization with business context analysis,
 * multi-criteria pattern matching, and statistical confidence scoring
 */
export class ContextualAICategorizer {
  private readonly chartOfAccounts: ChartOfAccount[]
  private readonly historicalPatterns: Map<string, PatternMatchResult[]> = new Map()
  private readonly businessIntelligence: Map<string, BusinessContext> = new Map()

  constructor(chartOfAccounts: ChartOfAccount[]) {
    this.chartOfAccounts = chartOfAccounts
    this.initializeBusinessIntelligence()
  }

  /**
   * Categorize transactions with enhanced business context analysis
   */
  async categorizeTransactions(
    transactions: Array<{
      id: string
      date: string
      description: string
      amount: number
      type: 'DR' | 'CR'
      contact?: string
    }>
  ): Promise<CategorizationResultItem[]> {
    const results: CategorizationResultItem[] = []

    for (const transaction of transactions) {
      // Analyze business context
      const businessContext = await this.analyzeBusinessContext(transaction)
      
      // Find historical patterns
      const patterns = this.findHistoricalPatterns(transaction)
      
      // Generate AI categorization with enhanced reasoning
      const categorization = await this.generateSmartCategorization(
        transaction, 
        businessContext, 
        patterns
      )

      results.push({
        ...transaction,
        businessContext,
        categorization,
        patterns,
        isEdited: false
      })
    }

    // Update pattern learning from new results
    this.updatePatternLearning(results)

    return results
  }

  /**
   * Analyze business context with intelligence inference
   */
  private async analyzeBusinessContext(transaction: {
    description: string
    amount: number
    contact?: string
    type: 'DR' | 'CR'
  }): Promise<BusinessContext> {
    const contact = transaction.contact || this.extractContactFromDescription(transaction.description)
    
    // Check existing business intelligence
    if (this.businessIntelligence.has(contact)) {
      return this.businessIntelligence.get(contact)!
    }

    // Infer business nature from transaction patterns
    const businessNature = this.inferBusinessNature(transaction)
    const relationshipType = this.inferRelationshipType(transaction, businessNature)
    const industry = this.inferIndustry(transaction)

    const context: BusinessContext = {
      contactName: contact,
      businessNature,
      relationshipType,
      industry,
      typicalAmountRange: this.calculateAmountRange(transaction.amount),
      transactionFrequency: 'low', // Will be updated with more data
      preferredAccounts: [],
      businessKeywords: this.extractBusinessKeywords(transaction.description),
      confidenceScore: this.calculateBusinessContextConfidence(transaction)
    }

    // Cache for future use
    this.businessIntelligence.set(contact, context)
    return context
  }

  /**
   * Find historical patterns using multi-criteria matching
   */
  private findHistoricalPatterns(transaction: {
    description: string
    amount: number
    contact?: string
    type: 'DR' | 'CR'
  }): PatternMatchResult[] {
    const contact = transaction.contact || this.extractContactFromDescription(transaction.description)
    const existingPatterns = this.historicalPatterns.get(contact) || []
    
    return existingPatterns.filter(pattern => {
      // Multi-criteria matching
      const contactMatch = pattern.contactSimilarity >= 0.8
      const amountInRange = transaction.amount >= pattern.amountRange.min && 
                           transaction.amount <= pattern.amountRange.max
      const typeMatch = pattern.transactionType === transaction.type
      const descriptionSimilarity = this.calculateDescriptionSimilarity(
        transaction.description, 
        pattern.descriptionPattern
      )

      return contactMatch && amountInRange && typeMatch && descriptionSimilarity >= 0.6
    }).sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Generate smart categorization with enhanced AI reasoning
   */
  private async generateSmartCategorization(
    transaction: {
      description: string
      amount: number
      type: 'DR' | 'CR'
      contact?: string
    },
    businessContext: BusinessContext,
    patterns: PatternMatchResult[]
  ) {
    // Simulate AI categorization with sophisticated logic
    const baseMatch = this.findBestAccountMatch(transaction, businessContext)
    
    // Apply pattern-based confidence boosting
    let confidence = baseMatch.confidence
    if (patterns.length > 0) {
      const patternBoost = Math.min(0.3, patterns[0].confidence * 0.4)
      confidence = Math.min(0.99, confidence + patternBoost)
    }

    // Apply business context confidence adjustment
    const contextBoost = businessContext.confidenceScore * 0.2
    confidence = Math.min(0.99, confidence + contextBoost)

    // Generate warning flags
    const warningFlags: string[] = []
    if (confidence < 0.6) warningFlags.push('Low confidence categorization')
    if (transaction.amount > 10000) warningFlags.push('High amount transaction')
    if (patterns.length === 0) warningFlags.push('No historical pattern found')
    if (businessContext.confidenceScore < 0.5) warningFlags.push('Uncertain business context')

    // Enhanced reasoning with business intelligence
    const reasoning = this.generateEnhancedReasoning(
      transaction, 
      businessContext, 
      patterns, 
      baseMatch,
      confidence
    )

    return {
      accountId: baseMatch.accountId,
      accountName: baseMatch.accountName,
      confidence,
      reasoning,
      alternativeOptions: [],
      businessLogic: `Business context: ${businessContext.businessNature}. Pattern matches: ${patterns.length}`,
      warningFlags: warningFlags.length > 0 ? warningFlags : undefined
    }
  }

  /**
   * Build enhanced AI prompt with business context
   */
  private buildEnhancedPrompt(
    transaction: { type: string; amount: number; description: string; contact?: string },
    businessContext: BusinessContext,
    patterns: PatternMatchResult[]
  ): string {
    return `Categorize this ${transaction.type} transaction for $${transaction.amount.toLocaleString()}:

TRANSACTION: "${transaction.description}"
CONTACT: ${businessContext.contactName}
BUSINESS CONTEXT:
- Nature: ${businessContext.businessNature}
- Relationship: ${businessContext.relationshipType} 
- Industry: ${businessContext.industry}
- Typical Range: ${businessContext.typicalAmountRange}
- Keywords: ${businessContext.businessKeywords.join(', ')}

HISTORICAL PATTERNS: ${patterns.length} similar transactions found
${patterns.slice(0, 2).map(p => `- ${p.descriptionPattern} (${(p.confidence * 100).toFixed(1)}% match)`).join('\n')}

CHART OF ACCOUNTS:
${this.chartOfAccounts.map(acc => `${acc.code} - ${acc.name} (${acc.class})`).join('\n')}

Consider business relationship context, transaction nature, and historical patterns for accurate categorization.`
  }

  /**
   * Find best account match using business context
   */
  private findBestAccountMatch(
    transaction: TransactionInput,
    businessContext: BusinessContext
  ): { accountId: string; accountName: string; confidence: number } {
    const description = transaction.description.toLowerCase()
    const amount = transaction.amount
    const businessNature = businessContext.businessNature.toLowerCase()
    
    // Enhanced matching logic with business context
    let bestMatch = this.chartOfAccounts[0]
    let maxScore = 0

    for (const account of this.chartOfAccounts) {
      let score = 0
      const accountName = account.name.toLowerCase()
      
      // Direct keyword matching (40% weight)
      if (description.includes(accountName) || accountName.includes(description.split(' ')[0])) {
        score += 0.4
      }

      // Business nature alignment (30% weight)
      if (businessNature.includes('supplier') || businessNature.includes('vendor')) {
        if (accountName.includes('expense') || accountName.includes('cost') || accountName.includes('purchase')) {
          score += 0.3
        }
      } else if (businessNature.includes('customer') || businessNature.includes('client')) {
        if (accountName.includes('revenue') || accountName.includes('sales') || accountName.includes('income')) {
          score += 0.3
        }
      }

      // Transaction type alignment (20% weight)
      if (transaction.type === 'DR' && (account.class === 'Asset' || account.class === 'Expense')) {
        score += 0.2
      } else if (transaction.type === 'CR' && (account.class === 'Liability' || account.class === 'Revenue' || account.class === 'Equity')) {
        score += 0.2
      }

      // Amount-based context (10% weight)
      if (amount > 1000 && accountName.includes('equipment') || accountName.includes('asset')) {
        score += 0.1
      }

      if (score > maxScore) {
        maxScore = score
        bestMatch = account
      }
    }

    return {
      accountId: bestMatch.code,
      accountName: bestMatch.name,
      confidence: Math.max(0.3, Math.min(0.95, maxScore))
    }
  }

  /**
   * Generate enhanced reasoning with business intelligence
   */
  private generateEnhancedReasoning(
    transaction: TransactionInput,
    businessContext: BusinessContext,
    patterns: PatternMatchResult[],
    baseMatch: { accountId: string; accountName: string; confidence: number },
    confidence: number
  ): string {
    const reasons: string[] = []

    // Business context reasoning
    reasons.push(`Identified ${businessContext.contactName} as ${businessContext.businessNature} in ${businessContext.industry} industry`)
    
    // Pattern matching reasoning
    if (patterns.length > 0) {
      reasons.push(`Found ${patterns.length} similar historical patterns with ${(patterns[0].confidence * 100).toFixed(1)}% similarity`)
    }

    // Account selection reasoning
    reasons.push(`Selected ${baseMatch.accountName} based on business relationship and transaction nature`)
    
    // Confidence explanation
    if (confidence >= 0.8) {
      reasons.push(`High confidence due to strong business context and historical patterns`)
    } else if (confidence >= 0.6) {
      reasons.push(`Medium confidence with good business context match`)
    } else {
      reasons.push(`Lower confidence suggests manual review recommended`)
    }

    return reasons.join('. ') + '.'
  }

  // Helper methods for business intelligence
  private initializeBusinessIntelligence(): void {
    // Initialize with common business patterns
    // This would typically load from a database or API
  }

  private extractContactFromDescription(description: string): string {
    // Extract contact name from transaction description
    const words = description.split(' ')
    return words.slice(0, 2).join(' ') || 'Unknown Contact'
  }

  private inferBusinessNature(transaction: TransactionInput): string {
    const desc = transaction.description.toLowerCase()
    
    if (desc.includes('payment') || desc.includes('invoice') || desc.includes('bill')) {
      return transaction.type === 'DR' ? 'Supplier/Vendor' : 'Customer Payment'
    } else if (desc.includes('salary') || desc.includes('wage') || desc.includes('payroll')) {
      return 'Employee'
    } else if (desc.includes('rent') || desc.includes('lease')) {
      return 'Property/Landlord'
    } else if (desc.includes('loan') || desc.includes('interest')) {
      return 'Financial Institution'
    } else if (desc.includes('tax') || desc.includes('government')) {
      return 'Government Entity'
    }
    
    return 'Business Partner'
  }

  private inferRelationshipType(transaction: TransactionInput, businessNature: string): string {
    if (businessNature.includes('Supplier') || businessNature.includes('Vendor')) {
      return 'Vendor Relationship'
    } else if (businessNature.includes('Customer')) {
      return 'Customer Relationship'
    } else if (businessNature.includes('Employee')) {
      return 'Employment Relationship'
    }
    return 'Business Relationship'
  }

  private inferIndustry(transaction: TransactionInput): string {
    const desc = transaction.description.toLowerCase()
    
    if (desc.includes('tech') || desc.includes('software') || desc.includes('IT')) {
      return 'Technology'
    } else if (desc.includes('construction') || desc.includes('building')) {
      return 'Construction'
    } else if (desc.includes('medical') || desc.includes('health')) {
      return 'Healthcare'
    } else if (desc.includes('legal') || desc.includes('law')) {
      return 'Legal Services'
    }
    
    return 'General Business'
  }

  private calculateAmountRange(amount: number): string {
    if (amount < 100) return 'Micro ($0-$100)'
    if (amount < 1000) return 'Small ($100-$1K)'
    if (amount < 10000) return 'Medium ($1K-$10K)'
    if (amount < 100000) return 'Large ($10K-$100K)'
    return 'Enterprise ($100K+)'
  }

  private extractBusinessKeywords(description: string): string[] {
    const keywords: string[] = []
    const desc = description.toLowerCase()
    
    const businessTerms = ['payment', 'invoice', 'service', 'product', 'consulting', 'maintenance', 'supply', 'rental', 'subscription']
    businessTerms.forEach(term => {
      if (desc.includes(term)) keywords.push(term)
    })
    
    return keywords
  }

  private calculateBusinessContextConfidence(transaction: TransactionInput): number {
    let confidence = 0.5
    
    // More descriptive transactions get higher confidence
    if (transaction.description.length > 20) confidence += 0.2
    if (transaction.contact && transaction.contact !== 'Unknown Contact') confidence += 0.2
    if (transaction.amount > 0) confidence += 0.1
    
    return Math.min(0.95, confidence)
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    // Simple similarity calculation
    const words1 = desc1.toLowerCase().split(' ')
    const words2 = desc2.toLowerCase().split(' ')
    const commonWords = words1.filter(word => words2.includes(word))
    
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  private updatePatternLearning(results: CategorizationResultItem[]): void {
    // Update historical patterns based on new results
    results.forEach(result => {
      const contact = result.contact || 'Unknown Contact'
      const patterns = this.historicalPatterns.get(contact) || []
      
      // Add new pattern
      const newPattern: PatternMatchResult = {
        contactSimilarity: 1.0,
        amountRange: { 
          min: result.amount * 0.8, 
          max: result.amount * 1.2 
        },
        transactionType: result.type,
        descriptionPattern: result.description,
        accountId: result.categorization.accountId,
        confidence: result.categorization.confidence,
        frequency: 1,
        lastSeen: new Date().toISOString()
      }
      
      patterns.push(newPattern)
      this.historicalPatterns.set(contact, patterns)
    })
  }
}