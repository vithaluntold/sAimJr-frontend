import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { field_name, user_input, context } = body

    // Simple validation logic without hardcoded AI models
    // Let the environment handle AI if available, otherwise use rule-based validation
    
    let validation_result = {
      is_valid: true,
      confidence: 0.9,
      corrected_value: user_input,
      corrections_made: [],
      suggestions: [],
      requires_clarification: false,
      clarification_options: []
    }

    // Basic validation rules based on field type
    if (field_name === 'companyName') {
      // Company name validation
      if (user_input.trim().length < 2) {
        validation_result.is_valid = false
        validation_result.requires_clarification = true
        validation_result.clarification_options = ['Please provide a longer company name']
      } else if (user_input.trim().length > 100) {
        validation_result.corrected_value = user_input.trim().substring(0, 100)
        validation_result.corrections_made.push({
          original: user_input,
          corrected: validation_result.corrected_value,
          type: 'length_adjustment'
        })
      } else {
        validation_result.suggestions.push('Company name looks good!')
      }
    } else if (field_name === 'businessNature') {
      // Business nature validation
      const commonTypes = ['consulting', 'retail', 'manufacturing', 'technology', 'healthcare', 'finance', 'education', 'services']
      const lowerInput = user_input.toLowerCase()
      const hasMatch = commonTypes.some(type => lowerInput.includes(type))
      
      if (hasMatch) {
        validation_result.suggestions.push('Business type recognized')
      } else {
        validation_result.suggestions.push('Unique business type noted')
      }
    } else if (field_name === 'industrySector') {
      // Industry sector validation
      const sectors = ['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'consulting', 'education', 'government']
      const lowerInput = user_input.toLowerCase()
      const hasMatch = sectors.some(sector => lowerInput.includes(sector))
      
      if (hasMatch) {
        validation_result.suggestions.push('Industry sector recognized')
      } else {
        validation_result.suggestions.push('Industry sector noted')
      }
    }

    return NextResponse.json({ validation_result })
  } catch (error) {
    console.error('Validation API error:', error)
    
    // Return a basic validation result on error
    return NextResponse.json({
      validation_result: {
        is_valid: true,
        confidence: 0.7,
        corrected_value: '',
        corrections_made: [],
        suggestions: ['Input accepted'],
        requires_clarification: false,
        clarification_options: []
      }
    })
  }
}