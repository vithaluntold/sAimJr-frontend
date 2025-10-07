import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params

    // Mock processing runs data
    const mockProcessingRuns = [
      {
        id: '1',
        companyId,
        fileName: 'bank-statement-jan-2024.csv',
        status: 'completed',
        progress: 100,
        transactionsProcessed: 125,
        exceptionsCount: 3,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(), // 5 minutes later
        tokensConsumed: 1250,
        processingTimeMs: 45000,
        errorMessage: null
      },
      {
        id: '2',
        companyId,
        fileName: 'bank-statement-feb-2024.csv',
        status: 'completed',
        progress: 100,
        transactionsProcessed: 89,
        exceptionsCount: 1,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(), // 3 minutes later
        tokensConsumed: 890,
        processingTimeMs: 32000,
        errorMessage: null
      }
    ]

    return NextResponse.json(mockProcessingRuns)
  } catch (error) {
    console.error('Error fetching processing runs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch processing runs' },
      { status: 500 }
    )
  }
}