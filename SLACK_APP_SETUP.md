# Slack App Setup Guide — CodePulse

Follow these steps exactly to create the Slack app CodePulse needs.

---

## Step 1: Create the App

1. Go to https://api.slack.com/apps
2. Click **Create New App**
3. Choose **From an app manifest**
4. Select your test workspace
5. Paste the contents of `manifest.json` from this repo
6. Click **Next**, then **Create**

---

## Step 2: Get the Credentials

After creation, you are on the app settings page.

### Bot User OAuth Token

1. Go to **OAuth & Permissions** in the left menu.
2. Scroll to **OAuth Tokens for Your Workspace**.
3. Click **Install to Workspace** if not already installed.
4. Copy the **Bot User OAuth Token**.
   - It looks like `xoxb-` followed by your workspace and bot identifiers
5. Paste it into `.env` as `SLACK_BOT_TOKEN`.

### Signing Secret

1. Go to **Basic Information** in the left menu.
2. Scroll to **App Credentials**.
3. Copy **Signing Secret**.
4. Paste it into `.env` as `SLACK_SIGNING_SECRET`.

### App-Level Token

1. Go to **Basic Information** in the left menu.
2. Scroll to **App-Level Tokens**.
3. Click **Generate Token and Scopes**.
4. Add the scope `connections:write`.
5. Click **Generate**.
6. Copy the token.
   - It looks like `xapp-1-` followed by your app identifiers
7. Paste it into `.env` as `SLACK_APP_TOKEN`.

---

## Step 3: Verify Scopes and Event Subscriptions

1. Go to **OAuth & Permissions**.
2. Under **Scopes > Bot Token Scopes**, confirm these are present:
   - `app_mentions:read`
   - `chat:write`
   - `commands`
   - `search:read`
3. If any are missing, add them and **Reinstall to Workspace**.

4. Go to **Event Subscriptions**.
5. Confirm **Enable Events** is on and **App Mention** is selected under **Subscribe to bot events**.
6. Because Socket Mode is enabled, you do not need a Request URL.

---

## Step 4: Enable Socket Mode

1. Go to **Socket Mode** in the left menu.
2. Turn **Enable Socket Mode** on.
3. The app should already have the `connections:write` scope from Step 2.

---

## Step 5: Invite the Bot to a Channel

1. In your Slack workspace, go to any channel.
2. Type `/invite @CodePulse` and press Enter.
3. The bot should join the channel.

---

## Step 6: Start CodePulse

```bash
cd codepulse
npm run gen:context
npm start
```

You should see:

```
[MCP] Connected to SigMap
[Slack] CodePulse is running
```

---

## Step 7: Test in Slack

In the channel where you invited the bot, type:

```
@CodePulse what does searchSlackHistory do
```

Wait a few seconds. The bot should reply with SigMap's ranked signatures, with `src/index.js` at the top scoring around 4.47.

> **Why this exact question?** SigMap ranks files by matching your words against **indexed symbol names**, not by semantic understanding. `searchSlackHistory` is a real function in `src/index.js`, so it scores. A question like "where is the event handler?" returns an all-zero table — the handlers are anonymous callbacks (`app.event('app_mention', ...)`), so no symbol named "event" or "handler" exists to match. Ask about symbols that exist.

Other verified questions:
- `how does the mcp client connect to sigmap` → `src/mcpClient.js` (3.76)
- `how are responses formatted for slack` → `src/index.js` (2.79)
- `where is handleQuestion defined` → `src/index.js` (2.54)

---

## Step 8: Invite the Judges

1. In your Slack developer sandbox, go to **People** → **Invite people**.
2. Add these emails as **Members** (not Guests):
   - `slackhack@salesforce.com`
   - `testing@devpost.com`
3. Make sure the CodePulse bot is installed and the judges can access the test channel.
4. Copy your workspace URL (e.g., `https://your-team.slack.com`) and include it in your Devpost submission.

---

## Troubleshooting

### "invalid_auth" or "missing_scope"

- Reinstall the app to your workspace after adding scopes.
- Make sure `SLACK_BOT_TOKEN` starts with `xoxb-`.
- Make sure `SLACK_APP_TOKEN` starts with `xapp-1-` and includes the `connections:write` scope.

### Bot does not respond to mentions

- Confirm the bot is in the channel (`/invite @CodePulse`).
- Confirm **App Mention** is enabled under **Event Subscriptions**.
- Confirm Socket Mode is enabled.

### "No signatures indexed"

- Run `npm run gen:context`.
- Verify `SIGMAP_PROJECT_ROOT` in `.env` points to the repo you want to query.

### "Unknown tool: query_context"

- Run `npm run tools` to see your SigMap version's actual tool names.
- Update `SIGMAP_ASK_TOOL` and `SIGMAP_ASK_ARG` in `.env`.

---

## Next Step

Record the demo video using `demo-script.md`.
