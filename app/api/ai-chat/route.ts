import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, useGPT4, systemPrompt } = await request.json()
    
    console.log('🤖 AI Chat API called with message:', message.substring(0, 100) + '...')
    
    // Mock AI response for Chart of Accounts generation
    // In production, this would call OpenAI GPT-4 or similar
    const mockCoAResponse = `[
  {
    "code": "1001",
    "name": "Cash in Hand",
    "category": "Current Assets",
    "class": "Assets", 
    "statement": "Balance Sheet"
  },
  {
    "code": "1002",
    "name": "Cash at Bank",
    "category": "Current Assets",
    "class": "Assets",
    "statement": "Balance Sheet"
  },
  {
    "code": "1101",
    "name": "Accounts Receivable",
    "category": "Current Assets", 
    "class": "Assets",
    "statement": "Balance Sheet"
  },
  {
    "code": "1201",
    "name": "Inventory",
    "category": "Current Assets",
    "class": "Assets",
    "statement": "Balance Sheet"
  },
  {
    "code": "1501",
    "name": "Land",
    "category": "Fixed Assets",
    "class": "Assets",
    "statement": "Balance Sheet"
  },
  {
    "code": "1502", 
    "name": "Building",
    "category": "Fixed Assets",
    "class": "Assets",
    "statement": "Balance Sheet"
  },
  {
    "code": "1503",
    "name": "Plant & Machinery",
    "category": "Fixed Assets",
    "class": "Assets",
    "statement": "Balance Sheet"
  },
  {
    "code": "2001",
    "name": "Accounts Payable",
    "category": "Current Liabilities",
    "class": "Liabilities",
    "statement": "Balance Sheet"
  },
  {
    "code": "2101",
    "name": "GST Output Tax (CGST)",
    "category": "Current Liabilities",
    "class": "Tax Liabilities", 
    "statement": "Balance Sheet"
  },
  {
    "code": "2102",
    "name": "GST Output Tax (SGST)",
    "category": "Current Liabilities",
    "class": "Tax Liabilities",
    "statement": "Balance Sheet"
  },
  {
    "code": "2201",
    "name": "TDS Payable - Salary",
    "category": "Current Liabilities",
    "class": "Tax Liabilities",
    "statement": "Balance Sheet"
  },
  {
    "code": "2301",
    "name": "PF Payable - Employer",
    "category": "Current Liabilities",
    "class": "Statutory Liabilities",
    "statement": "Balance Sheet"
  },
  {
    "code": "2302",
    "name": "ESI Payable - Employer", 
    "category": "Current Liabilities",
    "class": "Statutory Liabilities",
    "statement": "Balance Sheet"
  },
  {
    "code": "3001",
    "name": "Share Capital",
    "category": "Equity",
    "class": "Capital",
    "statement": "Balance Sheet"
  },
  {
    "code": "3002",
    "name": "Retained Earnings",
    "category": "Equity",
    "class": "Capital", 
    "statement": "Balance Sheet"
  },
  {
    "code": "4001",
    "name": "Sales Revenue",
    "category": "Revenue",
    "class": "Operating Revenue",
    "statement": "Profit & Loss"
  },
  {
    "code": "4002",
    "name": "Service Revenue",
    "category": "Revenue",
    "class": "Operating Revenue",
    "statement": "Profit & Loss"
  },
  {
    "code": "5001",
    "name": "Cost of Goods Sold",
    "category": "Expenses",
    "class": "Direct Expenses",
    "statement": "Profit & Loss"
  },
  {
    "code": "5101",
    "name": "Salaries & Wages",
    "category": "Expenses", 
    "class": "Operating Expenses",
    "statement": "Profit & Loss"
  },
  {
    "code": "5102",
    "name": "Rent Expense",
    "category": "Expenses",
    "class": "Operating Expenses",
    "statement": "Profit & Loss"
  },
  {
    "code": "5103",
    "name": "Utilities Expense",
    "category": "Expenses",
    "class": "Operating Expenses", 
    "statement": "Profit & Loss"
  }
]`
    
    // Simulate processing delay 
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return NextResponse.json({
      response: mockCoAResponse,
      success: true
    })
    
  } catch (error) {
    console.error('❌ AI Chat API error:', error)
    return NextResponse.json({
      error: 'AI processing failed',
      success: false
    }, { status: 500 })
  }
}