"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { 
  Download, 
  Edit3, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Building2,
  FileText,
  Eye,
  Save,
  X
} from 'lucide-react'
import type { ChartOfAccount } from '../lib/types'
import { CategorizationResultItem } from '../lib/enhanced-types'

interface CategorizationResultsProps {
  results: CategorizationResultItem[]
  chartOfAccounts: ChartOfAccount[]
  onExportCSV: (results: CategorizationResultItem[]) => void
  onExportExcel: (results: CategorizationResultItem[]) => void
  onSaveChanges: (results: CategorizationResultItem[]) => void
  companyName: string
}

export function CategorizationResults({
  results,
  chartOfAccounts,
  onExportCSV,
  onExportExcel,
  onSaveChanges,
  companyName
}: CategorizationResultsProps) {
  const [editedResults, setEditedResults] = useState<CategorizationResultItem[]>(results)
  const [selectedContact, setSelectedContact] = useState<string>('all')
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all')

  // Group transactions by contact
  const contactSummaries = useMemo(() => {
    const grouped = editedResults.reduce((acc, transaction) => {
      const contact = transaction.contact || 'Unknown Contact'
      if (!acc[contact]) {
        acc[contact] = {
          contactName: contact,
          businessNature: transaction.businessContext.businessNature,
          relationshipType: transaction.businessContext.relationshipType,
          transactionCount: 0,
          totalAmount: 0,
          avgConfidence: 0,
          warningCount: 0,
          transactions: []
        }
      }
      
      acc[contact].transactions.push(transaction)
      acc[contact].transactionCount++
      acc[contact].totalAmount += transaction.amount
      acc[contact].avgConfidence += transaction.categorization.confidence
      if (transaction.categorization.warningFlags && transaction.categorization.warningFlags.length > 0) {
        acc[contact].warningCount++
      }
      
      return acc
    }, {} as Record<string, any>)

    // Calculate averages
    Object.values(grouped).forEach((summary: any) => {
      summary.avgConfidence = summary.avgConfidence / summary.transactionCount
    })

    return Object.values(grouped).sort((a: any, b: any) => b.transactionCount - a.transactionCount)
  }, [editedResults])

  // Overall statistics
  const overallStats = useMemo(() => {
    const total = editedResults.length
    const highConfidence = editedResults.filter(r => r.categorization.confidence >= 0.8).length
    const mediumConfidence = editedResults.filter(r => r.categorization.confidence >= 0.6 && r.categorization.confidence < 0.8).length
    const lowConfidence = editedResults.filter(r => r.categorization.confidence < 0.6).length
    const warnings = editedResults.filter(r => r.categorization.warningFlags && r.categorization.warningFlags.length > 0).length
    const edited = editedResults.filter(r => r.isEdited).length
    const avgConfidence = editedResults.reduce((sum, r) => sum + r.categorization.confidence, 0) / total

    return {
      total,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      warnings,
      edited,
      avgConfidence
    }
  }, [editedResults])

  const hasChanges = editedResults.some(r => r.isEdited)

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorization Results</h2>
          <p className="text-gray-600">{companyName} - Transaction Analysis Complete</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onExportCSV(editedResults)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => onExportExcel(editedResults)}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          {hasChanges && (
            <Button onClick={() => onSaveChanges(editedResults)}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{overallStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">{(overallStats.avgConfidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Contacts</p>
                <p className="text-2xl font-bold">{contactSummaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold">{overallStats.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Confidence Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">High Confidence (≥80%)</span>
              <span className="text-sm font-medium">{overallStats.highConfidence} transactions</span>
            </div>
            <Progress value={(overallStats.highConfidence / overallStats.total) * 100} className="h-2 bg-green-100" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">Medium Confidence (60-79%)</span>
              <span className="text-sm font-medium">{overallStats.mediumConfidence} transactions</span>
            </div>
            <Progress value={(overallStats.mediumConfidence / overallStats.total) * 100} className="h-2 bg-yellow-100" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">Low Confidence (&lt;60%)</span>
              <span className="text-sm font-medium">{overallStats.lowConfidence} transactions</span>
            </div>
            <Progress value={(overallStats.lowConfidence / overallStats.total) * 100} className="h-2 bg-red-100" />
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Results</CardTitle>
          <CardDescription>
            {editedResults.length} transactions processed with AI business context analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editedResults.map(transaction => (
              <div key={transaction.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{transaction.date}</span>
                    <Badge variant={transaction.type === 'CR' ? 'default' : 'secondary'}>
                      {transaction.type}
                    </Badge>
                    <span className="font-medium">${transaction.amount.toLocaleString()}</span>
                    {transaction.isEdited && (
                      <Badge variant="outline" className="text-blue-600">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edited
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    variant={transaction.categorization.confidence >= 0.8 ? 'default' : 
                             transaction.categorization.confidence >= 0.6 ? 'secondary' : 'destructive'}
                  >
                    {(transaction.categorization.confidence * 100).toFixed(1)}% confident
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">Contact: {transaction.contact}</p>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <span className="text-sm font-medium">Account: </span>
                    <span className="text-sm">{transaction.categorization.accountId} - {transaction.categorization.accountName}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  <strong>Business Context:</strong> {transaction.businessContext.businessNature} • {transaction.businessContext.relationshipType}
                </div>

                <div className="text-sm text-gray-600">
                  <strong>AI Reasoning:</strong> {transaction.categorization.reasoning}
                </div>

                {transaction.categorization.warningFlags && transaction.categorization.warningFlags.length > 0 && (
                  <Alert className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {transaction.categorization.warningFlags.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}