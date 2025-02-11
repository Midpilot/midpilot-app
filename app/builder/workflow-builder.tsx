"use client"

import type React from "react"
import { useState } from "react"
import { motion, Reorder } from "framer-motion"
import { Plus, Trash2, Play, Wand2, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Substep {
  id: string
  title: string
  description: string
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  substeps: Substep[]
}

export default function WorkflowBuilder() {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: "1", title: "Step 1", description: "Description for Step 1", substeps: [] },
    { id: "2", title: "Step 2", description: "Description for Step 2", substeps: [] },
    { id: "3", title: "Step 3", description: "Description for Step 3", substeps: [] },
  ])
  const [editingTitle, setEditingTitle] = useState(false)
  const [workflowTitle, setWorkflowTitle] = useState("Workflow Builder")
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [generatedSubsteps, setGeneratedSubsteps] = useState<Substep[]>([])

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: `${Date.now()}`,
      title: `Step ${steps.length + 1}`,
      description: `Description for Step ${steps.length + 1}`,
      substeps: [],
    }
    setSteps([...steps, newStep])
  }

  const openEditDialog = (step: WorkflowStep) => {
    setEditingStep({ ...step, substeps: [...step.substeps] })
    setIsDialogOpen(true)
  }

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingStep) {
      setSteps(steps.map((step) => (step.id === editingStep.id ? editingStep : step)))
      setIsDialogOpen(false)
    }
  }

  const handleDeleteStep = () => {
    if (editingStep) {
      setSteps(steps.filter((step) => step.id !== editingStep.id))
      setIsDialogOpen(false)
    }
  }

  const addSubstep = () => {
    if (editingStep) {
      const newSubstep: Substep = {
        id: `${Date.now()}`,
        title: `Substep ${editingStep.substeps.length + 1}`,
        description: `Description for Substep ${editingStep.substeps.length + 1}`,
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
      console.error('Failed to generate substeps:', error)
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
        <Button variant="default">
          <Play className=" h-4 w-4" /> Run
        </Button>
      </div>
      <div className="mb-4">
        <Button variant="outline" onClick={addStep}>
          <Plus className="mr-2 h-4 w-4" /> Add Step
        </Button>
      </div>
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
                <Card className="w-48 cursor-pointer mt-4">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{step.description}</p>
                    {step.substeps.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">Substeps: {step.substeps.length}</p>
                    )}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingStep?.title || ""}
                  onChange={(e) => setEditingStep((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <div className="col-span-3 space-y-2">
                  <Textarea
                    id="description"
                    value={editingStep?.description || ""}
                    onChange={(e) => setEditingStep((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateSubsteps}
                    disabled={!editingStep?.description || isGenerating}
                    className="w-full"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate Substeps with AI"}
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Substeps</h4>
                <Button type="button" onClick={addSubstep} className="mb-2">
                  <Plus className="mr-2 h-4 w-4" /> Add Substep
                </Button>
                <Accordion type="multiple" className="w-full">
                  {editingStep?.substeps.map((substep, index) => (
                    <AccordionItem value={substep.id} key={substep.id}>
                      <AccordionTrigger className="text-sm">{substep.title}</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor={`substep-title-${substep.id}`} className="text-right text-xs">
                              Title
                            </Label>
                            <Input
                              id={`substep-title-${substep.id}`}
                              value={substep.title}
                              onChange={(e) => updateSubstep(substep.id, "title", e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor={`substep-description-${substep.id}`} className="text-right text-xs">
                              Description
                            </Label>
                            <Textarea
                              id={`substep-description-${substep.id}`}
                              value={substep.description}
                              onChange={(e) => updateSubstep(substep.id, "description", e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => deleteSubstep(substep.id)}
                            className="mt-2"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Substep
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button type="button" variant="destructive" onClick={handleDeleteStep}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Step
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Existing Substeps?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <p>This will replace all existing substeps. Do you want to continue?</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReplace}>
              Replace Substeps
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

