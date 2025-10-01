/**
 * Professional CSV/Excel Export Utilities for Transaction Categorization Results
 * Provides comprehensive export functionality with full metadata preservation
 */

import { CategorizationResultItem } from './enhanced-types'

export class ExportUtils {
  /**
   * Export categorization results to CSV with comprehensive metadata
   */
  static exportToCSV(results: CategorizationResultItem[], companyName: string): void {
    const headers = [
      'Date',
      'Description', 
      'Contact',
      'Amount',
      'Type',
      'Account Code',
      'Account Name',
      'AI Confidence',
      'Business Nature',
      'Relationship Type',
      'Industry',
      'Amount Range',
      'AI Reasoning',
      'Pattern Matches',
      'Warning Flags',
      'Business Logic',
      'Keywords',
      'Is Edited',
      'Context Score'
    ]

    const csvRows = [
      // Header row
      headers.join(','),
      
      // Data rows
      ...results.map(result => [
        result.date,
        `"${result.description.replace(/"/g, '""')}"`,
        `"${result.contact || 'Unknown'}"`,
        result.amount,
        result.type,
        result.categorization.accountId,
        `"${result.categorization.accountName}"`,
        (result.categorization.confidence * 100).toFixed(2) + '%',
        `"${result.businessContext.businessNature}"`,
        `"${result.businessContext.relationshipType}"`,
        `"${result.businessContext.industry}"`,
        `"${result.businessContext.typicalAmountRange}"`,
        `"${result.categorization.reasoning.replace(/"/g, '""')}"`,
        result.patterns.length,
        `"${result.categorization.warningFlags?.join('; ') || 'None'}"`,
        `"${result.categorization.businessLogic}"`,
        `"${result.businessContext.businessKeywords.join(', ')}"`,
        result.isEdited ? 'Yes' : 'No',
        (result.businessContext.confidenceScore * 100).toFixed(2) + '%'
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${companyName}_categorization_results_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Export categorization results to Excel format with multiple sheets
   */
  static exportToExcel(results: CategorizationResultItem[], companyName: string): void {
    // For a complete Excel export, we'd typically use a library like xlsx
    // For now, we'll create a comprehensive CSV that can be imported into Excel
    
    const summaryData = this.generateSummaryAnalysis(results)
    const detailedData = this.prepareDetailedExportData(results)
    
    // Create workbook-style data structure
    const workbookData = {
      summary: summaryData,
      detailed: detailedData,
      businessIntelligence: this.generateBusinessIntelligenceSheet(results)
    }

    // For demonstration, export as enhanced CSV with summary
    this.exportEnhancedCSVWithSummary(workbookData, companyName)
  }

  /**
   * Generate comprehensive summary analysis
   */
  private static generateSummaryAnalysis(results: CategorizationResultItem[]) {
    const total = results.length
    const highConfidence = results.filter(r => r.categorization.confidence >= 0.8).length
    const mediumConfidence = results.filter(r => r.categorization.confidence >= 0.6 && r.categorization.confidence < 0.8).length
    const lowConfidence = results.filter(r => r.categorization.confidence < 0.6).length
    const warnings = results.filter(r => r.categorization.warningFlags && r.categorization.warningFlags.length > 0).length
    const edited = results.filter(r => r.isEdited).length
    const avgConfidence = results.reduce((sum, r) => sum + r.categorization.confidence, 0) / total

    // Account distribution
    const accountDistribution = results.reduce((acc, result) => {
      const key = `${result.categorization.accountId} - ${result.categorization.accountName}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Business nature distribution
    const businessNatureDistribution = results.reduce((acc, result) => {
      acc[result.businessContext.businessNature] = (acc[result.businessContext.businessNature] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      overview: {
        totalTransactions: total,
        highConfidenceCount: highConfidence,
        mediumConfidenceCount: mediumConfidence,
        lowConfidenceCount: lowConfidence,
        warningsCount: warnings,
        editedCount: edited,
        averageConfidence: avgConfidence
      },
      accountDistribution,
      businessNatureDistribution
    }
  }

  /**
   * Prepare detailed export data with all metadata
   */
  private static prepareDetailedExportData(results: CategorizationResultItem[]) {
    return results.map(result => ({
      // Transaction basics
      date: result.date,
      description: result.description,
      contact: result.contact || 'Unknown',
      amount: result.amount,
      type: result.type,
      
      // Categorization results
      accountCode: result.categorization.accountId,
      accountName: result.categorization.accountName,
      confidence: result.categorization.confidence,
      confidencePercent: (result.categorization.confidence * 100).toFixed(2) + '%',
      
      // Business intelligence
      businessNature: result.businessContext.businessNature,
      relationshipType: result.businessContext.relationshipType,
      industry: result.businessContext.industry,
      amountRange: result.businessContext.typicalAmountRange,
      transactionFrequency: result.businessContext.transactionFrequency,
      
      // AI analysis
      aiReasoning: result.categorization.reasoning,
      businessLogic: result.categorization.businessLogic,
      patternMatches: result.patterns.length,
      warningFlags: result.categorization.warningFlags?.join('; ') || 'None',
      businessKeywords: result.businessContext.businessKeywords.join(', '),
      
      // Status
      isEdited: result.isEdited,
      contextScore: result.businessContext.confidenceScore,
      contextScorePercent: (result.businessContext.confidenceScore * 100).toFixed(2) + '%'
    }))
  }

  /**
   * Generate business intelligence analysis sheet
   */
  private static generateBusinessIntelligenceSheet(results: CategorizationResultItem[]) {
    // Group by contacts for business intelligence
    const contactAnalysis = results.reduce((acc, result) => {
      const contact = result.contact || 'Unknown'
      if (!acc[contact]) {
        acc[contact] = {
          contactName: contact,
          businessNature: result.businessContext.businessNature,
          relationshipType: result.businessContext.relationshipType,
          industry: result.businessContext.industry,
          transactionCount: 0,
          totalAmount: 0,
          avgConfidence: 0,
          preferredAccounts: new Set<string>(),
          warningCount: 0,
          editCount: 0
        }
      }
      
      const analysis = acc[contact]
      analysis.transactionCount++
      analysis.totalAmount += result.amount
      analysis.avgConfidence += result.categorization.confidence
      analysis.preferredAccounts.add(`${result.categorization.accountId} - ${result.categorization.accountName}`)
      
      if (result.categorization.warningFlags && result.categorization.warningFlags.length > 0) {
        analysis.warningCount++
      }
      if (result.isEdited) {
        analysis.editCount++
      }
      
      return acc
    }, {} as Record<string, any>)

    // Convert to array and calculate averages
    return Object.values(contactAnalysis).map((analysis: any) => ({
      ...analysis,
      avgConfidence: analysis.avgConfidence / analysis.transactionCount,
      avgAmount: analysis.totalAmount / analysis.transactionCount,
      preferredAccounts: Array.from(analysis.preferredAccounts).join('; '),
      riskScore: this.calculateContactRiskScore(analysis)
    })).sort((a, b) => b.transactionCount - a.transactionCount)
  }

  /**
   * Calculate risk score for contact based on various factors
   */
  private static calculateContactRiskScore(analysis: any): number {
    let riskScore = 0
    
    // Low confidence increases risk
    if (analysis.avgConfidence < 0.6) riskScore += 0.3
    else if (analysis.avgConfidence < 0.8) riskScore += 0.1
    
    // High warning count increases risk
    const warningRatio = analysis.warningCount / analysis.transactionCount
    riskScore += warningRatio * 0.4
    
    // High edit count might indicate problematic categorization
    const editRatio = analysis.editCount / analysis.transactionCount
    riskScore += editRatio * 0.3
    
    return Math.min(1.0, riskScore)
  }

  /**
   * Export enhanced CSV with summary information
   */
  private static exportEnhancedCSVWithSummary(workbookData: any, companyName: string): void {
    const sections = []
    
    // Add summary section
    sections.push('=== CATEGORIZATION SUMMARY ===')
    sections.push(`Company: ${companyName}`)
    sections.push(`Export Date: ${new Date().toISOString()}`)
    sections.push(`Total Transactions: ${workbookData.summary.overview.totalTransactions}`)
    sections.push(`Average Confidence: ${(workbookData.summary.overview.averageConfidence * 100).toFixed(2)}%`)
    sections.push(`High Confidence (≥80%): ${workbookData.summary.overview.highConfidenceCount}`)
    sections.push(`Medium Confidence (60-79%): ${workbookData.summary.overview.mediumConfidenceCount}`)
    sections.push(`Low Confidence (<60%): ${workbookData.summary.overview.lowConfidenceCount}`)
    sections.push(`Warnings: ${workbookData.summary.overview.warningsCount}`)
    sections.push(`Manual Edits: ${workbookData.summary.overview.editedCount}`)
    sections.push('')
    
    // Add account distribution
    sections.push('=== ACCOUNT DISTRIBUTION ===')
    Object.entries(workbookData.summary.accountDistribution).forEach(([account, count]) => {
      sections.push(`${account}: ${count} transactions`)
    })
    sections.push('')
    
    // Add detailed data headers
    sections.push('=== DETAILED TRANSACTION DATA ===')
    const headers = [
      'Date', 'Description', 'Contact', 'Amount', 'Type',
      'Account Code', 'Account Name', 'Confidence %',
      'Business Nature', 'Relationship Type', 'Industry',
      'AI Reasoning', 'Pattern Matches', 'Warning Flags',
      'Business Keywords', 'Is Edited', 'Context Score %'
    ]
    sections.push(headers.join(','))
    
    // Add detailed data
    workbookData.detailed.forEach((row: any) => {
      const csvRow = [
        row.date,
        `"${row.description.replace(/"/g, '""')}"`,
        `"${row.contact}"`,
        row.amount,
        row.type,
        row.accountCode,
        `"${row.accountName}"`,
        row.confidencePercent,
        `"${row.businessNature}"`,
        `"${row.relationshipType}"`,
        `"${row.industry}"`,
        `"${row.aiReasoning.replace(/"/g, '""')}"`,
        row.patternMatches,
        `"${row.warningFlags}"`,
        `"${row.businessKeywords}"`,
        row.isEdited ? 'Yes' : 'No',
        row.contextScorePercent
      ]
      sections.push(csvRow.join(','))
    })

    const csvContent = sections.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${companyName}_comprehensive_analysis_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}