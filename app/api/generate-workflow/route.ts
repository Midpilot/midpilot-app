import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { task } = await req.json()

    if (!task) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that breaks down high-level tasks into a series of main steps. Each step should be clear and actionable. Return the steps as a JSON array of objects, where each object has a title and description. Generate 3-5 main steps."
        },
        {
          role: "user",
          content: `Break down this task into main steps: "${task}"`
        }
      ],
      response_format: { type: "json_object" },
    })

    const response = completion.choices[0].message.content
    const parsedResponse = JSON.parse(response || '{"steps": []}')

    // Transform the steps into the format expected by the workflow builder
    const workflowSteps = parsedResponse.steps.map((step: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      title: step.title,
      description: step.description,
      substeps: []
    }))

    return NextResponse.json({ steps: workflowSteps })
  } catch (error) {
    console.error('Error generating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to generate workflow' },
      { status: 500 }
    )
  }
} 