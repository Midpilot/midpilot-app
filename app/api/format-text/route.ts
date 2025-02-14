import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Step {
  title: string;
  description: string;
  isInputStep: boolean;
  inputType: 'text' | 'file' | 'none';
  inputPrompt?: string;
}

export async function POST(req: Request) {
  try {
    const { text, previousSteps } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Format previous steps context without numbering
    const stepsContext = previousSteps?.length 
      ? `Context from previous steps:\n${previousSteps.map((step: Step) => 
          step.isInputStep 
            ? `${step.inputType === 'file' ? 'File Upload' : 'Text Input'}: ${step.inputPrompt}` 
            : step.description
        ).join('\n')}`
      : '';

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that improves instruction clarity. Your task is to rewrite the given instruction to be clearer and more explicit for an AI to understand. Focus on making the instruction precise and unambiguous. Do not add any step numbers, prefixes, or suffixes. Do not mention 'next step' or add any workflow-related text. Just return the improved instruction text directly."
        },
        {
          role: "user",
          content: stepsContext 
            ? `Using this context:\n${stepsContext}\n\nImprove this instruction:\n${text}`
            : `Improve this instruction:\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const formattedText = completion.choices[0].message.content;

    return NextResponse.json({ formattedText });
  } catch (error) {
    console.error('Error formatting text:', error);
    return NextResponse.json(
      { error: 'Failed to format text' },
      { status: 500 }
    );
  }
} 