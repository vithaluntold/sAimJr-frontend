// Enhanced file upload with progress tracking
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadWithProgressProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
}

export function FileUploadWithProgress({
  onUpload,
  accept = "*/*",
  maxSize = 10,
  disabled = false,
}: FileUploadWithProgressProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      setStatus("error")
      return
    }

    setFile(selectedFile)
    setStatus("idle")
    setError(null)
    setProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setStatus("uploading")
    setProgress(0)

    try {
      // Simulate progress for demo - in real implementation,
      // you'd track actual upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await onUpload(file)

      clearInterval(progressInterval)
      setProgress(100)
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setStatus("idle")
    setError(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {!file ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              disabled ? "border-muted bg-muted/50" : "border-border hover:border-primary/50 cursor-pointer",
            )}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">{disabled ? "Upload disabled" : "Choose file to upload"}</p>
            <p className="text-sm text-muted-foreground">Max size: {maxSize}MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="icon" onClick={reset} disabled={uploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {status === "uploading" && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">Uploading... {progress}%</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Upload successful!</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={uploading || status === "success"} className="flex-1">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              <Button variant="outline" onClick={reset} disabled={uploading}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
