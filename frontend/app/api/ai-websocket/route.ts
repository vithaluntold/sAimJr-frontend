// 🚨 DEPRECATED: This route has been moved to secure FastAPI backend// 🚨 DEPRECATED: This route has been moved to secure FastAPI backend// 🚨 DEPRECATED: This route has been moved to secure FastAPI backend

// Frontend API routes are INSECURE and should not handle business logic

// // Frontend API routes are INSECURE and should not handle business logic// Frontend API routes are INSECURE and should not handle business logic

// This endpoint is now handled by:

// - Backend: /api/v1/ws/validation (FastAPI WebSocket)// // 

// - Authentication: Required via JWT tokens  

// - Security: Input validation, rate limiting, proper logging// This endpoint is now handled by:// This endpoint is now handled by:



import { NextResponse } from 'next/server'// - Backend: /api/v1/ws/validation (FastAPI WebSocket)// - Backend: /api/v1/ws/validation (FastAPI WebSocket)



export async function GET() {// - Authentication: Required via JWT tokens  // - Authentication: Required via JWT tokens  

  console.log('⚠️ DEPRECATED: Frontend WebSocket route called - redirecting to secure backend')

  // - Security: Input validation, rate limiting, proper logging// - Security: Input validation, rate limiting, proper logging

  return NextResponse.json({

    error: 'This endpoint has been moved to secure backend',

    message: 'Please use the FastAPI backend WebSocket /api/v1/ws/validation',

    migration_info: {import { NextResponse } from 'next/server'import { NextResponse } from 'next/server'

      old_endpoint: '/api/ai-websocket',

      new_endpoint: '/api/v1/ws/validation',

      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

      security: 'JWT authentication required',export async function GET() {export async function GET() {

      status: 'DEPRECATED - INSECURE ROUTE'

    }  console.log('⚠️ DEPRECATED: Frontend WebSocket route called - redirecting to secure backend')  console.log('⚠️ DEPRECATED: Frontend WebSocket route called - redirecting to secure backend')

  }, { status: 410 }) // 410 Gone - resource no longer available

}    



export async function POST() {  return NextResponse.json({  return NextResponse.json({

  console.log('⚠️ DEPRECATED: Frontend WebSocket POST route called - redirecting to secure backend')

      error: 'This endpoint has been moved to secure backend',    error: 'This endpoint has been moved to secure backend',

  return NextResponse.json({

    error: 'This endpoint has been moved to secure backend',    message: 'Please use the FastAPI backend WebSocket /api/v1/ws/validation',    message: 'Please use the FastAPI backend WebSocket /api/v1/ws/validation',

    message: 'Please use the FastAPI backend endpoint /api/validate-input or WebSocket /api/v1/ws/validation',

    migration_info: {    migration_info: {    migration_info: {

      old_endpoint: '/api/ai-websocket',

      new_endpoint: '/api/v1/ws/validation',      old_endpoint: '/api/ai-websocket',      old_endpoint: '/api/ai-websocket',

      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

      security: 'JWT authentication required',       new_endpoint: '/api/v1/ws/validation',      new_endpoint: '/api/v1/ws/validation',

      status: 'DEPRECATED - INSECURE ROUTE'

    }      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

  }, { status: 410 }) // 410 Gone - resource no longer available

}      security: 'JWT authentication required',      security: 'JWT authentication required',

      status: 'DEPRECATED - INSECURE ROUTE'      status: 'DEPRECATED - INSECURE ROUTE'

    }    }

  }, { status: 410 }) // 410 Gone - resource no longer available  }, { status: 410 }) // 410 Gone - resource no longer available

}}



export async function POST() {export async function POST() {

  console.log('⚠️ DEPRECATED: Frontend WebSocket POST route called - redirecting to secure backend')  console.log('⚠️ DEPRECATED: Frontend WebSocket POST route called - redirecting to secure backend')

    

  return NextResponse.json({  return NextResponse.json({

    error: 'This endpoint has been moved to secure backend',    error: 'This endpoint has been moved to secure backend',

    message: 'Please use the FastAPI backend endpoint /api/validate-input or WebSocket /api/v1/ws/validation',    message: 'Please use the FastAPI backend endpoint /api/validate-input or WebSocket /api/v1/ws/validation',

    migration_info: {    migration_info: {

      old_endpoint: '/api/ai-websocket',      old_endpoint: '/api/ai-websocket',

      new_endpoint: '/api/v1/ws/validation',      new_endpoint: '/api/v1/ws/validation',

      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

      security: 'JWT authentication required',       security: 'JWT authentication required', 

      status: 'DEPRECATED - INSECURE ROUTE'      status: 'DEPRECATED - INSECURE ROUTE'

    }    }

  }, { status: 410 }) // 410 Gone - resource no longer available  }, { status: 410 }) // 410 Gone - resource no longer available

}      }
    }
    
    if (type === 'validate_input') {
      // Process validation request
      const validationResult = await performAIValidation(message)
      response.data = validationResult
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    console.error('❌ AI WebSocket error:', error)
    return new Response(JSON.stringify({
      type: 'error',
      data: { error: 'AI processing failed' }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

async function performAIValidation(text: string) {
  // AI validation logic
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      isValid: false,
      suggestions: ['Please enter some text'],
      corrections: [],
      confidence: 0
    }
  }
  
  // Basic spell checking
  const misspellings: { [key: string]: string } = {
    'teh': 'the',
    'recieve': 'receive',
    'seperate': 'separate',
    'buisness': 'business',
    'managment': 'management',
    'finacial': 'financial'
  }
  
  const corrections: string[] = []
  const words = text.toLowerCase().split(/\s+/)
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '')
    if (misspellings[cleanWord]) {
      corrections.push(`"${cleanWord}" → "${misspellings[cleanWord]}"`)
    }
  }
  
  return {
    success: true,
    isValid: corrections.length === 0,
    suggestions: corrections.length > 0 ? ['Check spelling'] : [],
    corrections,
    confidence: corrections.length > 0 ? 0.7 : 0.95
  }
}
