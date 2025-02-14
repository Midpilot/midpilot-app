// OpenOperatorProvider: Wraps the existing open-operator fork implementation.
import Browserbase from '@browserbasehq/sdk';
import { getClosestRegion } from '../../lib/getClosestRegion'; // Reuse your existing helper if possible

const OpenOperatorProvider = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createSession: async (timezone?: string, goal?: string) => {
    const bb = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY!,
    });
    const browserSettings: { context?: { id: string } } = {};
    if (process.env.BROWSERBASE_CONTEXT_ID) {
      browserSettings.context = { id: process.env.BROWSERBASE_CONTEXT_ID };
    }

    console.log('Creating session using open-operator fork with timezone:', timezone);
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserSettings,
      keepAlive: true,
      region: getClosestRegion(timezone),
    });
    return session;
  },
  getDebugUrl: async (sessionId: string) => {
    const bb = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY!,
    });
    const session = await bb.sessions.debug(sessionId);
    return session.debuggerFullscreenUrl;
  },
  endSession: async (sessionId: string) => {
    const bb = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY!,
    });
    // If open-operator has native status endpoints or streaming,
    // implement it here. Otherwise, return a default status.
    await bb.sessions.update(sessionId, {
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      status: "REQUEST_RELEASE",
    });
  },
  // Optional: simulate or proxy status updates if available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTaskStatus: async (sessionId: string) => {
    // If open-operator has native status endpoints or streaming,
    // implement it here. For now, return a basic BrowserStep
    return {
      text: "Task in progress",
      status: "running"
    };
  }
};

export default OpenOperatorProvider; 