"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Zap, Brain, BarChart3, FileSpreadsheet, Users, ArrowRight, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Zap,
    title: "Automated Transaction Categorization",
    description: "Let S(ai)m Jr intelligently sort your transactions into the correct accounts.",
  },
  {
    icon: Brain,
    title: "Intelligent Chart of Accounts",
    description: "Get a customized Chart of Accounts or upload your own for S(ai)m Jr to learn.",
  },
  {
    icon: Users,
    title: "Vendor & Customer Mapping",
    description: "S(ai)m Jr helps identify and map your recurring vendors and customers.",
  },
  {
    icon: FileSpreadsheet,
    title: "Seamless Spreadsheet Integration",
    description: "Upload your existing spreadsheets (CSV, XLSX) and get an enhanced, categorized version back.",
  },
  {
    icon: BarChart3,
    title: "AI-Powered Insights",
    description: "Gain a clearer understanding of your financial data through smart processing.",
  },
  {
    icon: TrendingUp, // Changed icon
    title: "Streamlined Workflow",
    description: "S(ai)m Jr guides you step-by-step, simplifying complex accounting tasks.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
}

const WaveSeparator = ({ className, fill }: { className?: string; fill?: string }) => (
  <div className={`wave-separator ${className || ""}`}>
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={fill || "fill-background dark:fill-gray-800/20"}>
      <path d="M0,50 C150,100 300,0 450,50 C600,100 750,0 900,50 C1050,100 1200,0 1350,50 C1440,75 1440,100 1440,100 L0,100 Z"></path>
    </svg>
  </div>
)

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-emerald-50/10 to-teal-50/10 dark:from-gray-900 dark:via-gray-800/20 dark:to-teal-900/10 font-sans">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-500 dark:to-emerald-600 rounded-lg shadow-lg flex items-center justify-center">
            {/* S(ai)m Jr Logo SVG */}
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
          <h1 className="font-semibold text-2xl text-gray-800 dark:text-gray-100">S(ai)m Jr</h1>
        </motion.div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 overflow-hidden">
          {/* Abstract background graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.07, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] dark:opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%230d9488' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 md:space-y-8"
            >
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                Meet <span className="text-primary">S(ai)m Jr</span>
              </motion.h2>
              <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground">
                Your AI-Powered Accounting Co-Pilot.
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl"
              >
                S(ai)m Jr is an advanced AI accounting assistant module designed to integrate seamlessly into your existing platform. From intelligent
                transaction categorization to automated chart of accounts generation, S(ai)m Jr helps you save time,
                reduce errors, and gain deeper insights into your business finances.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Link href="/workflow">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-primary/40 group"
                  >
                    Hire S(ai)m Jr
                    <ArrowRight className="w-5 h-5 ml-2.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 80 }}
              className="flex justify-center md:justify-end mt-8 md:mt-0"
            >
              <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl border-4 border-primary/10 bg-gradient-to-br from-emerald-100/50 to-teal-100/50 dark:from-emerald-900/20 dark:to-teal-900/20 p-2">
                <Image
                  src="/modern-ai-avatar.png"
                  alt="S(Ai)m Jr Avatar"
                  layout="fill"
                  objectFit="contain"
                  priority
                  className="p-4 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <WaveSeparator fill="fill-background dark:fill-gray-800/20" />

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background dark:bg-gray-800/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-12 md:mb-16"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                How S(ai)m Jr Empowers You
              </h3>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                Focus on your business, let S(ai)m Jr handle the tedious accounting tasks with precision and speed.
              </p>
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    className="p-6 bg-card dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:scale-[1.03] flex flex-col items-start"
                  >
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/10 to-emerald-500/10 dark:from-primary/20 dark:to-emerald-500/20 text-primary rounded-xl mb-5 shadow-md">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        <WaveSeparator className="transform rotate-180" fill="fill-background dark:fill-gray-800/20" />

        {/* How It Works Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Simple Steps to Financial Clarity
            </h3>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            {[
              { title: "Profile Setup", description: "Tell S(ai)m Jr about your business." },
              { title: "Upload Data", description: "Provide your Chart of Accounts & transactions." },
              { title: "Get Results", description: "Receive your categorized data and insights." },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="space-y-3 p-6 bg-card dark:bg-gray-800/50 rounded-xl shadow-lg hover:shadow-primary/10 transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
                  {index + 1}
                </div>
                <h4 className="text-xl font-semibold">{step.title}</h4>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="py-8 bg-card dark:bg-gray-800/40 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} S(ai)m Jr. All rights reserved.</p>
          <p className="text-xs mt-1">Powered by Finaid.io</p>
        </div>
      </footer>
    </div>
  )
}
