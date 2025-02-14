"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, EqualIcon, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Workflow {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  steps: number;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const router = useRouter();

  // TODO: Replace this with actual API call when backend is ready
  useEffect(() => {
    // Temporary mock data
    setWorkflows([
      {
        id: "1",
        title: "Content Creation Workflow",
        description: "A workflow for creating and publishing blog content",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        steps: 5,
      },
      {
        id: "2",
        title: "Social Media Campaign",
        description: "Workflow for planning and executing social media campaigns",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        steps: 4,
      },
    ]);
  }, []);

  const handleCreateNew = () => {
    router.push("/builder");
  };

  const handleOpenWorkflow = (id: string) => {
    router.push(`/builder?id=${id}`);
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
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Workflows</h1>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Create New Workflow
          </Button>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first workflow</p>
            <Button onClick={handleCreateNew} variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Create Your First Workflow
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleOpenWorkflow(workflow.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <h3 className="font-semibold mb-2 line-clamp-1">{workflow.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {workflow.description}
                    </p>
                    <div className="mt-auto flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-1">
                        {workflow.steps} steps
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 