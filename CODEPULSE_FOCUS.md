# CodePulse — Track 1 Execution Plan

**Deadline:** July 13, 2026, 5:00pm PDT  
**Time remaining:** ~24 hours  
**Goal:** One working Slack agent demo + submitted Devpost entry.

---

## Must-Do Checklist (do not skip)

- [ ] Confirm Netherlands eligibility: https://slackhack.devpost.com/rules Section 3
- [ ] Create a Slack app at https://api.slack.com/apps (use `manifest.json` — detailed steps in `SLACK_APP_SETUP.md`)
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env` and fill in Slack + SigMap credentials
- [ ] Generate SigMap context: `npm run gen:context`
- [ ] Verify `npx sigmap --mcp` runs locally and exposes `query_context`
- [ ] Test MCP: `npm run test:mcp -- "what does searchSlackHistory do"`
- [ ] Start the app: `npm start`
- [ ] Test: `@CodePulse what does searchSlackHistory do` returns grounded answer
- [ ] Record 2–3 minute demo video (script in `demo-script.md`)
- [ ] Write final submission using `submission.md`
- [ ] Submit to Devpost before deadline

If Netherlands is not eligible, stop immediately.

---

## What CodePulse Actually Is

A Slack agent that answers codebase questions directly in thread.

Core flow:
1. Developer @mentions CodePulse in a Slack channel.
2. CodePulse calls `query_context(query)` via MCP.
3. SigMap returns ranked file/method signatures.
4. CodePulse posts a grounded answer with citations.

Optional enhancement (if time):
- Use Slack Search API to find past discussions about the same component.

---

## Build Steps

### 1. Slack app setup (30 min)

- Go to https://api.slack.com/apps
- Create New App > From manifest
- Paste the contents of `manifest.json` from this folder
- Note the Bot User OAuth Token, Signing Secret, and App-Level Token

### 2. Configure environment (15 min)

```bash
cp .env.example .env
# edit .env with your Slack credentials and SigMap MCP settings
```

### 3. Install dependencies (5 min)

```bash
npm install
```

### 4. Generate SigMap context (15 min)

The repo you want to query must be indexed first.

```bash
npm run gen:context
```

This writes `.github/copilot-instructions.md` in `SIGMAP_PROJECT_ROOT`.

### 5. Verify SigMap MCP connection (30 min)

Requirement: `npx sigmap --mcp` must start an MCP stdio server exposing at least `query_context(query: string)`.

```bash
npm run test:mcp -- "what does searchSlackHistory do"
```

If the tool name differs from `query_context`, update `SIGMAP_ASK_TOOL` and `SIGMAP_ASK_ARG` in `.env`. Use `node scripts/list-tools.js` to inspect available tools.

To test without SigMap running:

```bash
SIGMAP_MOCK=true npm run test:mcp -- "what does searchSlackHistory do"
```

### 6. Run the app and test in Slack (1 hour)

```bash
npm start
```

In a test channel, post:

```
@CodePulse what does searchSlackHistory do
```

Expected response format:

```
Based on SigMap's analysis:

| Rank | File | Score | Sigs | Penalty |
|------|------|-------|------|---------|
| 1 | src/index.js | 4.47 | 6 | 1.00 |
...
```

If the response is wrong, adjust `parseResult` in `src/mcpClient.js` to match SigMap's output shape.

### 7. Record demo video (1–2 hours)

See `demo-script.md`. Keep it under 3 minutes.

### 8. Devpost submission (1 hour)

Use `submission.md`. Add screenshots and video link.

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `manifest.json` | Slack app manifest |
| `package.json` | Node.js dependencies and scripts |
| `src/index.js` | Slack Bolt app and event handlers |
| `src/mcpClient.js` | SigMap MCP client wrapper |
| `scripts/test-mcp.js` | Standalone MCP test script |
| `scripts/test-query-context.js` | Direct query_context test |
| `scripts/list-tools.js` | List exposed MCP tools |
| `scripts/gen-context.js` | Generate SigMap context for a repo |
| `.env.example` | Environment variable template |
| `agent-instructions.md` | System prompt reference |
| `demo-script.md` | Exact script for the demo video |
| `submission.md` | Devpost submission text |
| `architecture.md` | Architecture diagram and data flow |
| `SUBMISSION_CHECKLIST.md` | Final Devpost submission checklist |
| `FINAL_SUBMISSION.md` | Copy-paste Devpost submission text |
| `JUDGE_NOTES.md` | Technical notes for hackathon judges |
| `SLACK_APP_SETUP.md` | Step-by-step Slack app creation guide |
| `README.md` | Setup and run instructions |

---

## Risk Log

| Risk | Mitigation |
|------|-----------|
| Netherlands not eligible | Verify first; stop if false |
| SigMap MCP tool/argument differs | Run `npm run tools`, then update `SIGMAP_ASK_TOOL` and `SIGMAP_ASK_ARG` in `.env` |
| SigMap response shape differs | Update `parseResult` in `src/mcpClient.js` |
| No time for Slack Search API | Skip it; MCP alone satisfies a required technology |
| No time for Marketplace | Track 1 does not require Marketplace |

---

## Why Track 1 Is the Right Bet

- MCP server integration is explicitly named in the hackathon rules.
- SigMap is your own product — no one else can demo this.
- No Slack Marketplace approval needed.
- Single workflow: one @mention → one grounded answer.

Finish this one submission well instead of three half-finished ones.
