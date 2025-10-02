import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json()
    
    console.log('🤖 AI validation request:', { text: text?.substring(0, 50) + '...', context })
    
    // Simulate AI validation with spell checking and suggestions
    const response = await validateWithAI(text, context)
    
    return NextResponse.json({
      success: true,
      isValid: response.isValid,
      suggestions: response.suggestions,
      corrections: response.corrections,
      confidence: response.confidence
    })
    
  } catch (error) {
    console.error('❌ AI validation error:', error)
    return NextResponse.json({
      success: false,
      error: 'AI validation failed',
      isValid: true, // Fallback to accepting input
      suggestions: [],
      corrections: [],
      confidence: 0
    }, { status: 500 })
  }
}

async function validateWithAI(text: string, context?: string): Promise<{
  isValid: boolean
  suggestions: string[]
  corrections: string[]
  confidence: number
}> {
  // Real AI validation logic would go here
  // For now, simulate with basic spell checking and business context validation
  
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate AI processing
  
  const suggestions: string[] = []
  const corrections: string[] = []
  let isValid = true
  let confidence = 0.9
  
  if (!text || text.trim().length === 0) {
    return { isValid: false, suggestions: ['Please enter some text'], corrections: [], confidence: 0 }
  }
  
  // Basic spell checking simulation
  const commonMisspellings: { [key: string]: string } = {
    'teh': 'the',
    'recieve': 'receive',
    'seperate': 'separate',
    'occurence': 'occurrence',
    'definately': 'definitely',
    'accomodation': 'accommodation',
    'buisness': 'business',
    'managment': 'management',
    'finacial': 'financial',
    'recoreded': 'recorded'
  }
  
  // Check for misspellings
  const words = text.toLowerCase().split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '')
    if (commonMisspellings[cleanWord]) {
      corrections.push(`Did you mean "${commonMisspellings[cleanWord]}" instead of "${cleanWord}"?`)
      isValid = false
      confidence = 0.6
    }
  }
  
  // Business context suggestions
  if (context === 'company_name') {
    if (text.length < 2) {
      suggestions.push('Company name should be at least 2 characters long')
      isValid = false
    }
    if (!/^[a-zA-Z0-9\s&.-]+$/.test(text)) {
      suggestions.push('Company name contains invalid characters')
      isValid = false
    }
  }
  
  if (context === 'business_nature') {
    const businessTypes = ['consulting', 'retail', 'manufacturing', 'services', 'technology', 'healthcare', 'education', 'finance', 'real estate', 'construction']
    const hasBusinessKeyword = businessTypes.some(type => text.toLowerCase().includes(type))
    
    if (!hasBusinessKeyword) {
      suggestions.push('Consider being more specific about your business type (e.g., consulting, retail, manufacturing)')
    }
  }
  
  // Industry validation
  if (context === 'industry') {
    const validIndustries = ['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'education', 'consulting', 'real estate', 'construction', 'agriculture']
    const isValidIndustry = validIndustries.some(industry => text.toLowerCase().includes(industry))
    
    if (!isValidIndustry) {
      suggestions.push('Please specify a valid industry category')
      confidence = 0.7
    }
  }
  
  return {
    isValid,
    suggestions,
    corrections,
    confidence
  }
}
