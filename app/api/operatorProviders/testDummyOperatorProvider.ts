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

  listTasks: async (page: number = 1, limit: number = 10) => {
    // Create a larger set of dummy tasks for pagination testing
    const allDummyTasks = Array.from({ length: 25 }, (_, i) => ({
      ...DummyTaskResponses[0],
      id: `dummy-task-${i + 1}`,
      task: `Dummy Task ${i + 1}`,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      status: i % 3 === 0 ? 'finished' : i % 3 === 1 ? 'running' : 'failed'
    }));

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTasks = allDummyTasks.slice(start, end);

    return {
      tasks: paginatedTasks,
      total_count: allDummyTasks.length,
      total_pages: Math.ceil(allDummyTasks.length / limit),
      page,
      limit
    };
  }
};

export default TestDummyOperatorProvider; 