# AGI CLI Agent

A TypeScript-based AI agent you run in the terminal.

It provides a chat-style CLI UI with streaming responses, tool calling, human approval for tool execution, token usage visibility, and an evaluation harness for testing tool behavior.

---

## Features

- **Terminal chat UI (Ink + React)** with streaming assistant output.
- **Tool calling loop** using the AI SDK, including:
  - Date/time tool
  - File system tools (read/write/list/delete)
  - Shell command execution
  - Code execution (JavaScript, Python, TypeScript)
  - Web search tool
- **Human-in-the-loop tool approval** before tool execution.
- **Token usage reporting** and context window usage display.
- **Conversation compaction** when token usage exceeds a threshold.
- **Evaluation suite** for tool selection and multi-turn behavior.

---

## Repository Structure

```text
src/
  cli.ts                    # Executable entrypoint (bin target)
  index.ts                  # Alternate app entrypoint
  types.ts                  # Shared app/agent type definitions
  ui/
    App.tsx                 # Main terminal UI orchestration
    components/             # Input, message list, tool call display, approval UI, token usage
  agent/
    run.ts                  # Main agent loop (streaming + tool calls + approvals)
    executeTools.ts         # Tool dispatch helper
    system/prompt.ts        # System prompt used by agent
    tools/                  # Tool definitions and registry
    context/                # Token estimation, model limits, conversation compaction

evals/
  *.eval.ts                 # Evaluation suites
  executors.ts              # Mocked executors for eval runs
  evaluators.ts             # Scoring functions
  data/*.json               # Evaluation datasets
```

---

## How It Works

1. User types a prompt in the terminal UI.
2. The app invokes the agent runtime with conversation history and UI callbacks.
3. The runtime streams text tokens back to the UI.
4. If the model requests tools, each tool call is surfaced for approval.
5. Approved tools are executed and their results are appended to the message history.
6. The model continues until it returns a final response.

The runtime also tracks estimated token usage. If usage approaches the context window threshold, it compacts the conversation by summarizing prior turns before continuing.

---

## Prerequisites

- Node.js 20+
- npm
- OpenAI API credentials (for model/tool features)

Optional:
- Laminar project API key (telemetry/evals)

---

## Installation

```bash
npm install
```

---

## Configuration

Set environment variables in your shell or a `.env` file:

```bash
OPENAI_API_KEY=...
LMNR_PROJECT_API_KEY=...   # optional for Laminar tracing
```

---

## Build

```bash
npm run build
```

This compiles TypeScript into `dist/` and produces the CLI entrypoint configured as `agi`.

---

## Run the Agent

After building, run:

```bash
node dist/cli.js
```

Inside the app:
- Type messages to chat.
- Type `exit` or `quit` to close.
- Approve or deny tool calls using keyboard controls in the approval prompt.

---

## Evaluate Agent Behavior

Run evaluation suites with:

```bash
npm run eval
```

Eval coverage includes:
- Single-turn tool selection behavior.
- Multi-turn tool ordering and output quality checks.
- Forbidden-tool avoidance checks.

---

## Development Notes

- Tool registration lives in `src/agent/tools/index.ts`.
- Tool implementations use `zod` schemas for structured tool arguments.
- Main loop logic is centralized in `src/agent/run.ts`.
- UI event and callback orchestration is centralized in `src/ui/App.tsx`.

---

## Tech Stack

- **TypeScript**
- **AI SDK (`ai`) + `@ai-sdk/openai`**
- **Ink + React** for terminal UI
- **Zod** for tool schemas
- **shelljs** for shell execution
- **Laminar (`@lmnr-ai/lmnr`)** for eval/tracing integration

---

