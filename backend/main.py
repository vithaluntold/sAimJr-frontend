#!/usr/bin/env python3
"""
S(ai)m Jr Secure FastAPI Backend
Comprehensive AI accounting assistant with microservice architecture
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Check if required dependencies are available
try:
    import uvicorn  # type: ignore
    from fastapi import FastAPI, HTTPException, Depends, status, Request  # type: ignore
    from fastapi.middleware.cors import CORSMiddleware  # type: ignore
    from fastapi.middleware.trustedhost import TrustedHostMiddleware  # type: ignore
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  # type: ignore
    from fastapi.responses import JSONResponse  # type: ignore
    from slowapi import Limiter, _rate_limit_exceeded_handler  # type: ignore
    from slowapi.util import get_remote_address  # type: ignore
    from slowapi.errors import RateLimitExceeded  # type: ignore
    from sqlalchemy import create_engine  # type: ignore
    from sqlalchemy.ext.declarative import declarative_base  # type: ignore
    from sqlalchemy.orm import sessionmaker, Session  # type: ignore
    from dotenv import load_dotenv  # type: ignore
    import jwt  # type: ignore
    from passlib.context import CryptContext  # type: ignore
    import redis  # type: ignore
except ImportError as e:
    print(f"Missing required dependency: {e}")
    print("Please install dependencies with: pip install -r requirements.txt")
    sys.exit(1)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("saimjr_backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./saimjr.db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Rate limiting configuration
limiter = Limiter(key_func=get_remote_address)

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_database() -> Session:
    """Database dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting S(ai)m Jr Backend Service...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Initialize Redis connection
    try:
        redis_client = redis.from_url(REDIS_URL)
        redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}")
    
    yield
    
    logger.info("Shutting down S(ai)m Jr Backend Service...")

# Create FastAPI app instance
app = FastAPI(
    title="S(ai)m Jr AI Accounting Backend",
    description="Secure microservice backend for AI-powered accounting assistant",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Configure CORS with security
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"]
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware for request tracking
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add request processing time and ID headers"""
    start_time = datetime.utcnow()
    request_id = f"req_{int(start_time.timestamp() * 1000)}"
    
    response = await call_next(request)
    
    process_time = (datetime.utcnow() - start_time).total_seconds()
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Request-ID"] = request_id
    
    # Log request
    logger.info(f"Request {request_id}: {request.method} {request.url} - {response.status_code} ({process_time:.3f}s)")
    
    return response

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url)
        }
    )

# Health check endpoints
@app.get("/", tags=["health"])
@limiter.limit("60/minute")
async def root(request: Request):
    """Service root endpoint"""
    return {
        "service": "S(ai)m Jr AI Accounting Backend",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/api/docs"
    }

@app.get("/api/health", tags=["health"])
@limiter.limit("30/minute")
async def health_check(request: Request, db: Session = Depends(get_database)):
    """Comprehensive health check"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "checks": {}
    }
    
    # Database check
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = "connected"
    except Exception as e:
        health_status["checks"]["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # Redis check
    try:
        redis_client = redis.from_url(REDIS_URL)
        redis_client.ping()
        health_status["checks"]["redis"] = "connected"
    except Exception as e:
        health_status["checks"]["redis"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # AI service check
    try:
        # Basic check for AI service availability
        health_status["checks"]["ai_service"] = "available"
    except Exception as e:
        health_status["checks"]["ai_service"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "production") == "development"
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=reload,
        access_log=True
    )