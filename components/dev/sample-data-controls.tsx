"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Trash2, User, Building } from "lucide-react"
import {
  initializeSampleData,
  clearSampleData,
  getSampleUser,
  SAMPLE_COMPANIES,
  SAMPLE_USER_ID,
} from "@/lib/sample-data"

export function SampleDataControls() {
  const handleInitialize = () => {
    initializeSampleData()
    // Refresh the page to see changes
    window.location.reload()
  }

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all sample data? This will remove all companies and transactions.")) {
      clearSampleData()
      window.location.reload()
    }
  }

  const sampleUser = getSampleUser()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sample Data Controls
        </CardTitle>
        <CardDescription>Initialize or clear sample data for testing the multi-company system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sample User Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4" />
            <h4 className="font-semibold">Sample User</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <strong>ID:</strong> <code className="bg-muted px-1 rounded">{sampleUser.id}</code>
            </div>
            <div>
              <strong>Name:</strong> {sampleUser.firstName} {sampleUser.lastName}
            </div>
            <div>
              <strong>Email:</strong> {sampleUser.email}
            </div>
            <div>
              <strong>Companies:</strong> {sampleUser.companies.length}
            </div>
          </div>
        </div>

        {/* Sample Companies */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <h4 className="font-semibold">Sample Companies</h4>
          </div>
          <div className="grid gap-3">
            {SAMPLE_COMPANIES.map((company) => (
              <div key={company.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{company.businessName}</h5>
                  <Badge variant="outline">{company.industry}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    ID: <code className="bg-muted px-1 rounded text-xs">{company.id}</code>
                  </div>
                  <div>Transactions: {company.totalTransactionsProcessed.toLocaleString()}</div>
                  <div>Rules: {company.totalRulesCreated}</div>
                  <div>AI Accuracy: {(company.averageAccuracy * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleInitialize} className="flex-1">
            <Database className="h-4 w-4 mr-2" />
            Initialize Sample Data
          </Button>
          <Button onClick={handleClear} variant="destructive" className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Test:</h5>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Click &quot;Initialize Sample Data&quot; to load test companies</li>
            <li>Go to the Dashboard to see all companies</li>
            <li>Click on any company to view its details and stats</li>
            <li>Use &quot;Continue Chat&quot; to resume conversations</li>
            <li>Each company has its own transaction history and rules</li>
            <li>Switch between companies to see isolated data</li>
          </ol>
        </div>

        {/* Current User ID Display */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">For Development:</h5>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Use this User ID in your auth system: <br />
            <code className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded mt-1 inline-block">
              {SAMPLE_USER_ID}
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
