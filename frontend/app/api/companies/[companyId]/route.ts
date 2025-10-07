import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params

    // Mock company profile data
    const mockCompany = {
      id: companyId,
      businessName: "Acme Corporation",
      businessType: "Technology Services",
      incorporationDate: "2020-01-15",
      fiscalYearEnd: "December",
      currency: "USD",
      timezone: "America/New_York",
      address: {
        street: "123 Business Ave",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States"
      },
      contact: {
        email: "finance@acme.com",
        phone: "+1-555-0123"
      },
      settings: {
        defaultTaxRate: 8.25,
        autoCategorizationEnabled: true,
        multiCurrencyEnabled: false
      },
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockCompany)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params
    const updates = await request.json()

    // In a real app, you would update the company in the database
    const updatedCompany = {
      id: companyId,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company profile' },
      { status: 500 }
    )
  }
}