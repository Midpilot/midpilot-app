"use client";

import { EqualIcon } from "lucide-react";
import WorkflowBuilder from "./workflow-builder";

export default function Home() {
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
        <WorkflowBuilder />
      </main>
    </div>
  );
}
