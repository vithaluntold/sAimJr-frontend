// 🚨 DEPRECATED: This route has been moved to secure FastAPI backend
// Frontend API routes are INSECURE and should not handle business logic
// This endpoint is now handled by:
// - Backend: /api/v1/ws/validation (FastAPI WebSocket)
// - Authentication: Required via JWT tokens  
// - Security: Input validation, rate limiting, proper logging

import { NextResponse } from 'next/server'

export async function GET() {
  console.log('⚠️ DEPRECATED: Frontend WebSocket route called - redirecting to secure backend')

  return NextResponse.json({
    error: 'This endpoint has been moved to secure backend',
    message: 'Please use the FastAPI backend WebSocket /api/v1/ws/validation',
    migration_info: {
      old_endpoint: '/api/ai-websocket',
      new_endpoint: '/api/v1/ws/validation',
      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      security: 'JWT authentication required',
      status: 'DEPRECATED - INSECURE ROUTE'
    }
  }, { status: 410 })
}

export async function POST() {
  console.log('⚠️ DEPRECATED: Frontend WebSocket POST route called - redirecting to secure backend')

  return NextResponse.json({
    error: 'This endpoint has been moved to secure backend',
    message: 'Please use the FastAPI backend WebSocket /api/v1/ws/validation',
    migration_info: {
      old_endpoint: '/api/ai-websocket',
      new_endpoint: '/api/v1/ws/validation',
      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      security: 'JWT authentication required',
      status: 'DEPRECATED - INSECURE ROUTE'
    }
  }, { status: 410 })
}

// WebSocket connections should be handled by the secure FastAPI backend
// This ensures proper:
// 1. Authentication and authorization
// 2. Input validation and sanitization
// 3. Rate limiting and abuse prevention
// 4. Proper error handling and logging
// 5. Secure data transmission
