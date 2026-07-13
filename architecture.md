# CodePulse Architecture

## Overview

CodePulse is a custom Slack app built with Bolt.js. It receives codebase questions via `@CodePulse` mentions and `/ask-codebase` slash commands, queries SigMap through the Model Context Protocol (MCP), and returns grounded answers in Slack threads.

## Visual Diagram

![CodePulse Architecture](architecture-diagram.svg)

## Component Diagram

```
┌─────────────────┐     @CodePulse mention      ┌──────────────────┐
│   Slack Client  │ ───────────────────────────> │  Slack App       │
│   (web / desktop)│                              │  (api.slack.com) │
└─────────────────┘                              └────────┬─────────┘
                                                        │ Socket Mode
┌───────────────────────────────────────────────────────┼───────────────┐
│                       CodePulse Server                │               │
│                                                       ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Bolt.js    │───>│   Question   │───>│  MCP Client          │  │
│  │   Receiver   │    │   Parser     │    │  (@modelcontextprotocol/sdk)│
│  └──────────────┘    └──────────────┘    └──────────┬───────────┘  │
│                                                     │ stdio         │
│                                                     ▼               │
│                                        ┌──────────────────────┐    │
│                                        │  SigMap MCP Server   │    │
│                                        │  npx sigmap --mcp    │    │
│                                        └──────────┬───────────┘    │
│                                                   │                 │
│                                                   ▼                 │
│                                        ┌──────────────────────┐    │
│                                        │  Indexed Repository  │    │
│                                        └──────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Slack Response  │
                                               │ with citations  │
                                               └─────────────────┘
```

## Data Flow

1. **Trigger**: User types `@CodePulse what does searchSlackHistory do` in a Slack channel.
2. **Delivery**: Slack emits an `app_mention` event to the Bolt.js app via Socket Mode.
3. **Extraction**: `src/index.js` removes the bot mention and keeps the question text.
4. **MCP Call**: `src/mcpClient.js` spawns `npx sigmap --mcp` as a stdio transport and calls `query_context(query)`.
5. **Result Parsing**: SigMap returns ranked signatures as markdown text. The client passes it through.
6. **Formatting**: `formatResponse` in `src/index.js` builds a Slack message with file and method citations.
7. **Reply**: The app posts the formatted answer back into the thread.

## Technology Mapping to Hackathon Requirements

| Requirement | Implementation |
|-------------|----------------|
| Slack AI capabilities | Response summarization and formatting for multi-file results |
| MCP server integration | SigMap MCP server via `@modelcontextprotocol/sdk` |
| Real-Time Search API | Optional: `client.search.messages()` with `search:read` scope to append past discussions |

## Key Files

| File | Responsibility |
|------|----------------|
| `src/index.js` | Slack event handlers, response formatting, server startup |
| `src/mcpClient.js` | MCP stdio transport, tool invocation, result parsing |
| `manifest.json` | Slack app scopes and event subscriptions |
| `.env` | Tokens, MCP command, and tool name configuration |

## Scalability Notes

For a production deployment beyond the hackathon:
- Replace Socket Mode with an HTTP event handler behind a public URL.
- Cache SigMap connection or use a long-running MCP server instead of spawning per request.
- Add rate limiting and per-workspace repository indexing.
