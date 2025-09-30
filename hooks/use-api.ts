"use client"

// Custom hooks for API operations
import { useState, useEffect, useCallback } from "react"
import { apiClient, APIError } from "@/lib/api-client"

export function useAPI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<APIError | null>(null)

  const execute = useCallback(async (apiCall) => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      return result
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError(0, "Unknown error")
      setError(apiError)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute }
}

export function useCompanyProfile(companyId) {
  const [profile, setProfile] = useState(null)
  const { loading, error, execute } = useAPI()

  const fetchProfile = useCallback(async () => {
    if (!companyId) return

    const result = await execute(() => apiClient.getCompanyProfile(companyId))
    if (result) {
      setProfile(result)
    }
  }, [companyId, execute])

  const updateProfile = useCallback(
    async (updates) => {
      if (!companyId) return null

      const result = await execute(() => apiClient.updateCompanyProfile(companyId, updates))
      if (result) {
        setProfile(result)
      }
      return result
    },
    [companyId, execute],
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}

export function useProcessingRun(runId) {
  const [run, setRun] = useState(null)
  const [status, setStatus] = useState("idle")
  const { loading, error, execute } = useAPI()

  const pollStatus = useCallback(async () => {
    if (!runId) return

    const result = await execute(() => apiClient.getProcessingStatus(runId))
    if (result) {
      setRun(result)
      setStatus(result.status)
    }
  }, [runId, execute])

  useEffect(() => {
    if (!runId) return

    // Initial fetch
    pollStatus()

    // Poll every 2 seconds while processing
    const interval = setInterval(() => {
      if (status === "processing") {
        pollStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [runId, status, pollStatus])

  return { run, status, loading, error, refetch: pollStatus }
}
