const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

class SigMapMcpClient {
  constructor() {
    this.command = process.env.SIGMAP_MCP_COMMAND || 'npx';
    this.args = (process.env.SIGMAP_MCP_ARGS || 'sigmap,--mcp').split(',').filter(Boolean);
    this.toolName = process.env.SIGMAP_ASK_TOOL || 'query_context';
    this.argName = process.env.SIGMAP_ASK_ARG || 'query';
    this.projectRoot = process.env.SIGMAP_PROJECT_ROOT || process.cwd();
    this.mockMode = process.env.SIGMAP_MOCK === 'true';
    this.client = null;
    this.transport = null;
  }

  async connect() {
    if (this.mockMode) {
      console.log('[MCP] Running in mock mode');
      return;
    }

    if (this.client) return;

    this.transport = new StdioClientTransport({
      command: this.command,
      args: this.args,
      cwd: this.projectRoot,
    });

    this.client = new Client({ name: 'codepulse', version: '1.0.0' });
    await this.client.connect(this.transport);
    console.log('[MCP] Connected to SigMap');
  }

  async ask(question) {
    if (this.mockMode) {
      return this.mockResponse(question);
    }

    await this.connect();

    const args = { [this.argName]: question };
    if (this.toolName === 'query_context') {
      args.topK = 5;
    }

    const result = await this.client.callTool({
      name: this.toolName,
      arguments: args,
    });

    return this.parseResult(result);
  }

  parseResult(result) {
    // SigMap returns markdown text; pass it through as a string
    if (!result || !result.content || result.content.length === 0) {
      return null;
    }

    return result.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');
  }

  mockResponse(question) {
    return `## Query: ${question}\nIntent: navigate\n\n| Rank | File | Score | Sigs | Penalty |\n|------|------|-------|------|---------|\n| 1 | src/index.js | 0.91 | 3 | 1.00 |\n| 2 | src/mcpClient.js | 0.68 | 11 | 1.00 |\n\n### src/index.js\nSignals: exactToken=0.91 symbolMatch=0.00 prefixMatch=0.00 pathMatch=0.00 penalty=1.00\n\`\`\`\nasync function handleQuestion(question, say)  :57-65\nfunction formatResponse(data)  :25-55\n\`\`\``;
  }

  async close() {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
      this.client = null;
    }
  }
}

module.exports = { SigMapMcpClient };
