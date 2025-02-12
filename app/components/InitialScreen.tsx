"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wand2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

interface InitialScreenProps {
  onTaskSubmit: (task: string) => void
  onStartFromScratch: () => void
}

export default function InitialScreen({ onTaskSubmit, onStartFromScratch }: InitialScreenProps) {
  const [task, setTask] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!task.trim()) return
    setIsLoading(true)
    onTaskSubmit(task)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            What do you want Midpilot to do for you?
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Describe your task in detail, and we'll break it down into actionable steps.
          </p>
          <Textarea
            placeholder="Example: Go to my Shopify order, copy the customer info and order a pickup from my store to their address on helthjem"
            className="min-h-[120px] mb-4 text-lg"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <div className="flex flex-col gap-4 items-center">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!task.trim() || isLoading}
              className="gap-2 w-full max-w-md"
            >
              {isLoading ? (
                "Generating workflow..."
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Workflow
                </>
              )}
            </Button>
            <div className="relative w-full max-w-md flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative px-4 text-sm text-gray-500 bg-white">
                or
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={onStartFromScratch}
              className="gap-2 w-full max-w-md"
            >
              <Plus className="w-5 h-5" />
              Start from Scratch
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 