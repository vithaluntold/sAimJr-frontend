// 🚨 DEPRECATED: This route has been moved to secure FastAPI backend
// Frontend API routes are INSECURE and should not handle business logic
// 
// This endpoint is now handled by:
// - Backend: /api/validate-input (FastAPI backend)
// - Authentication: Required via JWT tokens  
// - Security: Input validation, rate limiting, proper logging

import { NextResponse } from 'next/server'

export async function POST() {
  console.log('⚠️ DEPRECATED: Frontend validation route called - redirecting to secure backend')
  
  return NextResponse.json({
    error: 'This endpoint has been moved to secure backend',
    message: 'Please use the FastAPI backend endpoint /api/validate-input',
    migration_info: {
      old_endpoint: '/api/validate-input',  
      new_endpoint: '/api/validate-input',
      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      security: 'JWT authentication required',
      status: 'DEPRECATED - INSECURE ROUTE'
    }
  }, { status: 410 }) // 410 Gone - resource no longer available
}
