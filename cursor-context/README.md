# Cursor Context Documentation

This document provides a complete overview of the system architecture, design decisions, and future plans for our AI agent platform. It is intended to give future agents a full context in one reference.

---

## Overview

Our application (Midpilot) is built as a modular, hybrid system with two primary components:

1. **Midpilot Frontend**  
   - A Next.js/React UI that provides a chat-based interface.
   - Responsible for collecting user input, displaying session details, and allowing users to interact with the agent.

2. **Backend Operator / Agent Provider**  
   - A set of API endpoints that handle session creation, management, and execution of AI-driven browser actions.
   - Uses an **OperatorProvider** abstraction to decouple the frontend from specific operator implementations.

---

## Implemented Features

### OperatorProvider Abstraction

- **OperatorProvider Interface:**  
  Defined in `app/api/operatorProvider.ts` with the following methods:
  - `createSession(timezone?: string): Promise<{ id: string }>`
  - `getDebugUrl(sessionId: string): Promise<string>`
  - `endSession?(sessionId: string): Promise<void>`

- **Provider Implementations:**  
  Two operator implementations are available:
  - **Open-Operator Provider:** Uses our existing open-operator fork integrated with Browserbase.
  - **Browser Use Provider:** Originally designed to use the client's browser, now adapted to run on Browserbase—acting as a virtual browser similar to Open-Operator.

- **Switching Capabilities:**  
  The system allows switching between the two providers by setting environment variables (or using simple percentage-based logic). This isn't a formal A/B testing framework but provides the ability to easily toggle between implementations.

### Virtual Browser Provider

- **Current Setup:**  
  Both operator providers are integrated with **Browserbase** as the virtual browser technology. This abstraction hides the complexities of browser automation from the frontend.

- **API Boundary:**  
  API endpoints (for example, `/api/session/route.ts`) use the OperatorProvider interface to initiate sessions, fetch debug URLs, and end sessions. The frontend remains agnostic to the underlying implementation.

---

## Operator Providers

We currently support two operator providers which allow the AI agent to convert natural language into headless browser actions:

- **Open-operator:**  
  Uses our existing open‑operator fork integrated with Browserbase and Stagehand.
  
- **Browser‑use Operator:**  
  Implements integration with [browser‑use](https://github.com/browser-use/browser-use), which enables AI agents to control the browser via a hosted REST API.
  **Note:** Browser‑use is distinct from Browserbase—the latter provides the virtual browser environment while the former is an operator layer.
  In our implementation, the browser‑use operator calls out to a hosted browser‑use service via REST API (configurable via the `BROWSER_USE_SERVICE_URL` environment variable).

The selection between these operators is managed in our OperatorProvider abstraction. Switch between them by setting the `OPERATOR_PROVIDER` environment variable to either `open-operator` or `browser-use`.

---

## Virtual Browser Providers

- **Browserbase** is our current virtual browser technology. We have integrated both operator providers with Browserbase. In the future, this layer will be modular so that we can experiment with alternatives like [steel.dev](https://steel.dev).

---

## Future Plans

- Develop a more formal A/B testing framework for selecting between operator providers.
- Expand the modularity of the virtual browser provider layer for seamless swapping (e.g., replacing Browserbase with steel.dev).
- Extend the integration with browser‑use to leverage any new features or updates provided by its team.

*Future agents should reference this document to understand the architecture and design decisions behind our operator provider implementations.*

---

## Conclusion

The current system:
- Provides a modular architecture that separates frontend logic from backend operator implementations.
- Offers the flexibility to switch between an open-operator fork and a Browser Use provider.
- Uses Browserbase as the virtual browser technology for both providers.

Future enhancements will formalize testing and extend modularity to easily integrate additional virtual browser providers, such as steel.dev.

*Future agents should reference this document for system context and architectural guidelines.* 