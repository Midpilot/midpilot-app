// OpenOperatorProvider: Wraps the existing open-operator fork implementation.
import Browserbase from '@browserbasehq/sdk';
import { getClosestRegion } from '../../lib/getClosestRegion'; // Reuse your existing helper if possible

const OpenOperatorProvider = {
  createSession: async (timezone?: string) => {
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
};

export default OpenOperatorProvider; 