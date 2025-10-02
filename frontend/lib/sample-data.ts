// Sample data for testing the multi-company system
import type { User, CompanyProfile, HistoricalTransaction, TransactionRule, ProcessingRun } from "./types"

// Sample User ID
export const SAMPLE_USER_ID = "user_12345_john_doe"

// Sample User Object
export const SAMPLE_USER: User = {
  id: SAMPLE_USER_ID,
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  avatar: "/placeholder.svg",
  createdAt: "2024-01-15T10:30:00Z",
  emailVerified: true,
  companies: ["company_tech_startup", "company_consulting_firm", "company_retail_store"],
  defaultCompanyId: "company_tech_startup",
  preferences: {
    theme: "light",
    notifications: true,
    autoSaveRules: true,
  },
}

// Sample Company Profiles
export const SAMPLE_COMPANIES: CompanyProfile[] = [
  {
    id: "company_tech_startup",
    userId: SAMPLE_USER_ID,
    businessName: "TechFlow Solutions",
    natureOfBusiness: "Software Development",
    industry: "Technology",
    location: "San Francisco, CA",
    reportingFramework: "US GAAP",
    statutoryCompliances: ["Federal Tax", "State Tax", "Sales Tax"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z",
    lastAccessedAt: "2024-01-20T14:22:00Z",
    chartOfAccounts: [
      { code: "1000", name: "Cash", category: "Assets", class: "Current Assets", statement: "Balance Sheet" },
      {
        code: "4000",
        name: "Software Revenue",
        category: "Revenue",
        class: "Operating Revenue",
        statement: "Income Statement",
      },
      {
        code: "6400",
        name: "Cloud Services",
        category: "Expenses",
        class: "Operating Expenses",
        statement: "Income Statement",
      },
    ],
    contacts: [
      { id: "contact_1", name: "AWS", type: "Vendor" },
      { id: "contact_2", name: "Acme Corp", type: "Client" },
    ],
    isSetupComplete: true,
    totalTransactionsProcessed: 1247,
    totalRulesCreated: 8,
    averageAccuracy: 0.942,
    currentStep: 8,
    completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    hasActiveChat: false,
  },
  {
    id: "company_consulting_firm",
    userId: SAMPLE_USER_ID,
    businessName: "Strategic Advisors LLC",
    natureOfBusiness: "Management Consulting",
    industry: "Professional Services",
    location: "New York, NY",
    reportingFramework: "US GAAP",
    statutoryCompliances: ["Federal Tax", "State Tax", "NYC Tax"],
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    lastAccessedAt: "2024-01-18T16:45:00Z",
    chartOfAccounts: [
      { code: "1000", name: "Cash", category: "Assets", class: "Current Assets", statement: "Balance Sheet" },
      {
        code: "4200",
        name: "Consulting Revenue",
        category: "Revenue",
        class: "Operating Revenue",
        statement: "Income Statement",
      },
      {
        code: "6600",
        name: "Travel Expenses",
        category: "Expenses",
        class: "Operating Expenses",
        statement: "Income Statement",
      },
    ],
    contacts: [
      { id: "contact_3", name: "Fortune 500 Client", type: "Client" },
      { id: "contact_4", name: "Delta Airlines", type: "Vendor" },
    ],
    isSetupComplete: true,
    totalTransactionsProcessed: 856,
    totalRulesCreated: 12,
    averageAccuracy: 0.918,
    currentStep: 6,
    completedSteps: [1, 2, 3, 4, 5],
    hasActiveChat: true,
  },
  {
    id: "company_retail_store",
    userId: SAMPLE_USER_ID,
    businessName: "Boutique Fashion Co",
    natureOfBusiness: "Retail Fashion",
    industry: "Retail",
    location: "Los Angeles, CA",
    reportingFramework: "US GAAP",
    statutoryCompliances: ["Federal Tax", "State Tax", "Sales Tax", "Reseller Permit"],
    createdAt: "2024-01-05T11:20:00Z",
    updatedAt: "2024-01-12T13:30:00Z",
    lastAccessedAt: "2024-01-12T13:30:00Z",
    chartOfAccounts: [
      { code: "1000", name: "Cash", category: "Assets", class: "Current Assets", statement: "Balance Sheet" },
      { code: "1200", name: "Inventory", category: "Assets", class: "Current Assets", statement: "Balance Sheet" },
      {
        code: "4100",
        name: "Product Sales",
        category: "Revenue",
        class: "Operating Revenue",
        statement: "Income Statement",
      },
      {
        code: "5000",
        name: "Cost of Goods Sold",
        category: "Expenses",
        class: "Cost of Sales",
        statement: "Income Statement",
      },
    ],
    contacts: [
      { id: "contact_5", name: "Fashion Supplier Inc", type: "Vendor" },
      { id: "contact_6", name: "Retail Customer", type: "Client" },
    ],
    isSetupComplete: true,
    totalTransactionsProcessed: 2341,
    totalRulesCreated: 15,
    averageAccuracy: 0.896,
    currentStep: 8,
    completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    hasActiveChat: false,
  },
]

// Sample Historical Transactions for TechFlow Solutions
export const SAMPLE_TECH_TRANSACTIONS: HistoricalTransaction[] = [
  {
    id: "txn_tech_001",
    companyId: "company_tech_startup",
    runId: "run_tech_001",
    date: "2024-01-15",
    description: "AWS Cloud Services",
    amount: -450.75,
    category: "Cloud Infrastructure",
    accountId: "6400",
    accountName: "Cloud Services",
    payee: "Amazon Web Services",
    confidence: 0.95,
    wasException: false,
    ruleApplied: "rule_aws_auto",
    transactionType: "debit",
    isRecurring: true,
    merchantCategory: "Cloud Services",
    userFeedback: "correct",
  },
  {
    id: "txn_tech_002",
    companyId: "company_tech_startup",
    runId: "run_tech_001",
    date: "2024-01-16",
    description: "Client Payment - Acme Corp",
    amount: 5000.0,
    category: "Software Revenue",
    accountId: "4000",
    accountName: "Software Revenue",
    payee: "Acme Corp",
    confidence: 0.98,
    wasException: false,
    transactionType: "credit",
    isRecurring: true,
    merchantCategory: "Client Payment",
    userFeedback: "correct",
  },
  {
    id: "txn_tech_003",
    companyId: "company_tech_startup",
    runId: "run_tech_002",
    date: "2024-01-17",
    description: "GitHub Enterprise",
    amount: -21.0,
    category: "Software Tools",
    accountId: "6400",
    accountName: "Cloud Services",
    payee: "GitHub Inc",
    confidence: 0.92,
    wasException: false,
    ruleApplied: "rule_github_auto",
    transactionType: "debit",
    isRecurring: true,
    merchantCategory: "Software Tools",
    userFeedback: "correct",
  },
]

// Sample Transaction Rules for TechFlow Solutions
export const SAMPLE_TECH_RULES: TransactionRule[] = [
  {
    id: "rule_aws_auto",
    companyId: "company_tech_startup",
    name: "AWS Cloud Services Auto-Categorization",
    conditions: [
      { field: "description", operator: "contains", value: "AWS" },
      { field: "payee", operator: "equals", value: "Amazon Web Services" },
    ],
    applyToAccountId: "6400",
    applyToAccountName: "Cloud Services",
    isPermanent: true,
    isEnabled: true,
    createdAt: "2024-01-15T12:00:00Z",
    timesApplied: 24,
    accuracy: 0.96,
    suggestedBySaim: true,
    basedOnTransactionIds: ["txn_tech_001"],
    confidence: 0.95,
    lastAppliedAt: "2024-01-20T10:30:00Z",
    userValidated: true,
  },
  {
    id: "rule_github_auto",
    companyId: "company_tech_startup",
    name: "GitHub Subscription Auto-Categorization",
    conditions: [{ field: "description", operator: "contains", value: "GitHub" }],
    applyToAccountId: "6400",
    applyToAccountName: "Cloud Services",
    isPermanent: true,
    isEnabled: true,
    createdAt: "2024-01-16T14:30:00Z",
    timesApplied: 12,
    accuracy: 0.92,
    suggestedBySaim: true,
    basedOnTransactionIds: ["txn_tech_003"],
    confidence: 0.92,
    lastAppliedAt: "2024-01-19T09:15:00Z",
    userValidated: true,
  },
]

// Sample Processing Runs
export const SAMPLE_PROCESSING_RUNS: ProcessingRun[] = [
  {
    id: "run_tech_001",
    companyId: "company_tech_startup",
    fileName: "january_bank_statement.csv",
    fileType: "csv",
    periodFrom: "2024-01-01",
    periodTo: "2024-01-31",
    processedAt: "2024-01-15T15:30:00Z",
    status: "completed",
    transactionCount: 156,
    exceptionsCount: 8,
    rulesApplied: ["rule_aws_auto", "rule_github_auto"],
    summary: "Processed 156 transactions with 8 exceptions resolved",
    tokensUsed: 1240,
    cost: 12.4,
    aiAccuracy: 0.95,
  },
  {
    id: "run_consulting_001",
    companyId: "company_consulting_firm",
    fileName: "december_expenses.xlsx",
    fileType: "xlsx",
    periodFrom: "2023-12-01",
    periodTo: "2023-12-31",
    processedAt: "2024-01-10T11:45:00Z",
    status: "completed",
    transactionCount: 89,
    exceptionsCount: 12,
    rulesApplied: ["rule_travel_auto", "rule_client_payment"],
    summary: "Processed 89 transactions with 12 exceptions resolved",
    tokensUsed: 890,
    cost: 8.9,
    aiAccuracy: 0.88,
  },
]

// Function to initialize sample data in localStorage
export function initializeSampleData() {
  // Clear existing data first
  localStorage.clear()

  // Set sample user companies
  localStorage.setItem(`saimJr_userCompanies_${SAMPLE_USER_ID}`, JSON.stringify(SAMPLE_USER.companies))

  // Set current company
  localStorage.setItem("saimJr_currentCompanyId", "company_tech_startup")

  // Save company profiles
  SAMPLE_COMPANIES.forEach((company) => {
    localStorage.setItem(`saimJr_companyProfile_${company.id}`, JSON.stringify(company))
  })

  // Save sample transactions for tech company
  localStorage.setItem(`saimJr_historicalTransactions_company_tech_startup`, JSON.stringify(SAMPLE_TECH_TRANSACTIONS))

  // Save sample rules for tech company
  localStorage.setItem(`saimJr_transactionRules_company_tech_startup`, JSON.stringify(SAMPLE_TECH_RULES))

  // Save sample processing runs
  localStorage.setItem(`saimJr_processingRuns_company_tech_startup`, JSON.stringify([SAMPLE_PROCESSING_RUNS[0]]))
  localStorage.setItem(`saimJr_processingRuns_company_consulting_firm`, JSON.stringify([SAMPLE_PROCESSING_RUNS[1]]))

  console.log("Sample data initialized successfully!")
  console.log("Sample User ID:", SAMPLE_USER_ID)
  console.log(
    "Sample Companies:",
    SAMPLE_COMPANIES.map((c) => ({ id: c.id, name: c.businessName })),
  )
}

// Function to get sample user for testing
export function getSampleUser(): User {
  return SAMPLE_USER
}

// Function to clear all sample data
export function clearSampleData() {
  // Clear all localStorage keys that start with 'saimJr_'
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith("saimJr_")) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
  console.log("Sample data cleared!")
}
