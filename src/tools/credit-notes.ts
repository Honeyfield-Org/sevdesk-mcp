import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

const CreditNotePositionSchema = z.object({
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

export function registerCreditNotesTools(server: McpServer) {
  // List Credit Notes
  server.tool(
    'list_credit_notes',
    'List credit notes with optional filters.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
      status: z.number().optional().describe('Filter by status (100=Draft, 200=Open, 1000=Paid)'),
      creditNoteNumber: z.string().optional().describe('Filter by credit note number'),
      startDate: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
      contactId: z.string().optional().describe('Filter by contact ID'),
    },
    async ({ limit, offset, status, creditNoteNumber, startDate, endDate, contactId }) => {
      const client = getSevDeskClient();
      const creditNotes = await client.listCreditNotes({
        limit: limit ?? 50,
        offset,
        status,
        creditNoteNumber,
        startDate,
        endDate,
        contactId,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(creditNotes, null, 2) }],
      };
    }
  );

  // Get Credit Note
  server.tool(
    'get_credit_note',
    'Get detailed information about a specific credit note.',
    {
      creditNoteId: z.string().describe('The ID of the credit note to retrieve'),
      embed: z.array(z.string()).optional().describe('Related objects to embed (e.g., positions, contact)'),
    },
    async ({ creditNoteId, embed }) => {
      const client = getSevDeskClient();
      const creditNote = await client.getCreditNote(creditNoteId, embed);
      return {
        content: [{ type: 'text', text: JSON.stringify(creditNote, null, 2) }],
      };
    }
  );

  // Create Credit Note
  server.tool(
    'create_credit_note',
    'Create a new credit note with positions.',
    {
      contactId: z.number().describe('The ID of the contact/customer'),
      creditNoteDate: z.string().describe('Credit note date (YYYY-MM-DD)'),
      positions: z.array(CreditNotePositionSchema).describe('Credit note line items'),
      header: z.string().optional().describe('Credit note header/subject'),
      headText: z.string().optional().describe('Text before positions'),
      footText: z.string().optional().describe('Text after positions'),
      status: z.number().optional().describe('Status (100=Draft, 200=Open)'),
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
      contactPersonId: z.number().optional().describe('ID des sevDesk-Benutzers als Kontaktperson'),
    },
    async (args) => {
      const client = getSevDeskClient();

      const creditNote: Record<string, unknown> = {
        objectName: 'CreditNote',
        contact: { id: args.contactId, objectName: 'Contact' },
        creditNoteDate: args.creditNoteDate,
        mapAll: true,
      };

      if (args.header) creditNote.header = args.header;
      if (args.headText) creditNote.headText = args.headText;
      if (args.footText) creditNote.footText = args.footText;
      if (args.status) creditNote.status = args.status;
      if (args.currency) creditNote.currency = args.currency;
      if (args.showNet !== undefined) creditNote.showNet = args.showNet;
      if (args.addressName) creditNote.addressName = args.addressName;
      if (args.addressStreet) creditNote.addressStreet = args.addressStreet;
      if (args.addressZip) creditNote.addressZip = args.addressZip;
      if (args.addressCity) creditNote.addressCity = args.addressCity;
      if (args.addressCountryId) creditNote.addressCountry = { id: args.addressCountryId, objectName: 'StaticCountry' };
      if (args.taxRate) creditNote.taxRate = args.taxRate;
      if (args.taxType) creditNote.taxType = args.taxType;
      if (args.taxSetId) creditNote.taxSet = { id: args.taxSetId, objectName: 'TaxSet' };
      if (args.contactPersonId) creditNote.contactPerson = { id: args.contactPersonId, objectName: 'SevUser' };

      const creditNotePosSave = args.positions.map((pos, index) => ({
        objectName: 'CreditNotePos',
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

      const result = await client.createCreditNote({ creditNote, creditNotePosSave });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Update Credit Note
  server.tool(
    'update_credit_note',
    'Update an existing credit note. Only works for draft credit notes (status 100).',
    {
      creditNoteId: z.string().describe('The ID of the credit note to update'),
      header: z.string().optional().describe('Credit note header/subject'),
      headText: z.string().optional().describe('Text before positions'),
      footText: z.string().optional().describe('Text after positions'),
      status: z.number().optional().describe('Status (100=Draft, 200=Open)'),
    },
    async ({ creditNoteId, ...updateData }) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {};

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      const creditNote = await client.updateCreditNote(creditNoteId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(creditNote, null, 2) }],
      };
    }
  );

  // Delete Credit Note
  server.tool(
    'delete_credit_note',
    'Delete a credit note. Only works for draft credit notes (status 100).',
    {
      creditNoteId: z.string().describe('The ID of the credit note to delete'),
    },
    async ({ creditNoteId }) => {
      const client = getSevDeskClient();
      await client.deleteCreditNote(creditNoteId);
      return {
        content: [{ type: 'text', text: `Credit note ${creditNoteId} deleted successfully.` }],
      };
    }
  );

  // Send Credit Note Email
  server.tool(
    'send_credit_note_email',
    'Send a credit note via email.',
    {
      creditNoteId: z.string().describe('The ID of the credit note to send'),
      toEmail: z.string().describe('Recipient email address'),
      subject: z.string().describe('Email subject'),
      text: z.string().describe('Email body text'),
      copy: z.boolean().optional().describe('Send a copy to yourself'),
      ccEmail: z.string().optional().describe('CC email address'),
      bccEmail: z.string().optional().describe('BCC email address'),
    },
    async ({ creditNoteId, ...emailData }) => {
      const client = getSevDeskClient();
      const result = await client.sendCreditNoteEmail(creditNoteId, emailData);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Book Credit Note Payment
  server.tool(
    'book_credit_note_payment',
    'Book a payment for a credit note.',
    {
      creditNoteId: z.string().describe('The ID of the credit note'),
      amount: z.number().describe('Payment amount'),
      date: z.string().describe('Payment date (YYYY-MM-DD)'),
      type: z.string().describe('Payment type (e.g., "N" for normal)'),
      checkAccountId: z.number().optional().describe('ID of the check account'),
      createFeed: z.boolean().optional().describe('Create a feed entry'),
    },
    async ({ creditNoteId, amount, date, type, checkAccountId, createFeed }) => {
      const client = getSevDeskClient();
      const data: Parameters<typeof client.bookCreditNotePayment>[1] = {
        amount,
        date,
        type,
        createFeed,
      };

      if (checkAccountId) {
        data.checkAccount = { id: checkAccountId, objectName: 'CheckAccount' };
      }

      const result = await client.bookCreditNotePayment(creditNoteId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Enshrine Credit Note
  server.tool(
    'enshrine_credit_note',
    'Lock/enshrine a credit note. Once enshrined, it cannot be modified.',
    {
      creditNoteId: z.string().describe('The ID of the credit note to enshrine'),
    },
    async ({ creditNoteId }) => {
      const client = getSevDeskClient();
      const result = await client.enshrineCreditNote(creditNoteId);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Create Credit Note from Invoice
  server.tool(
    'create_credit_note_from_invoice',
    'Create a credit note from an existing invoice.',
    {
      invoiceId: z.string().describe('The ID of the invoice to convert'),
    },
    async ({ invoiceId }) => {
      const client = getSevDeskClient();
      const result = await client.createCreditNoteFromInvoice(invoiceId);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
