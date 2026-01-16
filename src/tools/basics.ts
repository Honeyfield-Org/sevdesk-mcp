import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

export function registerBasicsTools(server: McpServer) {
  // Get System Version
  server.tool(
    'get_system_version',
    'Get the current sevDesk system version.',
    {},
    async () => {
      const client = getSevDeskClient();
      const version = await client.getSystemVersion();
      return {
        content: [{ type: 'text', text: JSON.stringify(version, null, 2) }],
      };
    }
  );

  // Get Next Sequence Number
  server.tool(
    'get_next_sequence_number',
    'Get the next sequence number for a specific document type.',
    {
      objectType: z.string().describe('Object type (e.g., Invoice, CreditNote, Order, Voucher)'),
    },
    async ({ objectType }) => {
      const client = getSevDeskClient();
      const result = await client.getNextSequenceNumber(objectType);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Export Data
  server.tool(
    'export_data',
    'Export data of a specific object type. Returns a list of objects.',
    {
      objectType: z.enum(['Contact', 'Invoice', 'CreditNote', 'Order', 'Voucher', 'Part', 'CheckAccount', 'CheckAccountTransaction']).describe('Type of objects to export'),
      startDate: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
    },
    async ({ objectType, startDate, endDate }) => {
      const client = getSevDeskClient();
      const data = await client.exportData({
        objectType,
        startDate,
        endDate,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }
  );
}
