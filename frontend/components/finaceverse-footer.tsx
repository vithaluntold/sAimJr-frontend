"use client"

import React from "react"
import Image from "next/image"

export function FinACEverseFooter() {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <span 
          className="text-sm font-medium"
          style={{ color: "#c23d47" }}
        >
          Powered by
        </span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
            <Image
              src="/finaceverse-logo.png"
              alt="FinACEverse Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span 
            className="text-sm font-semibold"
            style={{ color: "#76a9db" }}
          >
            FinACEverse
          </span>
        </div>
      </div>
    </div>
  )
}