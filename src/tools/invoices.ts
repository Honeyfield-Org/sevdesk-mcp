import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

const InvoicePositionSchema = z.object({
  name: z.string().describe('Name/description of the position'),
  quantity: z.number().describe('Quantity'),
  price: z.number().describe('Unit price'),
  taxRate: z.number().describe('Tax rate in percent (e.g., 19)'),
  unityId: z.number().describe('Unity ID (1=piece, 2=hour, etc.)'),
  partId: z.number().optional().describe('Optional part/article ID'),
  discount: z.number().optional().describe('Discount in percent'),
  text: z.string().optional().describe('Additional text for this position'),
  positionNumber: z.number().optional().describe('Position number for ordering'),
});

export function registerInvoicesTools(server: McpServer) {
  // List Invoices
  server.tool(
    'list_invoices',
    'List invoices with optional filters.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
      status: z.number().optional().describe('Filter by status (100=Draft, 200=Open, 1000=Paid)'),
      invoiceNumber: z.string().optional().describe('Filter by invoice number'),
      startDate: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
      contactId: z.string().optional().describe('Filter by contact ID'),
    },
    async ({ limit, offset, status, invoiceNumber, startDate, endDate, contactId }) => {
      const client = getSevDeskClient();
      const invoices = await client.listInvoices({
        limit: limit ?? 50,
        offset,
        status,
        invoiceNumber,
        startDate,
        endDate,
        contactId,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(invoices, null, 2) }],
      };
    }
  );

  // Get Invoice
  server.tool(
    'get_invoice',
    'Get detailed information about a specific invoice.',
    {
      invoiceId: z.string().describe('The ID of the invoice to retrieve'),
      embed: z.array(z.string()).optional().describe('Related objects to embed (e.g., positions, contact)'),
    },
    async ({ invoiceId, embed }) => {
      const client = getSevDeskClient();
      const invoice = await client.getInvoice(invoiceId, embed);
      return {
        content: [{ type: 'text', text: JSON.stringify(invoice, null, 2) }],
      };
    }
  );

  // Create Invoice
  server.tool(
    'create_invoice',
    'Create a new invoice with positions.',
    {
      contactId: z.number().describe('The ID of the contact/customer'),
      invoiceDate: z.string().describe('Invoice date (YYYY-MM-DD)'),
      positions: z.array(InvoicePositionSchema).describe('Invoice line items'),
      header: z.string().optional().describe('Invoice header/subject'),
      headText: z.string().optional().describe('Text before positions'),
      footText: z.string().optional().describe('Text after positions'),
      timeToPay: z.number().optional().describe('Payment terms in days'),
      discount: z.number().optional().describe('Discount in percent'),
      discountTime: z.number().optional().describe('Early payment discount time in days'),
      deliveryDate: z.string().optional().describe('Delivery date (YYYY-MM-DD)'),
      deliveryDateUntil: z.string().optional().describe('Delivery end date (YYYY-MM-DD)'),
      status: z.number().optional().describe('Status (100=Draft, 200=Open)'),
      invoiceType: z.enum(['RE', 'WKR', 'SR', 'MA', 'TR', 'ER']).optional().describe('Invoice type'),
      currency: z.string().optional().describe('Currency code (default: EUR)'),
      showNet: z.boolean().optional().describe('Show net prices'),
      addressName: z.string().optional().describe('Custom address name'),
      addressStreet: z.string().optional().describe('Custom address street'),
      addressZip: z.string().optional().describe('Custom address ZIP'),
      addressCity: z.string().optional().describe('Custom address city'),
      addressCountryId: z.number().optional().describe('Custom address country ID'),
      taxRate: z.number().optional().describe('Default tax rate'),
      taxType: z.string().optional().describe('Tax type (default, eu, noteu, custom)'),
      taxSetId: z.number().optional().describe('Tax set ID'),
      paymentMethodId: z.number().optional().describe('Payment method ID'),
      smallSettlement: z.boolean().optional().describe('Small business regulation (Kleinunternehmer)'),
    },
    async (args) => {
      const client = getSevDeskClient();

      const invoice: Record<string, unknown> = {
        objectName: 'Invoice',
        contact: { id: args.contactId, objectName: 'Contact' },
        invoiceDate: args.invoiceDate,
        mapAll: true,
      };

      if (args.header) invoice.header = args.header;
      if (args.headText) invoice.headText = args.headText;
      if (args.footText) invoice.footText = args.footText;
      if (args.timeToPay) invoice.timeToPay = args.timeToPay;
      if (args.discount) invoice.discount = args.discount;
      if (args.discountTime) invoice.discountTime = args.discountTime;
      if (args.deliveryDate) invoice.deliveryDate = args.deliveryDate;
      if (args.deliveryDateUntil) invoice.deliveryDateUntil = args.deliveryDateUntil;
      if (args.status) invoice.status = args.status;
      if (args.invoiceType) invoice.invoiceType = args.invoiceType;
      if (args.currency) invoice.currency = args.currency;
      if (args.showNet !== undefined) invoice.showNet = args.showNet;
      if (args.addressName) invoice.addressName = args.addressName;
      if (args.addressStreet) invoice.addressStreet = args.addressStreet;
      if (args.addressZip) invoice.addressZip = args.addressZip;
      if (args.addressCity) invoice.addressCity = args.addressCity;
      if (args.addressCountryId) invoice.addressCountry = { id: args.addressCountryId, objectName: 'StaticCountry' };
      if (args.taxRate) invoice.taxRate = args.taxRate;
      if (args.taxType) invoice.taxType = args.taxType;
      if (args.taxSetId) invoice.taxSet = { id: args.taxSetId, objectName: 'TaxSet' };
      if (args.paymentMethodId) invoice.paymentMethod = { id: args.paymentMethodId, objectName: 'PaymentMethod' };
      if (args.smallSettlement !== undefined) invoice.smallSettlement = args.smallSettlement;

      const invoicePosSave = args.positions.map((pos, index) => ({
        objectName: 'InvoicePos',
        name: pos.name,
        quantity: pos.quantity,
        price: pos.price,
        taxRate: pos.taxRate,
        unity: { id: pos.unityId, objectName: 'Unity' },
        positionNumber: pos.positionNumber ?? index,
        ...(pos.partId && { part: { id: pos.partId, objectName: 'Part' } }),
        ...(pos.discount && { discount: pos.discount }),
        ...(pos.text && { text: pos.text }),
        mapAll: true,
      }));

      const result = await client.createInvoice({ invoice, invoicePosSave });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Update Invoice
  server.tool(
    'update_invoice',
    'Update an existing invoice. Only works for draft invoices (status 100).',
    {
      invoiceId: z.string().describe('The ID of the invoice to update'),
      header: z.string().optional().describe('Invoice header/subject'),
      headText: z.string().optional().describe('Text before positions'),
      footText: z.string().optional().describe('Text after positions'),
      timeToPay: z.number().optional().describe('Payment terms in days'),
      discount: z.number().optional().describe('Discount in percent'),
      deliveryDate: z.string().optional().describe('Delivery date (YYYY-MM-DD)'),
      deliveryDateUntil: z.string().optional().describe('Delivery end date (YYYY-MM-DD)'),
      status: z.number().optional().describe('Status (100=Draft, 200=Open)'),
    },
    async ({ invoiceId, ...updateData }) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {};

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      const invoice = await client.updateInvoice(invoiceId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(invoice, null, 2) }],
      };
    }
  );

  // Delete Invoice
  server.tool(
    'delete_invoice',
    'Delete an invoice. Only works for draft invoices (status 100).',
    {
      invoiceId: z.string().describe('The ID of the invoice to delete'),
    },
    async ({ invoiceId }) => {
      const client = getSevDeskClient();
      await client.deleteInvoice(invoiceId);
      return {
        content: [{ type: 'text', text: `Invoice ${invoiceId} deleted successfully.` }],
      };
    }
  );

  // Send Invoice Email
  server.tool(
    'send_invoice_email',
    'Send an invoice via email.',
    {
      invoiceId: z.string().describe('The ID of the invoice to send'),
      toEmail: z.string().describe('Recipient email address'),
      subject: z.string().describe('Email subject'),
      text: z.string().describe('Email body text'),
      copy: z.boolean().optional().describe('Send a copy to yourself'),
      ccEmail: z.string().optional().describe('CC email address'),
      bccEmail: z.string().optional().describe('BCC email address'),
    },
    async ({ invoiceId, ...emailData }) => {
      const client = getSevDeskClient();
      const result = await client.sendInvoiceEmail(invoiceId, emailData);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Book Invoice Payment
  server.tool(
    'book_invoice_payment',
    'Book a payment for an invoice.',
    {
      invoiceId: z.string().describe('The ID of the invoice'),
      amount: z.number().describe('Payment amount'),
      date: z.string().describe('Payment date (YYYY-MM-DD)'),
      type: z.string().describe('Payment type (e.g., "N" for normal)'),
      checkAccountId: z.number().optional().describe('ID of the check account'),
      createFeed: z.boolean().optional().describe('Create a feed entry'),
    },
    async ({ invoiceId, amount, date, type, checkAccountId, createFeed }) => {
      const client = getSevDeskClient();
      const data: Parameters<typeof client.bookInvoicePayment>[1] = {
        amount,
        date,
        type,
        createFeed,
      };

      if (checkAccountId) {
        data.checkAccount = { id: checkAccountId, objectName: 'CheckAccount' };
      }

      const result = await client.bookInvoicePayment(invoiceId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Enshrine Invoice
  server.tool(
    'enshrine_invoice',
    'Lock/enshrine an invoice. Once enshrined, it cannot be modified.',
    {
      invoiceId: z.string().describe('The ID of the invoice to enshrine'),
    },
    async ({ invoiceId }) => {
      const client = getSevDeskClient();
      const result = await client.enshrineInvoice(invoiceId);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Reset Invoice to Draft
  server.tool(
    'reset_invoice_to_draft',
    'Reset an invoice back to draft status. Only possible if no payments have been booked.',
    {
      invoiceId: z.string().describe('The ID of the invoice to reset'),
    },
    async ({ invoiceId }) => {
      const client = getSevDeskClient();
      const result = await client.resetInvoiceToDraft(invoiceId);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Get Invoice PDF
  server.tool(
    'get_invoice_pdf',
    'Get the PDF download information for an invoice.',
    {
      invoiceId: z.string().describe('The ID of the invoice'),
    },
    async ({ invoiceId }) => {
      const client = getSevDeskClient();
      const result = await client.getInvoicePdf(invoiceId);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Export Invoice XML (XRechnung)
  server.tool(
    'export_invoice_xml',
    'Export an invoice as XRechnung XML format.',
    {
      invoiceId: z.string().describe('The ID of the invoice to export'),
    },
    async ({ invoiceId }) => {
      const client = getSevDeskClient();
      const result = await client.exportInvoiceXml(invoiceId);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Create Invoice from Order
  server.tool(
    'create_invoice_from_order',
    'Create an invoice from an existing order.',
    {
      orderId: z.string().describe('The ID of the order to convert'),
    },
    async ({ orderId }) => {
      const client = getSevDeskClient();
      const result = await client.createInvoiceFromOrder(orderId);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
