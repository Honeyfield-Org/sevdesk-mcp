import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

const OrderPositionSchema = z.object({
  name: z.string().describe('Name/description of the position'),
  quantity: z.number().describe('Quantity'),
  price: z.number().describe('Unit price'),
  taxRate: z.number().describe('Tax rate in percent (e.g., 19)'),
  unityId: z.number().describe('Unity ID (1=piece, 2=hour, etc.)'),
  partId: z.number().optional().describe('Optional part/article ID'),
  discount: z.number().optional().describe('Discount in percent'),
  text: z.string().optional().describe('Additional text for this position'),
  positionNumber: z.number().optional().describe('Position number for ordering'),
  optional: z.boolean().optional().describe('Mark position as optional'),
});

export function registerOrdersTools(server: McpServer) {
  // List Orders
  server.tool(
    'list_orders',
    'List orders/quotes with optional filters.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
      status: z.number().optional().describe('Filter by status (100=Draft, 200=Delivered, 300=Accepted, 500=Partially invoiced, 750=Invoiced, 1000=Cancelled)'),
      orderNumber: z.string().optional().describe('Filter by order number'),
      orderType: z.string().optional().describe('Filter by order type (AN=Quote, AB=Order confirmation, LI=Delivery note)'),
      startDate: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
      contactId: z.string().optional().describe('Filter by contact ID'),
    },
    async ({ limit, offset, status, orderNumber, orderType, startDate, endDate, contactId }) => {
      const client = getSevDeskClient();
      const orders = await client.listOrders({
        limit: limit ?? 50,
        offset,
        status,
        orderNumber,
        orderType,
        startDate,
        endDate,
        contactId,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(orders, null, 2) }],
      };
    }
  );

  // Get Order
  server.tool(
    'get_order',
    'Get detailed information about a specific order/quote.',
    {
      orderId: z.string().describe('The ID of the order to retrieve'),
      embed: z.array(z.string()).optional().describe('Related objects to embed (e.g., positions, contact)'),
    },
    async ({ orderId, embed }) => {
      const client = getSevDeskClient();
      const order = await client.getOrder(orderId, embed);
      return {
        content: [{ type: 'text', text: JSON.stringify(order, null, 2) }],
      };
    }
  );

  // Create Order
  server.tool(
    'create_order',
    'Create a new order/quote with positions.',
    {
      contactId: z.number().describe('The ID of the contact/customer'),
      orderDate: z.string().describe('Order date (YYYY-MM-DD)'),
      orderType: z.enum(['AN', 'AB', 'LI']).describe('Order type (AN=Quote, AB=Order confirmation, LI=Delivery note)'),
      positions: z.array(OrderPositionSchema).describe('Order line items'),
      header: z.string().optional().describe('Order header/subject'),
      headText: z.string().optional().describe('Text before positions'),
      footText: z.string().optional().describe('Text after positions'),
      deliveryDate: z.string().optional().describe('Delivery date (YYYY-MM-DD)'),
      deliveryDateUntil: z.string().optional().describe('Delivery end date (YYYY-MM-DD)'),
      status: z.number().optional().describe('Status (100=Draft, 200=Delivered, etc.)'),
      currency: z.string().optional().describe('Currency code (default: EUR)'),
      showNet: z.boolean().optional().describe('Show net prices'),
      addressName: z.string().optional().describe('Custom address name'),
      addressStreet: z.string().optional().describe('Custom address street'),
      addressZip: z.string().optional().describe('Custom address ZIP'),
      addressCity: z.string().optional().describe('Custom address city'),
      addressCountryId: z.number().optional().describe('Custom address country ID'),
      taxRate: z.number().optional().describe('Default tax rate'),
      taxType: z.string().optional().describe('Tax type (default, eu, noteu, custom)'),
      taxText: z.string().optional().describe('Tax description text (e.g. "Umsatzsteuer 20%")'),
      taxSetId: z.number().optional().describe('Tax set ID'),
      taxRuleId: z.number().optional().describe('Tax rule ID (sevDesk 2.0, default: 1 = Umsatzsteuerpflichtige Umsätze)'),
      smallSettlement: z.boolean().optional().describe('Small business regulation (Kleinunternehmer)'),
      contactPersonId: z.number().optional().describe('ID des sevDesk-Benutzers als Kontaktperson'),
    },
    async (args) => {
      const client = getSevDeskClient();

      // Fetch next order number automatically
      const orderNumber = await client.getNextOrderNumber(args.orderType);

      const order: Record<string, unknown> = {
        objectName: 'Order',
        orderNumber,
        contact: { id: args.contactId, objectName: 'Contact' },
        orderDate: args.orderDate,
        orderType: args.orderType,
        mapAll: true,
        status: args.status ?? 100,
        header: args.header ?? `${args.orderType}-${orderNumber}`,
        currency: args.currency ?? 'EUR',
        taxRate: args.taxRate ?? 0,
        taxType: args.taxType ?? 'default',
        taxText: args.taxText ?? 'Umsatzsteuer',
        taxRule: { id: args.taxRuleId ?? 1, objectName: 'TaxRule' },
        version: 0,
      };

      if (args.addressCountryId) order.addressCountry = { id: args.addressCountryId, objectName: 'StaticCountry' };

      if (args.headText) order.headText = args.headText;
      if (args.footText) order.footText = args.footText;
      if (args.deliveryDate) order.deliveryDate = args.deliveryDate;
      if (args.deliveryDateUntil) order.deliveryDateUntil = args.deliveryDateUntil;
      if (args.showNet !== undefined) order.showNet = args.showNet;
      if (args.addressName) order.addressName = args.addressName;
      if (args.addressStreet) order.addressStreet = args.addressStreet;
      if (args.addressZip) order.addressZip = args.addressZip;
      if (args.addressCity) order.addressCity = args.addressCity;
      if (args.taxSetId) order.taxSet = { id: args.taxSetId, objectName: 'TaxSet' };
      if (args.smallSettlement !== undefined) order.smallSettlement = args.smallSettlement;
      if (args.contactPersonId !== undefined) {
        order.contactPerson = { id: args.contactPersonId, objectName: 'SevUser' };
      } else {
        const users = await client.listUsers({ limit: 1 });
        if (users && users.length > 0) {
          order.contactPerson = { id: (users[0] as any).id, objectName: 'SevUser' };
        }
      }

      const orderPosSave = args.positions.map((pos, index) => ({
        objectName: 'OrderPos',
        name: pos.name,
        quantity: pos.quantity,
        price: pos.price,
        taxRate: pos.taxRate,
        unity: { id: pos.unityId, objectName: 'Unity' },
        positionNumber: pos.positionNumber ?? index,
        ...(pos.partId && { part: { id: pos.partId, objectName: 'Part' } }),
        ...(pos.discount && { discount: pos.discount }),
        ...(pos.text && { text: pos.text }),
        ...(pos.optional !== undefined && { optional: pos.optional }),
        mapAll: true,
      }));

      const result = await client.createOrder({ order, orderPosSave });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Update Order
  server.tool(
    'update_order',
    'Update an existing order. Only works for draft orders (status 100).',
    {
      orderId: z.string().describe('The ID of the order to update'),
      header: z.string().optional().describe('Order header/subject'),
      headText: z.string().optional().describe('Text before positions'),
      footText: z.string().optional().describe('Text after positions'),
      deliveryDate: z.string().optional().describe('Delivery date (YYYY-MM-DD)'),
      deliveryDateUntil: z.string().optional().describe('Delivery end date (YYYY-MM-DD)'),
      status: z.number().optional().describe('Status (100=Draft, 200=Delivered, etc.)'),
    },
    async ({ orderId, ...updateData }) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {};

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      const order = await client.updateOrder(orderId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(order, null, 2) }],
      };
    }
  );

  // Delete Order
  server.tool(
    'delete_order',
    'Delete an order. Only works for draft orders (status 100).',
    {
      orderId: z.string().describe('The ID of the order to delete'),
    },
    async ({ orderId }) => {
      const client = getSevDeskClient();
      await client.deleteOrder(orderId);
      return {
        content: [{ type: 'text', text: `Order ${orderId} deleted successfully.` }],
      };
    }
  );

  // Send Order Email
  server.tool(
    'send_order_email',
    'Send an order/quote via email.',
    {
      orderId: z.string().describe('The ID of the order to send'),
      toEmail: z.string().describe('Recipient email address'),
      subject: z.string().describe('Email subject'),
      text: z.string().describe('Email body text'),
      copy: z.boolean().optional().describe('Send a copy to yourself'),
      ccEmail: z.string().optional().describe('CC email address'),
      bccEmail: z.string().optional().describe('BCC email address'),
    },
    async ({ orderId, ...emailData }) => {
      const client = getSevDeskClient();
      const result = await client.sendOrderEmail(orderId, emailData);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
