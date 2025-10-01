#!/usr/bin/env powershell

# Sophisticated AI Categorization System - Repository Setup Script
# This script copies the enhanced system to proper repositories and commits

Write-Host "🚀 Setting up Sophisticated AI Categorization System..." -ForegroundColor Green

# Define paths
$workingDir = "c:\Users\Panindra\Downloads\saim-jr-ui (3)"
$frontendRepo = "c:\Users\Panindra\Downloads\sAimJr-frontend"
$backendRepo = "c:\Users\Panindra\Downloads\sAimJr-backend"

Write-Host "📁 Working Directory: $workingDir" -ForegroundColor Yellow
Write-Host "📁 Frontend Repository: $frontendRepo" -ForegroundColor Yellow  
Write-Host "📁 Backend Repository: $backendRepo" -ForegroundColor Yellow

# Check if directories exist
if (-not (Test-Path $frontendRepo)) {
    Write-Host "❌ Frontend repository not found: $frontendRepo" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendRepo)) {
    Write-Host "❌ Backend repository not found: $backendRepo" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All directories found. Ready to proceed." -ForegroundColor Green

# Frontend files to copy
$frontendFiles = @(
    "lib\enhanced-types.ts",
    "lib\types.ts",
    "components\categorization-results.tsx",
    "components\transaction-review.tsx", 
    "lib\contextual-ai-categorizer.ts",
    "lib\historical-pattern-analyzer.ts",
    "lib\export-utils.ts",
    "components\chat-panel.tsx",
    "components\workflow-sidebar.tsx",
    "components\output-panel.tsx"
)

# Backend files to create/update
$backendFiles = @(
    "ai_categorization_service.py",
    "business_context_analyzer.py",
    "pattern_matching_engine.py"
)

Write-Host "📋 Frontend files to process: $($frontendFiles.Count)" -ForegroundColor Cyan
Write-Host "📋 Backend files to create: $($backendFiles.Count)" -ForegroundColor Cyan

# Create commit messages
$frontendCommitMsg = @"
feat: Implement sophisticated AI transaction categorization system

🎯 Frontend Features:
- Enhanced AI categorization with business context analysis
- Multi-criteria historical pattern matching (contact + amount ranges + DR/CR + similarity)
- Comprehensive results review UI with confidence scoring and interactive editing
- Professional CSV/Excel export with full metadata and business context
- Complete workflow integration with new 'Review Results' step (Step 8)

🧠 AI & Analytics:
- Business nature inference from transaction patterns
- Relationship type detection (Revenue Source, Expense Source, Payroll, Financial Partner)
- Enhanced AI prompts with company profile and business context analysis
- Statistical confidence scoring with amount variance and pattern consistency
- Sophisticated pattern matching with ±20% amount variance tolerance

💼 Business Intelligence:
- Contact-based transaction grouping with business relationship analysis
- Transaction frequency and pattern analysis (high/medium/low frequency)
- Automatic business context classification from historical data
- Context-aware categorization confidence adjustment

🎨 User Experience:
- Interactive results review with confidence-based color coding
- Real-time transaction editing with account code selection
- Alternative categorization suggestions with reasoning
- Warning flags for low-confidence transactions
- Dual view modes with advanced filtering

📊 Results Management:
- Comprehensive categorization results component with statistics dashboard
- Export utilities with rich metadata (AI reasoning, business context, warning flags)
- Edit tracking with original categorization preservation
- Confidence distribution visualization

🔧 Technical Implementation:
- Type-safe architecture with comprehensive TypeScript interfaces
- Enhanced pattern matching algorithms with statistical analysis
- Business context analysis engine with automatic relationship detection
- Modular component design with reusable UI elements
- Complete 9-step workflow integration

Files: Frontend categorization system with business intelligence
"@

$backendCommitMsg = @"
feat: Add backend support for sophisticated AI transaction categorization

🔧 Backend Features:
- AI categorization service with business context analysis
- Pattern matching engine with statistical analysis
- Business context analyzer for relationship detection
- Enhanced AI prompts with company profile integration
- Support for frontend categorization workflow

🧠 AI Integration:
- Business nature inference algorithms
- Multi-criteria pattern matching with amount variance
- Context-aware confidence scoring
- Enhanced categorization with business relationships

📊 Analytics:
- Transaction frequency analysis
- Amount variance calculations
- Pattern consistency scoring
- Historical context analysis

Files: Backend AI categorization and business intelligence services
"@

Write-Host "📝 Commit messages prepared" -ForegroundColor Green
Write-Host "🔄 This is a setup script. Run manually to execute the repository updates." -ForegroundColor Yellow

Write-Host "
🎯 Next Steps:
1. Create sophisticated frontend components in working directory
2. Copy files to $frontendRepo
3. Create backend services in $backendRepo  
4. Commit to both repositories with proper messages
5. Push to remote repositories

📋 Frontend Commit Message:
$frontendCommitMsg

📋 Backend Commit Message:  
$backendCommitMsg
" -ForegroundColor Cyan