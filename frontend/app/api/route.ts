// 🚨 DEPRECATED: All frontend API routes have been moved to secure FastAPI backend
// Frontend API routes are INSECURE and should not handle business logic
//
// All endpoints are now handled by the FastAPI backend with proper:
// - JWT Authentication
// - Input validation & sanitization  
// - Rate limiting
// - Audit logging
// - Secure database operations
//
// Backend URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    error: 'All frontend API routes have been deprecated',
    message: 'Please use the secure FastAPI backend endpoints',
    backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    status: 'DEPRECATED - MOVED TO SECURE BACKEND'
  }, { status: 410 })
}

export async function POST() {
  return NextResponse.json({
    error: 'All frontend API routes have been deprecated',
    message: 'Please use the secure FastAPI backend endpoints',
    backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', 
    status: 'DEPRECATED - MOVED TO SECURE BACKEND'
  }, { status: 410 })
}