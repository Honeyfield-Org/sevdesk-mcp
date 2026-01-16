#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerContactsTools } from './tools/contacts.js';
import { registerInvoicesTools } from './tools/invoices.js';
import { registerCreditNotesTools } from './tools/credit-notes.js';
import { registerOrdersTools } from './tools/orders.js';
import { registerVouchersTools } from './tools/vouchers.js';
import { registerTransactionsTools } from './tools/transactions.js';
import { registerPartsTools } from './tools/parts.js';
import { registerBasicsTools } from './tools/basics.js';

// Check for API token
if (!process.env.SEVDESK_API_TOKEN) {
  console.error('Error: SEVDESK_API_TOKEN environment variable is required');
  console.error('Please set your sevDesk API token:');
  console.error('  export SEVDESK_API_TOKEN=your-api-token');
  process.exit(1);
}

// Create MCP server
const server = new McpServer({
  name: 'sevdesk-mcp',
  version: '1.0.0',
});

// Register all tools
registerContactsTools(server);
registerInvoicesTools(server);
registerCreditNotesTools(server);
registerOrdersTools(server);
registerVouchersTools(server);
registerTransactionsTools(server);
registerPartsTools(server);
registerBasicsTools(server);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('sevDesk MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
