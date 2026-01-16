import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getSevDeskClient } from '../sevdesk-client.js';

export function registerContactsTools(server: McpServer) {
  // List Contacts
  server.tool(
    'list_contacts',
    'List contacts with optional filters. Returns customers, suppliers, and other contacts.',
    {
      limit: z.number().optional().describe('Maximum number of results (default: 50)'),
      offset: z.number().optional().describe('Number of results to skip for pagination'),
      depth: z.number().optional().describe('Depth of nested objects (0-3)'),
      customerNumber: z.string().optional().describe('Filter by customer number'),
      name: z.string().optional().describe('Filter by name (partial match)'),
    },
    async ({ limit, offset, depth, customerNumber, name }) => {
      const client = getSevDeskClient();
      const contacts = await client.listContacts({
        limit: limit ?? 50,
        offset,
        depth,
        customerNumber,
        name,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(contacts, null, 2) }],
      };
    }
  );

  // Get Contact
  server.tool(
    'get_contact',
    'Get detailed information about a specific contact by ID.',
    {
      contactId: z.string().describe('The ID of the contact to retrieve'),
      embed: z.array(z.string()).optional().describe('Related objects to embed (e.g., communicationWays, addresses)'),
    },
    async ({ contactId, embed }) => {
      const client = getSevDeskClient();
      const contact = await client.getContact(contactId, embed);
      return {
        content: [{ type: 'text', text: JSON.stringify(contact, null, 2) }],
      };
    }
  );

  // Create Contact
  server.tool(
    'create_contact',
    'Create a new contact (customer, supplier, or partner).',
    {
      name: z.string().describe('Company name or display name'),
      name2: z.string().optional().describe('Additional name field'),
      surename: z.string().optional().describe('First name (for persons)'),
      familyname: z.string().optional().describe('Last name (for persons)'),
      categoryId: z.number().describe('Category ID (3=Customer, 4=Supplier, 28=Partner)'),
      customerNumber: z.string().optional().describe('Custom customer number'),
      description: z.string().optional().describe('Description or notes'),
      vatNumber: z.string().optional().describe('VAT number'),
      taxNumber: z.string().optional().describe('Tax number'),
      bankAccount: z.string().optional().describe('Bank account number (IBAN)'),
      bankNumber: z.string().optional().describe('Bank code (BIC)'),
      defaultTimeToPay: z.number().optional().describe('Default payment terms in days'),
      gender: z.string().optional().describe('Gender (m/f)'),
      academicTitle: z.string().optional().describe('Academic title'),
      titel: z.string().optional().describe('Title (e.g., Dr.)'),
      birthday: z.string().optional().describe('Birthday (YYYY-MM-DD)'),
      exemptVat: z.boolean().optional().describe('Exempt from VAT'),
    },
    async (args) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {
        name: args.name,
        category: { id: args.categoryId, objectName: 'Category' },
      };

      if (args.name2) data.name2 = args.name2;
      if (args.surename) data.surename = args.surename;
      if (args.familyname) data.familyname = args.familyname;
      if (args.customerNumber) data.customerNumber = args.customerNumber;
      if (args.description) data.description = args.description;
      if (args.vatNumber) data.vatNumber = args.vatNumber;
      if (args.taxNumber) data.taxNumber = args.taxNumber;
      if (args.bankAccount) data.bankAccount = args.bankAccount;
      if (args.bankNumber) data.bankNumber = args.bankNumber;
      if (args.defaultTimeToPay) data.defaultTimeToPay = args.defaultTimeToPay;
      if (args.gender) data.gender = args.gender;
      if (args.academicTitle) data.academicTitle = args.academicTitle;
      if (args.titel) data.titel = args.titel;
      if (args.birthday) data.birthday = args.birthday;
      if (args.exemptVat !== undefined) data.exemptVat = args.exemptVat;

      const contact = await client.createContact(data);
      return {
        content: [{ type: 'text', text: JSON.stringify(contact, null, 2) }],
      };
    }
  );

  // Update Contact
  server.tool(
    'update_contact',
    'Update an existing contact.',
    {
      contactId: z.string().describe('The ID of the contact to update'),
      name: z.string().optional().describe('Company name or display name'),
      name2: z.string().optional().describe('Additional name field'),
      surename: z.string().optional().describe('First name'),
      familyname: z.string().optional().describe('Last name'),
      customerNumber: z.string().optional().describe('Customer number'),
      description: z.string().optional().describe('Description or notes'),
      vatNumber: z.string().optional().describe('VAT number'),
      taxNumber: z.string().optional().describe('Tax number'),
      bankAccount: z.string().optional().describe('Bank account number (IBAN)'),
      bankNumber: z.string().optional().describe('Bank code (BIC)'),
      defaultTimeToPay: z.number().optional().describe('Default payment terms in days'),
      exemptVat: z.boolean().optional().describe('Exempt from VAT'),
    },
    async ({ contactId, ...updateData }) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {};

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          data[key] = value;
        }
      });

      const contact = await client.updateContact(contactId, data);
      return {
        content: [{ type: 'text', text: JSON.stringify(contact, null, 2) }],
      };
    }
  );

  // Delete Contact
  server.tool(
    'delete_contact',
    'Delete a contact. Note: This may fail if the contact has associated documents.',
    {
      contactId: z.string().describe('The ID of the contact to delete'),
    },
    async ({ contactId }) => {
      const client = getSevDeskClient();
      await client.deleteContact(contactId);
      return {
        content: [{ type: 'text', text: `Contact ${contactId} deleted successfully.` }],
      };
    }
  );

  // Get Next Customer Number
  server.tool(
    'get_next_customer_number',
    'Generate the next available customer number.',
    {},
    async () => {
      const client = getSevDeskClient();
      const result = await client.getNextCustomerNumber();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // List Contact Addresses
  server.tool(
    'list_contact_addresses',
    'List all addresses for a specific contact.',
    {
      contactId: z.string().describe('The ID of the contact'),
    },
    async ({ contactId }) => {
      const client = getSevDeskClient();
      const addresses = await client.listContactAddresses(contactId);
      return {
        content: [{ type: 'text', text: JSON.stringify(addresses, null, 2) }],
      };
    }
  );

  // Create Contact Address
  server.tool(
    'create_contact_address',
    'Create a new address for a contact.',
    {
      contactId: z.number().describe('The ID of the contact'),
      street: z.string().optional().describe('Street and house number'),
      zip: z.string().optional().describe('ZIP/Postal code'),
      city: z.string().optional().describe('City'),
      countryId: z.number().describe('Country ID (1=Germany, see sevDesk documentation for others)'),
      name: z.string().optional().describe('Name line 1'),
      name2: z.string().optional().describe('Name line 2'),
      name3: z.string().optional().describe('Name line 3'),
      name4: z.string().optional().describe('Name line 4'),
      categoryId: z.number().optional().describe('Address category ID'),
    },
    async (args) => {
      const client = getSevDeskClient();
      const data: Record<string, unknown> = {
        contact: { id: args.contactId, objectName: 'Contact' },
        country: { id: args.countryId, objectName: 'StaticCountry' },
      };

      if (args.street) data.street = args.street;
      if (args.zip) data.zip = args.zip;
      if (args.city) data.city = args.city;
      if (args.name) data.name = args.name;
      if (args.name2) data.name2 = args.name2;
      if (args.name3) data.name3 = args.name3;
      if (args.name4) data.name4 = args.name4;
      if (args.categoryId) data.category = { id: args.categoryId, objectName: 'Category' };

      const address = await client.createContactAddress(data);
      return {
        content: [{ type: 'text', text: JSON.stringify(address, null, 2) }],
      };
    }
  );
}
