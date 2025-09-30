"use client"

import { SampleDataControls } from "@/components/dev/sample-data-controls"

export default function DevPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Development Tools</h1>
          <p className="text-muted-foreground">Tools for testing the multi-company system</p>
        </div>

        <SampleDataControls />
      </div>
    </div>
  )
}
