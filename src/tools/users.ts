import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

export function registerUsersTools(server: McpServer) {
  // List Users
  server.tool(
    'list_users',
    'List all sevDesk users (SevUser). Useful for getting user IDs to use as contactPerson in invoices, orders, and credit notes.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
    },
    async ({ limit, offset }) => {
      const client = getSevDeskClient();
      const users = await client.listUsers({
        limit: limit ?? 50,
        offset,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(users, null, 2) }],
      };
    }
  );

  // Get User
  server.tool(
    'get_user',
    'Get detailed information about a specific sevDesk user by ID.',
    {
      userId: z.string().describe('The ID of the user to retrieve'),
    },
    async ({ userId }) => {
      const client = getSevDeskClient();
      const user = await client.getUser(userId);
      return {
        content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
      };
    }
  );
}
