"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion, Reorder } from "framer-motion"
import { Plus, Trash2, Play, Wand2, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { debounce } from "lodash"

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
}

interface WorkflowBuilderProps {
  initialSteps?: WorkflowStep[]
}

export default function WorkflowBuilder({ initialSteps = [] }: WorkflowBuilderProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps)
  const [editingTitle, setEditingTitle] = useState(false)
  const [workflowTitle, setWorkflowTitle] = useState("Workflow Builder")
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [generatedSubsteps, setGeneratedSubsteps] = useState<Substep[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null)

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `${Date.now()}`,
      title: `Step ${steps.length + 1}`,
      description: ``,
      substeps: [],
    }
    setSteps([...steps, newStep])
  }

  const openEditDialog = (step: WorkflowStep) => {
    setEditingStep({ ...step, substeps: [...step.substeps] })
    setIsDialogOpen(true)
  }

  const handleDeleteStep = () => {
    setShowDeleteConfirm(true)
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
        id: `${Date.now()}`,
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
      setEditingStep({
        ...editingStep,
        substeps: editingStep.substeps.filter((substep) => substep.id !== substepId),
      })
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
        
        if (editingStep.substeps.length > 0) {
          setGeneratedSubsteps(newSubsteps)
          setShowConfirmDialog(true)
        } else {
          setEditingStep({
            ...editingStep,
            substeps: newSubsteps,
          })
        }
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
      setSaveStatus('saving')
      setSteps(steps.map((step) => (step.id === updatedStep.id ? updatedStep : step)))
      setTimeout(() => {
        setSaveStatus('saved')
        setTimeout(() => {
          setSaveStatus(null)
        }, 2000)
      }, 500)
    }, 500),
    [steps]
  )

  const updateEditingStep = (updatedStep: WorkflowStep | null) => {
    setEditingStep(updatedStep)
    if (updatedStep) {
      autoSave(updatedStep)
    }
  }

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
        <Button variant="default" disabled={steps.length === 0}>
          <Play className="h-4 w-4" /> Run
        </Button>
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
        <Reorder.Group axis="x" values={steps} onReorder={setSteps} className="flex space-x-8 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <Reorder.Item key={step.id} value={step}>
              <div className="relative">
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
                    className={`w-72 h-32 cursor-pointer mt-4 ${
                      !step.description 
                        ? 'border-red-200 dark:border-red-900' 
                        : ''
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-sm text-gray-500 truncate">{step.title}</h3>
                        <p className={`font-semibold ${
                          !step.description 
                            ? 'text-red-500 italic' 
                            : ''
                        } line-clamp-2`}>
                          {step.description || 'Missing instructions'}
                        </p>
                      </div>
                      <div>
                        {step.substeps.length > 0 && (
                          <p className="text-xs text-gray-400 mb-2">Substeps: {step.substeps.length}</p>
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full py-4 transition-colors hover:bg-secondary-foreground/10"
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
          <div className="flex items-center justify-center mt-4">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <DialogTitle className="text-xl">Step Configuration</DialogTitle>
            {saveStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {saveStatus === 'saving' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <div className="h-4 w-4 text-green-500">✓</div>
                    Saved
                  </>
                )}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="description" className="block text-sm font-medium mb-2">
                Describe what you want the AI to do in this step
              </Label>
              <Textarea
                id="description"
                value={editingStep?.description || ""}
                onChange={(e) => updateEditingStep(editingStep ? { ...editingStep, description: e.target.value } : null)}
                placeholder="Example: 'Search for recent news articles about AI'"
                className="min-h-[120px]"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={generateSubsteps}
              disabled={!editingStep?.description || isGenerating}
              className="w-full"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate plan with AI"}
            </Button>

            {editingStep?.substeps && (
              <div>
                <div className="space-y-2 mt-2">
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

                <Button
                  type="button"
                  disabled={!editingStep?.description || isGenerating}
                  variant="ghost"
                  onClick={addSubstep}
                  className="mt-3 text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new substep
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-start mt-6 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={handleDeleteStep} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Step
            </Button>
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

