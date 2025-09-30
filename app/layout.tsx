import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import { ErrorBoundary } from "../components/error-boundary"
import { FinACEverseFooter } from "../components/finaceverse-footer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "S(Ai)m Jr - AI-Powered Accounting Assistant",
  description: "Transform your accounting workflow with AI-powered transaction categorization and insights.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <FinACEverseFooter />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
