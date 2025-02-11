import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { description } = await req.json()

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that breaks down tasks into clear, actionable substeps. Return only the substeps as a JSON array of strings, with each string being a concise substep."
        },
        {
          role: "user",
          content: `Break down this task into 3-5 clear substeps: "${description}"`
        }
      ],
      response_format: { type: "json_object" },
    })

    const response = completion.choices[0].message.content
    const parsedResponse = JSON.parse(response || '{"substeps": []}')

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('Error generating substeps:', error)
    return NextResponse.json(
      { error: 'Failed to generate substeps' },
      { status: 500 }
    )
  }
} 