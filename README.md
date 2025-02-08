# Open Operator

> [!WARNING]
> This is simply a proof of concept.
> Browserbase aims not to compete with web agents, but rather to provide all the necessary tools for anybody to build their own web agent. We strongly recommend you check out both [Browserbase](https://www.browserbase.com) and our open source project [Stagehand](https://www.stagehand.dev) to build your own web agent.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbrowserbase%2Fopen-operator&env=OPENAI_API_KEY,BROWSERBASE_API_KEY,BROWSERBASE_PROJECT_ID&envDescription=API%20keys%20needed%20to%20run%20Open%20Operator&envLink=https%3A%2F%2Fgithub.com%2Fbrowserbase%2Fopen-operator%23environment-variables)

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Next, copy the example environment variables:

```bash
cp .env.example .env.local
```

You'll need to set up your API keys:

1. Get your OpenAI API key from [OpenAI's dashboard](https://platform.openai.com/api-keys)
2. Get your Browserbase API key and project ID from [Browserbase](https://www.browserbase.com)

Update `.env.local` with your API keys:

- `OPENAI_API_KEY`: Your OpenAI API key
- `BROWSERBASE_API_KEY`: Your Browserbase API key
- `BROWSERBASE_PROJECT_ID`: Your Browserbase project ID

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see Open Operator in action.

## How It Works

Building a web agent is a complex task. You need to understand the user's intent, convert it into headless browser operations, and execute actions, each of which can be incredibly complex on their own.

![public/agent_mess.png](public/agent_mess.png)

Stagehand is a tool that helps you build web agents. It allows you to convert natural language into headless browser operations, execute actions on the browser, and extract results back into structured data.

![public/stagehand_clean.png](public/stagehand_clean.png)

Under the hood, we have a very simple agent loop that just calls Stagehand to convert the user's intent into headless browser operations, and then calls Browserbase to execute those operations.

![public/agent_loop.png](public/agent_loop.png)

Stagehand uses Browserbase to execute actions on the browser, and OpenAI to understand the user's intent.

For more on this, check out the code at [this commit](https://github.com/browserbase/open-operator/blob/6f2fba55b3d271be61819dc11e64b1ada52646ac/index.ts).

### Key Technologies

- **[Browserbase](https://www.browserbase.com)**: Powers the core browser automation and interaction capabilities
- **[Stagehand](https://www.stagehand.dev)**: Handles precise DOM manipulation and state management
- **[Next.js](https://nextjs.org)**: Provides the modern web framework foundation
- **[OpenAI](https://openai.com)**: Enable natural language understanding and decision making

## Contributing

We welcome contributions! Whether it's:

- Adding new features
- Improving documentation
- Reporting bugs
- Suggesting enhancements

Please feel free to open issues and pull requests.

## License

Open Operator is open source software licensed under the MIT license.

## Acknowledgments

This project is inspired by OpenAI's Operator feature and builds upon various open source technologies including Next.js, React, Browserbase, and Stagehand.

# Midpilot Monorepo Refactoring Plan

## Overview

This plan outlines our strategy to refactor Midpilot-App into a monorepo structure by combining our Next.js application with the Browser Use Python API. Bringing these two projects under one roof will improve development, testing, and deployment efficiency.

## Proposed Directory Structure

Below is the proposed repository tree for our monorepo:

midpilot-monorepo/
├── apps/
│ ├── midpilot-app/ # Next.js application (frontend + API)
│ └── browser-use-api/ # Python service implementing the Browser Use API
├── packages/ # (Optional) Shared code or contracts for future use
├── README.md # This refactoring plan and overall documentation
├── .gitignore
└── (additional config/CI files)
```

## Refactoring Steps

1. **Monorepo Initialization**
   - Create the new repository structure as shown above.
   - Initialize Git in the repository and configure a suitable `.gitignore`.

2. **Migrating Midpilot-App**
   - Move all of the existing Midpilot-App source code (Next.js pages, components, API routes, etc.) into `apps/midpilot-app`.
   - Adjust any relative paths and update configurations (e.g., `package.json`, environment variables) to match the new structure.
   - Ensure that all functionality, including the OperatorProvider abstraction, works as expected within its new location.

3. **Integrating Browser Use API**
   - Add the Browser Use Python project into `apps/browser-use-api` as per the instructions in the [browser-use repository](https://github.com/browser-use/browser-use).
   - Configure the Python project's dependency management (using `pyproject.toml`, `requirements.txt`, etc.) accordingly.
   - Validate that the Python API exposes the expected endpoints (e.g., `/session/create` and `/session/{sessionId}/debug`).
   - Update the Midpilot-App's environment (e.g., `BROWSER_USE_SERVICE_URL`) so that it correctly points to the deployed Python service.

4. **CI/CD & Build Pipeline**
   - Update your CI/CD configurations to build, test, and deploy both the Next.js and Python projects.
   - Consider tools such as Nx, Turborepo, or Lerna for managing cross-project dependencies and tasks if the need arises.

5. **Documentation & Communication**
   - Maintain this `README.md` with updates as the refactoring progresses.
   - Ensure that all team members are informed about the new monorepo structure and any changes in development workflows.

## Future Considerations

- **Shared Packages:**  
  As needed, code that is shared between the Node.js and Python projects (like API contracts) can be moved into the `packages/` directory.

- **Advanced Tooling:**  
  Evaluate using advanced monorepo tools such as Nx, Turborepo, or Lerna to improve dependency management, build caching, and task orchestration across the projects.

- **Formal A/B Testing Framework:**  
  Currently, operator switching is managed via environment variables; future improvements might include a more formal A/B testing framework for enhanced analytics and feature rollouts.

## Conclusion

Transitioning to a monorepo structure by combining the Midpilot-App and Browser Use Python API will unify our development process, simplify testing, and streamline deployment. This refactoring plan provides a clear roadmap for achieving this integration, with the flexibility to expand shared functionality as our platform evolves.

*Future contributors should refer to this document for details on the monorepo structure and development guidelines.*