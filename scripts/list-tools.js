require('dotenv').config();

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function main() {
  const command = process.env.SIGMAP_MCP_COMMAND || 'npx';
  const args = (process.env.SIGMAP_MCP_ARGS || 'sigmap,--mcp').split(',').filter(Boolean);

  const transport = new StdioClientTransport({ command, args });
  const client = new Client({ name: 'codepulse-list-tools', version: '1.0.0' });

  try {
    await client.connect(transport);
    const tools = await client.listTools();
    console.log('[Tools]', JSON.stringify(tools, null, 2));
  } catch (err) {
    console.error('[Error]', err);
  } finally {
    await transport.close();
  }
}

main();
