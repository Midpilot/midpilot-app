// File: app/api/operatorProviders/browserUseOperatorProvider.ts
// BrowserUseOperatorProvider: Implements integration with browser-use as an operator.
// This is the simplest integration following the browser-use docs.
// It calls the REST endpoints exposed by a hosted browser-use service.
// For this implementation, we use the global fetch (available in Next.js).

import { BrowserSession } from "../operatorProvider";

/**
 * BrowserUseOperatorProvider
 *
 * Implements Browser Use Cloud API integration (per https://docs.browser-use.com/cloud/implementation#basic-implementation)
 * and conforms to our OperatorProvider interface:
 *   - createSession(timezone?: string): Promise<{ id: string }>
 *   - getDebugUrl(sessionId: string): Promise<string>
 *   - endSession?(sessionId: string): Promise<void>
 *
 * Environment Variables:
 * - BROWSER_USE_API_KEY: The API key for authentication.
 * - BROWSER_USE_SERVICE_URL: Base URL for the Browser Use Cloud API (defaults to "https://api.browser-use.com/api/v1").
 */

const browserUseBaseUrl = process.env.BROWSER_USE_SERVICE_URL || "https://api.browser-use.com/api/v1";
const browserUseApiKey = process.env.BROWSER_USE_API_KEY;
if (!browserUseApiKey) {
  throw new Error("BROWSER_USE_API_KEY is not set.");
}

// Helper: simple delay function.
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const BrowserUseOperatorProvider = {
  createSession: async (timezone?: string, goal?: string) => {
    // For browser-use, the goal is the important parameter.
    // When provided, ignore timezone (which only confuses the LLM).
    console.log("Creating session with goal:", goal);
    const taskDescription = goal;
    
    const response = await fetch(`${browserUseBaseUrl}/run-task`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${browserUseApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ task: taskDescription })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to create session: ${response.status} ${errorDetails}`);
    }

    const data = await response.json();
    if (!data.id) {
      throw new Error(`Session creation failed: ${data.error || 'Missing session id in response'}`);
    }
    return { id: data.id };
  },

  getDebugUrl: async (sessionId: string) => {
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${browserUseBaseUrl}/task/${sessionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${browserUseApiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.live_url) {
          return data.live_url;
        }
      } else if (response.status !== 404) {
        const errorDetails = await response.text();
        throw new Error(`Error fetching debug URL: ${response.status} ${errorDetails}`);
      }
      // Wait and retry.
      await delay(700);
    }

    throw new Error("Timeout waiting for debug URL from Browser Use operator");
  },

  endSession: async (sessionId: string) => {
    const response = await fetch(`${browserUseBaseUrl}/stop-task`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${browserUseApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ task_id: sessionId })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to end session: ${response.status} ${errorDetails}`);
    }
  },
  
  // Updated getTaskStatus to use the "Get Task" endpoint and match the expected interface
  getTaskStatus: async (sessionId: string): Promise<BrowserSession> => {
    const url = `${browserUseBaseUrl}/task/${sessionId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${browserUseApiKey}`
      }
    });
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error fetching task info: ${response.status} ${errorDetails}`);
    }
    const data = await response.json();
    
    // Convert the response to match the BrowserSession interface
    return {
      id: data.id,
      task: data.task,
      live_url: data.live_url,
      output: data.output || '',
      status: data.status,
      created_at: data.created_at,
      finished_at: data.finished_at,
      steps: data.steps || [] // Ensure steps is always an array
    };
  }
};

export default BrowserUseOperatorProvider;