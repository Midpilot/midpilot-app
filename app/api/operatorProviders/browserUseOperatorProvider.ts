// File: app/api/operatorProviders/browserUseOperatorProvider.ts
// BrowserUseOperatorProvider: Implements integration with browser-use as an operator.
// This is the simplest integration following the browser-use docs.
// It calls the REST endpoints exposed by a hosted browser-use service.
// For this implementation, we use the global fetch (available in Next.js).

const BrowserUseOperatorProvider = {
    createSession: async (timezone?: string) => {
      const serviceUrl = process.env.BROWSER_USE_SERVICE_URL;
      if (!serviceUrl) {
        throw new Error("BROWSER_USE_SERVICE_URL is not defined");
      }
      const response = await fetch(`${serviceUrl}/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      });
      if (!response.ok) {
        throw new Error("Failed to create session via browser-use operator");
      }
      const session = await response.json();
      return session;
    },
    getDebugUrl: async (sessionId: string) => {
      const serviceUrl = process.env.BROWSER_USE_SERVICE_URL;
      if (!serviceUrl) {
        throw new Error("BROWSER_USE_SERVICE_URL is not defined");
      }
      const response = await fetch(`${serviceUrl}/session/${sessionId}/debug`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error("Failed to retrieve debug URL from browser-use operator");
      }
      const data = await response.json();
      return data.debugUrl;
    },
  };
  
  export default BrowserUseOperatorProvider;