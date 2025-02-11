// File: app/api/session/status/route.ts

import { NextResponse } from 'next/server';
import { getOperatorProvider } from '../../operatorProvider';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new NextResponse('Session ID is required', { status: 400 });
  }

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendError = async (message: string) => {
    try {
      const errorEvent = {
        type: 'error',
        message,
        timestamp: new Date().toISOString(),
      };
      await writer.write(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
    } catch (error) {
      // Ignore write errors when the connection is closed
      if (error instanceof Error && error.name !== 'ResponseAborted') {
        console.error('Error sending error message:', error);
      }
    }
  };

  const intervalId = setInterval(async () => {
    try {
      const provider = await getOperatorProvider();
      if (!provider.getTaskStatus) {
        await sendError('Task status provider not available');
        clearInterval(intervalId);
        writer.close().catch(() => {}); // Ignore close errors
        return;
      }

      const session = await provider.getTaskStatus(sessionId);
      if (!session) {
        await sendError('Session not found');
        clearInterval(intervalId);
        writer.close().catch(() => {}); // Ignore close errors
        return;
      }

      await writer.write(encoder.encode(`data: ${JSON.stringify(session)}\n\n`));
      
      if (session.status === 'finished' || session.status === 'failed') {
        if (provider.endSession) {
          try {
            await provider.endSession(sessionId);
          } catch (endError) {
            // Only log non-abort errors
            if (endError instanceof Error && endError.name !== 'ResponseAborted') {
              console.error('Error ending session:', endError);
              await sendError('Failed to end session properly');
            }
          }
        }
        clearInterval(intervalId);
        writer.close().catch(() => {}); // Ignore close errors
      }
    } catch (error) {
      // Only log non-abort errors
      if (error instanceof Error && error.name !== 'ResponseAborted') {
        console.error('Error polling session status:', error);
        await sendError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
      clearInterval(intervalId);
      writer.close().catch(() => {}); // Ignore close errors
    }
  }, 1000);

  // Handle premature client disconnection
  request.signal.addEventListener('abort', () => {
    clearInterval(intervalId);
    writer.close().catch(() => {}); // Ignore close errors
  });

  return new NextResponse(stream.readable, { headers });
}