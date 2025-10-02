"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "../lib/utils"

export type AvatarExpression = 
  | "greeting"    // Waving - for welcome messages
  | "confused"    // Scratching head - for errors/confusion
  | "thinking"    // Hand on chin - for processing
  | "shrugging"   // Both hands up - for uncertainty
  | "default"     // Neutral professional - for regular responses

interface DynamicSaimAvatarProps {
  expression?: AvatarExpression
  isProcessing?: boolean
  className?: string
}

const avatarSources: Record<AvatarExpression, string> = {
  greeting: "/saim-avatar-greeting.png",    // Image 1 - Waving
  confused: "/saim-avatar-confused.png",    // Image 2 - Scratching head with sweat  
  thinking: "/saim-avatar-thinking.png",    // Image 3 - Hand on chin
  shrugging: "/saim-avatar-shrugging.png",  // Image 4 - Both hands up
  default: "/saim-avatar-default.png"       // Image 5 - Neutral professional
}

export function DynamicSaimAvatar({ 
  expression = "default", 
  isProcessing = false,
  className 
}: DynamicSaimAvatarProps) {
  return (
    <div className={cn("relative", className)}>
      <Avatar 
        className={cn(
          "h-8 w-8 transition-all duration-500 ease-out",
          // Pop-out effect for interactive expressions
          (expression === "greeting" || expression === "confused" || expression === "shrugging") && 
          "transform scale-110 hover:scale-125 shadow-lg",
          // Gentle pulse for thinking
          expression === "thinking" && "animate-pulse",
          // Processing glow effect
          isProcessing && "ring-2 ring-primary ring-opacity-50 animate-pulse"
        )}
      >
        <AvatarImage 
          src={avatarSources[expression]} 
          alt={`S(ai)m Jr - ${expression}`}
          className={cn(
            "transition-all duration-300",
            // Pop-out expressions appear to come forward
            (expression === "greeting" || expression === "confused" || expression === "shrugging") && 
            "transform translate-y-[-2px]"
          )}
        />
        <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground text-xs font-semibold">
          S(ai)m
        </AvatarFallback>
      </Avatar>
      
      {/* Animated background effect for special expressions */}
      {(expression === "greeting" || expression === "confused" || expression === "shrugging") && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 animate-ping opacity-20" />
      )}
    </div>
  )
}