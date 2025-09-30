// Message queue system for async processing and scalability
import { EventEmitter } from "events"

export interface QueueMessage {
  id: string
  type: string
  payload: any
  priority: number
  attempts: number
  maxAttempts: number
  createdAt: Date
  scheduledAt?: Date
  processedAt?: Date
  error?: string
}

export interface QueueProcessor {
  type: string
  handler: (message: QueueMessage) => Promise<void>
  concurrency: number
}

export class MessageQueue extends EventEmitter {
  private queues = new Map<string, QueueMessage[]>()
  private processors = new Map<string, QueueProcessor>()
  private processing = new Map<string, Set<string>>()
  private deadLetterQueue: QueueMessage[] = []

  constructor() {
    super()
    this.startProcessing()
  }

  // Add message to queue
  async enqueue(
    type: string,
    payload: any,
    options: {
      priority?: number
      delay?: number
      maxAttempts?: number
    } = {},
  ): Promise<string> {
    const message: QueueMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date(),
      scheduledAt: options.delay ? new Date(Date.now() + options.delay) : undefined,
    }

    if (!this.queues.has(type)) {
      this.queues.set(type, [])
    }

    const queue = this.queues.get(type)!
    queue.push(message)

    // Sort by priority (higher priority first)
    queue.sort((a, b) => b.priority - a.priority)

    this.emit("messageEnqueued", message)
    return message.id
  }

  // Register message processor
  registerProcessor(processor: QueueProcessor): void {
    this.processors.set(processor.type, processor)
    if (!this.processing.has(processor.type)) {
      this.processing.set(processor.type, new Set())
    }
  }

  // Start processing messages
  private startProcessing(): void {
    setInterval(() => {
      this.processQueues()
    }, 1000) // Process every second
  }

  private async processQueues(): Promise<void> {
    for (const [type, processor] of this.processors.entries()) {
      const queue = this.queues.get(type)
      const processing = this.processing.get(type)!

      if (!queue || queue.length === 0 || processing.size >= processor.concurrency) {
        continue
      }

      // Find next message to process
      const messageIndex = queue.findIndex((msg) => !msg.scheduledAt || msg.scheduledAt <= new Date())

      if (messageIndex === -1) continue

      const message = queue.splice(messageIndex, 1)[0]
      processing.add(message.id)

      // Process message
      this.processMessage(message, processor).finally(() => {
        processing.delete(message.id)
      })
    }
  }

  private async processMessage(message: QueueMessage, processor: QueueProcessor): Promise<void> {
    message.attempts++
    message.processedAt = new Date()

    try {
      await processor.handler(message)
      this.emit("messageProcessed", message)
    } catch (error) {
      message.error = error instanceof Error ? error.message : String(error)

      if (message.attempts < message.maxAttempts) {
        // Retry with exponential backoff
        const delay = Math.pow(2, message.attempts) * 1000
        message.scheduledAt = new Date(Date.now() + delay)

        const queue = this.queues.get(message.type)!
        queue.push(message)

        this.emit("messageRetry", message)
      } else {
        // Move to dead letter queue
        this.deadLetterQueue.push(message)
        this.emit("messageFailed", message)
      }
    }
  }

  // Get queue statistics
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {}

    for (const [type, queue] of this.queues.entries()) {
      const processing = this.processing.get(type)?.size || 0
      stats[type] = {
        pending: queue.length,
        processing,
        total: queue.length + processing,
      }
    }

    stats.deadLetter = this.deadLetterQueue.length
    return stats
  }

  // Clear dead letter queue
  clearDeadLetterQueue(): QueueMessage[] {
    const messages = [...this.deadLetterQueue]
    this.deadLetterQueue.length = 0
    return messages
  }
}

// Predefined message types for the application
export const MESSAGE_TYPES = {
  // File processing
  PROCESS_BANK_STATEMENT: "process_bank_statement",
  PROCESS_COA_FILE: "process_coa_file",
  PROCESS_CONTACTS_FILE: "process_contacts_file",

  // AI processing
  CATEGORIZE_TRANSACTIONS: "categorize_transactions",
  MAP_PARTIES: "map_parties",
  GENERATE_REPORT: "generate_report",
  CREATE_RULE_SUGGESTIONS: "create_rule_suggestions",

  // Notifications
  SEND_EMAIL: "send_email",
  SEND_PUSH_NOTIFICATION: "send_push_notification",
  SEND_SYSTEM_NOTIFICATION: "send_system_notification",

  // Billing
  PROCESS_PAYMENT: "process_payment",
  UPDATE_SUBSCRIPTION: "update_subscription",
  CALCULATE_USAGE: "calculate_usage",

  // Analytics
  UPDATE_ANALYTICS: "update_analytics",
  GENERATE_INSIGHTS: "generate_insights",

  // System maintenance
  CLEANUP_EXPIRED_SESSIONS: "cleanup_expired_sessions",
  BACKUP_DATA: "backup_data",
  SYNC_EXTERNAL_DATA: "sync_external_data",
}

// Message queue processors
export const createMessageProcessors = (dependencies: any) => {
  const processors: QueueProcessor[] = [
    {
      type: MESSAGE_TYPES.PROCESS_BANK_STATEMENT,
      concurrency: 5,
      handler: async (message) => {
        const { runId, fileUrl, companyId } = message.payload
        // Process bank statement file
        await dependencies.fileProcessor.processBankStatement(runId, fileUrl, companyId)
      },
    },
    {
      type: MESSAGE_TYPES.SEND_EMAIL,
      concurrency: 10,
      handler: async (message) => {
        const { to, subject, template, data } = message.payload
        await dependencies.emailService.sendEmail(to, subject, template, data)
      },
    },
    {
      type: MESSAGE_TYPES.UPDATE_ANALYTICS,
      concurrency: 3,
      handler: async (message) => {
        const { userId, companyId, eventData } = message.payload
        await dependencies.analyticsService.updateAnalytics(userId, companyId, eventData)
      },
    },
    // Add more processors as needed
  ]

  return processors
}
