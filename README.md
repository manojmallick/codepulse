# CodePulse

Codebase intelligence inside Slack conversations.

## What It Does

- A developer `@CodePulse` in any Slack channel with a codebase question.
- CodePulse calls the SigMap MCP server via the `query_context` tool.
- It posts a grounded answer citing specific files and methods.

## Quick Start

### 1. Install dependencies

```bash
cd codepulse
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

- `SLACK_BOT_TOKEN` — from your Slack app Settings > OAuth & Permissions
- `SLACK_SIGNING_SECRET` — from Settings > Basic Information
- `SLACK_APP_TOKEN` — from Settings > Basic Information > App-Level Tokens
- `SIGMAP_MCP_COMMAND` and `SIGMAP_MCP_ARGS` — usually `npx` and `sigmap,--mcp`
- `SIGMAP_ASK_TOOL` — default `query_context`
- `SIGMAP_PROJECT_ROOT` — absolute path to the repo you want CodePulse to query
- `ENABLE_SLACK_SEARCH` — set `true` to append past Slack discussions via Real-Time Search API

### 3. Generate SigMap context

Set `SIGMAP_PROJECT_ROOT` in `.env` to the absolute path of the repo you want to query, then run:

```bash
npm run gen:context
```

If `SIGMAP_PROJECT_ROOT` is not set, it defaults to the `codepulse` folder itself. You can also run `sigmap` directly in the target repo.

### 4. Test the MCP connection

```bash
npm run verify
npm run test:mcp -- "what does searchSlackHistory do"
```

To test without running SigMap:

```bash
SIGMAP_MOCK=true npm run test:mcp -- "what does searchSlackHistory do"
```

### 5. Run the Slack app

```bash
npm start
```

The bot connects via Socket Mode and listens for `@CodePulse` mentions and `/ask-codebase` commands.

## Slack App Scopes

Required bot token scopes:

- `app_mentions:read`
- `chat:write`
- `commands`
- `search:read` (optional, if you later add Slack message search)

## Demo

Use the script in `demo-script.md` to record your submission video.

## Project Structure

```
codepulse/
├── src/
│   ├── index.js        # Slack Bolt app and handlers
│   └── mcpClient.js    # SigMap MCP client wrapper
├── scripts/
│   ├── test-mcp.js     # Standalone MCP test
│   ├── test-query-context.js  # Direct query_context test
│   ├── list-tools.js   # List exposed MCP tools
│   ├── gen-context.js  # Generate SigMap context for a repo
│   └── verify.js       # Pre-flight verification script
├── manifest.json       # Slack app manifest
├── architecture-diagram.svg  # Visual architecture diagram
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Troubleshooting

**"No signatures indexed. Run: node gen-context.js"**

- Generate context in the `SIGMAP_PROJECT_ROOT` directory: `node scripts/gen-context.js`
- Or run `sigmap` directly in that directory.

**"Unknown tool" error**

- Run `npm run tools` to see the actual tool names exposed by your SigMap version.
- Update `SIGMAP_ASK_TOOL` and `SIGMAP_ASK_ARG` in `.env` accordingly.

**Slack app does not respond**

- Confirm `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN` are correct.
- Make sure the bot is invited to the channel.
- Enable `app_mention` and `slash_command` events in Slack app settings.

**Responses look wrong**

- Inspect the raw MCP output with `npm run test:mcp`.
- Adjust `parseResult` in `src/mcpClient.js` to match SigMap's response shape.
