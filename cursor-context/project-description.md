# Project Description

This document provides a complete overview of our AI agent platform's architecture and design decisions. It is intended to serve as a full technical reference for developers and LLMS interacting with the code.

---

## Overview

Our application, **Midpilot**, is built as a modular, hybrid system with two primary components:

1. **Midpilot Frontend**
   - A Next.js/React UI that provides a chat-based interface.
   - Responsible for collecting user input, displaying session details, and allowing users to interact with the agent.

2. **Backend Operator / Agent Provider**
   - A set of API endpoints that handle session creation, management, and execution of AI-driven browser actions.
   - Uses an **OperatorProvider** abstraction to decouple the frontend from specific operator implementations.

---

## Implemented Features

### OperatorProvider Abstraction

- **Interface Definition:**
  - Located in `app/api/operatorProvider.ts`
  - Methods include:
    - `createSession(timezone?: string): Promise<{ id: string }>`
    - `getDebugUrl(sessionId: string): Promise<string>`
    - *(Optional)* `endSession(sessionId: string): Promise<void>`

- **Provider Implementations:**
  - **Open-Operator Provider:**  
    Uses our existing open‑operator fork integrated with Browserbase and Stagehand.
  - **Browser Use Operator:**  
    Intended to integrate with browser‑use (which was initially adapted to run on Browserbase), providing similar functionality as Open‑Operator. Its implementation placeholders are found under `app/api/operatorProviders/browserUseOperatorProvider.ts`.

---

## API Boundary

- **API Routes:**
  - Defined in files such as `app/api/session/route.ts` and `app/api/agent/route.ts`
  - These endpoints use the OperatorProvider abstraction to create sessions, retrieve debug URLs, and, possibly, end sessions.

- **Frontend Integration:**
  - The Next.js UI is agnostic to the underlying operator implementation.
  - The `OperatorProvider` abstraction allows seamless switching between provider implementations via environment variables (e.g., `OPERATOR_PROVIDER`).

---

## Repository Context

- This project's code includes a Next.js/React frontend (in `app/`) and a set of API endpoints.
- The OperatorProvider implementations reference external services such as Browserbase and (planned) Browser Use API.
- The system is designed to allow flexibility in choosing the operator backend without modifying frontend logic.

*This detailed project description is intended to give full context for working with and extending the codebase.* 