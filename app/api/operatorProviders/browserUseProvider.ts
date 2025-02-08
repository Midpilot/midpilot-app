// BrowserUseProvider: Implementation that leverages Browser Use as default.
import Browserbase from '@browserbasehq/sdk';

const BrowserUseProvider = {
  createSession: async (timezone?: string) => {
    const bb = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY!,
    });
    const browserSettings: { context?: { id: string } } = {};
    if (process.env.BROWSERBASE_CONTEXT_ID) {
      browserSettings.context = { id: process.env.BROWSERBASE_CONTEXT_ID };
    }
    
    console.log('Creating session using Browser Use default with timezone:', timezone);
    // You can add additional logic here if Browser Use requires any adjustments.
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserSettings,
      keepAlive: true,
      // You can reuse the getClosestRegion function if needed or override it
      region: timezone ? "ap-southeast-1" : "us-west-2", // Simplified example
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

export default BrowserUseProvider; 