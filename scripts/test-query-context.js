require('dotenv').config();

const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const projectRoot = process.env.SIGMAP_PROJECT_ROOT || path.resolve(__dirname, '..');

async function main() {
  const command = process.env.SIGMAP_MCP_COMMAND || 'npx';
  const args = (process.env.SIGMAP_MCP_ARGS || 'sigmap,--mcp').split(',').filter(Boolean);

  const transport = new StdioClientTransport({ command, args, cwd: projectRoot });
  const client = new Client({ name: 'codepulse-test', version: '1.0.0' });

  const query = process.argv[2] || 'where is the Slack event handler?';

  try {
    await client.connect(transport);
    console.log('[Test] Querying:', query);
    const result = await client.callTool({
      name: 'query_context',
      arguments: { query, topK: 5 },
    });
    console.log('[Test] Raw result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('[Test] Failed:', err);
  } finally {
    await transport.close();
  }
}

main();
