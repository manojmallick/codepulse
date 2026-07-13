require('dotenv').config();

const { SigMapMcpClient } = require('../src/mcpClient');

async function main() {
  const client = new SigMapMcpClient();
  const question = process.argv[2] || 'where is JWT validation handled?';

  try {
    await client.connect();
    console.log('[Test] Asking:', question);
    const result = await client.ask(question);
    console.log('[Test] Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('[Test] Failed:', err);
  } finally {
    await client.close();
  }
}

main();
