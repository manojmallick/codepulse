# CodePulse Demo Script

**Target length:** 2 minutes 30 seconds  
**Recording tool:** Screen recorder + Slack workspace  
**Voiceover:** Yes, read directly from this script.

---

> **Before recording:** the indexed repo is CodePulse itself (`SIGMAP_PROJECT_ROOT`). Every query below is verified to return a non-zero ranking against that index. Do **not** improvise questions on camera — a query whose words don't match an indexed symbol returns an all-zero table, because SigMap ranks by symbol/token match rather than semantic similarity.

## Scene 1: The Problem (20 sec)

**Visual:** Slack channel `#backend-team`. Scroll through a conversation where developers are discussing where a piece of logic lives.

**Voiceover:**
> Developers live in Slack. But when a codebase question comes up, they have to leave the conversation, open GitHub, search the IDE, or ask a teammate. Context switching kills flow.

---

## Scene 2: The Agent Mention (15 sec)

**Visual:** A developer types in the channel:

```
@CodePulse what does searchSlackHistory do
```

**Voiceover:**
> Meet CodePulse. Mention it in any channel and it answers directly in the thread.

---

## Scene 3: The Response (30 sec)

**Visual:** CodePulse posts a response with cited file signatures. This is the actual output — verified, not mocked.

```
Based on SigMap's analysis:

## Query: what does searchSlackHistory do
Intent: search

| Rank | File | Score | Sigs | Penalty |
|------|------|-------|------|---------|
| 1 | src/index.js | 4.47 | 6 | 1.00 |
| 2 | scripts/list-tools.js | 0.00 | 1 | 1.00 |
| 3 | scripts/test-mcp.js | 0.00 | 1 | 1.00 |

### src/index.js
Signals: exactToken=3.00 symbolMatch=1.50 prefixMatch=0.00 pathMatch=0.00 penalty=1.00
```
function isAllowed(channel)  :22-25
function extractSearchKeywords(question)  :29-43
async function searchSlackHistory(client, question)  :45-71
function formatResponse(data)  :73-95
function truncateSlackMessage(text)  :97-100
async function handleQuestion(question, say, client)  :102-119
```
```

**Voiceover:**
> CodePulse calls SigMap's MCP server via the `query_context` tool. It returns ranked code signatures with massive token reduction compared to sending the full codebase to an LLM. The response is grounded — every claim cites a specific file, symbol, and line range. And the scoring is transparent: you can see exactly why a file ranked where it did.

> **Note for the voiceover:** the top hit scores 4.47 and lands on the exact file and line range. Lower-ranked files score zero — that is the ranker being honest about irrelevance, not a failure.

---

## Scene 4: The Technology Stack (30 sec)

**Visual:** Simple architecture slide or diagram.

```
Slack Message
    |
    v
CodePulse (Bolt.js app)
    |
    +-- MCP --> SigMap (query_context)
    +-- Search API --> Slack message history
    |
    v
Grounded answer in thread
```

**Voiceover:**
> CodePulse uses three required Slack technologies: a custom Slack app built with Bolt.js, an MCP server integration through SigMap, and the Real-Time Search API to surface past team discussions about the same component. Slack AI helps summarize long context when needed.

---

## Scene 5: Why It Wins (30 sec)

**Visual:** Return to Slack conversation. Show the agent being used a second time for a different question:

```
@CodePulse how does the mcp client connect to sigmap
```

*(Verified: ranks `src/mcpClient.js` at 3.76. Alternative verified queries — "how are responses formatted for slack" → 2.79, "where is handleQuestion defined" → 2.54.)*

**Voiceover:**
> CodePulse is built on SigMap, which I created. No other submission can combine codebase intelligence, MCP, and Slack search in one workflow. It keeps developers in their conversation and gives them the right answer, grounded in actual code.

---

## Closing Slide (15 sec)

**Visual:** Text on screen.

```
CodePulse
Codebase intelligence inside Slack

MCP integration • Real-Time Search • Slack AI
```

**Voiceover:**
> CodePulse. Codebase questions answered where they already live — in Slack.

---

## Recording Tips

- Use a test Slack workspace, not a production one.
- Generate SigMap context first so `query_context` returns good results: `node scripts/gen-context.js`
- Record at 1080p.
- Keep total runtime under 3 minutes.
- Upload to YouTube or Loom unlisted; paste the link into Devpost.
