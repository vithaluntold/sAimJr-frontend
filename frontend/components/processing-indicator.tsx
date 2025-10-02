"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProcessingIndicatorProps {
  startTime: number
  estimatedDuration: number // in seconds
}

export function ProcessingIndicator({ startTime, estimatedDuration }: ProcessingIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const calculateElapsed = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedTime(Math.min(elapsed, estimatedDuration)) // Cap at estimated duration
    }

    calculateElapsed() // Initial calculation

    const timer = setInterval(() => {
      calculateElapsed()
      if (Date.now() - startTime >= estimatedDuration * 1000) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, estimatedDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(1, "0") // No need to pad if mins < 10 for typical short durations
    const secs = (seconds % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
  }

  return (
    <div className="flex items-center space-x-1.5 text-xs text-muted-foreground mt-2 opacity-90">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>
        Processing... ({formatTime(elapsedTime)} / {formatTime(estimatedDuration)})
      </span>
    </div>
  )
}
