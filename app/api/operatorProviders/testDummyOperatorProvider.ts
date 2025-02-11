/**
 * TestDummyOperatorProvider
 *
 * A dummy operator provider implementation for testing purposes.
 *
 * This provider simulates a Browser Use task by preparing an ordered list of
 * get-task responses (which follow the structure defined by the Browser Use API):
 *
 * {
 *    "id": "<string>",
 *    "task": "<string>",
 *    "live_url": "<string>",
 *    "output": "<string>",
 *    "status": "created",
 *    "created_at": "2023-11-07T05:31:56Z",
 *    "finished_at": "2023-11-07T05:31:56Z",
 *    "steps": [
 *      {
 *         "id": "<string>",
 *         "step": 123,
 *         "evaluation_previous_goal": "<string>",
 *         "next_goal": "<string>"
 *      }
 *    ]
 * }
 *
 * Over an 8‑second simulated session, the responses progress through:
 *   created  -> running  -> paused  -> running  -> stopped  -> failed  -> finished
 *
 * Each call to getTaskStatus() returns the status field from the next response
 * in the list.
 */

import { BrowserSession } from "../operatorProvider";
import dummySteps from './dummySteps.json';

interface DummyTaskResponse {
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

const DummyTaskResponses: DummyTaskResponse[] = dummySteps as DummyTaskResponse[];
let currentTaskIndex = 0;

const TestDummyOperatorProvider = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createSession: async (timezone?: string, goal?: string) => {
    currentTaskIndex = 0;
    return { id: DummyTaskResponses[0].id };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDebugUrl: async (sessionId: string) => {
    return DummyTaskResponses[0].live_url;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endSession: async (sessionId: string) => {
    currentTaskIndex = 0;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTaskStatus: async (sessionId: string): Promise<BrowserSession> => {
    const response = DummyTaskResponses[currentTaskIndex];
    
    if (currentTaskIndex < DummyTaskResponses.length - 1) {
      currentTaskIndex++;
    }

    return response;
  },
};

export default TestDummyOperatorProvider; 