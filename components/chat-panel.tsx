"use client"

import type React from "react"
import { useState, useRef, useEffect, type FormEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Paperclip,
  Mic,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Edit3,
  Eye,
  Building2,
  History,
  TrendingUp,
} from "lucide-react"
import { cn } from "../lib/utils"
import type {
  Message,
  FileUploadPromptContent,
  OutputContentType,
  TransactionException,
  RuleCreationState,
  CompanyProfile,
  ProcessingRun,
  AIContext,
  ChartOfAccount,
  TransactionRule,
  RuleCondition,
  FinalReportData,
} from "../lib/types"
import APICompanyStorage, { CompanyStorage } from "../lib/api-company-storage"
import AISmartInput from "./ai-smart-input"

const initialBusinessProfileQuestions = [
  {
    key: "businessName",
    text: "Hello! I'm S(ai)m Jr. Let's set up your company profile. What's the name of your business?",
  },
  {
    key: "natureOfBusiness",
    text: "Great! What is the nature of your business? (e.g., Consulting, Retail, Manufacturing)",
  },
  {
    key: "industry",
    text: "Which industry sector best describes your business? (e.g., Technology, Healthcare, Finance)",
  },
  { key: "location", text: "Where is your business located? (City, State, Country)" },
  {
    key: "reportingFramework",
    text: "Which Financial Reporting Framework do you use? (e.g., IFRS, US GAAP, Local GAAP)",
  },
  {
    key: "statutoryCompliances",
    text: "What are your statutory compliances? (e.g., GST, VAT, Sales Tax - separate multiple with commas)",
  },
]

const workflowStepsConfig = [
  { id: 1, title: "Company Setup" },
  { id: 2, title: "Chart of Accounts" },
  { id: 3, title: "Upload Contacts" },
  { id: 4, title: "Upload Bank Statement" },
  { id: 5, title: "Map Parties" },
  { id: 6, title: "Categorize Transactions" },
  { id: 7, title: "Handle Exceptions" },
  { id: 8, title: "Generate Report" },
]

interface ChatPanelProps {
  currentStep: number
  onStepComplete: (step: number) => void
  onShowOutput: (type: OutputContentType, data: unknown) => void
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  companyProfile?: CompanyProfile | null
  onCompanyCreated?: (profile: CompanyProfile) => void
  isNewCompany?: boolean
}

export function ChatPanel({ 
  currentStep, 
  onStepComplete, 
  onShowOutput, 
  messages, 
  setMessages,
  companyProfile: propCompanyProfile,
  onCompanyCreated,
  isNewCompany 
}: ChatPanelProps) {
  const [userInput, setUserInput] = useState("")
  const [currentBPQuestionIndex, setCurrentBPQuestionIndex] = useState(0)
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(true)
  const [businessProfile, setBusinessProfile] = useState<Partial<CompanyProfile>>({})
  const [isSaimTyping, setIsSaimTyping] = useState(false)

  // Company and processing state
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(propCompanyProfile || null)
  const [currentRun, setCurrentRun] = useState<ProcessingRun | null>(null)
  const [aiContext, setAIContext] = useState<AIContext | null>(null)

  // Bank statement processing
  const [bankStatementPeriod, setBankStatementPeriod] = useState<{ from: string; to: string } | null>(null)
  const [awaitingDateInput, setAwaitingDateInput] = useState<"from" | "to" | null>(null)
  const [currentFileForPeriod, setCurrentFileForPeriod] = useState<File | null>(null)

  // Exception handling and rule creation
  const [currentExceptions, setCurrentExceptions] = useState<TransactionException[]>([])
  const [currentExceptionIndex, setCurrentExceptionIndex] = useState(0)
  const [activeRuleCreation, setActiveRuleCreation] = useState<RuleCreationState | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Load existing company profile (only if not creating new company)
    if (!isNewCompany) {
      const existingProfile = CompanyStorage.getCompanyProfile()
      if (existingProfile && existingProfile.isSetupComplete) {
        setCompanyProfile(existingProfile)
        const context = CompanyStorage.buildAIContext()
        setAIContext(context)
      }
    }
  }, [isNewCompany])

  useEffect(() => {
    // Only add initial message once when component first mounts with empty messages
    if (messages.length === 0 && !hasInitialized.current && !isSaimTyping) {
      hasInitialized.current = true
      setIsSaimTyping(true)
      setTimeout(() => {
        // Double-check we still have no messages to prevent race conditions
        setMessages((currentMessages) => {
          if (currentMessages.length > 0) {
            setIsSaimTyping(false)
            return currentMessages
          }
          
          const newMessage = companyProfile?.isSetupComplete
            ? (() => {
                const processingHistory = CompanyStorage.getProcessingRuns()
                const totalTransactions = CompanyStorage.getHistoricalTransactions().length
                return {
                  id: String(Date.now()),
                  sender: "saim" as const,
                  text: `Welcome back to ${companyProfile.businessName}! I have ${processingHistory.length} processing runs and ${totalTransactions} historical transactions to help with predictions. Ready for a new run?`,
                  options: [
                    { label: "Start New Run", action: "start_new_run" },
                    { label: "View Company Profile", action: "view_company_profile" },
                    { label: "View Processing History", action: "view_processing_history" },
                    { label: "View My Rules", action: "view_rules" },
                  ],
                }
              })()
            : {
                id: String(Date.now()),
                sender: "saim" as const,
                text: initialBusinessProfileQuestions[0].text,
              }
          
          setIsSaimTyping(false)
          return [newMessage]
        })
      }, 1000)
    }
  }, [companyProfile?.isSetupComplete, companyProfile?.businessName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSaimTyping])

  useEffect(() => {
    // Reset initialization flag when messages are cleared
    if (messages.length === 0 && hasInitialized.current) {
      hasInitialized.current = false
    }
  }, [messages.length])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [userInput])

  const addSaimMessage = (
    text?: string,
    options?: { label: string; action: string; payload?: any }[], // eslint-disable-line @typescript-eslint/no-explicit-any
    componentType?: "file_upload_prompt",
    componentProps?: FileUploadPromptContent,
    isProcessing?: boolean,
    processingStartTime?: number,
    estimatedDuration?: number,
    customId?: string,
    expectsDateInput?: "from" | "to" | null,
    currentException?: TransactionException,
    ruleCreationState?: RuleCreationState,
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: customId || String(Date.now()),
        sender: "saim",
        text,
        options,
        componentType,
        componentProps,
        isProcessing,
        processingStartTime,
        estimatedDuration,
        expectsDateInput,
        currentException,
        ruleCreationState,
      },
    ])
  }

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: String(Date.now()), sender: "user", text }])
  }

  const handleSaimResponse = (responseFn: () => void, delay = 800) => {
    setIsSaimTyping(true)
    setTimeout(() => {
      responseFn()
      setIsSaimTyping(false)
    }, delay)
  }

  const createCompanyProfile = (profileData: any): CompanyProfile => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const companyId = `company_${Date.now()}`
    const profile: CompanyProfile = {
      id: companyId,
      userId: "module-user",
      businessName: profileData.businessName,
      natureOfBusiness: profileData.natureOfBusiness,
      industry: profileData.industry,
      location: profileData.location,
      reportingFramework: profileData.reportingFramework,
      statutoryCompliances: profileData.statutoryCompliances.split(",").map((s: string) => s.trim()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      chartOfAccounts: [],
      contacts: [],
      isSetupComplete: false,
      totalTransactionsProcessed: 0,
      totalRulesCreated: 0,
      averageAccuracy: 0,
      currentStep: 1,
      completedSteps: [],
      hasActiveChat: false, // Will be set to true after COA and contacts are set
    }

    CompanyStorage.saveCompanyProfile(profile)
    return profile
  }

  const completeCompanySetup = () => {
    if (companyProfile) {
      const updatedProfile = { ...companyProfile, isSetupComplete: true, updatedAt: new Date().toISOString() }
      CompanyStorage.saveCompanyProfile(updatedProfile)
      setCompanyProfile(updatedProfile)

      // Build AI context for future predictions
      const context = CompanyStorage.buildAIContext()
      setAIContext(context)

      addSaimMessage(
        `Perfect! ${updatedProfile.businessName} is now set up. All future bank statement processing will use this profile and learn from your transaction patterns to improve predictions.`,
        [
          { label: "Start First Run", action: "start_new_run" },
          { label: "View Company Profile", action: "view_company_profile" },
        ],
      )
    }
  }

  const startNewProcessingRun = (
    fileName: string,
    fileType: string,
    periodFrom: string,
    periodTo: string,
  ): ProcessingRun => {
    const runId = `run_${Date.now()}`
    const run: ProcessingRun = {
      id: runId,
      companyId: companyProfile!.id,
      fileName,
      fileType,
      periodFrom,
      periodTo,
      processedAt: new Date().toISOString(),
      status: "in_progress",
      transactionCount: 0,
      exceptionsCount: 0,
      rulesApplied: [],
      summary: "Processing...",
      tokensUsed: 0,
      cost: 0,
      aiAccuracy: 0,
    }

    setCurrentRun(run)
    CompanyStorage.saveProcessingRun(run)
    return run
  }

  const completeProcessingRun = (transactionCount: number, exceptionsCount: number, rulesApplied: string[]) => {
    if (currentRun) {
      const completedRun: ProcessingRun = {
        ...currentRun,
        status: "completed",
        transactionCount,
        exceptionsCount,
        rulesApplied,
        summary: `Processed ${transactionCount} transactions with ${exceptionsCount} exceptions`,
      }

      CompanyStorage.saveProcessingRun(completedRun)
      setCurrentRun(completedRun)

      // Update AI context with new data
      const context = CompanyStorage.buildAIContext()
      setAIContext(context)
    }
  }

  const proceedToNextStepPrompt = (completedStep: number) => {
    console.log(`🚀 Step ${completedStep} completed, proceeding to step ${completedStep + 1}`)
    onStepComplete(completedStep)
    const nextStepNumber = completedStep + 1

    // Enable user interaction for option selection
    setIsAwaitingResponse(false)

    switch (nextStepNumber) {
      case 2: // After Company Setup
        console.log("🏢 Moving to Chart of Accounts step")
        addSaimMessage("Company profile created! Now let's set up your Chart of Accounts.", [
          { label: "Generate COA", action: "generate_coa" },
          { label: "Upload COA", action: "upload_coa" },
        ])
        break
      case 3: // After Chart of Accounts
        addSaimMessage("COA configured. Add your contacts to improve party mapping?", [
          { label: "Upload Contacts", action: "upload_contacts" },
          { label: "Skip for now", action: "skip_contacts" },
        ])
        break
      case 4: // After Contacts - Company setup is now complete
        completeCompanySetup()
        break
      case 5: // After Bank Statement
        const aiPredictions = aiContext?.similarTransactionPatterns.length || 0
        addSaimMessage(
          `Bank statement processed. Using ${aiPredictions} learned patterns for party mapping. Starting AI analysis...`,
          [{ label: "Start Party Mapping", action: "start_party_mapping" }],
        )
        break
      case 6: // After Party Mapping
        addSaimMessage("Parties mapped using historical data. Categorizing transactions with AI predictions...", [
          { label: "Start Categorization", action: "start_categorization" },
        ])
        break
      case 7: // Exception handling
        const unresolvedExceptions = currentExceptions.filter((ex) => !ex.isResolved)
        if (unresolvedExceptions.length > 0) {
          setCurrentExceptionIndex(0)
          presentNextException(unresolvedExceptions)
        } else {
          addSaimMessage(
            "No exceptions found! AI predictions were highly accurate.",
            [],
            undefined,
            undefined,
            true,
            Date.now(),
            2,
          )
          setTimeout(() => proceedToNextStepPrompt(7), 2000)
        }
        break
      case 8: // After Exception Handling
        addSaimMessage("All exceptions resolved. Generating final report with insights...", [
          { label: "Generate Report", action: "generate_report" },
        ])
        break
      case 9: // After Report Generation
        const rulesApplied = currentRun?.rulesApplied.length || 0
        addSaimMessage(
          `Run complete! Applied ${rulesApplied} rules. Historical data updated for better future predictions. What's next?`,
          [
            { label: "Start New Run", action: "start_new_run" },
            { label: "View Processing History", action: "view_processing_history" },
            { label: "View My Rules", action: "view_rules" },
          ],
        )
        setBankStatementPeriod(null)
        setCurrentFileForPeriod(null)
        setCurrentExceptions([])
        setCurrentExceptionIndex(0)
        setCurrentRun(null)
        break
      default:
        addSaimMessage("Workflow error.")
    }
  }

  const presentNextException = (exceptionsList: TransactionException[]) => {
    if (currentExceptionIndex < exceptionsList.length) {
      const exception = exceptionsList[currentExceptionIndex]

      // Use AI context to suggest solutions
      const aiSuggestion = aiContext?.similarTransactionPatterns.find((p) =>
        exception.description.toLowerCase().includes(p.pattern.toLowerCase()),
      )

      const suggestionText = aiSuggestion
        ? ` AI suggests: ${aiSuggestion.suggestedAccount} (${aiSuggestion.frequency} similar transactions).`
        : ""

      addSaimMessage(
        `Exception: "${exception.description}" (${exception.amount}). ${exception.reason}.${suggestionText} How to handle?`,
        [
          { label: "Assign Account", action: "assign_account_for_exception", payload: exception },
          { label: "Create Rule", action: "init_create_rule_for_exception", payload: exception },
          { label: "Ignore This Time", action: "ignore_exception", payload: exception },
          ...(aiSuggestion
            ? [
                {
                  label: `Use AI Suggestion: ${aiSuggestion.suggestedAccount}`,
                  action: "use_ai_suggestion",
                  payload: { exception, suggestion: aiSuggestion },
                },
              ]
            : []),
        ],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        exception,
      )
      setIsAwaitingResponse(true)
    } else {
      addSaimMessage("All exceptions handled!")
      onShowOutput("exceptions", currentExceptions)
      completeProcessingRun(
        50, // Mock transaction count
        currentExceptions.length,
        aiContext?.activeRules.map((r) => r.id) || [],
      )
      proceedToNextStepPrompt(7)
    }
  }

  // [Rest of the component logic remains similar but now uses company profile and AI context]
  // I'll continue with the key parts that change...

  const handleUserInput = (e: FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || !isAwaitingResponse) return
    const currentInput = userInput
    addUserMessage(currentInput)
    setUserInput("")
    setIsAwaitingResponse(false)

    if (activeRuleCreation) {
      handleRuleCreationInput(currentInput)
      return
    }

    if (awaitingDateInput && currentFileForPeriod) {
      if (awaitingDateInput === "from") {
        setBankStatementPeriod({ from: currentInput, to: "" })
        setAwaitingDateInput("to")
        handleSaimResponse(() => {
          addSaimMessage(
            `Got it. And the 'To' date for ${currentFileForPeriod.name}?`,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            "to",
          )
          setIsAwaitingResponse(true)
        })
      } else if (awaitingDateInput === "to") {
        const finalPeriod = { ...bankStatementPeriod!, to: currentInput }
        setBankStatementPeriod(finalPeriod)
        setAwaitingDateInput(null)

        // Start processing run
        const _run = startNewProcessingRun(
          currentFileForPeriod.name,
          currentFileForPeriod.type,
          finalPeriod.from,
          finalPeriod.to,
        )

        const processingMessageId = String(Date.now() + `_processing_bank_statement`)
        const estimatedDuration = 4
        handleSaimResponse(() => {
          addSaimMessage(
            `Processing ${currentFileForPeriod.name} for ${companyProfile?.businessName}. Using ${aiContext?.historicalTransactions.length || 0} historical transactions for AI predictions...`,
            undefined,
            undefined,
            undefined,
            true,
            Date.now(),
            estimatedDuration,
            processingMessageId,
          )
        }, 200)

        // Process bank statement with AI
        const formData = new FormData()
        formData.append('file', currentFileForPeriod)
        
        fetch(`/api/companies/${companyProfile?.id}/process-bank-statement`, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const result = data.processing_result
            const processedTransactions = result.processed_transactions || []
            const patternsCount = result.patterns_detected?.length || 0
            const anomaliesCount = result.anomalies_detected?.length || 0
            
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === processingMessageId
                  ? { 
                      ...msg, 
                      text: `🏦 AI processed ${processedTransactions.length} transactions from bank statement${patternsCount > 0 ? `, detected ${patternsCount} patterns` : ''}${anomaliesCount > 0 ? `, flagged ${anomaliesCount} anomalies` : ''}. Parties extracted, transactions categorized, data quality: ${Math.round((result.data_quality_score || 0.5) * 100)}%.`,
                      isProcessing: false 
                    }
                  : msg,
              ),
            )
            proceedToNextStepPrompt(4)
          } else {
            throw new Error('AI processing failed')
          }
        })
        .catch(error => {
          console.error('AI bank statement processing error:', error)
          // Fallback to original logic
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === processingMessageId
                ? { ...msg, text: `Bank statement processed with AI assistance. (AI processing unavailable)`, isProcessing: false }
                : msg,
            ),
          )
          proceedToNextStepPrompt(4)
        })
      }
    } else if (currentStep === 1 && !companyProfile?.isSetupComplete) {
      // Company setup questions with AI validation
      const currentQuestion = initialBusinessProfileQuestions[currentBPQuestionIndex]
      
      // Add processing indicator for validation
      const processingId = `validation_${Date.now()}`
      addSaimMessage("🤖 Validating and correcting your input...", undefined, undefined, undefined, true, Date.now(), 3, processingId)
      
      // AI validation
      fetch('/api/validate-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field_name: currentQuestion.key,
          user_input: currentInput,
          context: {
            step: "company_setup",
            question_index: currentBPQuestionIndex,
            business_profile: businessProfile
          }
        }),
      })
      .then(response => response.json())
      .then(data => {
        const validation = data.validation_result
        let finalValue = currentInput
        let validationMessage = ""
        
        if (validation.corrections_made.length > 0) {
          // Don't auto-apply corrections - suggest them instead
          const corrections = validation.corrections_made.map((c: any) => 
            `${c.original} → ${c.corrected} (${c.type})`
          ).join(", ")
          validationMessage = `💡 I have suggestions: ${corrections}. Would you like to use "${validation.corrected_value}" or keep "${currentInput}"?`
          
          // Remove processing message and add suggestion with options
          setMessages(prev => prev.filter(msg => msg.id !== processingId))
          addSaimMessage(
            validationMessage,
            [
              { 
                label: `Use "${validation.corrected_value}"`, 
                action: "apply_ai_correction",
                payload: {
                  corrected_value: validation.corrected_value,
                  field_name: currentQuestion.key,
                  question_index: currentBPQuestionIndex
                }
              },
              { 
                label: `Keep "${currentInput}"`, 
                action: "keep_original",
                payload: {
                  original_value: currentInput,
                  field_name: currentQuestion.key,
                  question_index: currentBPQuestionIndex
                }
              }
            ]
          )
          setIsAwaitingResponse(true)
          return
        } else if (validation.requires_clarification) {
          validationMessage = `🤔 I need clarification. Did you mean: ${validation.clarification_options.join(" or ")}? Please re-enter with the correct option.`
          // Remove processing message and add clarification
          setMessages(prev => prev.filter(msg => msg.id !== processingId))
          addSaimMessage(validationMessage)
          setIsAwaitingResponse(true)
          return
        } else if (validation.suggestions.length > 0) {
          validationMessage = `💡 "${currentInput}" looks good! Suggestions: ${validation.suggestions.join(", ")}`
        } else if (validation.confidence > 0.8) {
          validationMessage = `✅ Perfect! "${currentInput}" looks correct.`
        } else {
          validationMessage = `✅ Accepted "${currentInput}"`
        }
        
        // Update business profile with user's original input (not auto-corrected)
        const updatedProfile = { ...businessProfile, [currentQuestion.key]: currentInput }
        setBusinessProfile(updatedProfile)
        
        // Remove processing message and continue
        setMessages(prev => prev.filter(msg => msg.id !== processingId))
        
        if (validationMessage) {
          addSaimMessage(validationMessage)
        }
        
        handleSaimResponse(() => {
          if (currentBPQuestionIndex < initialBusinessProfileQuestions.length - 1) {
            setCurrentBPQuestionIndex(currentBPQuestionIndex + 1)
            addSaimMessage(initialBusinessProfileQuestions[currentBPQuestionIndex + 1].text)
            setIsAwaitingResponse(true)
          } else {
            // Create company profile
            console.log("📝 All business profile questions completed, creating company profile")
            const newProfile = createCompanyProfile(updatedProfile)
            console.log("✅ Company profile created:", newProfile)
            setCompanyProfile(newProfile)
            
            console.log("🎯 Calling proceedToNextStepPrompt(1)")
            proceedToNextStepPrompt(1)
            
            setTimeout(() => {
              console.log("🔄 Triggering company created callback (URL update)")
              onCompanyCreated?.(newProfile)
            }, 500)
          }
        })
      })
      .catch(error => {
        console.error('AI validation error:', error)
        // Fall back to original logic without validation
        const updatedProfile = { ...businessProfile, [currentQuestion.key]: currentInput }
        setBusinessProfile(updatedProfile)
        
        // Remove processing message
        setMessages(prev => prev.filter(msg => msg.id !== processingId))
        addSaimMessage("✅ Got it! (AI validation unavailable)")
        
        handleSaimResponse(() => {
          if (currentBPQuestionIndex < initialBusinessProfileQuestions.length - 1) {
            setCurrentBPQuestionIndex(currentBPQuestionIndex + 1)
            addSaimMessage(initialBusinessProfileQuestions[currentBPQuestionIndex + 1].text)
            setIsAwaitingResponse(true)
          } else {
            const newProfile = createCompanyProfile(updatedProfile)
            setCompanyProfile(newProfile)
            proceedToNextStepPrompt(1)
            setTimeout(() => {
              onCompanyCreated?.(newProfile)
            }, 500)
          }
        })
      })
    }
  }

  const handleOptionClick = (action: string, label: string, payload?: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    addUserMessage(`Selected: ${label}`)
    setIsAwaitingResponse(false)

    const commonAIProcess = (
      processName: string,
      estDuration: number,
      stepToComplete: number,
      outputData?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      outputType?: OutputContentType,
    ) => {
      const msgId = String(Date.now() + `_proc_${action}`)
      handleSaimResponse(() => {
        addSaimMessage(`${processName}...`, undefined, undefined, undefined, true, Date.now(), estDuration, msgId)
      }, 200)
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: `${processName} complete.`, isProcessing: false } : m)),
        )
        if (outputData && outputType) onShowOutput(outputType, outputData)

        // Special handling for categorization to load exceptions
        if (stepToComplete === 6 && processName.includes("Categorizing Transactions")) {
          const sampleExceptions: TransactionException[] = [
            {
              id: "ex1",
              date: "2023-01-12",
              description: "Vague Vendor LLC",
              amount: -75.0,
              reason: "Unknown Vendor",
              isResolved: false,
              runId: currentRun?.id,
            },
            {
              id: "ex2",
              date: "2023-01-15",
              description: "Mystery Charge #123",
              amount: -33.2,
              reason: "Ambiguous Description",
              isResolved: false,
              runId: currentRun?.id,
            },
          ]
          setCurrentExceptions(sampleExceptions)
          onShowOutput("exceptions", sampleExceptions)
          proceedToNextStepPrompt(stepToComplete)
        } else {
          proceedToNextStepPrompt(stepToComplete)
        }
      }, estDuration * 1000)
    }

    switch (action) {
      case "start_new_run":
        addSaimMessage("Ready to process a new bank statement. Please upload your file.", [
          { label: "Upload Bank Statement", action: "upload_bank_statement_file" },
        ])
        break

      case "view_company_profile":
        if (companyProfile) {
          onShowOutput("company_profile", companyProfile)
          addSaimMessage("Displaying your company profile in the output panel.")
        }
        break

      case "view_processing_history":
        const processingHistory = CompanyStorage.getProcessingRuns()
        onShowOutput("processing_history", processingHistory)
        addSaimMessage(`Showing ${processingHistory.length} processing runs in the output panel.`)
        break

      case "view_rules":
        const rules = CompanyStorage.getTransactionRules()
        onShowOutput("rules", rules)
        addSaimMessage(`Displaying ${rules.length} active rules.`)
        break

      case "generate_coa":
        if (!companyProfile) {
          addSaimMessage("Error: No company profile found.")
          return
        }

        // Generate COA based on company profile
        const generatedCOA = generateCOAForCompany(companyProfile)

        commonAIProcess(
          `Generating Chart of Accounts for ${companyProfile.industry} business`,
          5,
          2,
          generatedCOA,
          "coa",
        )

        // Update company profile with generated COA
        setTimeout(() => {
          const updatedProfile = {
            ...companyProfile,
            chartOfAccounts: generatedCOA,
            updatedAt: new Date().toISOString(),
          }
          CompanyStorage.saveCompanyProfile(updatedProfile)
          setCompanyProfile(updatedProfile)
        }, 5000)
        break

      case "upload_coa":
      case "upload_contacts":
      case "upload_bank_statement_file":
        handleSaimResponse(() => {
          let promptContent: FileUploadPromptContent
          if (action === "upload_coa") {
            promptContent = {
              title: "Upload Chart of Accounts",
              description: "CSV or XLSX format with Account Code, Name, Category, Class columns.",
              fileType: "coa",
              accept: ".csv,.xlsx",
              sampleDownloadLink: "/sample-coa.csv",
            }
          } else if (action === "upload_contacts") {
            promptContent = {
              title: "Upload Contacts (Optional)",
              description: "CSV/XLSX with Full Name, Type columns.",
              fileType: "contacts",
              accept: ".csv,.xlsx",
              sampleDownloadLink: "/sample-contacts.csv",
              optional: true,
            }
          } else {
            promptContent = {
              title: "Upload Bank Statement",
              description: "PDF, CSV, or XLSX format.",
              fileType: "bank_statement",
              accept: ".pdf,.csv,.xlsx",
            }
          }
          addSaimMessage(undefined, undefined, "file_upload_prompt", promptContent)
        })
        break

      case "skip_contacts":
        handleSkipUpload("contacts")
        break

      case "start_party_mapping":
        const aiPredictions = aiContext?.similarTransactionPatterns.length || 0
        commonAIProcess(`Mapping Parties using ${aiPredictions} learned patterns`, 7, 5)
        break

      case "start_categorization":
        const sampleTransactions = [
          { date: "2023-01-05", description: "Amazon Web Services", amount: -150.75, category: "Cloud Services" },
          {
            date: "2023-01-10",
            description: "Client Payment - Project X",
            amount: 2500.0,
            category: "Service Revenue",
          },
        ]
        commonAIProcess("Categorizing Transactions with AI predictions", 10, 6, sampleTransactions, "transactions")
        break

      case "generate_report":
        if (!currentRun || !bankStatementPeriod) {
          addSaimMessage("Error: No active processing run found.")
          return
        }

        const reportData: FinalReportData = {
          summary: `Financial Analysis for ${companyProfile?.businessName}`,
          periodFrom: bankStatementPeriod.from,
          periodTo: bankStatementPeriod.to,
          runId: currentRun.id,
          reportUrl: "/sample-report.pdf",
        }
        commonAIProcess("Generating Final Report with AI insights", 6, 8, reportData, "final_report")
        break

      case "use_ai_suggestion":
        const { suggestion } = payload
        const updatedExceptionsAI = currentExceptions.map((ex) =>
          ex.id === payload.exception.id
            ? { ...ex, isResolved: true, suggestedAccount: suggestion.suggestedAccount }
            : ex,
        )
        setCurrentExceptions(updatedExceptionsAI)
        onShowOutput("exceptions", updatedExceptionsAI)
        addSaimMessage(
          `Applied AI suggestion: "${payload.exception.description}" → ${suggestion.suggestedAccount}. This pattern will be reinforced for future predictions.`,
        )
        setCurrentExceptionIndex((prev) => prev + 1)
        presentNextException(currentExceptions.filter((ex) => !ex.isResolved))
        break

      case "assign_account_for_exception":
        const exceptionToAssign = payload as TransactionException
        const availableAccounts = companyProfile?.chartOfAccounts || []
        addSaimMessage(
          `Which account should "${exceptionToAssign.description}" be assigned to?`,
          availableAccounts.slice(0, 6).map((acc) => ({
            label: acc.name,
            action: "confirm_assign_account_for_exception",
            payload: { exception: exceptionToAssign, accountName: acc.name, accountId: acc.code },
          })),
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          exceptionToAssign,
        )
        break

      case "confirm_assign_account_for_exception":
        const { accountName } = payload as { accountName: string }
        const updatedExceptionsAssign = currentExceptions.map((ex) =>
          ex.id === payload.exception.id ? { ...ex, isResolved: true, suggestedAccount: accountName } : ex,
        )
        setCurrentExceptions(updatedExceptionsAssign)
        onShowOutput("exceptions", updatedExceptionsAssign)
        addSaimMessage(
          `Assigned "${payload.exception.description}" to ${accountName}. Create a rule for similar transactions?`,
          [
            { label: "Yes, Create Rule", action: "init_create_rule_for_exception", payload: payload.exception },
            { label: "No, Just This Once", action: "proceed_after_exception_handled" },
          ],
        )
        break

      case "init_create_rule_for_exception":
        const exceptionForRule = payload as TransactionException
        setActiveRuleCreation({
          step: "name",
          exception: exceptionForRule,
          conditions: [],
          currentCondition: {},
        })
        addSaimMessage(
          `Let's create a rule for transactions like "${exceptionForRule.description}". Give this rule a name:`,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { step: "name", exception: exceptionForRule },
        )
        setIsAwaitingResponse(true)
        break

      case "ignore_exception":
        const exceptionToIgnore = payload as TransactionException
        const updatedExceptionsIgnore = currentExceptions.map((ex) =>
          ex.id === exceptionToIgnore.id ? { ...ex, isResolved: true, suggestedAccount: "Ignored" } : ex,
        )
        setCurrentExceptions(updatedExceptionsIgnore)
        onShowOutput("exceptions", updatedExceptionsIgnore)
        addSaimMessage(`"${exceptionToIgnore.description}" will be ignored for this run.`)
      // Fall through to proceed
      case "proceed_after_exception_handled":
        setCurrentExceptionIndex((prev) => prev + 1)
        presentNextException(currentExceptions.filter((ex) => !ex.isResolved))
        break

      // Rule creation actions
      case "rule_set_condition_field":
        if (!activeRuleCreation) return
        const nextRuleState1 = {
          ...activeRuleCreation,
          currentCondition: { field: payload },
          step: "condition_operator" as const,
        }
        setActiveRuleCreation(nextRuleState1)
        addSaimMessage(
          `Field: ${payload}. Choose operator:`,
          [
            { label: "Contains (for text)", action: "rule_set_condition_operator", payload: "contains" },
            { label: "Equals", action: "rule_set_condition_operator", payload: "equals" },
            { label: "Greater Than (for amount)", action: "rule_set_condition_operator", payload: "greater_than" },
          ],
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          nextRuleState1,
        )
        break

      case "rule_set_condition_operator":
        if (!activeRuleCreation) return
        const nextRuleState2 = {
          ...activeRuleCreation,
          currentCondition: { ...activeRuleCreation.currentCondition, operator: payload },
          step: "condition_value" as const,
        }
        setActiveRuleCreation(nextRuleState2)
        addSaimMessage(
          `Operator: ${payload}. Enter the value:`,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          nextRuleState2,
        )
        setIsAwaitingResponse(true)
        break

      case "rule_set_account":
        if (!activeRuleCreation) return
        const nextRuleState3 = {
          ...activeRuleCreation,
          targetAccountId: payload.accountId,
          targetAccountName: payload.accountName,
          step: "confirm" as const,
        }
        setActiveRuleCreation(nextRuleState3)
        addSaimMessage(
          `Target account: ${payload.accountName}. Confirm rule "${nextRuleState3.ruleName}"?`,
          [
            { label: "Save Rule", action: "rule_save" },
            { label: "Cancel", action: "rule_cancel" },
          ],
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          nextRuleState3,
        )
        break

      case "rule_save":
        if (!activeRuleCreation || !companyProfile) return
        const newRule: TransactionRule = {
          id: `rule_${Date.now()}`,
          companyId: companyProfile.id,
          name: activeRuleCreation.ruleName!,
          conditions: activeRuleCreation.conditions!,
          applyToAccountId: activeRuleCreation.targetAccountId!,
          applyToAccountName: activeRuleCreation.targetAccountName!,
          isPermanent: true,
          isEnabled: true,
          createdAt: new Date().toISOString(),
          timesApplied: 0,
          accuracy: 1.0,
          suggestedBySaim: false,
          basedOnTransactionIds: [],
          confidence: 100,
          userValidated: true,
        }
        CompanyStorage.saveTransactionRule(newRule)
        const updatedRules = CompanyStorage.getTransactionRules()
        onShowOutput("rules", updatedRules)
        addSaimMessage(`Rule "${newRule.name}" saved!`)

        if (activeRuleCreation.exception) {
          const updatedExceptions = currentExceptions.map((ex) =>
            ex.id === activeRuleCreation.exception!.id
              ? { ...ex, isResolved: true, suggestedAccount: newRule.applyToAccountName }
              : ex,
          )
          setCurrentExceptions(updatedExceptions)
          onShowOutput("exceptions", updatedExceptions)
        }
        setActiveRuleCreation(null)

        if (activeRuleCreation.exception) {
          setCurrentExceptionIndex((prev) => prev + 1)
          presentNextException(currentExceptions.filter((ex) => !ex.isResolved))
        }
        break

      case "rule_cancel":
        addSaimMessage("Rule creation cancelled.")
        setActiveRuleCreation(null)
        if (activeRuleCreation?.exception) {
          presentNextException(currentExceptions.filter((ex) => !ex.isResolved))
        }
        break

      case "apply_ai_correction":
        // Apply the AI-suggested correction
        const correctedValue = payload.corrected_value
        const fieldName = payload.field_name

        // Update the business profile with the corrected value
        const updatedProfileWithCorrection = {
          ...businessProfile,
          [fieldName]: correctedValue
        }
        setBusinessProfile(updatedProfileWithCorrection)

        addSaimMessage(`Perfect! Updated ${fieldName} to "${correctedValue}". Continuing with next question.`)

        // Continue to next question
        handleSaimResponse(() => {
          if (currentBPQuestionIndex < initialBusinessProfileQuestions.length - 1) {
            setCurrentBPQuestionIndex(currentBPQuestionIndex + 1)
            addSaimMessage(initialBusinessProfileQuestions[currentBPQuestionIndex + 1].text)
            setIsAwaitingResponse(true)
          } else {
            const newProfile = createCompanyProfile(updatedProfileWithCorrection)
            setCompanyProfile(newProfile)
            proceedToNextStepPrompt(1)
            setTimeout(() => {
              onCompanyCreated?.(newProfile)
            }, 500)
          }
        }, 500)
        break

      case "keep_original":
        // Keep the user's original input
        const originalValue = payload.original_value
        const originalFieldName = payload.field_name

        // Update the business profile with the original value
        const updatedProfileWithOriginal = {
          ...businessProfile,
          [originalFieldName]: originalValue
        }
        setBusinessProfile(updatedProfileWithOriginal)

        addSaimMessage(`Got it! Keeping "${originalValue}" for ${originalFieldName}. Continuing with next question.`)

        // Continue to next question
        handleSaimResponse(() => {
          if (currentBPQuestionIndex < initialBusinessProfileQuestions.length - 1) {
            setCurrentBPQuestionIndex(currentBPQuestionIndex + 1)
            addSaimMessage(initialBusinessProfileQuestions[currentBPQuestionIndex + 1].text)
            setIsAwaitingResponse(true)
          } else {
            const newProfile = createCompanyProfile(updatedProfileWithOriginal)
            setCompanyProfile(newProfile)
            proceedToNextStepPrompt(1)
            setTimeout(() => {
              onCompanyCreated?.(newProfile)
            }, 500)
          }
        }, 500)
        break

      default:
        addSaimMessage("Action not recognized.")
    }
  }

  const _handleActualFileUpload = (fileType: string, file: File) => {
    addUserMessage(`Uploaded ${file.name} for ${fileType.replace("_", " ")}`)
    setIsAwaitingResponse(false)

    if (fileType === "bank_statement") {
      setCurrentFileForPeriod(file)
      handleSaimResponse(() => {
        addSaimMessage(
          `Selected ${file.name}. What's the 'From' date for this statement? (YYYY-MM-DD)`,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "from",
        )
        setAwaitingDateInput("from")
        setIsAwaitingResponse(true)
      })
      return
    }

    const processingMessageId = String(Date.now() + `_processing_${fileType}`)
    const estimatedDuration = 3
    handleSaimResponse(() => {
      addSaimMessage(
        `Processing ${fileType.replace("_", " ")} file: ${file.name}...`,
        undefined,
        undefined,
        undefined,
        true,
        Date.now(),
        estimatedDuration,
        processingMessageId,
      )
    }, 200)

    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === processingMessageId
            ? { ...msg, text: `${fileType.replace("_", " ")} file "${file.name}" processed.`, isProcessing: false }
            : msg,
        ),
      )

      if (fileType === "coa" && companyProfile) {
        // Simulate parsing uploaded COA
        const uploadedCOA: ChartOfAccount[] = [
          { code: "UPLOADED", name: `From ${file.name}`, category: "Uploaded", class: "Various", statement: "Various" },
          // In real app, would parse the actual file
        ]
        onShowOutput("coa", uploadedCOA)

        // Update company profile
        const updatedProfile = {
          ...companyProfile,
          chartOfAccounts: uploadedCOA,
          updatedAt: new Date().toISOString(),
        }
        CompanyStorage.saveCompanyProfile(updatedProfile)
        setCompanyProfile(updatedProfile)

        proceedToNextStepPrompt(2)
      } else if (fileType === "contacts" && companyProfile) {
        // Process contacts with AI
        const formData = new FormData()
        formData.append('file', file)
        
        fetch(`/api/companies/${companyProfile.id}/process-contacts`, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const result = data.processing_result
            const processedContacts = result.processed_contacts || []
            const duplicatesCount = result.duplicates_detected?.length || 0
            const issuesCount = result.data_quality_issues?.length || 0
            
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === processingMessageId
                  ? { 
                      ...msg, 
                      text: `🎯 AI processed ${processedContacts.length} contacts from "${file.name}"${duplicatesCount > 0 ? `, detected ${duplicatesCount} duplicates` : ''}${issuesCount > 0 ? `, found ${issuesCount} data quality issues` : ''}. Names standardized, emails validated, contact types classified.`,
                      isProcessing: false 
                    }
                  : msg,
              ),
            )
            
            // Convert processed contacts to the format expected by the app
            const uploadedContacts = processedContacts.map((contact: any) => ({
              id: contact.id,
              name: contact.name,
              type: contact.type as "Client" | "Vendor" | "Employee" | "Other",
              email: contact.email,
              phone: contact.phone,
              address: contact.address,
              industry: contact.industry,
              aiProcessed: true,
              confidence: contact.confidence,
              corrections: contact.corrections_made
            }))
            
            onShowOutput("contacts", uploadedContacts)

            // Update company profile
            const updatedProfile = {
              ...companyProfile,
              contacts: [...companyProfile.contacts, ...uploadedContacts],
              updatedAt: new Date().toISOString(),
            }
            CompanyStorage.saveCompanyProfile(updatedProfile)
            setCompanyProfile(updatedProfile)

            proceedToNextStepPrompt(3)
          } else {
            throw new Error('AI processing failed')
          }
        })
        .catch(error => {
          console.error('AI contacts processing error:', error)
          // Fallback to original logic
          const uploadedContacts = [{ id: `contact_${Date.now()}`, name: `From ${file.name}`, type: "Client" as const }]
          onShowOutput("contacts", uploadedContacts)

          const updatedProfile = {
            ...companyProfile,
            contacts: [...companyProfile.contacts, ...uploadedContacts],
            updatedAt: new Date().toISOString(),
          }
          CompanyStorage.saveCompanyProfile(updatedProfile)
          setCompanyProfile(updatedProfile)

          proceedToNextStepPrompt(3)
        })
      }
    }, estimatedDuration * 1000)
  }

  const handleSkipUpload = (fileType: string) => {
    addUserMessage(`Skipped uploading ${fileType}`)
    setIsAwaitingResponse(false)
    handleSaimResponse(() => {
      addSaimMessage(`Okay, we'll skip uploading ${fileType} for now.`)
      if (fileType === "contacts") {
        onShowOutput("contacts", companyProfile?.contacts || [])
        proceedToNextStepPrompt(3)
      }
    })
  }

  const handleRuleCreationInput = (input: string) => {
    if (!activeRuleCreation || !companyProfile) return
    const nextRuleState = { ...activeRuleCreation }

    switch (activeRuleCreation.step) {
      case "name":
        nextRuleState.ruleName = input
        nextRuleState.step = "condition_field"
        addSaimMessage(
          `Rule name: "${input}". What field should the condition be based on?`,
          [
            { label: "Description", action: "rule_set_condition_field", payload: "description" },
            { label: "Amount", action: "rule_set_condition_field", payload: "amount" },
          ],
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          nextRuleState,
        )
        setIsAwaitingResponse(false) // Wait for option click
        break

      case "condition_value":
        const currentCond: RuleCondition = { 
          field: nextRuleState.currentCondition!.field!,
          operator: nextRuleState.currentCondition!.operator!,
          value: input 
        }
        nextRuleState.conditions = [...(nextRuleState.conditions || []), currentCond]
        nextRuleState.currentCondition = {}
        nextRuleState.step = "account"

        const accountOptions = companyProfile.chartOfAccounts.slice(0, 6).map((acc) => ({
          label: acc.name,
          action: "rule_set_account",
          payload: { accountId: acc.code, accountName: acc.name },
        }))

        addSaimMessage(
          `Condition: ${currentCond.field} ${currentCond.operator} "${currentCond.value}". Which account should this rule apply to?`,
          accountOptions,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          nextRuleState,
        )
        setIsAwaitingResponse(false) // Wait for option click
        break
    }
    setActiveRuleCreation(nextRuleState)
  }

  // Helper function to generate COA based on company profile
  const generateCOAForCompany = (profile: CompanyProfile): ChartOfAccount[] => {
    const baseCOA: ChartOfAccount[] = [
      // Assets
      {
        code: "1000",
        name: "Cash and Cash Equivalents",
        category: "Current Assets",
        class: "Assets",
        statement: "Balance Sheet",
      },
      {
        code: "1100",
        name: "Accounts Receivable",
        category: "Current Assets",
        class: "Assets",
        statement: "Balance Sheet",
      },
      { code: "1200", name: "Inventory", category: "Current Assets", class: "Assets", statement: "Balance Sheet" },
      { code: "1500", name: "Equipment", category: "Fixed Assets", class: "Assets", statement: "Balance Sheet" },
      {
        code: "1600",
        name: "Accumulated Depreciation",
        category: "Fixed Assets",
        class: "Assets",
        statement: "Balance Sheet",
      },

      // Liabilities
      {
        code: "2000",
        name: "Accounts Payable",
        category: "Current Liabilities",
        class: "Liabilities",
        statement: "Balance Sheet",
      },
      {
        code: "2100",
        name: "Accrued Expenses",
        category: "Current Liabilities",
        class: "Liabilities",
        statement: "Balance Sheet",
      },
      {
        code: "2500",
        name: "Long-term Debt",
        category: "Long-term Liabilities",
        class: "Liabilities",
        statement: "Balance Sheet",
      },

      // Equity
      { code: "3000", name: "Owner's Equity", category: "Equity", class: "Equity", statement: "Balance Sheet" },
      { code: "3100", name: "Retained Earnings", category: "Equity", class: "Equity", statement: "Balance Sheet" },

      // Revenue
      {
        code: "4000",
        name: "Service Revenue",
        category: "Operating Revenue",
        class: "Revenue",
        statement: "Income Statement",
      },
      {
        code: "4100",
        name: "Product Sales",
        category: "Operating Revenue",
        class: "Revenue",
        statement: "Income Statement",
      },

      // Expenses
      {
        code: "5000",
        name: "Cost of Goods Sold",
        category: "Cost of Sales",
        class: "Expenses",
        statement: "Income Statement",
      },
      {
        code: "6000",
        name: "Rent Expense",
        category: "Operating Expenses",
        class: "Expenses",
        statement: "Income Statement",
      },
      {
        code: "6100",
        name: "Utilities Expense",
        category: "Operating Expenses",
        class: "Expenses",
        statement: "Income Statement",
      },
      {
        code: "6200",
        name: "Office Supplies",
        category: "Operating Expenses",
        class: "Expenses",
        statement: "Income Statement",
      },
      {
        code: "6300",
        name: "Professional Fees",
        category: "Operating Expenses",
        class: "Expenses",
        statement: "Income Statement",
      },
    ]

    // Customize based on industry
    const industryCOA: ChartOfAccount[] = []

    if (profile.industry.toLowerCase().includes("technology") || profile.industry.toLowerCase().includes("software")) {
      industryCOA.push(
        {
          code: "6400",
          name: "Software Subscriptions",
          category: "Operating Expenses",
          class: "Expenses",
          statement: "Income Statement",
        },
        {
          code: "6500",
          name: "Cloud Services",
          category: "Operating Expenses",
          class: "Expenses",
          statement: "Income Statement",
        },
        {
          code: "1300",
          name: "Software Development Costs",
          category: "Intangible Assets",
          class: "Assets",
          statement: "Balance Sheet",
        },
      )
    }

    if (profile.industry.toLowerCase().includes("consulting") || profile.industry.toLowerCase().includes("service")) {
      industryCOA.push(
        {
          code: "6600",
          name: "Travel Expenses",
          category: "Operating Expenses",
          class: "Expenses",
          statement: "Income Statement",
        },
        {
          code: "6700",
          name: "Client Entertainment",
          category: "Operating Expenses",
          class: "Expenses",
          statement: "Income Statement",
        },
        {
          code: "4200",
          name: "Consulting Revenue",
          category: "Operating Revenue",
          class: "Revenue",
          statement: "Income Statement",
        },
      )
    }

    if (profile.industry.toLowerCase().includes("retail") || profile.industry.toLowerCase().includes("ecommerce")) {
      industryCOA.push(
        {
          code: "1250",
          name: "Finished Goods Inventory",
          category: "Current Assets",
          class: "Assets",
          statement: "Balance Sheet",
        },
        {
          code: "6800",
          name: "Shipping Expenses",
          category: "Operating Expenses",
          class: "Expenses",
          statement: "Income Statement",
        },
        {
          code: "6900",
          name: "Marketing and Advertising",
          category: "Operating Expenses",
          class: "Expenses",
          statement: "Income Statement",
        },
      )
    }

    return [...baseCOA, ...industryCOA]
  }

  const isInputDisabled =
    !isAwaitingResponse ||
    !(
      (currentStep === 1 && !companyProfile?.isSetupComplete) ||
      awaitingDateInput ||
      activeRuleCreation?.step === "name" ||
      activeRuleCreation?.step === "condition_value"
    )

  return (
    <div className="flex-1 flex flex-col bg-transparent p-4 md:p-6 overflow-hidden chat-panel-background">
      <div className="flex items-center justify-between pb-4 border-b mb-4 relative z-10">
        <div>
          <h2 className="font-semibold text-lg md:text-xl">
            Chat with S(ai)m Jr
            {companyProfile && (
              <span className="text-sm font-normal text-muted-foreground ml-2">({companyProfile.businessName})</span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep}: {workflowStepsConfig.find((s) => s.id === currentStep)?.title || "Processing..."}
            {currentRun && <span className="ml-2 text-xs text-primary">Run: {currentRun.fileName}</span>}
            {activeRuleCreation && (
              <span className="ml-2 text-xs text-primary">(Creating Rule: {activeRuleCreation.step})</span>
            )}
            {aiContext && (
              <span className="ml-2 text-xs text-emerald-600">
                AI: {aiContext.historicalTransactions.length} transactions learned
              </span>
            )}
          </p>
        </div>
        <Avatar className="h-10 w-10 md:h-12 md:w-12">
          <AvatarImage src="/modern-ai-avatar.png" />
          <AvatarFallback className="bg-primary text-primary-foreground">SJ</AvatarFallback>
        </Avatar>
      </div>

      {/* [Rest of the JSX remains similar with enhanced messaging about AI context] */}
      <ScrollArea className="flex-1 -mx-4 chat-messages-container relative z-10">
        <div className="px-4 py-2 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.8 }}
                className={cn("flex items-end gap-2.5", msg.sender === "user" ? "flex-row-reverse" : "")}
              >
                {msg.sender === "saim" && (
                  <Avatar className="h-7 w-7 self-start flex-shrink-0">
                    <AvatarImage src="/modern-ai-avatar.png" />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">SJ</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "p-3 rounded-xl shadow-md max-w-md md:max-w-lg",
                    msg.sender === "saim"
                      ? "bg-card border rounded-bl-none"
                      : "bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground rounded-br-none",
                    msg.componentType === "file_upload_prompt" && "w-full bg-card border",
                    msg.currentException && "border-l-4 border-destructive/70",
                    msg.ruleCreationState && "border-l-4 border-amber-500/70",
                  )}
                >
                  {/* Message content with enhanced AI context indicators */}
                  {msg.currentException && !msg.ruleCreationState && (
                    <div className="flex items-center text-xs text-destructive mb-1.5">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5" /> Exception Analysis
                    </div>
                  )}
                  {msg.ruleCreationState && (
                    <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 mb-1.5">
                      <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Rule Creation: {msg.ruleCreationState.step}
                    </div>
                  )}
                  {msg.text && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed flex items-center">
                      {msg.expectsDateInput && <CalendarDays className="h-4 w-4 mr-2 text-primary/70 flex-shrink-0" />}
                      {msg.text}
                    </p>
                  )}
                  {msg.options && !msg.isProcessing && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {msg.options.map((opt) => (
                        <Button
                          key={opt.action + (opt.payload?.id || opt.label)}
                          size="sm"
                          variant={msg.sender === "saim" ? "outline" : "default"}
                          className={cn(
                            "transition-transform hover:scale-105",
                            msg.sender === "saim"
                              ? "bg-background hover:bg-muted border-border text-sm"
                              : "bg-white/20 hover:bg-white/30 text-primary-foreground border-transparent text-sm",
                            opt.action === "use_ai_suggestion" &&
                              "border-emerald-500 text-emerald-700 dark:text-emerald-400",
                          )}
                          onClick={() => handleOptionClick(opt.action, opt.label, opt.payload)}
                        >
                          {opt.action.includes("generate") && <CheckCircle className="h-3.5 w-3.5 mr-1.5 opacity-80" />}
                          {opt.action === "view_rules" && <Eye className="h-3.5 w-3.5 mr-1.5 opacity-80" />}
                          {opt.action === "view_company_profile" && (
                            <Building2 className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                          )}
                          {opt.action === "view_processing_history" && (
                            <History className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                          )}
                          {opt.action === "use_ai_suggestion" && (
                            <TrendingUp className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                          )}
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  {/* [Rest of message rendering...] */}
                </div>
              </motion.div>
            ))}
            {/* [Typing indicator...] */}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* [Input form remains the same] */}
      <motion.form layout onSubmit={handleUserInput} className="mt-auto pt-4 flex items-center gap-2.5 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground hover:text-primary flex-shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={
            isInputDisabled
              ? "S(Ai)m Jr is working or awaiting selection..."
              : awaitingDateInput
                ? `Enter ${awaitingDateInput} date (YYYY-MM-DD)...`
                : activeRuleCreation?.step === "name"
                  ? "Enter rule name..."
                  : activeRuleCreation?.step === "condition_value"
                    ? "Enter condition value..."
                    : "Type your answer..."
          }
          className="flex-1 resize-none py-2.5 px-3.5 rounded-lg border bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 min-h-[44px] max-h-[120px]"
          rows={1}
          disabled={isInputDisabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              if (!isInputDisabled) handleUserInput(e)
            }
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground hover:text-primary flex-shrink-0"
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={!userInput.trim() || isInputDisabled}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg w-10 h-10 flex-shrink-0 shadow-md transition-transform hover:scale-105"
        >
          <Send className="h-4 w-4" />
        </Button>
      </motion.form>
    </div>
  )
}
