import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

export function registerTransactionsTools(server: McpServer) {
  // List Check Accounts
  server.tool(
    'list_check_accounts',
    'List all payment accounts (bank accounts, cash registers, etc.).',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
    },
    async ({ limit, offset }) => {
      const client = getSevDeskClient();
      const checkAccounts = await client.listCheckAccounts({
        limit: limit ?? 50,
        offset,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(checkAccounts, null, 2) }],
      };
    }
  );

  // List Transactions
  server.tool(
    'list_transactions',
    'List transactions for payment accounts.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
      checkAccountId: z.string().optional().describe('Filter by check account ID'),
      startDate: z.string().optional().describe('Filter by start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('Filter by end date (YYYY-MM-DD)'),
      isBooked: z.boolean().optional().describe('Filter by booking status'),
    },
    async ({ limit, offset, checkAccountId, startDate, endDate, isBooked }) => {
      const client = getSevDeskClient();
      const transactions = await client.listTransactions({
        limit: limit ?? 50,
        offset,
        checkAccountId,
        startDate,
        endDate,
        isBooked,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(transactions, null, 2) }],
      };
    }
  );

  // Get Transaction
  server.tool(
    'get_transaction',
    'Get detailed information about a specific transaction.',
    {
      transactionId: z.string().describe('The ID of the transaction to retrieve'),
      embed: z.array(z.string()).optional().describe('Related objects to embed'),
    },
    async ({ transactionId, embed }) => {
      const client = getSevDeskClient();
      const transaction = await client.getTransaction(transactionId, embed);
      return {
        content: [{ type: 'text', text: JSON.stringify(transaction, null, 2) }],
      };
    }
  );

  // Create Transaction
  server.tool(
    'create_transaction',
    'Create a new transaction in a check account.',
    {
      checkAccountId: z.number().describe('The ID of the check account'),
      valueDate: z.string().describe('Value date (YYYY-MM-DD)'),
      amount: z.number().describe('Transaction amount (positive for income, negative for expense)'),
      entryDate: z.string().optional().describe('Entry date (YYYY-MM-DD)'),
      paymtPurpose: z.string().optional().describe('Payment purpose/description'),
      payeePayerName: z.string().optional().describe('Name of payee/payer'),
      payeePayerAcctNo: z.string().optional().describe('Account number of payee/payer (IBAN)'),
      payeePayerBankCode: z.string().optional().describe('Bank code of payee/payer (BIC)'),
      status: z.number().optional().describe('Transaction status (100=Created, 200=Linked, 300=Private, 400=Booked)'),
    },
    async (args) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {
        checkAccount: { id: args.checkAccountId, objectName: 'CheckAccount' },
        valueDate: args.valueDate,
        amount: args.amount,
      };

      if (args.entryDate) data.entryDate = args.entryDate;
      if (args.paymtPurpose) data.paymtPurpose = args.paymtPurpose;
      if (args.payeePayerName) data.payeePayerName = args.payeePayerName;
      if (args.payeePayerAcctNo) data.payeePayerAcctNo = args.payeePayerAcctNo;
      if (args.payeePayerBankCode) data.payeePayerBankCode = args.payeePayerBankCode;
      if (args.status !== undefined) data.status = args.status;

      const transaction = await client.createTransaction(data);
      return {
        content: [{ type: 'text', text: JSON.stringify(transaction, null, 2) }],
      };
    }
  );

  // Update Transaction
  server.tool(
    'update_transaction',
    'Update an existing transaction.',
    {
      transactionId: z.string().describe('The ID of the transaction to update'),
      paymtPurpose: z.string().optional().describe('Payment purpose/description'),
      payeePayerName: z.string().optional().describe('Name of payee/payer'),
      payeePayerAcctNo: z.string().optional().describe('Account number of payee/payer (IBAN)'),
      payeePayerBankCode: z.string().optional().describe('Bank code of payee/payer (BIC)'),
      status: z.number().optional().describe('Transaction status (100=Created, 200=Linked, 300=Private, 400=Booked)'),
    },
    async ({ transactionId, ...updateData }) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {};

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      const transaction = await client.updateTransaction(transactionId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(transaction, null, 2) }],
      };
    }
  );
}
