"use client";

import { useState } from "react";
import { EqualIcon } from "lucide-react";
import WorkflowBuilder from "./workflow-builder";
import InitialScreen from "../components/InitialScreen";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [initialSteps, setInitialSteps] = useState([]);
  const { toast } = useToast();

  const handleTaskSubmit = async (task: string) => {
    try {
      const response = await fetch("/api/generate-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workflow");
      }

      const data = await response.json();
      setInitialSteps(data.steps);
      setShowBuilder(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartFromScratch = () => {
    setInitialSteps([]);
    setShowBuilder(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1">
          <EqualIcon className="w-4 h-4" />
          <span className="font-inter font-semibold text-black">Midpilot</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {showBuilder ? (
          <WorkflowBuilder initialSteps={initialSteps} />
        ) : (
          <InitialScreen 
            onTaskSubmit={handleTaskSubmit} 
            onStartFromScratch={handleStartFromScratch}
          />
        )}
      </main>
    </div>
  );
}
