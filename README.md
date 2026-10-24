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

## Usage

In any channel the bot has been invited to:

- `@CodePulse where is JWT validation handled?`
- `@CodePulse what does searchSlackHistory do`
- `/ask-codebase where is auth handled?`

CodePulse sends the question to the SigMap MCP server's `query_context` tool, which ranks the files and signatures in `SIGMAP_PROJECT_ROOT`, and replies with a grounded answer that cites those files and methods. Long answers are truncated to fit Slack's message limit. Mentioning the bot with no question returns a short help message, and saying `hello codepulse` returns an online check.

## How it works

```
Slack (@CodePulse or /ask-codebase)
   -> src/index.js        Bolt app, Socket Mode, channel allow-list
   -> src/mcpClient.js    MCP client (stdio) -> `npx sigmap --mcp` -> query_context
   <- formatted answer    optionally appended with related past Slack discussions
```

See [architecture.md](architecture.md) for the full diagram.

## Configuration reference

| Variable | Required | Description |
|---|---|---|
| `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_APP_TOKEN` | yes | Slack credentials (bot token, signing secret, app-level token for Socket Mode) |
| `SIGMAP_MCP_COMMAND`, `SIGMAP_MCP_ARGS` | yes | How to launch the SigMap MCP server, default `npx` and `sigmap,--mcp` |
| `SIGMAP_ASK_TOOL`, `SIGMAP_ASK_ARG` | no | MCP tool name and its argument name, default `query_context` and `query` |
| `SIGMAP_PROJECT_ROOT` | yes | Absolute path of the repo to answer questions about |
| `SIGMAP_MOCK` | no | `true` returns simulated answers without running SigMap |
| `ENABLE_SLACK_SEARCH` | no | `true` appends related past Slack discussions (needs the `search:read` scope) |
| `ALLOWED_CHANNELS` | no | Comma-separated channel IDs; empty allows all channels |

## Scripts

| Command | What it does |
|---|---|
| `npm start` / `npm run dev` | Run the Slack app / run it with auto-restart on change |
| `npm run gen:context` | Generate SigMap context for `SIGMAP_PROJECT_ROOT` |
| `npm run verify` | Pre-flight check of config and MCP connection |
| `npm run tools` | List the tools the SigMap MCP server exposes |
| `npm run test:mcp -- "<question>"` | Ask one question through the MCP client without Slack |

## Limitations

- It answers about **one repository** (the one in `SIGMAP_PROJECT_ROOT`) and only as fresh as the last context generation; re-run `npm run gen:context` after the code changes.
- There are no automated tests; use `npm run verify` and `npm run test:mcp`.
- `package.json` declares MIT; see [LICENSE](LICENSE).

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
