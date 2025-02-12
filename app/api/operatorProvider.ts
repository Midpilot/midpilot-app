// File: app/api/operatorProvider.ts

export type OperatorProvider = {
    createSession: (timezone?: string, goal?: string) => Promise<{ id: string }>;
    getDebugUrl: (sessionId: string) => Promise<string>;
    endSession?: (sessionId: string) => Promise<void>;
    // Update return type to BrowserSession
    getTaskStatus?: (sessionId: string) => Promise<BrowserSession>;
    // Add new method for listing tasks
    listTasks?: (page?: number, limit?: number) => Promise<{
      tasks: BrowserSession[];
      total_count: number;
      total_pages: number;
      page: number;
      limit: number;
    }>;
  };
  
  // Factory function to choose the provider based on environment variable.
  export async function getOperatorProvider(): Promise<OperatorProvider> {
    const providerChoice = process.env.OPERATOR_PROVIDER;
    
    if (providerChoice === 'browser-use') {
      return (await import('./operatorProviders/browserUseOperatorProvider')).default;
    } else if (providerChoice === 'test-dummy') {
      return (await import('./operatorProviders/testDummyOperatorProvider')).default;
    } else {
      // Fallback to open-operator by default.
      return (await import('./operatorProviders/openOperatorProvider')).default;
    }

  } 

  export interface BrowserSession {
    id: string;
    task: string;
    live_url: string;
    output: string;
    status: string;
    created_at: string;
    finished_at: string;
    steps: {
      id: string;
      step: number;
      evaluation_previous_goal: string;
      next_goal: string;
    }[];
  }

  // New helper function to subscribe to task status updates.
  // This function periodically polls the operator's getTaskStatus method
  // and calls the provided onStatusChange callback whenever a new status is detected.
  export async function subscribeTaskStatus(
    sessionId: string,
    onStatusChange: (status: BrowserSession) => void,
    interval: number = 3000
  ): Promise<() => void> {
    let currentStatus: BrowserSession | null = null;
    const operator = await getOperatorProvider();
    const timer = setInterval(async () => {
      if (operator.getTaskStatus) {
        try {
          const status = await operator.getTaskStatus(sessionId);
          if (status !== currentStatus) {
            currentStatus = status;
            onStatusChange(status);
          }
        } catch (error) {
          console.error("Error polling task status:", error);
        }
      }
    }, interval);
    return () => clearInterval(timer);
  }

  // New helper function to run the agent flow (i.e. produce step events)
  // and delegate the polling logic appropriate to the provider.
//   export async function runAgentFlow(
//     goal: string,
//     sessionId: string,
//     onStep: (step: BrowserStep) => void
//   ): Promise<void> {
//     const providerChoice = process.env.OPERATOR_PROVIDER;
    
//     // For browser-use, poll the full task endpoint for richer info.
//     if (providerChoice === "browser-use") {
//       let stepNumber = 1;
//       let finished = false;
//       let lastOutput = "";
//       while (!finished) {
//         try {
//           const browserUseBaseUrl = process.env.BROWSER_USE_SERVICE_URL || "https://api.browser-use.com/api/v1";
//           const apiKey = process.env.BROWSER_USE_API_KEY;
//           const response = await fetch(`${browserUseBaseUrl}/task/${sessionId}`, {
//             method: "GET",
//             headers: {
//               "Authorization": `Bearer ${apiKey}`
//             }
//           });
//           if (!response.ok) {
//             const errorDetails = await response.text();
//             throw new Error(`Error fetching task info: ${response.status} ${errorDetails}`);
//           }
//           const taskData = await response.json();

//           // Only fire a new step if taskData.output exists and has changed.
//           if (taskData.output && taskData.output !== lastOutput) {
//             const step: BrowserStep = {
//               text: taskData.output,
//               reasoning: "", // Additional fields can be mapped here.
//               tool: taskData.status, // Optionally map the raw status to a normalized tool.
//               instruction: "",
//               stepNumber,
//             };
//             onStep(step);
//             lastOutput = taskData.output;
//             stepNumber++;
//           } else {
//             console.log("No new output. Current status:", taskData.status);
//           }
//           if (taskData.status === "finished" || taskData.status === "failed") {
//             finished = true;
//             // Optionally, emit the final step if needed.
//             if (taskData.output && taskData.output !== lastOutput) {
//               const finalStep: BrowserStep = {
//                 text: taskData.output,
//                 reasoning: "",
//                 tool: taskData.status,
//                 instruction: "",
//                 stepNumber,
//               };
//               onStep(finalStep);
//             }
//           }
//         } catch (err) {
//           console.error("Error in runAgentFlow for browser-use:", err);
//           finished = true;
//         }
//         // Wait before polling again.
//         await new Promise((resolve) => setTimeout(resolve, 5000));
//       }
//     } else {
//       // For open-operator: Use the agent endpoint flow.
//       let stepNumber = 1;
//       // Start the agent.
//       const startResponse = await fetch("/api/agent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           goal,
//           sessionId,
//           action: "START",
//         }),
//       });
//       const startData = await startResponse.json();
//       if (startData.success) {
//         const normalizedStep: BrowserStep = {
//           text: startData.result.text || "No text",
//           reasoning: startData.result.reasoning || "",
//           tool: startData.result.tool || "OBSERVE",
//           instruction: startData.result.instruction || "",
//           stepNumber: stepNumber,
//         };
//         onStep(normalizedStep);
//         while (true) {
//           const nextResponse = await fetch("/api/agent", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               goal,
//               sessionId,
//               previousSteps: [], // Optionally pass previous steps.
//               action: "GET_NEXT_STEP",
//             }),
//           });
//           const nextData = await nextResponse.json();
//           if (!nextData.success) break;
//           stepNumber++;
//           const nextStep: BrowserStep = {
//             text: nextData.result.text || "No text",
//             reasoning: nextData.result.reasoning || "",
//             tool: nextData.result.tool || "OBSERVE",
//             instruction: nextData.result.instruction || "",
//             stepNumber,
//           };
//           onStep(nextStep);
//           if (nextData.done || nextData.result.tool === "CLOSE") break;
//           const execResponse = await fetch("/api/agent", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               sessionId,
//               step: nextData.result,
//               action: "EXECUTE_STEP",
//             }),
//           });
//           const execData = await execResponse.json();
//           if (execData.done) break;
//         }
//       }
//     }
//   }
