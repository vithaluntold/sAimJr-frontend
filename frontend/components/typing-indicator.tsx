"use client"

import { motion } from "framer-motion"

const dotVariants = {
  initial: {
    y: "0%",
  },
  animate: {
    y: ["0%", "-70%", "0%"], // Bouncing effect
    transition: {
      duration: 0.7,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  },
}

export function TypingIndicator() {
  return (
    <motion.div
      className="flex space-x-1 items-center h-5" // Fixed height to prevent layout shift
      variants={{
        initial: { transition: { staggerChildren: 0.1 } },
        animate: { transition: { staggerChildren: 0.1 } },
      }}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 bg-muted-foreground rounded-full"
          variants={dotVariants}
          style={{ animationDelay: `${i * 0.15}s` }} // Stagger the animation start
        />
      ))}
    </motion.div>
  )
}
