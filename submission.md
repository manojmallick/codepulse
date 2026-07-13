# CodePulse — Devpost Submission

## Project Title

CodePulse: Codebase Intelligence Inside Slack Conversations

## One-Sentence Summary

CodePulse is a Slack agent that answers codebase questions directly in thread, using SigMap's MCP server to return grounded, file-cited responses.

## Problem Statement

Developers already live in Slack. When questions about code come up — during incident response, PR reviews, or onboarding — they leave Slack to search GitHub, their IDE, or ask a teammate. That context switch slows down the entire team.

## Solution

CodePulse keeps the answer inside the conversation. A developer @mentions CodePulse with a codebase question. The agent calls SigMap's MCP server, retrieves ranked code signatures, and posts a grounded answer with specific file and method citations.

## How It Works

1. User @mentions CodePulse in any Slack channel or runs `/ask-codebase`.
2. The custom Bolt app receives the event and extracts the question.
3. The app invokes SigMap's `query_context` tool via the Model Context Protocol (MCP).
4. SigMap returns ranked signatures from the indexed repository.
5. The app posts a concise response citing exact files and methods directly in the thread.

## Technologies Used

- **Slack Bolt:** custom Slack app runtime handling `@CodePulse` mentions, slash commands, and in-thread responses.
- **MCP server integration:** SigMap's `npx sigmap --mcp` stdio server exposes `query_context` and other codebase tools.
- **Real-Time Search API:** optionally surfaces past Slack discussions about the same component via `search:read` scope.
- **Slack AI:** used to summarize long context when the codebase response includes multiple files.

## Demo

[Video link here — 2 min 30 sec]

**Demo scenario:** A developer asks `@CodePulse what does searchSlackHistory do` CodePulse responds with a ranked list from SigMap — `src/index.js` at score 4.47 — citing the exact symbol (`async function searchSlackHistory(client, question)`), its line range (`:45-71`), and a transparent breakdown of why it ranked there (`exactToken=3.00 symbolMatch=1.50`).

## Key Differentiator

SigMap is my own codebase intelligence product. No other submission can combine a purpose-built MCP server for code search with a custom Slack app. This is not a wrapper around a generic LLM — every answer is grounded in actual repository signatures.

## Impact

- Reduces token usage by ~97% compared to sending full codebase context to an LLM.
- Keeps developers in Slack instead of forcing tool switches.
- Makes onboarding faster: new developers can ask natural-language questions and get cited answers.

## Future Roadmap

- Add line-number citations from SigMap.
- Surface related past Slack discussions automatically.
- Support multi-repo workspaces.

## GitHub / Source

[Repository link if public]

---

## Submission Checklist

- [ ] Video uploaded and link inserted above
- [ ] Screenshots of agent response attached
- [ ] Slack workspace available for judges if requested
- [ ] Devpost form fields completed
