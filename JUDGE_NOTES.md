# CodePulse — Judge Notes

For hackathon judges reviewing the submission.

---

## Hackathon Requirement Mapping

| Requirement | Where It Lives in CodePulse | Evidence |
|-------------|----------------------------|----------|
| Slack AI capabilities | `src/index.js` `formatResponse()` summarizes and truncates long SigMap responses | `src/index.js:25-95` |
| MCP server integration | `src/mcpClient.js` connects to SigMap stdio MCP and calls `query_context` | `src/mcpClient.js:25-54` |
| Real-Time Search API | Optional `searchSlackHistory()` in `src/index.js` using `client.search.messages` | `src/index.js:45-71` |

---

## How to Verify the MCP Integration

1. Clone or open the project.
2. Run `npm install`.
3. Run `npm run gen:context` in the repo you want to query.
4. Run `npm run test:mcp -- "what does searchSlackHistory do"`.

You should see output like:

```
[MCP] Connected to SigMap
[Test] Asking: what does searchSlackHistory do
[Test] Result: "## Query: what does searchSlackHistory do\nIntent: search\n\n| Rank | File | Score |\n| 1 | src/index.js | 4.47 | ..."
```

> **How to ask CodePulse good questions.** SigMap ranks files by matching query words against **indexed symbol names** — it is a deterministic ranker, not a semantic LLM. Questions naming real symbols score well; questions using generic prose ("where is the event handler?") return an all-zero table, because the Slack handlers are anonymous callbacks with no matching symbol name. This is the ranker being honest about a miss, not a bug.
>
> Verified queries against this repo:
> - `what does searchSlackHistory do` → `src/index.js` (4.47)
> - `how does the mcp client connect to sigmap` → `src/mcpClient.js` (3.76)
> - `how are responses formatted for slack` → `src/index.js` (2.79)
> - `where is handleQuestion defined` → `src/index.js` (2.54)

If you prefer to test without installing SigMap dependencies, run:

```bash
SIGMAP_MOCK=true npm run test:mcp -- "what does searchSlackHistory do"
```

---

## How to Verify the Slack App

1. Create a Slack app from `manifest.json` at https://api.slack.com/apps.
2. Copy `.env.example` to `.env` and fill in:
   - `SLACK_BOT_TOKEN` (xoxb-...)
   - `SLACK_SIGNING_SECRET`
   - `SLACK_APP_TOKEN` (xapp-...)
   - `SIGMAP_PROJECT_ROOT` (absolute path to the indexed repo)
3. Run `npm start`.
4. Invite the bot to a channel and type `@CodePulse what does searchSlackHistory do`.

The bot will reply in the thread with SigMap's ranked signatures.

---

## Key Technical Decisions

- **Custom Bolt.js app** instead of Slack Agent Builder no-code. This gives full control over event handling, MCP transport, and response formatting.
- **Stdio MCP transport** to `npx sigmap --mcp`. This is the simplest way to run SigMap as an MCP server.
- **Environment-driven tool configuration** (`SIGMAP_ASK_TOOL`, `SIGMAP_ASK_ARG`, `SIGMAP_PROJECT_ROOT`) so CodePulse adapts to different SigMap versions.
- **Markdown passthrough** from SigMap's `query_context` response. The tool returns rich markdown; we preserve it rather than force a custom format.
- **Optional Slack Search** behind `ENABLE_SLACK_SEARCH`. It is off by default to keep the demo stable, but one env var turns on the third required technology.

---

## Files to Review

| File | What to Look For |
|------|-----------------|
| `src/index.js` | Slack event handlers, optional Slack Search API, response formatting |
| `src/mcpClient.js` | MCP stdio client, tool invocation, mock mode |
| `manifest.json` | Slack app scopes and Socket Mode |
| `architecture.md` | Component diagram and data flow |
| `architecture-diagram.svg` | Visual architecture diagram |

---

## Notes on SigMap

SigMap is a codebase context engine I built. It extracts deterministic signatures from source code and ranks them for a given query. The MCP server exposes multiple tools including `query_context`, `search_signatures`, `get_impact`, and `verify_suggestion`. CodePulse uses `query_context` because it is the natural question-answering tool.

The integration is not a wrapper around a generic LLM. Every answer is grounded in actual repository signatures.
