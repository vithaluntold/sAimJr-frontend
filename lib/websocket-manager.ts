// WebSocket manager for real-time updates
import { apiClient } from "./api-client"

export type WebSocketMessage = {
  type: "processing_update" | "exception_found" | "step_complete" | "error"
  data: any
  timestamp: string
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private runId: string,
    private onMessage: (message: WebSocketMessage) => void,
    private onError: (error: Event) => void = () => {},
    private onClose: (event: CloseEvent) => void = () => {},
  ) {}

  connect() {
    try {
      this.ws = apiClient.createWebSocket(this.runId)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.onMessage(message)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        this.onError(error)
      }

      this.ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason)
        this.onClose(event)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
            this.connect()
          }, this.reconnectDelay * this.reconnectAttempts)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket:", error)
      this.onError(error as Event)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Client disconnect")
      this.ws = null
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }
}
