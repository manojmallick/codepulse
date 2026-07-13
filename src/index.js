require('dotenv').config();

const { App } = require('@slack/bolt');
const { SigMapMcpClient } = require('./mcpClient');

const sigmap = new SigMapMcpClient();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const ALLOWED_CHANNELS = (process.env.ALLOWED_CHANNELS || '')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

const ENABLE_SLACK_SEARCH = process.env.ENABLE_SLACK_SEARCH === 'true';

function isAllowed(channel) {
  if (ALLOWED_CHANNELS.length === 0) return true;
  return ALLOWED_CHANNELS.includes(channel);
}

const SLACK_MAX_LENGTH = 3500; // leave headroom below 4000 char Slack limit

function extractSearchKeywords(question) {
  // Drop common stop words and keep technical terms
  const stopWords = new Set([
    'where', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'from',
    'how', 'what', 'who', 'when', 'why', 'does', 'do', 'did', 'can', 'could',
    'handle', 'handled', 'does', 'work', 'find', 'get', 'about'
  ]);
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s_.]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 5)
    .join(' ');
}

async function searchSlackHistory(client, question) {
  try {
    const query = extractSearchKeywords(question);
    if (!query) return null;

    const result = await client.search.messages({
      query,
      sort: 'timestamp',
      sort_dir: 'desc',
      count: 3,
    });

    const matches = result?.ok ? result.messages?.matches || [] : [];
    if (matches.length === 0) return null;

    const lines = matches.map((m, i) => {
      const channel = m.channel?.name || 'private';
      const snippet = (m.text || '').replace(/\n/g, ' ').slice(0, 80);
      return `${i + 1}. #${channel}: "${snippet}${snippet.length >= 80 ? '...' : ''}"`;
    });

    return `Also found ${matches.length} past Slack discussion(s):\n${lines.join('\n')}`;
  } catch (err) {
    console.error('[Search] Slack search failed:', err.message);
    return null;
  }
}

function formatResponse(data) {
  if (!data) {
    return 'I could not get a response from SigMap. Please check that the MCP server is running and that context has been generated (`node scripts/gen-context.js`).';
  }

  let text;
  if (typeof data === 'string') {
    text = data;
  } else if (data && typeof data.answer === 'string') {
    text = data.answer;
  } else {
    text = JSON.stringify(data, null, 2);
  }

  const prefix = "Based on SigMap's analysis:";
  const full = `${prefix}\n\n${text}`;

  if (full.length <= SLACK_MAX_LENGTH) {
    return full;
  }

  return full.slice(0, SLACK_MAX_LENGTH - 3) + '...';
}

function truncateSlackMessage(text) {
  if (text.length <= SLACK_MAX_LENGTH) return text;
  return text.slice(0, SLACK_MAX_LENGTH - 3) + '...';
}

async function handleQuestion(question, say, client) {
  try {
    const result = await sigmap.ask(question);
    let message = formatResponse(result);

    if (ENABLE_SLACK_SEARCH && client) {
      const searchResult = await searchSlackHistory(client, question);
      if (searchResult) {
        message += '\n\n' + searchResult;
      }
    }

    await say(truncateSlackMessage(message));
  } catch (err) {
    console.error('[Error] Failed to answer question:', err);
    await say('Sorry, I ran into an error while querying the codebase. Please try again.');
  }
}

// Respond to @CodePulse mentions
app.event('app_mention', async ({ event, say, client }) => {
  if (!isAllowed(event.channel)) return;

  const text = event.text.replace(/<@\w+>/g, '').trim();
  if (!text) {
    await say('Hi! Ask me anything about your codebase, like "where is JWT validation handled?"');
    return;
  }

  await handleQuestion(text, say, client);
});

// Respond to /ask-codebase slash command
app.command('/ask-codebase', async ({ command, ack, respond, client }) => {
  await ack();

  if (!isAllowed(command.channel_id)) {
    await respond('CodePulse is not enabled in this channel.');
    return;
  }

  const question = command.text.trim();
  if (!question) {
    await respond('Please provide a question, e.g. `/ask-codebase where is auth handled?`');
    return;
  }

  try {
    const result = await sigmap.ask(question);
    let message = formatResponse(result);

    if (ENABLE_SLACK_SEARCH && client) {
      const searchResult = await searchSlackHistory(client, question);
      if (searchResult) {
        message += '\n\n' + searchResult;
      }
    }

    await respond(truncateSlackMessage(message));
  } catch (err) {
    console.error('[Error] Slash command failed:', err);
    await respond('Sorry, I ran into an error while querying the codebase. Please try again.');
  }
});

// Health check message on startup
app.message('hello codepulse', async ({ say }) => {
  await say('CodePulse is online. Mention me with a codebase question.');
});

(async () => {
  try {
    await sigmap.connect();
    await app.start(process.env.PORT || 3000);
    console.log('[Slack] CodePulse is running');
  } catch (err) {
    console.error('[Fatal] Failed to start:', err);
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  await sigmap.close();
  await app.stop();
  process.exit(0);
});
