"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { WorkflowSidebar } from "../../components/workflow-sidebar"
import { ChatPanel } from "../../components/chat-panel"
import { OutputPanel } from "../../components/output-panel"
import { CompanyStorage } from "@/lib/company-storage"
import type { Message, ChatSession, CompanyProfile, OutputContentType } from "@/lib/types"

export default function SaimJrWorkflowPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyId = searchParams.get("company")
  const isNewCompany = searchParams.get("new") === "true"

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [outputContent, setOutputContent] = useState<{ type: OutputContentType; data: unknown }>({
    type: null,
    data: null,
  })
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)

  const initializeWorkflow = useCallback(() => {
    if (isNewCompany) {
      // Starting fresh company setup
      setCurrentStep(1)
      setCompletedSteps([])
      setMessages([])
      setChatSession(null)
      setCompanyProfile(null)
    } else if (companyId) {
      // Load existing company and chat session
      const profile = CompanyStorage.getCompanyProfile(companyId)
      if (!profile) {
        router.push("/dashboard")
        return
      }

      setCompanyProfile(profile)

      // Load or create chat session
      let session = CompanyStorage.getChatSession(companyId)
      if (!session) {
        session = CompanyStorage.createChatSession(companyId, "module-user")
      }

      setChatSession(session)
      setMessages(session.messages)
      setCurrentStep(session.currentStep)
      setCompletedSteps(session.completedSteps)

      // Update company's hasActiveChat status
      if (profile && !profile.hasActiveChat) {
        const updatedProfile = { ...profile, hasActiveChat: true }
        CompanyStorage.saveCompanyProfile(updatedProfile)
        setCompanyProfile(updatedProfile)
      }
    } else {
      router.push("/dashboard")
    }
  }, [companyId, isNewCompany, router])

  useEffect(() => {
    if (companyId || isNewCompany) {
      console.log("🚀 Initializing workflow - companyId:", companyId, "isNewCompany:", isNewCompany)
      initializeWorkflow()
    }
  }, [companyId, isNewCompany, router, initializeWorkflow])

  const handleStepComplete = (step: number) => {
    console.log(`📋 handleStepComplete called with step: ${step}`)
    console.log(`📋 Current completedSteps:`, completedSteps)
    console.log(`📋 Current currentStep:`, currentStep)
    
    if (!completedSteps.includes(step)) {
      const newCompletedSteps = [...completedSteps, step]
      setCompletedSteps(newCompletedSteps)
      console.log(`📋 Updated completedSteps:`, newCompletedSteps)

      // Update chat session
      if (chatSession) {
        const newCurrentStep = step < 8 ? step + 1 : step
        const updatedSession = {
          ...chatSession,
          completedSteps: newCompletedSteps,
          currentStep: newCurrentStep,
        }
        CompanyStorage.saveChatSession(updatedSession)
        setChatSession(updatedSession)
        console.log(`📋 Updated session currentStep to: ${newCurrentStep}`)
      }
    }

    // Always update the local currentStep state
    const newCurrentStep = step < 8 ? step + 1 : step
    setCurrentStep(newCurrentStep)
    console.log(`📋 Set local currentStep to: ${newCurrentStep}`)
  }

  const handleShowOutput = (type: OutputContentType, data: unknown) => {
    setOutputContent({ type, data })
  }

  const handleMessagesUpdate = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setMessages(newMessages)

    // Save to chat session
    if (chatSession) {
      const resolvedMessages = typeof newMessages === 'function' ? newMessages(messages) : newMessages
      const updatedSession = {
        ...chatSession,
        messages: resolvedMessages,
        currentStep,
        completedSteps,
      }
      CompanyStorage.saveChatSession(updatedSession)
      setChatSession(updatedSession)
    }
  }

  const handleCompanyCreated = (profile: CompanyProfile) => {
    console.log("🏢 Company created, updating state and URL...")
    console.log("📝 Current messages length:", messages.length)
    console.log("📝 Current step:", currentStep)
    console.log("📝 Completed steps:", completedSteps)
    
    setCompanyProfile(profile)

    // Create chat session for new company with current conversation state
    const session = CompanyStorage.createChatSession(profile.id, "module-user")
    
    // Use a callback to get the most current state
    setMessages(currentMessages => {
      setCurrentStep(currentStepValue => {
        setCompletedSteps(currentCompletedSteps => {
          // Preserve the current conversation flow by updating the session with current state
          const updatedSession = {
            ...session,
            messages: currentMessages,
            currentStep: currentStepValue,
            completedSteps: currentCompletedSteps
          }
          
          console.log("💾 Saving session with messages:", currentMessages.length)
          console.log("💾 Saving session with currentStep:", currentStepValue)
          CompanyStorage.saveChatSession(updatedSession)
          setChatSession(updatedSession)

          // Update URL to company-specific session (this will trigger re-initialization)
          setTimeout(() => {
            router.replace(`/workflow?company=${profile.id}`)
          }, 100)
          
          return currentCompletedSteps
        })
        return currentStepValue
      })
      return currentMessages
    })
  }



  return (
    <div className="h-screen w-screen flex bg-background font-sans">
      {/* Left Sidebar: Workflow Steps */}
      <WorkflowSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        companyName={companyProfile?.businessName}
      />

      {/* Center Panel: Chat Interface */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatPanel
          currentStep={currentStep}
          onStepComplete={handleStepComplete}
          onShowOutput={handleShowOutput}
          messages={messages}
          setMessages={handleMessagesUpdate}
          companyProfile={companyProfile}
          onCompanyCreated={handleCompanyCreated}
          isNewCompany={isNewCompany}
        />
      </main>

      {/* Right Sidebar: Outputs */}
      <OutputPanel content={outputContent} />
    </div>
  )
}
