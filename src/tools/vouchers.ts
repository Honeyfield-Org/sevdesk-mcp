import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

const VoucherPositionSchema = z.object({
  accountingTypeId: z.number().describe('Accounting type ID (expense account)'),
  taxRate: z.number().describe('Tax rate in percent (e.g., 19)'),
  sumNet: z.number().describe('Net amount'),
  sumGross: z.number().describe('Gross amount'),
  net: z.boolean().describe('Whether the amount is net (true) or gross (false)'),
  isAsset: z.boolean().optional().describe('Whether this is an asset'),
  comment: z.string().optional().describe('Comment for this position'),
});

export function registerVouchersTools(server: McpServer) {
  // List Vouchers
  server.tool(
    'list_vouchers',
    'List vouchers (receipts/expense documents) with optional filters.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
      status: z.number().optional().describe('Filter by status (50=Draft, 100=Unpaid, 1000=Paid)'),
      voucherType: z.string().optional().describe('Filter by voucher type (VOU=Voucher, RV=Recurring voucher)'),
      startDate: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
    },
    async ({ limit, offset, status, voucherType, startDate, endDate }) => {
      const client = getSevDeskClient();
      const vouchers = await client.listVouchers({
        limit: limit ?? 50,
        offset,
        status,
        voucherType,
        startDate,
        endDate,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(vouchers, null, 2) }],
      };
    }
  );

  // Get Voucher
  server.tool(
    'get_voucher',
    'Get detailed information about a specific voucher.',
    {
      voucherId: z.string().describe('The ID of the voucher to retrieve'),
      embed: z.array(z.string()).optional().describe('Related objects to embed (e.g., positions, supplier)'),
    },
    async ({ voucherId, embed }) => {
      const client = getSevDeskClient();
      const voucher = await client.getVoucher(voucherId, embed);
      return {
        content: [{ type: 'text', text: JSON.stringify(voucher, null, 2) }],
      };
    }
  );

  // Create Voucher
  server.tool(
    'create_voucher',
    'Create a new voucher (expense document) with positions.',
    {
      voucherDate: z.string().describe('Voucher date (YYYY-MM-DD)'),
      positions: z.array(VoucherPositionSchema).describe('Voucher line items'),
      supplierId: z.number().optional().describe('The ID of the supplier contact'),
      supplierName: z.string().optional().describe('Supplier name (if no supplier contact)'),
      description: z.string().optional().describe('Voucher description'),
      status: z.number().optional().describe('Status (50=Draft, 100=Unpaid, 1000=Paid)'),
      creditDebit: z.enum(['C', 'D']).describe('Credit (C) or Debit (D)'),
      taxType: z.string().describe('Tax type (default, eu, noteu, custom, ss)'),
      voucherType: z.enum(['VOU', 'RV']).optional().describe('Voucher type (VOU=Voucher, RV=Recurring)'),
      currency: z.string().optional().describe('Currency code (default: EUR)'),
      taxSetId: z.number().optional().describe('Tax set ID'),
      paymentDeadline: z.string().optional().describe('Payment deadline (YYYY-MM-DD)'),
      deliveryDate: z.string().optional().describe('Delivery date (YYYY-MM-DD)'),
      deliveryDateUntil: z.string().optional().describe('Delivery end date (YYYY-MM-DD)'),
    },
    async (args) => {
      const client = getSevDeskClient();

      const voucher: Record<string, unknown> = {
        objectName: 'Voucher',
        voucherDate: args.voucherDate,
        creditDebit: args.creditDebit,
        taxType: args.taxType,
        mapAll: true,
      };

      if (args.supplierId !== undefined) voucher.supplier = { id: args.supplierId, objectName: 'Contact' };
      if (args.supplierName) voucher.supplierName = args.supplierName;
      if (args.description) voucher.description = args.description;
      if (args.status !== undefined) voucher.status = args.status;
      if (args.voucherType) voucher.voucherType = args.voucherType;
      if (args.currency) voucher.currency = args.currency;
      if (args.taxSetId !== undefined) voucher.taxSet = { id: args.taxSetId, objectName: 'TaxSet' };
      if (args.paymentDeadline) voucher.paymentDeadline = args.paymentDeadline;
      if (args.deliveryDate) voucher.deliveryDate = args.deliveryDate;
      if (args.deliveryDateUntil) voucher.deliveryDateUntil = args.deliveryDateUntil;

      const voucherPosSave = args.positions.map((pos) => ({
        objectName: 'VoucherPos',
        accountingType: { id: pos.accountingTypeId, objectName: 'AccountingType' },
        taxRate: pos.taxRate,
        sumNet: pos.sumNet,
        sumGross: pos.sumGross,
        net: pos.net,
        ...(pos.isAsset !== undefined && { isAsset: pos.isAsset }),
        ...(pos.comment && { comment: pos.comment }),
        mapAll: true,
      }));

      const result = await client.createVoucher({ voucher, voucherPosSave });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Update Voucher
  server.tool(
    'update_voucher',
    'Update an existing voucher. Only works for draft vouchers (status 50).',
    {
      voucherId: z.string().describe('The ID of the voucher to update'),
      description: z.string().optional().describe('Voucher description'),
      status: z.number().optional().describe('Status (50=Draft, 100=Unpaid, 1000=Paid)'),
      paymentDeadline: z.string().optional().describe('Payment deadline (YYYY-MM-DD)'),
    },
    async ({ voucherId, ...updateData }) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {};

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      const voucher = await client.updateVoucher(voucherId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(voucher, null, 2) }],
      };
    }
  );

  // Book Voucher
  server.tool(
    'book_voucher',
    'Book a payment for a voucher.',
    {
      voucherId: z.string().describe('The ID of the voucher'),
      amount: z.number().describe('Payment amount'),
      date: z.string().describe('Payment date (YYYY-MM-DD)'),
      type: z.string().describe('Payment type (e.g., "N" for normal)'),
      checkAccountId: z.number().optional().describe('ID of the check account'),
      createFeed: z.boolean().optional().describe('Create a feed entry'),
    },
    async ({ voucherId, amount, date, type, checkAccountId, createFeed }) => {
      const client = getSevDeskClient();
      const data: Parameters<typeof client.bookVoucher>[1] = {
        amount,
        date,
        type,
        createFeed,
      };

      if (checkAccountId) {
        data.checkAccount = { id: checkAccountId, objectName: 'CheckAccount' };
      }

      const result = await client.bookVoucher(voucherId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
