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
          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600">
            {/* Brain/AI Logo SVG */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              {/* Brain-like circuit pattern */}
              <path
                d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"
                fill="currentColor"
                opacity="0.3"
              />
              <circle cx="8" cy="9" r="1.5" fill="currentColor" />
              <circle cx="16" cy="9" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <path
                d="M8 9l4 3m0 0l4-3M12 12v3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
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