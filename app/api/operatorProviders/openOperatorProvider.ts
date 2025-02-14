// OpenOperatorProvider: Wraps the existing open-operator fork implementation.
import Browserbase from '@browserbasehq/sdk';
import { BrowserSession } from '../operatorProvider';
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
  getTaskStatus: async (sessionId: string): Promise<BrowserSession> => {
    const bb = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY!,
    });
    
    // Get the session info from Browserbase
    const session = await bb.sessions.retrieve(sessionId);
    
    // Map Browserbase session status to our status format
    let status = "running";
    if (session.status === "COMPLETED") status = "finished";
    else if (session.status === "ERROR") status = "failed";
    
    // Return a properly formatted BrowserSession object
    return {
      id: sessionId,
      task: "Browser session task", // We don't have this info from Browserbase
      live_url: "", // We'll get this from getDebugUrl if needed
      output: "", // We don't have this info from Browserbase
      status,
      created_at: new Date().toISOString(), // Browserbase doesn't expose this
      finished_at: "", // Browserbase doesn't expose this
      steps: [] // We don't track steps in Browserbase
    };
  }
};

export default OpenOperatorProvider; 