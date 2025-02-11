# Future Plans and Planned Changes

This document outlines the planned changes and future enhancements for the Midpilot platform. It focuses on upcoming integrations, improvements to the OperatorProvider abstraction, and overall system modularity.

---

## Immediate Integration Focus: Browser Use Cloud API

- **Objective:**  
  Integrate Browser Use via their Cloud API (refer to [Browser Use Quickstart](https://docs.browser-use.com/cloud/quickstart)) in a way similar to the current Open‑Operator implementation.

- **Key Steps:**
  1. **Review Documentation:**  
     Understand the required endpoints, HTTP methods, request payloads, response formats, and any authentication requirements.
  
  2. **Implement Provider:**
     - Create a new file (e.g., `app/api/operatorProviders/browserUseOperatorProvider.ts`) that implements:
       - `createSession`:  
         - Retrieves the service URL from `BROWSER_USE_SERVICE_URL`.
         - Sends a POST request to `/session/create` with the appropriate parameters.
         - Returns the session ID or throws a meaningful error on failure.
       - `getDebugUrl`:  
         - Sends a GET request to `/session/{sessionId}/debug` and returns the debug URL.
       - *(Optional)* `endSession`:  
         - If supported, implement termination of sessions.
  
  3. **Retain Provider Switching:**  
     Ensure the factory function (`app/api/operatorProvider.ts`) dynamically loads the Browser Use provider when `OPERATOR_PROVIDER` is set to `"browser-use"`.

  4. **Testing and Validation:**  
     - Run local tests by setting the appropriate environment variables.
     - Validate that sessions are created, debug URLs are retrieved, and errors are handled properly.

---

## Longer Term Enhancements

- **Formal A/B Testing Framework:**
  - Develop a robust mechanism to switch between operator providers using detailed analytics rather than simple environment toggles.
  
- **Extended Modularity:**
  - Expand the virtual browser provider layer to allow seamless swapping, enabling experimentation with alternatives like [steel.dev](https://steel.dev).

- **Shared Contracts and Schemas:**
  - In the future, extract any shared API contracts or utility code into a `packages/` directory for tighter integration between the Node.js and (potentially) Python projects.

- **CI/CD Pipeline Enhancements:**
  - Adjust and expand CI/CD configurations to run tests and deployments for any new provider integrations and cross-project dependencies.

---

## Conclusion

These planned changes aim to extend our system's flexibility and modularity. The immediate goal is to integrate the Browser Use Cloud API so we can switch between operator providers with minimal impact. Longer term, we plan to invest in formalized testing frameworks and more advanced modularity options.

*This future plan serves as a roadmap to guide upcoming development efforts and ensure a smooth evolution of the Midpilot platform.* 