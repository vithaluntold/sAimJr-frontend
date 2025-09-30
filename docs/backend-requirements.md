# Backend Requirements (Python) - Module Integration

## Technology Stack
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Async Support**: Required for WebSocket and concurrent processing
- **Container Support**: Docker for deployment
- **CI/CD Integration**: GitHub Actions or similar

## Core Components (Authentication Removed for Module Integration)
1. **API Server**: FastAPI application serving REST endpoints
2. **WebSocket Server**: For real-time communication during processing
3. **File Processing Service**: Process and validate uploaded accounting files
4. **AI Engine**: Natural language processing and accounting rules engine
5. **Data Storage Service**: Interface with database and object storage
6. **Analytics Service**: Generate insights and reports from processed data
7. **Company Management Service**: Handle company profiles and workflow data

## Service Architecture
The backend follows a simplified microservice architecture for module integration:

### API Gateway Service
- Routes requests to appropriate microservices
- Handles API versioning and rate limiting
- CORS configuration for frontend integration
- Dependencies: None

### File Processing Service
- File upload and validation
- File parsing and normalization (CSV, XLSX parsing)
- Data extraction and transformation
- Support for bank statements, COA, and contacts
- Dependencies: Object Storage, Database, AI Engine

### AI Engine Service
- Natural language processing for chat interactions
- Mock AI processing for transaction categorization
- Rule-based processing for accounting workflows
- Pattern recognition and suggestion generation
- Dependencies: Database, Model Storage

### Company Management Service
- Company creation and configuration
- Chart of accounts management
- Contact management
- Multi-tenant data isolation by company ID
- Dependencies: Database

### Transaction Processing Service
- Transaction categorization and validation
- Party mapping and contact resolution
- Rule application and exception generation
- Historical transaction storage
- Dependencies: Database, AI Engine

### Chat Session Service
- Chat message persistence and retrieval
- Workflow step tracking
- Processing run management
- Session state management
- Dependencies: Database

### Reporting Service
- Generate accounting reports
- Data visualization preparation
- Export to various formats (PDF, CSV, Excel)
- Processing history and analytics
- Dependencies: Database

## Implementation Requirements

### FastAPI Application Structure
```python
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import models, schemas, crud
from database import engine, SessionLocal

app = FastAPI(
    title="Saim Jr Accounting API",
    description="API for the Saim Jr AI accounting assistant module",
    version="1.0.0"
)

# CORS middleware configuration for module integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://app.saimjr.com"],
    allow_credentials=False,  # No authentication needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Core API Endpoints

## Company Management
@app.post("/api/companies", response_model=schemas.CompanyProfile)
async def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    """Create a new company profile"""
    return crud.create_company(db=db, company=company)

@app.get("/api/companies/{company_id}", response_model=schemas.CompanyProfile)
async def get_company(company_id: str, db: Session = Depends(get_db)):
    """Get company profile by ID"""
    company = crud.get_company(db, company_id=company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

## File Processing
@app.post("/api/companies/{company_id}/files/upload")
async def upload_file(
    company_id: str,
    file_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process accounting files"""
    return await crud.process_file_upload(db, company_id, file_type, file)

## Chat Sessions
@app.get("/api/companies/{company_id}/chat", response_model=schemas.ChatSession)
async def get_chat_session(company_id: str, db: Session = Depends(get_db)):
    """Get or create chat session for company"""
    return crud.get_or_create_chat_session(db, company_id)

@app.post("/api/companies/{company_id}/chat/messages")
async def add_chat_message(
    company_id: str,
    message: schemas.MessageCreate,
    db: Session = Depends(get_db)
):
    """Add message to chat session"""
    return crud.add_chat_message(db, company_id, message)

## Transaction Processing
@app.get("/api/companies/{company_id}/transactions")
async def get_transactions(company_id: str, db: Session = Depends(get_db)):
    """Get historical transactions for company"""
    return crud.get_historical_transactions(db, company_id)

@app.post("/api/companies/{company_id}/transactions/categorize")
async def categorize_transactions(
    company_id: str,
    transactions: List[schemas.TransactionCreate],
    db: Session = Depends(get_db)
):
    """AI-powered transaction categorization"""
    return await crud.categorize_transactions(db, company_id, transactions)

## Rules Management
@app.get("/api/companies/{company_id}/rules")
async def get_transaction_rules(company_id: str, db: Session = Depends(get_db)):
    """Get transaction rules for company"""
    return crud.get_transaction_rules(db, company_id)

@app.post("/api/companies/{company_id}/rules")
async def create_rule(
    company_id: str,
    rule: schemas.TransactionRuleCreate,
    db: Session = Depends(get_db)
):
    """Create new transaction rule"""
    return crud.create_transaction_rule(db, company_id, rule)
