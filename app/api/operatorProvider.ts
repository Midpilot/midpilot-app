// OperatorProvider Interface and Factory Function
export type OperatorProvider = {
  createSession: (timezone?: string) => Promise<{ id: string }>;
  getDebugUrl: (sessionId: string) => Promise<string>;
  endSession?: (sessionId: string) => Promise<void>;
};

// Factory function to choose the provider based on environment variable.
export async function getOperatorProvider(): Promise<OperatorProvider> {
  const providerChoice = process.env.OPERATOR_PROVIDER;
  
  if (providerChoice === 'browser-use') {
    return (await import('./operatorProviders/browserUseOperatorProvider')).default;
  } else {
    // Fallback to open-operator by default.
    return (await import('./operatorProviders/openOperatorProvider')).default;
  }
} 