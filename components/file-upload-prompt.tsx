"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { UploadCloud, FileText, Download, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "../lib/utils"
import type { FileUploadPromptContent } from "../lib/types"

// S(ai)m Jr Lite - Demo version transaction limit
const LITE_TRANSACTION_LIMIT = 50

interface FileUploadPromptProps {
  promptContent: FileUploadPromptContent
  onFileUpload: (fileType: string, file: File) => void
  onSkip?: (fileType: string) => void
}

export function FileUploadPrompt({ promptContent, onFileUpload, onSkip }: FileUploadPromptProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [transactionCount, setTransactionCount] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Count transactions in bank statement files
  const countTransactions = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Count CSV rows (excluding header)
          const lines = content.split('\n').filter(line => line.trim())
          resolve(Math.max(0, lines.length - 1))
        } else {
          // For other formats, estimate (Excel parsing would be complex)
          const lines = content.split('\n').filter(line => line.trim())
          resolve(Math.max(0, lines.length - 1))
        }
      }
      reader.readAsText(file)
    })
  }

  const validateAndSetFile = async (file: File) => {
    setValidationError(null)
    setTransactionCount(null)
    
    // Only validate bank statement files
    if (promptContent.fileType === 'bank_statement') {
      try {
        const count = await countTransactions(file)
        setTransactionCount(count)
        
        if (count > LITE_TRANSACTION_LIMIT) {
          setValidationError(`This bank statement contains ${count} transactions. S(ai)m Jr Lite supports up to ${LITE_TRANSACTION_LIMIT} transactions for demonstration purposes.`)
          return
        }
      } catch (error) {
        console.warn('Could not validate transaction count:', error)
        // Allow upload anyway if validation fails
      }
    }
    
    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileUpload(promptContent.fileType, selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setTransactionCount(null)
    setValidationError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
  }

  return (
    <Card className="shadow-none border-none bg-transparent">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-base font-semibold">
          {promptContent.title}
          {promptContent.optional && <span className="text-xs font-normal text-muted-foreground ml-1">(Optional)</span>}
        </CardTitle>
        <CardDescription className="text-sm">{promptContent.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        {promptContent.sampleDownloadLink && (
          <Button variant="link" size="sm" asChild className="p-0 h-auto text-primary hover:text-primary/80">
            <a href={promptContent.sampleDownloadLink} download>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download Sample {promptContent.fileType.toUpperCase()}
            </a>
          </Button>
        )}

        {!selectedFile ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-md p-6 text-center transition-colors",
              dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">Drag & drop your file here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={promptContent.accept}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="border rounded-md p-3 flex items-center justify-between bg-muted/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[150px]">{selectedFile.name}</span>
                  {transactionCount !== null && (
                    <span className="text-xs text-muted-foreground">
                      {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} detected
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-7 w-7">
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <Button 
            onClick={handleUploadClick} 
            disabled={!selectedFile || !!validationError} 
            size="sm" 
            className="flex-1"
          >
            Upload File
          </Button>
          {promptContent.optional && onSkip && (
            <Button variant="outline" onClick={() => onSkip(promptContent.fileType)} size="sm" className="flex-1">
              Skip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
