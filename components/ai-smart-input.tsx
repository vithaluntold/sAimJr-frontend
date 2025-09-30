"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2, Edit3, ArrowRight, Info } from 'lucide-react'

interface ValidationResult {
  is_valid: boolean
  corrected_value: string
  confidence: number
  corrections_made: Array<{
    type: string
    original: string
    corrected: string
  }>
  requires_clarification: boolean
  clarification_options: string[]
  suggestions: string[]
}

interface AISmartInputProps {
  fieldName: string
  label: string
  value: string
  onChange: (value: string) => void
  context?: Record<string, any>
  placeholder?: string
  disabled?: boolean
  className?: string
  validateOnBlur?: boolean
  validateOnChange?: boolean
  showValidationDetails?: boolean
}

const AISmartInput: React.FC<AISmartInputProps> = ({
  fieldName,
  label,
  value,
  onChange,
  context = {},
  placeholder,
  disabled = false,
  className = "",
  validateOnBlur = true,
  validateOnChange = false,
  showValidationDetails = true
}) => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showClarification, setShowClarification] = useState(false)
  const [hasBeenValidated, setHasBeenValidated] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)
  const validateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const validateInput = async (inputValue: string) => {
    if (!inputValue.trim() || isValidating) return

    setIsValidating(true)
    setHasBeenValidated(false)

    try {
      const response = await fetch('/api/validate-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field_name: fieldName,
          user_input: inputValue,
          context: context
        }),
      })

      if (!response.ok) {
        throw new Error('Validation failed')
      }

      const data = await response.json()
      const result = data.validation_result as ValidationResult

      setValidationResult(result)
      setHasBeenValidated(true)

      // Auto-apply corrections if high confidence and no clarification needed
      if (result.confidence > 0.8 && !result.requires_clarification && result.corrected_value !== inputValue) {
        setDisplayValue(result.corrected_value)
        onChange(result.corrected_value)
      }

      // Show clarification dialog if needed
      if (result.requires_clarification) {
        setShowClarification(true)
      }

    } catch (error) {
      console.error('Validation error:', error)
      setValidationResult({
        is_valid: true,
        corrected_value: inputValue,
        confidence: 0.5,
        corrections_made: [],
        requires_clarification: false,
        clarification_options: [],
        suggestions: []
      })
      setHasBeenValidated(true)
    } finally {
      setIsValidating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setDisplayValue(newValue)
    setValidationResult(null)
    setHasBeenValidated(false)
    setShowClarification(false)

    if (validateOnChange) {
      // Debounce validation on change
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current)
      }
      validateTimeoutRef.current = setTimeout(() => {
        validateInput(newValue)
      }, 1000)
    }

    onChange(newValue)
  }

  const handleInputBlur = () => {
    if (validateOnBlur && displayValue.trim()) {
      validateInput(displayValue)
    }
  }

  const acceptCorrection = (correctedValue: string) => {
    setDisplayValue(correctedValue)
    onChange(correctedValue)
    setShowClarification(false)
  }

  const selectClarificationOption = (option: string) => {
    setDisplayValue(option)
    onChange(option)
    setShowClarification(false)
    setValidationResult(null)
  }

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (!hasBeenValidated) {
      return null
    }
    if (validationResult?.is_valid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  const getValidationBadge = () => {
    if (!hasBeenValidated || !validationResult) return null

    const confidence = validationResult.confidence
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default"
    let badgeText = "Validated"

    if (confidence >= 0.9) {
      badgeVariant = "default"
      badgeText = "High Confidence"
    } else if (confidence >= 0.7) {
      badgeVariant = "secondary"
      badgeText = "Good"
    } else if (confidence >= 0.5) {
      badgeVariant = "outline"
      badgeText = `${Math.round(confidence * 100)}% Sure`
    } else {
      badgeVariant = "destructive"
      badgeText = "Low Confidence"
    }

    return (
      <Badge variant={badgeVariant} className="text-xs">
        {badgeText}
      </Badge>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          {getValidationIcon()}
          {getValidationBadge()}
        </div>
      </div>

      <div className="relative">
        <Input
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled || isValidating}
          className={`${className} ${isValidating ? 'pr-8' : ''}`}
        />
      </div>

      {/* Validation Results */}
      {showValidationDetails && hasBeenValidated && validationResult && (
        <div className="space-y-2">
          {/* Corrections Made */}
          {validationResult.corrections_made.length > 0 && (
            <Alert>
              <Edit3 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Corrections applied:</div>
                  {validationResult.corrections_made.map((correction, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">{correction.type}</Badge>
                      <span className="line-through text-muted-foreground">{correction.original}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium">{correction.corrected}</span>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Suggestions:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {validationResult.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Clarification Dialog */}
      {showClarification && validationResult?.requires_clarification && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Clarification Needed</span>
              </div>
              
              <p className="text-sm text-yellow-700">
                We found multiple possible meanings for "{displayValue}". Please select the correct one:
              </p>
              
              <div className="flex flex-wrap gap-2">
                {validationResult.clarification_options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => selectClarificationOption(option)}
                    className="text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClarification(false)}
                  className="text-xs"
                >
                  Keep Original
                </Button>
                {validationResult.corrected_value !== displayValue && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => acceptCorrection(validationResult.corrected_value)}
                    className="text-xs"
                  >
                    Use: {validationResult.corrected_value}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AISmartInput