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
            {/* Temporary brain icon - replace finaceverse-logo.png with actual logo */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill="currentColor"
                opacity="0.3"
              />
              <circle cx="9" cy="9" r="1" fill="currentColor" />
              <circle cx="15" cy="9" r="1" fill="currentColor" />
              <circle cx="12" cy="13" r="1" fill="currentColor" />
              <path
                d="M9 9l3 4m0 0l3-4"
                stroke="currentColor"
                strokeWidth="1"
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