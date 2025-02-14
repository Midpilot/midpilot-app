"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion, Reorder } from "framer-motion"
import { Plus, Trash2, Play, Wand2, AlertTriangle, Loader2, CircleCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { debounce } from "lodash"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs"

interface Substep {
  id: string
  title: string
  description: string
  isEditing?: boolean
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  substeps: Substep[]
  isInputStep: boolean
  inputType: 'text' | 'file' | 'none'
  inputPrompt?: string
}

interface WorkflowBuilderProps {
  initialSteps?: WorkflowStep[]
}

export default function WorkflowBuilder({ initialSteps = [] }: WorkflowBuilderProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(() => initialSteps)
  const [editingTitle, setEditingTitle] = useState(false)
  const [workflowTitle, setWorkflowTitle] = useState(() => "Untitled Workflow")
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [generatedSubsteps, setGeneratedSubsteps] = useState<Substep[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null)
  const [isFormatting, setIsFormatting] = useState(false)

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${steps.length + 1}-${Math.random().toString(36).slice(2, 9)}`,
      title: `Step ${steps.length + 1}`,
      description: ``,
      substeps: [],
      isInputStep: false,
      inputType: 'none',
    }
    setSteps([...steps, newStep])
    setEditingStep(newStep)
    setIsDialogOpen(true)
  }

  const openEditDialog = (step: WorkflowStep) => {
    setEditingStep({ ...step, substeps: [...step.substeps] })
    setIsDialogOpen(true)
  }

  const handleDeleteStep = () => {
    setShowDeleteConfirm(true)
  }

  const navigateToStep = (direction: 'prev' | 'next') => {
    if (!editingStep) return
    const currentIndex = steps.findIndex(step => step.id === editingStep.id)
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex >= 0 && newIndex < steps.length) {
      setEditingStep({ ...steps[newIndex], substeps: [...steps[newIndex].substeps] })
    }
  }

  const handleNextOrAdd = () => {
    if (!editingStep) return
    const currentIndex = steps.findIndex(step => step.id === editingStep.id)
    
    if (currentIndex === steps.length - 1) {
      // Add new step and navigate to it
      const newStep: WorkflowStep = {
        id: `step-${steps.length + 1}-${Math.random().toString(36).slice(2, 9)}`,
        title: `Step ${steps.length + 1}`,
        description: ``,
        substeps: [],
        isInputStep: false,
        inputType: 'none',
      }
      setSteps([...steps, newStep])
      setEditingStep({ ...newStep, substeps: [] })
    } else {
      // Navigate to next step
      navigateToStep('next')
    }
  }

  const confirmDelete = () => {
    if (editingStep) {
      setSteps(steps.filter((step) => step.id !== editingStep.id))
      setIsDialogOpen(false)
      setShowDeleteConfirm(false)
    }
  }

  const addSubstep = () => {
    if (editingStep) {
      const newSubstep: Substep = {
        id: `substep-${editingStep.substeps.length + 1}-${Math.random().toString(36).slice(2, 9)}`,
        title: "",
        description: "",
        isEditing: true
      }
      setEditingStep({
        ...editingStep,
        substeps: [...editingStep.substeps, newSubstep],
      })
    }
  }

  const updateSubstep = (substepId: string, field: keyof Substep, value: string) => {
    if (editingStep) {
      setEditingStep({
        ...editingStep,
        substeps: editingStep.substeps.map((substep) =>
          substep.id === substepId ? { ...substep, [field]: value } : substep,
        ),
      })
    }
  }

  const deleteSubstep = (substepId: string) => {
    if (editingStep) {
      const updatedStep = {
        ...editingStep,
        substeps: editingStep.substeps.filter((substep) => substep.id !== substepId),
      };
      setEditingStep(updatedStep);
      setSteps(steps.map(step => step.id === editingStep.id ? updatedStep : step));
      autoSave(updatedStep);
    }
  }

  const handleTitleClick = () => {
    setEditingTitle(true)
  }

  const handleTitleBlur = () => {
    setEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditingTitle(false)
    }
  }

  const generateSubsteps = async () => {
    if (!editingStep?.description) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-substeps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: editingStep.description
        }),
      })
      
      const data = await response.json()
      if (data.substeps && editingStep) {
        const newSubsteps: Substep[] = data.substeps.map((step: string, index: number) => ({
          id: `gen-${Date.now()}-${index}`,
          title: step,
          description: step,
        }))
        
        const updatedStep = {
          ...editingStep,
          substeps: newSubsteps,
        }

        setSteps(steps.map(step => step.id === editingStep.id ? updatedStep : step))
        autoSave(updatedStep)
        setEditingStep(updatedStep)
      }
    } catch (error) {
      console.error('Failed to generate plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfirmReplace = () => {
    if (editingStep && generatedSubsteps.length > 0) {
      setEditingStep({
        ...editingStep,
        substeps: generatedSubsteps,
      })
      setShowConfirmDialog(false)
      setGeneratedSubsteps([])
    }
  }

  const autoSave = useCallback(
    debounce((updatedStep: WorkflowStep) => {
      setSaveStatus('saving');
      setSteps(steps.map((step) => (step.id === updatedStep.id ? updatedStep : step)));
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus(null);
        }, 2000);
      }, 500);
    }, 500),
    [steps, setSaveStatus, setSteps]
  )

  const updateEditingStep = (updatedStep: WorkflowStep | null) => {
    if (!updatedStep) return;
    
    // Update the editing step
    setEditingStep(updatedStep);
    
    // Update the step in the steps array
    setSteps(steps.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    ));
    
    // Trigger auto-save
    autoSave(updatedStep);
  }

  const handleRun = () => {
    let output = '';
    
    // Generate each step's task
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const taskName = `agent_2_step_${stepNumber}_task`;
      
      output += `        # Step ${stepNumber}: ${step.title}\n`;
      output += `        ${taskName} = (\n`;
      
      if (step.isInputStep) {
        output += `            "${step.inputPrompt}\\n"\n`;
      } else {
        output += `            "${step.description}\\n"\n`;
        if (step.substeps && step.substeps.length > 0) {
          step.substeps.forEach((substep, subIndex) => {
            output += `            "${subIndex + 1}. ${substep.title}\\n"\n`;
          });
        }
      }
      
      output += '        )\n\n';
    });

    // Add agent creation code
    output += '        # Create and run agents sequentially\n';
    output += '        agents = []\n';
    output += '        for step, task in enumerate([';
    
    // Add task names with proper indentation
    const taskNames = steps.map((_, index) => `agent_2_step_${index + 1}_task`);
    output += '\n' + taskNames.map(name => '                                   ' + name).join(',\n');
    output += '], 1):\n';

    console.log(output);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        {editingTitle ? (
          <Input
            className="text-2xl font-bold w-64"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h1 
            className="text-2xl font-bold cursor-pointer hover:opacity-80" 
            onDoubleClick={handleTitleClick}
          >
            {workflowTitle}
          </h1>
        )}
        <div className="flex items-center gap-2">
         
          <Button variant="default" disabled={steps.length === 0} onClick={handleRun}>
            <Play className="h-4 w-4" /> Run
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <Button variant="outline" onClick={addStep}>
          <Plus className="mr-2 h-4 w-4" /> Add Step
        </Button>
      </div>
      {steps.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Welcome to Workflow Builder!</h3>
          <p className="text-gray-500 mb-4">Get started by adding steps to create your workflow.</p>
          <Button onClick={addStep} variant="secondary">
            <Plus className="mr-2 h-4 w-4" /> Add Your First Step
          </Button>
        </div>
      ) : (
        <Reorder.Group 
          axis="y" 
          values={steps} 
          onReorder={setSteps} 
          className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 overflow-x-auto pb-4"
        >
          {steps.map((step, index) => (
            <Reorder.Item key={step.id} value={step}>
              <div className="relative w-full md:w-80">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <motion.div
                  whileDrag={{
                    scale: 1.05,
                    boxShadow: "0px 5px 10px rgba(0,0,0,0.1)",
                  }}
                  onDoubleClick={() => openEditDialog(step)}
                >
                  <Card 
                    className={`w-full md:w-80 h-40 cursor-pointer mt-4 ${
                      !step.description 
                        ? 'border-red-200 dark:border-red-900' 
                        : step.isInputStep
                        ? 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20'
                        : ''
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm text-gray-500 truncate">{step.title.replace(/^Step \d+/, '').trim()}</h3>
                          {step.isInputStep && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {step.inputType === 'text' ? 'Text Input' : 'File Upload'}
                            </span>
                          )}
                        </div>
                        <p className={`font-semibold ${
                          !step.description && !step.isInputStep
                            ? 'text-red-500 italic' 
                            : ''
                        } line-clamp-2 mt-1`}>
                          {step.isInputStep 
                            ? (step.inputPrompt || 'Missing instructions for user')
                            : (step.description || 'Missing instructions')}
                        </p>
                      </div>
                      <div>
                        {step.substeps.length > 0 && (
                          <p className="text-xs text-gray-400 mb-2">Substeps: {step.substeps.length}</p>
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className={`w-full py-4 transition-colors ${
                            step.isInputStep 
                              ? 'bg-white hover:bg-gray-100 dark:bg-white dark:hover:bg-gray-100' 
                              : 'hover:bg-secondary-foreground/10'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(step);
                          }}
                        >
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </Reorder.Item>
          ))}
          <div className="flex items-center justify-center mt-4 w-full md:w-auto">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={addStep}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </Reorder.Group>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToStep('prev')}
              disabled={!editingStep || steps.findIndex(step => step.id === editingStep.id) === 0}
              className="w-20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Prev
            </Button>

            <span className="text-sm text-muted-foreground">
              {editingStep ? `Step ${steps.findIndex(step => step.id === editingStep.id) + 1} of ${steps.length}` : ''}
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant={editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 
                        ? "default" 
                        : "ghost"}
                      size="sm"
                      onClick={handleNextOrAdd}
                      disabled={!editingStep || (
                        steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 && 
                        !editingStep.description
                      )}
                      className={`w-20 ${
                        editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1
                          ? "bg-primary hover:bg-primary/90"
                          : ""
                      }`}
                    >
                      {editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 ? (
                        <>
                          Add
                          <Plus className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Next
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-2"
                          >
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 && !editingStep.description && (
                  <TooltipContent side="left">
                    Add instructions for this step before creating a new one
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingStep ? `Edit Step ${steps.findIndex(step => step.id === editingStep.id) + 1}` : 'Edit Step'}
            </CardTitle>
          </CardHeader>
          
          <DialogTitle className="sr-only">Configure Step</DialogTitle>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Step Type Selection */}
              <Tabs 
                defaultValue="ai-action" 
                value={editingStep?.isInputStep ? "user-input" : "ai-action"}
                onValueChange={(value: string) => {
                  if (!editingStep) return;
                  const updatedStep = {
                    ...editingStep,
                    isInputStep: value === "user-input",
                    inputType: value === "user-input" ? ('text' as const) : ('none' as const),
                    // Clear substeps when switching to user input
                    substeps: value === "user-input" ? [] : editingStep.substeps
                  };
                  updateEditingStep(updatedStep);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai-action">
                    
                    {editingStep?.isInputStep === false && <CircleCheck className="mr-1 h-4 w-4 text-primary" />}
                    AI Step
                  </TabsTrigger>
                  <TabsTrigger value="user-input">
                    {editingStep?.isInputStep === true && <CircleCheck className="mr-1 h-4 w-4 text-primary" />}
                    User Input Step
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ai-action" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-base">What do you want the AI to do in this step?</Label>
                    <div className="relative">
                      <Textarea
                        id="description"
                        value={editingStep?.description || ""}
                        onChange={(e) => updateEditingStep(editingStep ? { ...editingStep, description: e.target.value } : null)}
                        placeholder="E.g. Collect all customer details from latest order"
                        className=" text-base pr-10"
                        autoFocus
                      />
                      {editingStep?.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={isFormatting}
                                className="absolute bottom-2 right-2 h-8 w-8 hover:bg-secondary"
                                onClick={async () => {
                                  if (!editingStep?.description) return;
                                  setIsFormatting(true);
                                  try {
                                    // Get previous steps up to the current one
                                    const currentStepIndex = steps.findIndex(step => step.id === editingStep.id);
                                    const previousSteps = steps.slice(0, currentStepIndex);
                                    
                                    const response = await fetch('/api/format-text', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ 
                                        text: editingStep.description,
                                        previousSteps: previousSteps.map(step => ({
                                          title: step.title,
                                          description: step.description,
                                          isInputStep: step.isInputStep,
                                          inputType: step.inputType,
                                          inputPrompt: step.inputPrompt
                                        }))
                                      }),
                                    });
                                    const data = await response.json();
                                    if (data.formattedText) {
                                      updateEditingStep(editingStep ? {
                                        ...editingStep,
                                        description: data.formattedText
                                      } : null);
                                    }
                                  } catch (error) {
                                    console.error('Failed to format text:', error);
                                  } finally {
                                    setIsFormatting(false);
                                  }
                                }}
                              >
                                {isFormatting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Wand2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Rewrite instructions with AI</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={generateSubsteps}
                    disabled={isGenerating || !editingStep?.description}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Generate plan with AI
                  </Button>
                </TabsContent>
                <TabsContent value="user-input" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateEditingStep(editingStep ? {
                        ...editingStep,
                        inputType: 'text'
                      } : null)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        editingStep?.inputType === 'text'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className={`w-6 h-6 ${
                            editingStep?.inputType === 'text'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div className="font-medium text-sm">Text Input</div>
                        <div className="text-xs text-muted-foreground">
                          User provides text-based information
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => updateEditingStep(editingStep ? {
                        ...editingStep,
                        inputType: 'file'
                      } : null)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        editingStep?.inputType === 'file'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className={`w-6 h-6 ${
                            editingStep?.inputType === 'file'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="font-medium text-sm">File Upload</div>
                        <div className="text-xs text-muted-foreground">
                          User uploads a file
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">Instructions for user</Label>
                    <Input
                      id="inputPrompt"
                      value={editingStep?.inputPrompt || ''}
                      onChange={(e) => updateEditingStep(editingStep ? {
                        ...editingStep,
                        inputPrompt: e.target.value,
                        description: e.target.value // Keep description in sync with input prompt
                      } : null)}
                      placeholder={editingStep?.inputType === 'text' 
                        ? "Tell user what to do. (e.g., 'Enter your order URL')..."
                        : "Tell user what to do. (e.g., 'Upload your receipt')..."
                      }
                      className="text-base"
                      autoFocus
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {!editingStep?.isInputStep && (
                <>
                  {/* Add Substep Button */}
                  <Button
                    variant="ghost"
                    onClick={addSubstep}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add new substep</span>
                  </Button>

                  {editingStep && editingStep.substeps && editingStep.substeps.length > 0 && (
                    <div className="space-y-2">
                      {editingStep.substeps.map((substep, index) => (
                        <div key={substep.id} className="flex items-center gap-2 group">
                          <div className="flex-1 bg-secondary p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="text-sm flex-1">
                                {substep.isEditing ? (
                                  <Input
                                    value={substep.title}
                                    onChange={(e) => updateSubstep(substep.id, 'title', e.target.value)}
                                    onBlur={() => {
                                      setEditingStep(prev => prev ? {
                                        ...prev,
                                        substeps: prev.substeps.map(s => 
                                          s.id === substep.id ? { ...s, isEditing: false } : s
                                        )
                                      } : null)
                                    }}
                                    autoFocus
                                    className="min-w-0"
                                  />
                                ) : (
                                  <div 
                                    onClick={() => {
                                      setEditingStep(prev => prev ? {
                                        ...prev,
                                        substeps: prev.substeps.map(s => 
                                          s.id === substep.id ? { ...s, isEditing: true } : s
                                        )
                                      } : null)
                                    }}
                                    className="cursor-pointer hover:opacity-70"
                                  >
                                    {index + 1}. {substep.title}
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSubstep(substep.id)}
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Delete Step Button and Save Status */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleDeleteStep}
                className="flex items-center gap-2 text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete Step</span>
              </Button>
              {saveStatus && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CircleCheck className="h-4 w-4" />
                      <span>Saved</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          {/* Footer Navigation */}
          <div className="hidden md:flex items-center justify-between border-t p-4">
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToStep('prev')}
                disabled={!editingStep || steps.findIndex(step => step.id === editingStep.id) === 0}
                className="flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Previous Step
              </Button>
            </div>

            <div className="flex-1 text-center">
              <span className="text-sm text-muted-foreground">
                {editingStep ? `Step ${steps.findIndex(step => step.id === editingStep.id) + 1} of ${steps.length}` : ''}
              </span>
            </div>

            <div className="flex-1 flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant={editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 
                          ? "default" 
                          : "ghost"}
                        size="sm"
                        onClick={handleNextOrAdd}
                        disabled={!editingStep || (
                          steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 && 
                          !editingStep.description
                        )}
                        className={`flex items-center gap-2 ${
                          editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1
                            ? "bg-primary hover:bg-primary/90"
                            : ""
                        }`}
                      >
                        {editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 ? (
                          <>
                            Add New Step
                            <Plus className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Next Step
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {editingStep && steps.findIndex(step => step.id === editingStep.id) === steps.length - 1 && !editingStep.description && (
                    <TooltipContent side="top">
                      Add instructions for this step before creating a new one
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showConfirmDialog && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Replace Existing Detailed Steps?</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <p>This will replace all existing detailed steps. Do you want to continue?</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmReplace}>
                Replace Steps
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Step</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <p>Are you sure you want to delete this step? This action cannot be undone.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

