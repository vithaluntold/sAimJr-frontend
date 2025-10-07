import { ChartOfAccount } from './types'

interface BusinessContext {
  companyName: string
  industry: string
  companyType: string
  location: string
  businessNature: string
  reportingFramework?: string
  tax?: string
  size?: string
  [key: string]: string | undefined
}

export class IntelligentCoAGenerator {
  private static instance: IntelligentCoAGenerator
  
  public static getInstance(): IntelligentCoAGenerator {
    if (!IntelligentCoAGenerator.instance) {
      IntelligentCoAGenerator.instance = new IntelligentCoAGenerator()
    }
    return IntelligentCoAGenerator.instance
  }

  public async generateContextualChartOfAccounts(businessContext: BusinessContext): Promise<ChartOfAccount[]> {
    console.log('🤖 PURE AI GENERATION - NO HARDCODED FALLBACKS!')
    console.log('📋 Business Context:', businessContext)
    
    // ONLY AI GENERATION - NO HARDCODED BACKUP!
    const aiGeneratedCoA = await this.tryAIGeneration(businessContext)
    
    if (aiGeneratedCoA && aiGeneratedCoA.length > 0) {
      console.log('✅ AI SUCCESSFULLY generated', aiGeneratedCoA.length, 'accounts')
      return aiGeneratedCoA
    }
    
    console.error('❌ AI FAILED - RETURNING EMPTY CHART OF ACCOUNTS (NO HARDCODED BACKUP)')
    return []
  }

  private async tryAIGeneration(context: BusinessContext): Promise<ChartOfAccount[]> {
    try {
      console.log('🔥 ATTEMPTING AI GENERATION FOR:', {
        location: context.location,
        industry: context.industry,
        companyType: context.companyType,
        tax: context.tax,
        reportingFramework: context.reportingFramework
      })

      const prompt = `Generate a comprehensive Chart of Accounts for an Indian business with the following details:
      
You are generating a **company-specific Chart of Accounts (CoA)**.

## Inputs (single JSON object)
{
  "companyName": "...",
  "natureOfBusiness": "...",        // e.g., manufacturing, SaaS, trading, services
  "industry": "...",                // e.g., FMCG, IT services, construction
  "location": "...",                // country/state (e.g., India / Maharashtra)
  "companyType": "...",             // e.g., Private Limited, LLP, Partnership, Proprietorship
  "reportingFramework": "...",      // e.g., Ind AS, IFRS, US GAAP
  "statutoryCompliances": [...]     // e.g., ["GST", "TDS", "PF", "ESI", "Professional Tax"]
}

## Output (and only output)
Return **ONLY** a JSON array of 80–120 account objects, each with:
[{
  "code": "1001",
  "name": "Cash in Hand",
  "category": "Current Assets",
  "class": "Assets",
  "description": "Physical cash on premises"
}]

### Code ranges
- 1000–1999: Assets  
- 2000–2999: Liabilities  
- 3000–3999: Equity  
- 4000–4999: Revenue  
- 5000–5999: Cost of Goods Sold (COGS) / Cost of Sales  
- 6000–7999: Operating Expenses  
- 8000–8999: Other Income / Other Gains  
- 9000–9999: Other Expenses / Exceptional / Year-end  

Ensure codes are **unique**, logically grouped, and leave **gaps** for future insertions.

## Coverage requirements
Produce a complete CoA tailored to the input profile. Use the profile as *decision signals*, not just decoration.

- **Baseline set**: cash/bank, receivables, payables, inventory/consumables (if applicable), fixed assets & accumulated depreciation, intangibles, prepayments, accruals, provisions, loans, equity, reserves, retained earnings, revenue streams, COGS, direct & indirect expenses, other income/expenses, taxes (current/deferred), year-end accounts.
- **Location-specific (India/GST)** — if "GST" in statutoryCompliances:
  - Input ITC: CGST Input, SGST Input, IGST Input
  - Output liability: CGST Output, SGST Output, IGST Output
  - Ineligible Input Tax Credit Expense
  - GST Refund Receivable, GST Payable – Net
- **India payroll/withholding** — if "TDS", "PF", "ESI", "Professional Tax" present:
  - TDS Payable, Advance Tax Paid
  - PF Payable, EPS Payable
  - ESI Payable
  - Professional Tax Payable
- **Company type**:
  - *Private Limited*: Share Capital, Securities Premium, Reserves & Surplus, Dividend Payable, Deferred Tax, CSR Expense/Payable
  - *LLP/Partnership*: Partners’ Capital, Partners’ Current Accounts, Drawings, Interest on Capital
  - *Proprietorship*: Owner’s Capital, Owner’s Drawings
- **Nature/Industry** (examples):
  - *Manufacturing*: Raw Materials, WIP, Finished Goods, Direct Labor, Factory Overheads, Power & Fuel, Scrap Sales
  - *Trading*: Merchandise Inventory, Freight Inward/Outward, Sales Returns
  - *Construction*: Contract Assets/WIP, Retention Money, Site Expenses
  - *SaaS/IT*: Deferred Revenue, Unbilled Revenue, Cloud Hosting, R&D Expense, Capitalized Dev Costs
  - *Retail/eComm*: POS Clearing, eComm Gateway Clearing, Packaging Materials, Returns Reserve
- **Reporting framework**:
  - *IFRS/Ind AS*: Deferred Tax, ROU Asset, Lease Liability, OCI Reserves
  - *Local GAAP*: Provisions for Doubtful Debts, etc.

## Decision rules
1. For each input attribute, **derive** needed accounts. Example: if statutoryCompliances contains "GST", add Input/Output CGST/SGST/IGST, Ineligible ITC Expense, GST Payable – Net.
2. If natureOfBusiness implies inventory, include inventory/WIP/variance accounts.
3. If companyType is corporate, generate share capital/premium/reserves; else generate partner/owner capital & drawings.
4. If reportingFramework includes lease capitalization, generate ROU Asset, Lease Liability, Depreciation – ROU, Interest – Lease Liability.
5. Ensure 80–120 accounts with balanced distribution (≈20–30% assets, 20–30% liabilities & equity, 15–25% revenue/COGS, 25–35% opex/other).
6. Write clear, context-specific descriptions.
7. Keep names concise, codes unique, leave room (e.g., 1010, 1020).

## Quality checks
- JSON valid, no trailing commas, 80–120 items.
- Codes in correct bands; unique and sorted.
- Mandatory India/GST items included if relevant.
- Equity structure matches companyType.
- Framework accounts included if reportingFramework requires.
- Industry-specific items included, irrelevant excluded.`

      // Use secure backend API instead of insecure frontend route
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/coa/generate/1`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          business_profile: prompt,
          ai_enabled: true
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const result = await response.json()
      console.log('🤖 AI Response received:', result)

      if (result.response) {
        try {
          // Extract JSON from AI response
          const jsonMatch = result.response.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const coaData = JSON.parse(jsonMatch[0])
            if (Array.isArray(coaData) && coaData.length > 0) {
              return coaData.map(account => ({
                code: account.code,
                name: account.name,
                category: account.category,
                class: account.class,
                statement: account.statement || 'Balance Sheet'
              }))
            }
          }
        } catch (parseError) {
          console.error('❌ Failed to parse AI response as JSON:', parseError)
        }
      }

      console.error('❌ AI did not return valid CoA data')
      return []

    } catch (error) {
      console.error('❌ AI generation completely failed:', error)
      return []
    }
  }
}

export default IntelligentCoAGenerator