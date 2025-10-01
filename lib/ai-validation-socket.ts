"use client"

export class AIValidationSocket {
  private ws: WebSocket | null = null
  private messageQueue: any[] = []
  private pendingRequests = new Map<string, (result: any) => void>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private onMessage: (message: any) => void,
    private onError: (error: any) => void
  ) {}

  connect() {
    try {
      console.log('🔌 Connecting to AI Validation WebSocket...')
      
      // Try WebSocket connection first, fallback to HTTP
      const wsUrl = `ws://${window.location.host}/api/ai-websocket`
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
        this.onError(error)
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

  async validateRealtime(field_name: string, user_input: string, context: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const id = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Use WebSocket for real-time validation
        console.log('🚀 Using WebSocket for validation:', user_input)
        
        this.pendingRequests.set(id, resolve)
        
        this.send({
          type: 'validate',
          id,
          data: { field_name, user_input, context }
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

  private async fallbackHttpValidation(field_name: string, user_input: string, context: any) {
    // Use the faster realtime endpoint instead of the slow regular validation
    const response = await fetch('/api/ai-websocket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field_name, user_input, context })
    })
    
    const data = await response.json()
    return data.validation_result
  }

  send(message: any) {
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