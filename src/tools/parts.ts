import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

export function registerPartsTools(server: McpServer) {
  // List Parts
  server.tool(
    'list_parts',
    'List parts/articles with optional filters.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
      partNumber: z.string().optional().describe('Filter by part number'),
      name: z.string().optional().describe('Filter by name (partial match)'),
    },
    async ({ limit, offset, partNumber, name }) => {
      const client = getSevDeskClient();
      const parts = await client.listParts({
        limit: limit ?? 50,
        offset,
        partNumber,
        name,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(parts, null, 2) }],
      };
    }
  );

  // Get Part
  server.tool(
    'get_part',
    'Get detailed information about a specific part/article.',
    {
      partId: z.string().describe('The ID of the part to retrieve'),
      embed: z.array(z.string()).optional().describe('Related objects to embed'),
    },
    async ({ partId, embed }) => {
      const client = getSevDeskClient();
      const part = await client.getPart(partId, embed);
      return {
        content: [{ type: 'text', text: JSON.stringify(part, null, 2) }],
      };
    }
  );

  // Create Part
  server.tool(
    'create_part',
    'Create a new part/article.',
    {
      name: z.string().describe('Part name'),
      partNumber: z.string().describe('Part number (SKU)'),
      unityId: z.number().describe('Unity ID (1=piece, 2=hour, etc.)'),
      taxRate: z.number().describe('Tax rate in percent (e.g., 19)'),
      text: z.string().optional().describe('Part description'),
      categoryId: z.number().optional().describe('Category ID'),
      stock: z.number().optional().describe('Current stock quantity'),
      stockEnabled: z.boolean().optional().describe('Enable stock tracking'),
      price: z.number().optional().describe('Price (default: net)'),
      priceNet: z.number().optional().describe('Net price'),
      priceGross: z.number().optional().describe('Gross price'),
      pricePurchase: z.number().optional().describe('Purchase price'),
      status: z.number().optional().describe('Status (0=Inactive, 100=Active)'),
      internalComment: z.string().optional().describe('Internal comment'),
    },
    async (args) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {
        name: args.name,
        partNumber: args.partNumber,
        unity: { id: args.unityId, objectName: 'Unity' },
        taxRate: args.taxRate,
      };

      if (args.text) data.text = args.text;
      if (args.categoryId) data.category = { id: args.categoryId, objectName: 'Category' };
      if (args.stock !== undefined) data.stock = args.stock;
      if (args.stockEnabled !== undefined) data.stockEnabled = args.stockEnabled;
      if (args.price !== undefined) data.price = args.price;
      if (args.priceNet !== undefined) data.priceNet = args.priceNet;
      if (args.priceGross !== undefined) data.priceGross = args.priceGross;
      if (args.pricePurchase !== undefined) data.pricePurchase = args.pricePurchase;
      if (args.status !== undefined) data.status = args.status;
      if (args.internalComment) data.internalComment = args.internalComment;

      const part = await client.createPart(data);
      return {
        content: [{ type: 'text', text: JSON.stringify(part, null, 2) }],
      };
    }
  );

  // Update Part
  server.tool(
    'update_part',
    'Update an existing part/article.',
    {
      partId: z.string().describe('The ID of the part to update'),
      name: z.string().optional().describe('Part name'),
      partNumber: z.string().optional().describe('Part number (SKU)'),
      text: z.string().optional().describe('Part description'),
      stock: z.number().optional().describe('Current stock quantity'),
      stockEnabled: z.boolean().optional().describe('Enable stock tracking'),
      price: z.number().optional().describe('Price (default: net)'),
      priceNet: z.number().optional().describe('Net price'),
      priceGross: z.number().optional().describe('Gross price'),
      pricePurchase: z.number().optional().describe('Purchase price'),
      taxRate: z.number().optional().describe('Tax rate in percent'),
      status: z.number().optional().describe('Status (0=Inactive, 100=Active)'),
      internalComment: z.string().optional().describe('Internal comment'),
    },
    async ({ partId, ...updateData }) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {};

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      const part = await client.updatePart(partId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(part, null, 2) }],
      };
    }
  );
}
