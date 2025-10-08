// Comprehensive database schema design for scalability
export interface DatabaseSchema {
  // User Management Tables
  users: {
    id: string // UUID primary key
    email: string // Unique, indexed
    password_hash: string
    password_salt: string
    first_name: string
    last_name: string
    role: "user" | "admin" | "super_admin"
    status: "active" | "suspended" | "pending" | "deleted"
    email_verified: boolean
    two_factor_enabled: boolean
    two_factor_secret?: string
    avatar_url?: string
    created_at: Date
    updated_at: Date
    last_login_at?: Date
    last_login_ip?: string
    preferences: Record<string, string | number | boolean> // JSON field
  }

  // Session Management
  user_sessions: {
    id: string // UUID primary key
    user_id: string // Foreign key to users
    session_token: string // Unique, indexed
    csrf_token: string
    ip_address: string
    user_agent: string
    created_at: Date
    last_activity: Date
    expires_at: Date
    is_active: boolean
  }

  // Company Management
  companies: {
    id: string // UUID primary key
    owner_id: string // Foreign key to users
    business_name: string
    nature_of_business: string
    industry: string
    location: string
    reporting_framework: string
    statutory_compliances: string[] // Array field
    created_at: Date
    updated_at: Date
    last_accessed_at: Date
    is_setup_complete: boolean
    total_transactions_processed: number
    total_rules_created: number
    average_accuracy: number
  }

  // User-Company Relationships (Many-to-Many)
  user_companies: {
    id: string
    user_id: string // Foreign key to users
    company_id: string // Foreign key to companies
    role: "owner" | "admin" | "viewer"
    permissions: string[] // Array of permission strings
    created_at: Date
    last_accessed_at: Date
  }

  // Chart of Accounts
  chart_of_accounts: {
    id: string
    company_id: string // Foreign key to companies
    code: string
    name: string
    category: string
    class: string
    statement: string
    parent_id?: string // Self-referencing for hierarchy
    is_active: boolean
    created_at: Date
    updated_at: Date
  }

  // Contacts
  contacts: {
    id: string
    company_id: string // Foreign key to companies
    name: string
    type: "client" | "vendor" | "other"
    email?: string
    phone?: string
    address?: string
    tax_id?: string
    created_at: Date
    updated_at: Date
  }

  // Processing Runs
  processing_runs: {
    id: string
    company_id: string // Foreign key to companies
    user_id: string // Foreign key to users
    file_name: string
    file_type: string
    file_size: number
    file_url: string // S3 URL
    period_from: Date
    period_to: Date
    status: "pending" | "processing" | "completed" | "failed"
    processed_at?: Date
    transaction_count: number
    exceptions_count: number
    rules_applied: string[] // Array of rule IDs
    tokens_used: number
    cost: number // USD
    ai_accuracy: number
    summary: string
    error_message?: string
    created_at: Date
    updated_at: Date
  }

  // Historical Transactions
  historical_transactions: {
    id: string
    company_id: string // Foreign key to companies
    run_id: string // Foreign key to processing_runs
    date: Date
    description: string
    amount: number
    transaction_type: "debit" | "credit"
    category: string
    account_id: string // Foreign key to chart_of_accounts
    account_name: string
    payee?: string
    merchant_category?: string
    confidence: number // AI confidence score
    was_exception: boolean
    rule_applied?: string // Rule ID if applied
    is_recurring: boolean
    similarity_score?: number
    user_feedback?: "correct" | "incorrect" | "partial"
    vector_embedding?: number[] // For AI similarity search
    created_at: Date
    updated_at: Date
  }

  // Transaction Rules
  transaction_rules: {
    id: string
    company_id: string // Foreign key to companies
    created_by: string // Foreign key to users
    name: string
    description?: string
    conditions: Record<string, string | number | boolean> // JSON field for rule conditions
    apply_to_account_id: string // Foreign key to chart_of_accounts
    apply_to_account_name: string
    is_permanent: boolean
    is_enabled: boolean
    suggested_by_saim: boolean
    based_on_transaction_ids: string[] // Array of transaction IDs
    confidence: number
    times_applied: number
    accuracy: number
    last_applied_at?: Date
    user_validated: boolean
    created_at: Date
    updated_at: Date
  }

  // Chat Sessions
  chat_sessions: {
    id: string
    company_id: string // Foreign key to companies
    user_id: string // Foreign key to users
    current_step: number
    completed_steps: number[]
    is_active: boolean
    context_data: Record<string, unknown> // JSON field for chat context
    created_at: Date
    updated_at: Date
    last_message_at: Date
  }

  // Chat Messages
  chat_messages: {
    id: string
    session_id: string // Foreign key to chat_sessions
    sender: "user" | "saim"
    message_type: "text" | "file_upload" | "processing" | "options"
    content: string
    metadata: Record<string, unknown> // JSON field for message metadata
    created_at: Date
  }

  // Subscriptions
  subscriptions: {
    id: string
    user_id: string // Foreign key to users
    plan_id: string // Foreign key to subscription_plans
    stripe_subscription_id?: string
    status: "active" | "canceled" | "past_due" | "trialing" | "incomplete"
    current_period_start: Date
    current_period_end: Date
    cancel_at_period_end: boolean
    canceled_at?: Date
    trial_start?: Date
    trial_end?: Date
    created_at: Date
    updated_at: Date
  }

  // Subscription Plans
  subscription_plans: {
    id: string
    name: string
    tier: "free" | "starter" | "professional" | "enterprise"
    price: number // Monthly price in cents
    tokens_included: number
    features: string[] // Array of feature names
    max_companies: number
    max_transactions_per_run: number
    priority_support: boolean
    custom_rules: boolean
    api_access: boolean
    vector_db_access: boolean
    unlimited_history: boolean
    stripe_product_id?: string
    stripe_price_id?: string
    is_active: boolean
    created_at: Date
    updated_at: Date
  }

  // Token Wallets
  token_wallets: {
    id: string
    user_id: string // Foreign key to users
    balance: number
    total_purchased: number
    total_used: number
    last_updated: Date
  }

  // Token Transactions
  token_transactions: {
    id: string
    user_id: string // Foreign key to users
    company_id?: string // Foreign key to companies
    type: "purchase" | "usage" | "refund" | "bonus"
    amount: number // Positive for purchases, negative for usage
    description: string
    processing_run_id?: string // Foreign key to processing_runs
    stripe_payment_intent_id?: string
    metadata: Record<string, unknown> // JSON field
    created_at: Date
  }

  // Notifications
  notifications: {
    id: string
    user_id?: string // Foreign key to users (null for system-wide)
    company_id?: string // Foreign key to companies
    type: "info" | "warning" | "error" | "success" | "maintenance"
    title: string
    message: string
    action_url?: string
    action_text?: string
    is_read: boolean
    expires_at?: Date
    created_at: Date
    read_at?: Date
  }

  // Audit Logs
  audit_logs: {
    id: string
    user_id?: string // Foreign key to users
    action: string
    resource_type: string
    resource_id?: string
    details: Record<string, unknown> // JSON field
    ip_address: string
    user_agent: string
    created_at: Date
  }

  // System Settings
  system_settings: {
    id: string
    key: string // Unique
    value: Record<string, unknown> // JSON field
    description?: string
    is_public: boolean // Whether setting is visible to non-admins
    created_at: Date
    updated_at: Date
  }

  // Usage Analytics
  usage_analytics: {
    id: string
    user_id: string // Foreign key to users
    company_id: string // Foreign key to companies
    period: string // YYYY-MM format
    tokens_used: number
    transactions_processed: number
    rules_created: number
    rules_applied: number
    average_tokens_per_transaction: number
    top_categories: Record<string, number> // JSON field
    cost_savings: number
    ai_accuracy_trend: Record<string, number> // JSON field
    created_at: Date
  }
}

// Database indexes for performance
export const DATABASE_INDEXES = {
  users: ["email", "status", "role", "created_at", "last_login_at"],
  user_sessions: ["user_id", "session_token", "expires_at", "is_active"],
  companies: ["owner_id", "industry", "created_at", "last_accessed_at"],
  user_companies: [
    "user_id",
    "company_id",
    ["user_id", "company_id"], // Composite index
  ],
  processing_runs: ["company_id", "user_id", "status", "created_at", "processed_at"],
  historical_transactions: ["company_id", "run_id", "date", "account_id", "amount", "created_at"],
  transaction_rules: ["company_id", "is_enabled", "created_at", "times_applied"],
  chat_sessions: ["company_id", "user_id", "is_active", "last_message_at"],
  notifications: ["user_id", "company_id", "type", "is_read", "created_at"],
  audit_logs: ["user_id", "action", "resource_type", "created_at"],
}
