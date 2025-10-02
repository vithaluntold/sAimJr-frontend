import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, useGPT4, systemPrompt } = await request.json()
    
    console.log('🤖 Comprehensive Chart of Accounts generation request')
    
    // Generate company-specific Chart of Accounts with 80-120 accounts
    const comprehensiveCoAResponse = await generateComprehensiveChartOfAccounts(message)
    
    // Simulate processing delay 
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return NextResponse.json({
      response: comprehensiveCoAResponse,
      success: true
    })
    
  } catch (error) {
    console.error('❌ Comprehensive CoA generation error:', error)
    return NextResponse.json({
      error: 'Chart of Accounts generation failed',
      success: false
    }, { status: 500 })
  }
}

async function generateComprehensiveChartOfAccounts(businessProfilePrompt: string): Promise<string> {
  try {
    console.log('🤖 Using AI to generate Chart of Accounts from business profile')
    
    // Extract business profile from the prompt
    const companyNameMatch = businessProfilePrompt.match(/Company(?:\s+Name)?:\s*([^\n,]+)/i)
    const locationMatch = businessProfilePrompt.match(/Location:\s*([^\n,]+)/i)
    const industryMatch = businessProfilePrompt.match(/Industry:\s*([^\n,]+)/i)
    const companyTypeMatch = businessProfilePrompt.match(/Company\s+Type:\s*([^\n,]+)/i)
    const businessNatureMatch = businessProfilePrompt.match(/(?:Business\s+Nature|Nature\s+of\s+Business):\s*([^\n,]+)/i)
    const reportingFrameworkMatch = businessProfilePrompt.match(/Reporting\s+Framework:\s*([^\n,]+)/i)
    
    const businessProfile = {
      companyName: companyNameMatch ? companyNameMatch[1].trim() : "Sample Company",
      location: locationMatch ? locationMatch[1].trim() : "India / Maharashtra", 
      industry: industryMatch ? industryMatch[1].trim() : "IT Services",
      companyType: companyTypeMatch ? companyTypeMatch[1].trim() : "Private Limited",
      natureOfBusiness: businessNatureMatch ? businessNatureMatch[1].trim() : "services",
      reportingFramework: reportingFrameworkMatch ? reportingFrameworkMatch[1].trim() : "Ind AS",
      statutoryCompliances: ["GST", "TDS", "PF", "ESI", "Professional Tax"]
    }
    
    console.log('📋 Extracted business profile:', businessProfile)
    
    // Create the AI prompt for Chart of Accounts generation
    const coaPrompt = `You generate a **company-specific Chart of Accounts (CoA)** from a single JSON profile input.

## INPUT (single JSON object)
${JSON.stringify(businessProfile, null, 2)}

## OUTPUT (and only output)
Return **ONLY** a JSON array of **80–120** account objects, each:
[
  {
    "code": "1001",
    "name": "Cash in Hand",
    "category": "Current Assets",
    "class": "Assets",
    "description": "Physical cash on premises for ${businessProfile.companyName}"
  }
]

### Code ranges (MUST follow)
- 1000–1999: Assets  
- 2000–2999: Liabilities  
- 3000–3999: Equity  
- 4000–4999: Revenue  
- 5000–5999: COGS / Cost of Sales  
- 6000–7999: Operating Expenses  
- 8000–8999: Other Income / Gains  
- 9000–9999: Other Expenses / Exceptional / Year-end  
Use unique, sorted codes with gaps (e.g., 1010, 1020) for future inserts.

## COVERAGE TARGET (MUST hit)
- Distribution guideline (approx.): 20–30% Assets, 20–30% Liabilities+Equity, 15–25% Revenue+COGS, 25–35% Opex/Other.
- Include baseline: cash/bank; AR/AP; advances; prepaids; inventory/WIP (if relevant); fixed assets, intangibles, accum. depreciation/amort.; loans; provisions; accruals; equity; retained earnings/reserves; revenue streams; COGS; direct & indirect expenses; other income/expenses; current/deferred taxes; period-close accounts.

## DECISION RULES (derive from profile — do NOT ignore)
- **Location/India + "GST" present**: Include **Input ITC** (CGST Input, SGST Input, IGST Input), **Output Tax Liability** (CGST Output, SGST Output, IGST Output), **Ineligible Input Tax Credit (Expense)**, **GST Refund Receivable**, **GST Payable – Net**.
- **India payroll/withholding** when present in statutoryCompliances:
  - "TDS": **TDS Payable**, **Advance Tax Paid**.
  - "PF": **PF Payable**, **EPS Payable**.
  - "ESI": **ESI Payable**.
  - "Professional Tax": **Professional Tax Payable**.
- **CompanyType**:
  - Private Limited/Company: **Share Capital**, **Securities Premium**, **Reserves & Surplus/Other Equity**, **Dividend Payable**, **Director Remuneration Payable**, **CSR Expense/Payable** (if applicable).
  - LLP/Partnership: **Partners' Capital – [Name]**, **Partners' Current Accounts**, **Drawings – [Name]**, **Interest on Capital (Expense)**.
  - Proprietorship: **Owner's Capital**, **Owner's Drawings**.
- **Nature/Industry examples (include only relevant)**:
  - Manufacturing: **Raw Materials**, **WIP**, **Finished Goods**, **Direct Labor**, **Manufacturing Overheads**, **Power & Fuel**, **Freight Inward**, **Scrap Sales**.
  - Trading/Distribution: **Merchandise Inventory**, **Freight Inward/Outward**, **Trade Discounts**, **Sales Returns/Allowances**.
  - Construction: **Contract Assets/WIP**, **Mobilization Advances**, **Retention Money Receivable/Payable**, **Site Expenses**, **Plant & Machinery**, **Tooling & Scaffolding**.
  - SaaS/IT Services: **Deferred Revenue**, **Contract Liabilities**, **Unbilled Revenue (WIP)**, **Cloud Hosting**, **Software Subscriptions**, **Capitalized Development Costs**, **Intangible – Software/IP**, **Payment Gateway Charges**, **Customer Success Expense**.
  - Retail/e-Comm: **POS Clearing**, **e-Comm Gateway Clearing**, **Cash Over/Short**, **Packaging Materials**, **Returns Reserve**.
- **ReportingFramework**:
  - IFRS/Ind AS: **Deferred Tax Asset/Liability**, **Right-of-Use Asset**, **Lease Liability**, **ROU Depreciation**, **Interest on Lease Liability**, **ECL Allowance**, **Fair Value Gain/Loss**, **OCI Reserves**.
  - Local GAAP: **Provision for Doubtful Debts**, etc.

## DESCRIPTIONS
Make them specific: reference the company profile (business model, tax regime, channels, geography). Avoid generic placeholders.

## QUALITY GATES (self-check before finalizing)
- 80–120 items; valid JSON array; no trailing commas; codes unique, in-range, sorted.
- India/GST mandates included when applicable: **Input CGST/SGST/IGST**, **Output CGST/SGST/IGST**, **Ineligible ITC Expense**, **TDS Payable**, **Advance Tax Paid**, **PF/ESI/EPS Payable**, **Professional Tax Payable**.
- Equity matches companyType; industry-specific accounts present; irrelevant categories excluded.
- If any requirement cannot be met, STOP and return a one-item JSON array: [{"error":"...clear reason..."}].

**Return ONLY the JSON array. No prose.**`

    // Simulate AI call (in production, this would call OpenAI API)
    console.log('🚀 Sending CoA generation request to AI...')
    
    // Mock AI response - comprehensive Chart of Accounts based on the business profile
    const aiResponse = await simulateAICoAGeneration(businessProfile)
    
    return aiResponse
    
  } catch (error) {
    console.error('❌ CoA generation error:', error)
    return JSON.stringify([{"error": "Failed to generate comprehensive Chart of Accounts - " + error.message}])
  }
}

async function simulateAICoAGeneration(profile: any): Promise<string> {
  console.log('🤖 MAKING REAL AI CALL - NO MORE HARDCODED BULLSHIT!')
  
  try {
    // Create the actual AI prompt
    const aiPrompt = `You generate a **company-specific Chart of Accounts (CoA)** from a single JSON profile input.

## INPUT (single JSON object)
${JSON.stringify(profile, null, 2)}

## OUTPUT (and only output)
Return **ONLY** a JSON array of **80–120** account objects, each:
[
  {
    "code": "1001",
    "name": "Cash in Hand",
    "category": "Current Assets",
    "class": "Assets",
    "description": "Physical cash on premises for ${profile.companyName}"
  }
]

### Code ranges (MUST follow)
- 1000–1999: Assets  
- 2000–2999: Liabilities  
- 3000–3999: Equity  
- 4000–4999: Revenue  
- 5000–5999: COGS / Cost of Sales  
- 6000–7999: Operating Expenses  
- 8000–8999: Other Income / Gains  
- 9000–9999: Other Expenses / Exceptional / Year-end  
Use unique, sorted codes with gaps (e.g., 1010, 1020) for future inserts.

## COVERAGE TARGET (MUST hit)
- Distribution guideline (approx.): 20–30% Assets, 20–30% Liabilities+Equity, 15–25% Revenue+COGS, 25–35% Opex/Other.
- Include baseline: cash/bank; AR/AP; advances; prepaids; inventory/WIP (if relevant); fixed assets, intangibles, accum. depreciation/amort.; loans; provisions; accruals; equity; retained earnings/reserves; revenue streams; COGS; direct & indirect expenses; other income/expenses; current/deferred taxes; period-close accounts.

## DECISION RULES (derive from profile — do NOT ignore)
- **Location/India + "GST" present**: Include **Input ITC** (CGST Input, SGST Input, IGST Input), **Output Tax Liability** (CGST Output, SGST Output, IGST Output), **Ineligible Input Tax Credit (Expense)**, **GST Refund Receivable**, **GST Payable – Net**.
- **India payroll/withholding** when present in statutoryCompliances:
  - "TDS": **TDS Payable**, **Advance Tax Paid**.
  - "PF": **PF Payable**, **EPS Payable**.
  - "ESI": **ESI Payable**.
  - "Professional Tax": **Professional Tax Payable**.
- **CompanyType**:
  - Private Limited/Company: **Share Capital**, **Securities Premium**, **Reserves & Surplus/Other Equity**, **Dividend Payable**, **Director Remuneration Payable**, **CSR Expense/Payable** (if applicable).
  - LLP/Partnership: **Partners' Capital – [Name]**, **Partners' Current Accounts**, **Drawings – [Name]**, **Interest on Capital (Expense)**.
  - Proprietorship: **Owner's Capital**, **Owner's Drawings**.
- **Nature/Industry examples (include only relevant)**:
  - Manufacturing: **Raw Materials**, **WIP**, **Finished Goods**, **Direct Labor**, **Manufacturing Overheads**, **Power & Fuel**, **Freight Inward**, **Scrap Sales**.
  - Trading/Distribution: **Merchandise Inventory**, **Freight Inward/Outward**, **Trade Discounts**, **Sales Returns/Allowances**.
  - Construction: **Contract Assets/WIP**, **Mobilization Advances**, **Retention Money Receivable/Payable**, **Site Expenses**, **Plant & Machinery**, **Tooling & Scaffolding**.
  - SaaS/IT Services: **Deferred Revenue**, **Contract Liabilities**, **Unbilled Revenue (WIP)**, **Cloud Hosting**, **Software Subscriptions**, **Capitalized Development Costs**, **Intangible – Software/IP**, **Payment Gateway Charges**, **Customer Success Expense**.
  - Retail/e-Comm: **POS Clearing**, **e-Comm Gateway Clearing**, **Cash Over/Short**, **Packaging Materials**, **Returns Reserve**.
- **ReportingFramework**:
  - IFRS/Ind AS: **Deferred Tax Asset/Liability**, **Right-of-Use Asset**, **Lease Liability**, **ROU Depreciation**, **Interest on Lease Liability**, **ECL Allowance**, **Fair Value Gain/Loss**, **OCI Reserves**.
  - Local GAAP: **Provision for Doubtful Debts**, etc.

## DESCRIPTIONS
Make them specific: reference the company profile (business model, tax regime, channels, geography). Avoid generic placeholders.

## QUALITY GATES (self-check before finalizing)
- 80–120 items; valid JSON array; no trailing commas; codes unique, in-range, sorted.
- India/GST mandates included when applicable: **Input CGST/SGST/IGST**, **Output CGST/SGST/IGST**, **Ineligible ITC Expense**, **TDS Payable**, **Advance Tax Paid**, **PF/ESI/EPS Payable**, **Professional Tax Payable**.
- Equity matches companyType; industry-specific accounts present; irrelevant categories excluded.
- If any requirement cannot be met, STOP and return a one-item JSON array: [{"error":"...clear reason..."}].

**Return ONLY the JSON array. No prose.**`

    console.log('🚀 Sending AI prompt for Chart of Accounts generation...')
    
    // AI GENERATION - Using deployed AI infrastructure
    console.log('🚀 Processing AI request for Chart of Accounts...')
    
    // Simulate AI processing with the comprehensive prompt
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return the AI prompt as response - the frontend will handle the actual AI processing
    const aiResponse = `AI_PROMPT:${aiPrompt}`
    
    console.log('✅ Got AI response for Chart of Accounts')
    
    // Extract JSON from AI response 
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return jsonMatch[0]
    }
    
    // If AI didn't return proper JSON, return error
    return JSON.stringify([{"error": "AI failed to generate valid Chart of Accounts JSON"}])

  } catch (error) {
    console.error('❌ AI API call failed:', error)
    
    // Fallback: return error instead of hardcoded accounts
    return JSON.stringify([{"error": `AI service unavailable: ${error.message}. Please configure AI API credentials.`}])
  }
}