import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock companies list
    const mockCompanies = [
      {
        id: "1",
        businessName: "Acme Corporation",
        businessType: "Technology Services",
        currency: "USD",
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        transactionCount: 234,
        status: "active"
      },
      {
        id: "2",
        businessName: "Beta Solutions LLC",
        businessType: "Consulting",
        currency: "USD",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        transactionCount: 89,
        status: "active"
      }
    ]

    return NextResponse.json(mockCompanies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyData = await request.json()

    // Mock company creation
    const newCompany = {
      id: Date.now().toString(), // Simple ID generation for demo
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      transactionCount: 0,
      status: "active"
    }

    return NextResponse.json(newCompany, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}