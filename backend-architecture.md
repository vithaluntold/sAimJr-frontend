# 🏗️ FastAPI Backend Architecture Design

## 📁 **Proposed Backend Structure**

```
backend/
├── main.py                     # FastAPI app entry point
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container configuration
├── .env                       # Environment variables
├── config/
│   ├── __init__.py
│   ├── settings.py            # Configuration management
│   └── database.py            # Database connection
├── api/
│   ├── __init__.py
│   ├── deps.py                # Dependencies (auth, db)
│   └── v1/
│       ├── __init__.py
│       ├── endpoints/
│       │   ├── __init__.py
│       │   ├── companies.py   # Company management
│       │   ├── ai_processing.py # AI operations (CoA, categorization)
│       │   ├── files.py       # File upload/processing
│       │   ├── transactions.py # Transaction operations
│       │   ├── chat.py        # Chat sessions
│       │   └── validation.py  # Input validation
│       └── router.py          # API router setup
├── services/
│   ├── __init__.py
│   ├── ai_service.py          # AI processing service
│   ├── file_service.py        # File processing service
│   ├── company_service.py     # Company operations
│   ├── transaction_service.py # Transaction processing
│   └── validation_service.py  # Input validation
├── models/
│   ├── __init__.py
│   ├── company.py             # SQLAlchemy models
│   ├── transaction.py
│   ├── chat.py
│   └── file.py
├── schemas/
│   ├── __init__.py
│   ├── company.py             # Pydantic schemas
│   ├── transaction.py
│   ├── chat.py
│   ├── ai.py
│   └── file.py
├── crud/
│   ├── __init__.py
│   ├── company.py             # Database operations
│   ├── transaction.py
│   ├── chat.py
│   └── file.py
├── core/
│   ├── __init__.py
│   ├── security.py            # Auth & security
│   ├── ai_engine.py          # Core AI processing
│   └── exceptions.py         # Custom exceptions
└── tests/
    ├── __init__.py
    ├── test_companies.py
    ├── test_ai_processing.py
    └── test_transactions.py
```

## 🔒 **Security-First API Design**

### **1. AI Processing Endpoints (SECURE)**
```python
# /api/v1/ai/chart-of-accounts
@router.post("/chart-of-accounts")
async def generate_chart_of_accounts(
    request: ChartOfAccountsRequest,
    company: Company = Depends(get_company),
    db: Session = Depends(get_db)
) -> ChartOfAccountsResponse:
    """Generate comprehensive Chart of Accounts using AI"""
    return await ai_service.generate_coa(company, request, db)

# /api/v1/ai/categorize-transactions  
@router.post("/categorize-transactions")
async def categorize_transactions(
    request: CategorizationRequest,
    company: Company = Depends(get_company),
    db: Session = Depends(get_db)
) -> CategorizationResponse:
    """AI-powered transaction categorization with learning"""
    return await ai_service.categorize_transactions(company, request, db)

# /api/v1/ai/validate-input
@router.post("/validate-input")
async def validate_input(
    request: ValidationRequest,
    company: Company = Depends(get_company)
) -> ValidationResponse:
    """Real-time AI input validation"""
    return await validation_service.validate_input(request, company)
```

### **2. File Processing Endpoints (SECURE)**
```python
# /api/v1/files/upload
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_type: FileType = Form(...),
    company: Company = Depends(get_company),
    db: Session = Depends(get_db)
) -> FileProcessingResponse:
    """Secure file upload and processing"""
    return await file_service.process_upload(file, file_type, company, db)

# /api/v1/files/process
@router.post("/process/{file_id}")
async def process_file(
    file_id: str,
    processing_options: ProcessingOptions,
    company: Company = Depends(get_company),
    db: Session = Depends(get_db)
) -> ProcessingRunResponse:
    """Process uploaded file with AI"""
    return await file_service.process_file(file_id, processing_options, company, db)
```

### **3. Company Management Endpoints (SECURE)**
```python
# /api/v1/companies
@router.post("/")
async def create_company(
    company_data: CompanyCreateRequest,
    db: Session = Depends(get_db)
) -> CompanyResponse:
    """Create new company profile"""
    return await company_service.create_company(company_data, db)

@router.get("/{company_id}")
async def get_company(
    company: Company = Depends(get_company),
    db: Session = Depends(get_db)
) -> CompanyResponse:
    """Get company profile and settings"""
    return await company_service.get_company_details(company, db)

@router.put("/{company_id}")
async def update_company(
    updates: CompanyUpdateRequest,
    company: Company = Depends(get_company),
    db: Session = Depends(get_db)
) -> CompanyResponse:
    """Update company profile"""
    return await company_service.update_company(company, updates, db)
```

## 🧠 **AI Service Architecture**

### **Core AI Engine (`core/ai_engine.py`)**
```python
class AIEngine:
    """Centralized AI processing engine"""
    
    async def generate_chart_of_accounts(
        self, 
        business_profile: BusinessProfile,
        requirements: CoARequirements
    ) -> ChartOfAccounts:
        """Generate 80-120 contextual accounts"""
        
    async def categorize_transactions(
        self,
        transactions: List[Transaction],
        historical_patterns: List[Pattern],
        company_context: CompanyContext
    ) -> List[CategorizedTransaction]:
        """AI transaction categorization with learning"""
        
    async def validate_business_input(
        self,
        input_text: str,
        validation_type: ValidationType,
        company_context: CompanyContext
    ) -> ValidationResult:
        """Real-time input validation with spell check"""
```

### **AI Prompts (SECURE & HIDDEN)**
```python
class AIPrompts:
    """Secure AI prompt templates - never exposed to frontend"""
    
    CHART_OF_ACCOUNTS_PROMPT = """
    Generate a comprehensive Chart of Accounts with 80-120 accounts for:
    
    Company: {company_name}
    Type: {company_type}
    Industry: {industry}
    Location: {location}
    Nature: {business_nature}
    
    Requirements:
    - Account codes: 1000-1999 (Assets), 2000-2999 (Liabilities), etc.
    - India-specific compliance: GST, TDS, PF, ESI
    - Company-specific descriptions
    - Proper account hierarchy and grouping
    """
    
    TRANSACTION_CATEGORIZATION_PROMPT = """
    Categorize the following transactions based on:
    - Historical patterns: {patterns}
    - Company context: {context}
    - Chart of Accounts: {coa}
    
    Transactions: {transactions}
    """
```

## 💾 **Database Models (SQLAlchemy)**

### **Company Model**
```python
class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    company_type = Column(Enum(CompanyType))
    industry = Column(String)
    location = Column(String)
    nature_of_business = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="company")
    chat_sessions = relationship("ChatSession", back_populates="company")
    files = relationship("File", back_populates="company")
```

### **Transaction Model**
```python
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    amount = Column(Numeric(15, 2))
    description = Column(String)
    category = Column(String)
    account_code = Column(String)
    confidence_score = Column(Float)
    is_ai_categorized = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="transactions")
```

## 🔐 **Security Implementation**

### **Authentication & Authorization**
```python
# For module integration - simplified auth
async def get_company(company_id: str = Header(...)) -> Company:
    """Extract company from request headers"""
    company = await company_service.get_by_id(company_id)
    if not company:
        raise HTTPException(401, "Invalid company")
    return company

# Rate limiting
@router.post("/ai/generate")
@rate_limit("10/minute")
async def ai_endpoint():
    pass
```

### **Input Validation & Sanitization**
```python
class BusinessProfileRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    industry: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., regex=r"^[A-Za-z\s/,-]+$")
    
    @validator('company_name')
    def validate_company_name(cls, v):
        # Sanitize and validate
        return sanitize_business_name(v)
```

## 🚀 **Deployment Configuration**

### **Docker Setup**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Environment Variables**
```env
DATABASE_URL=postgresql://user:pass@db:5432/saimjr
AI_MODEL_ENDPOINT=https://api.your-ai-provider.com
REDIS_URL=redis://redis:6379
LOG_LEVEL=INFO
```

---

## 📋 **Migration Plan Summary**

**Phase 1: Backend Setup**
1. ✅ Design FastAPI structure 
2. ⏳ Create backend API endpoints
3. ⏳ Implement AI services (secure)
4. ⏳ Add database models & CRUD

**Phase 2: Frontend Refactor**  
1. ⏳ Remove business logic from frontend
2. ⏳ Replace with API client calls
3. ⏳ Update components to use backend

**Phase 3: Security & Production**
1. ⏳ Add authentication & rate limiting
2. ⏳ Deploy backend infrastructure
3. ⏳ Performance optimization

This architecture ensures **ALL business logic is secure** in the backend! 🛡️