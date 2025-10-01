"use client"

import { CheckCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const workflowSteps = [
  { id: 1, title: "Business Profile" },
  { id: 2, title: "Chart of Accounts" },
  { id: 3, title: "Upload Contacts" },
  { id: 4, title: "Upload Bank Statement" },
  { id: 5, title: "Map Parties" },
  { id: 6, title: "Categorize Transactions" },
  { id: 7, title: "Handle Exceptions" },
  { id: 8, title: "Review Results" },
  { id: 9, title: "Generate Report" },
]

interface WorkflowSidebarProps {
  currentStep: number
  completedSteps: number[]
  companyName?: string
}

export function WorkflowSidebar({ currentStep, completedSteps, companyName }: WorkflowSidebarProps) {
  return (
    <aside className="w-72 bg-card border-r p-6 flex-col hidden lg:flex">
      <div className="flex items-center space-x-3 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-400 dark:to-emerald-600 rounded-lg shadow-lg flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1 className="font-semibold text-lg">S(ai)m Jr</h1>
          <p className="text-sm text-muted-foreground">{companyName ? companyName : "AI Accountant"}</p>
        </div>
      </div>
      <div className="flex-grow">
        <ol>
          <AnimatePresence initial={false}>
            {workflowSteps.map((step, index) => {
              if (step.id > currentStep) return null // Hide future steps

              const isCompleted = completedSteps.includes(step.id)
              const isActive = currentStep === step.id

              return (
                <motion.li
                  key={step.id}
                  className="relative pb-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* This is the vertical line of the circuit */}
                  {index < workflowSteps.length - 1 && step.id < currentStep && (
                    <div
                      className={cn(
                        "absolute top-4 left-3 -ml-px mt-0.5 h-full w-0.5",
                        isCompleted ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}

                  <div className="relative flex items-center">
                    <span
                      className={cn(
                        "z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card",
                        isActive ? "ring-4 ring-primary/20" : "",
                      )}
                    >
                      {isCompleted ? (
                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : isActive ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-border" />
                      )}
                    </span>
                    <div className="ml-4 flex flex-col">
                      <h3 className={cn("text-sm font-semibold", isActive ? "text-primary" : "text-foreground")}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{`Step ${step.id}`}</p>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      </div>
    </aside>
  )
}
