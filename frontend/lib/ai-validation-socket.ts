"use client"

interface ValidationMessage {
  id: string
  type: string
  field_name?: string
  user_input?: string
  context?: string
  data?: {
    field_name: string
    user_input: string
    context?: string
  }
}

interface ValidationResult {
  success: boolean
  isValid: boolean
  suggestions: string[]
  corrections: string[]
  corrections_made: Array<{ original: string; corrected: string; type: string }>
  corrected_value?: string
  requires_clarification?: boolean
  clarification_options?: string[]
  confidence: number
}

export class AIValidationSocket {
  private ws: WebSocket | null = null
  private messageQueue: ValidationMessage[] = []
  private pendingRequests = new Map<string, (result: ValidationResult) => void>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private onMessage: (message: ValidationResult) => void,
    private onError: (error: Error) => void
  ) {}

  connect() {
    try {
      console.log('🔌 Connecting to AI Validation WebSocket...')
      
      // Try WebSocket connection first, fallback to HTTP
      // Use secure backend WebSocket instead of insecure frontend route
      const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
      const wsUrl = `${WS_BASE_URL}/api/v1/ws/validation`
      console.log('🔌 Connecting to WebSocket URL:', wsUrl)
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('✅ AI Validation WebSocket connected')
        this.reconnectAttempts = 0
        
        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift()
          this.send(message)
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📨 AI WebSocket message:', message)
          
          if (message.type === 'validation_result' && message.id) {
            // Resolve pending validation request
            const resolver = this.pendingRequests.get(message.id)
            if (resolver) {
              resolver(message.data)
              this.pendingRequests.delete(message.id)
            }
          }
          
          this.onMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ AI WebSocket error:', error)
        this.onError(new Error('WebSocket error'))
      }

      this.ws.onclose = (event) => {
        console.log('🔌 AI WebSocket closed:', event.code, event.reason)
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          
          setTimeout(() => {
            this.connect()
          }, this.reconnectDelay * this.reconnectAttempts)
        } else {
          console.error('❌ Max reconnection attempts reached. Falling back to HTTP validation.')
          this.fallbackToHttp()
        }
      }

    } catch (error) {
      console.error('Failed to create AI WebSocket:', error)
      this.fallbackToHttp()
    }
  }

  private fallbackToHttp() {
    console.log('🔄 Falling back to HTTP validation')
    // All pending requests will be resolved via HTTP calls
    this.ws = null
  }

  async validateRealtime(field_name: string, user_input: string, context?: string | Record<string, unknown>): Promise<ValidationResult> {
    return new Promise(async (resolve, reject) => {
      const id = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Use WebSocket for real-time validation
        console.log('🚀 Using WebSocket for validation:', user_input)
        
        this.pendingRequests.set(id, resolve)
        
        const contextStr = typeof context === 'string' ? context : JSON.stringify(context)
        this.send({
          type: 'validate',
          id,
          data: { field_name, user_input, context: contextStr }
        })
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id)
            this.fallbackHttpValidation(field_name, user_input, context).then(resolve).catch(reject)
          }
        }, 5000)
        
      } else {
        // Fallback to HTTP validation
        console.log('🔄 Using HTTP fallback for validation:', user_input)
        try {
          const result = await this.fallbackHttpValidation(field_name, user_input, context)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
    })
  }

  private async fallbackHttpValidation(field_name: string, user_input: string, context?: string | Record<string, unknown>): Promise<ValidationResult> {
    console.log('🔗 HTTP validation fallback for:', { field_name, user_input })
    
    try {
      // First try the validate-input endpoint
      // Use secure backend API instead of insecure frontend route
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/validate-input`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({ 
          input_text: user_input, 
          context: typeof context === 'object' ? JSON.stringify(context) : (context || field_name)
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ HTTP validation result:', result)
      
      // Transform the response to match expected format
      return {
        success: true,
        isValid: result.isValid,
        corrections: result.corrections || [],
        corrections_made: result.corrections_made || [],
        corrected_value: result.corrected_value,
        requires_clarification: result.requires_clarification,
        clarification_options: result.clarification_options,
        suggestions: result.suggestions || [],
        confidence: result.confidence || 0.9
      }
    } catch (error) {
      console.error('❌ HTTP validation failed:', error)
      // Return a simple success response so validation doesn't break
      return {
        success: true,
        isValid: true,
        corrections: [],
        corrections_made: [],
        suggestions: [],
        confidence: 0.5
      }
    }
  }

  send(message: ValidationMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      this.messageQueue.push(message)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.pendingRequests.clear()
    this.messageQueue = []
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}