"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Card, CardContent } from './ui/card'
import { CheckCircle, AlertCircle, Loader2, Wifi, WifiOff, Edit3, ArrowRight } from 'lucide-react'

interface ValidationResult {
  type: 'validation_result' | 'validating' | 'validation_error' | 'pong'
  field_name: string
  is_valid?: boolean
  corrected_value?: string
  confidence?: number
  corrections_made?: Array<{
    type: string
    original: string
    corrected: string
  }>
  requires_clarification?: boolean
  clarification_options?: string[]
  suggestions?: string[]
  message?: string
  error?: string
}

interface LiveValidationInputProps {
  fieldName: string
  label: string
  value: string
  onChange: (value: string) => void
  onValidationComplete?: (result: ValidationResult) => void
  context?: Record<string, any>
  placeholder?: string
  disabled?: boolean
  className?: string
  autoValidate?: boolean
}

const LiveValidationInput: React.FC<LiveValidationInputProps> = ({
  fieldName,
  label,
  value,
  onChange,
  onValidationComplete,
  context = {},
  placeholder,
  disabled = false,
  className = "",
  autoValidate = true
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  
  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    try {
      const wsUrl = `ws://localhost:8000/api/validate-live`
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('🔌 Live validation WebSocket connected')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const result: ValidationResult = JSON.parse(event.data)
          
          if (result.type === 'validating') {
            setIsValidating(true)
            setValidationResult(null)
          } else if (result.type === 'validation_result') {
            setIsValidating(false)
            setValidationResult(result)
            onValidationComplete?.(result)
          } else if (result.type === 'validation_error') {
            setIsValidating(false)
            setConnectionError(result.error || 'Validation error')
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('🔌 Live validation WebSocket disconnected')
        setIsConnected(false)
        setIsValidating(false)
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connectWebSocket()
          }, delay)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionError('Connection error')
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setConnectionError('Failed to connect')
    }
  }, [onValidationComplete])
  
  // Send validation request
  const sendValidationRequest = useCallback((inputValue: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }
    
    if (!inputValue.trim()) {
      setValidationResult(null)
      setIsValidating(false)
      return
    }
    
    const message = {
      type: 'validate_input',
      field_name: fieldName,
      user_input: inputValue,
      context: context
    }
    
    wsRef.current.send(JSON.stringify(message))
  }, [fieldName, context])
  
  // Connect on mount
  useEffect(() => {
    if (autoValidate) {
      connectWebSocket()
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocket, autoValidate])
  
  // Send validation request when value changes
  useEffect(() => {
    if (autoValidate && isConnected) {
      sendValidationRequest(value)
    }
  }, [value, isConnected, sendValidationRequest, autoValidate])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Clear previous results
    if (validationResult && validationResult.field_name === fieldName) {
      setValidationResult(null)
    }
  }
  
  const applyCorrection = (correctedValue: string) => {
    onChange(correctedValue)
  }
  
  const getValidationIcon = () => {
    if (!isConnected) {
      return <WifiOff className="h-4 w-4 text-gray-400" />
    }
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (validationResult?.is_valid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (validationResult && !validationResult.is_valid) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    if (isConnected) {
      return <Wifi className="h-4 w-4 text-green-500" />
    }
    return null
  }
  
  const getValidationBadge = () => {
    if (!validationResult || !isConnected) return null
    
    const confidence = validationResult.confidence || 0
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
      badgeText = `${Math.round(confidence * 100)}%`
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
          {isValidating && (
            <span className="text-xs text-blue-600">Validating...</span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} ${isValidating ? 'border-blue-300' : ''} ${
            validationResult?.corrections_made?.length ? 'border-green-300 bg-green-50' : ''
          }`}
        />
      </div>
      
      {/* Connection Status */}
      {connectionError && (
        <Alert className="border-red-200 bg-red-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            Connection error: {connectionError}. Validation unavailable.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Live Validation Results */}
      {validationResult && isConnected && (
        <div className="space-y-2">
          {/* Corrections Made */}
          {validationResult.corrections_made && validationResult.corrections_made.length > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <Edit3 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium text-green-800">AI Corrections:</div>
                  {validationResult.corrections_made.map((correction, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">{correction.type}</Badge>
                      <span className="line-through text-muted-foreground">{correction.original}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium text-green-700">{correction.corrected}</span>
                    </div>
                  ))}
                  {validationResult.corrected_value !== value && (
                    <button
                      onClick={() => applyCorrection(validationResult.corrected_value!)}
                      className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                    >
                      Apply: "{validationResult.corrected_value}"
                    </button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Clarification Needed */}
          {validationResult.requires_clarification && validationResult.clarification_options && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Clarification Needed</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Did you mean one of these options?
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {validationResult.clarification_options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => applyCorrection(option)}
                        className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Suggestions */}
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium text-blue-800">💡 Suggestions:</div>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
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
    </div>
  )
}

export default LiveValidationInput
