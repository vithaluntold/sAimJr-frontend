"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { 
  Download, 
  Edit3, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText,
  Save
} from 'lucide-react'
import { CategorizationResultItem, ContactSummary } from '../lib/enhanced-types'

interface CategorizationResultsProps {
  results: CategorizationResultItem[]
  onExportCSV: (results: CategorizationResultItem[]) => void
  onExportExcel: (results: CategorizationResultItem[]) => void
  onSaveChanges: (results: CategorizationResultItem[]) => void
  companyName: string
}

export function CategorizationResults({
  results,
  onExportCSV,
  onExportExcel,
  onSaveChanges,
  companyName
}: CategorizationResultsProps) {
  
  const contactSummaries = useMemo(() => {
    const grouped = results.reduce((acc, transaction) => {
      const contact = transaction.contact || 'Unknown Contact'
      if (!acc[contact]) {
        acc[contact] = {
          contactName: contact,
          businessNature: transaction.businessContext?.businessNature || 'Unknown',
          relationshipType: transaction.businessContext?.relationshipType || 'Unknown',
          transactionCount: 0,
          totalAmount: 0,
          avgConfidence: 0,
          warningCount: 0,
          transactions: []
        }
      }
      
      acc[contact].transactionCount += 1
      acc[contact].totalAmount += Math.abs(transaction.amount)
      acc[contact].avgConfidence += transaction.categorization.confidence
      if (transaction.categorization.warningFlags?.length) {
        acc[contact].warningCount += 1
      }
      acc[contact].transactions.push(transaction)
      
      return acc
    }, {} as Record<string, ContactSummary>)

    Object.values(grouped).forEach(summary => {
      summary.avgConfidence = summary.avgConfidence / summary.transactionCount
    })

    return Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount)
  }, [results])

  const totalTransactions = results.length
  const highConfidenceCount = results.filter(r => r.categorization.confidence > 0.8).length
  const warningCount = results.filter(r => r.categorization.warningFlags?.length).length
  const avgConfidence = results.reduce((sum, r) => sum + r.categorization.confidence, 0) / totalTransactions

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Categorization Summary - {companyName}
          </CardTitle>
          <CardDescription>
            {totalTransactions} transactions categorized with {((highConfidenceCount / totalTransactions) * 100).toFixed(1)}% high confidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{highConfidenceCount}</div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(avgConfidence * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Confidence</span>
              <span>{(avgConfidence * 100).toFixed(1)}%</span>
            </div>
            <Progress value={avgConfidence * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onExportCSV(results)} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Button onClick={() => onExportExcel(results)} variant="outline" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Export Excel
        </Button>
        <Button onClick={() => onSaveChanges(results)} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contact Analysis
          </CardTitle>
          <CardDescription>
            Transaction breakdown by contact with confidence metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contactSummaries.map((summary, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{summary.contactName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {summary.businessNature}  {summary.relationshipType}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={summary.avgConfidence > 0.8 ? "default" : "secondary"}>
                      {(summary.avgConfidence * 100).toFixed(1)}% confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Transactions:</span>
                    <div className="font-medium">{summary.transactionCount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <div className="font-medium"></div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Warnings:</span>
                    <div className="font-medium flex items-center gap-1">
                      {summary.warningCount > 0 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      {summary.warningCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {warningCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Attention Required ({warningCount} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results
                .filter(result => result.categorization.warningFlags?.length)
                .map((result, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{result.description}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {result.categorization.warningFlags?.join(', ')}
                      </div>
                      <div className="text-sm mt-1">
                        Suggested: {result.categorization.accountName} ({(result.categorization.confidence * 100).toFixed(1)}% confidence)
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Transaction Details
          </CardTitle>
          <CardDescription>
            Detailed view of all categorized transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Contact</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-center p-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">{result.date}</td>
                    <td className="p-2 max-w-xs truncate">{result.description}</td>
                    <td className="p-2">{result.contact || 'Unknown'}</td>
                    <td className="p-2 text-right font-mono">
                      <span className={result.type === 'DR' ? 'text-red-600' : 'text-green-600'}>
                        {result.type === 'DR' ? '-' : '+'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="max-w-xs truncate">{result.categorization.accountName}</div>
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        variant={result.categorization.confidence > 0.8 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {(result.categorization.confidence * 100).toFixed(0)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
