# @honeyfield/sevdesk-mcp

MCP Server for the sevDesk Accounting API. This server provides 52 tools for managing contacts, invoices, credit notes, orders, vouchers, transactions, and parts in sevDesk.

## Installation

```bash
npm install -g @honeyfield/sevdesk-mcp
```

Or use directly with npx:

```bash
npx @honeyfield/sevdesk-mcp
```

## Configuration

### Environment Variable

Set your sevDesk API token as an environment variable:

```bash
export SEVDESK_API_TOKEN=your-api-token
```

### Getting an API Token

1. Log in to your [sevDesk account](https://my.sevdesk.de)
2. Go to **Settings** (Einstellungen) → **Users** (Benutzer) → **API Token**
3. Generate a new token
4. Copy and store the token securely (it's only shown once)

### Claude Desktop / Claude Code

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "sevdesk": {
      "command": "npx",
      "args": ["@honeyfield/sevdesk-mcp"],
      "env": {
        "SEVDESK_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Available Tools (52)

### Contacts (8 Tools)

| Tool | Description |
|------|-------------|
| `list_contacts` | List contacts with filters (customers, suppliers, partners) |
| `get_contact` | Get contact details by ID |
| `create_contact` | Create a new contact |
| `update_contact` | Update an existing contact |
| `delete_contact` | Delete a contact |
| `get_next_customer_number` | Generate the next customer number |
| `list_contact_addresses` | List addresses for a contact |
| `create_contact_address` | Create a new contact address |

### Invoices (12 Tools)

| Tool | Description |
|------|-------------|
| `list_invoices` | List invoices with filters |
| `get_invoice` | Get invoice details by ID |
| `create_invoice` | Create a new invoice with positions |
| `update_invoice` | Update an existing invoice |
| `delete_invoice` | Delete an invoice |
| `send_invoice_email` | Send invoice via email |
| `book_invoice_payment` | Book a payment for an invoice |
| `enshrine_invoice` | Lock/finalize an invoice |
| `reset_invoice_to_draft` | Reset invoice to draft status |
| `get_invoice_pdf` | Get invoice PDF download info |
| `export_invoice_xml` | Export invoice as XRechnung XML |
| `create_invoice_from_order` | Create invoice from an order |

### Credit Notes (9 Tools)

| Tool | Description |
|------|-------------|
| `list_credit_notes` | List credit notes with filters |
| `get_credit_note` | Get credit note details by ID |
| `create_credit_note` | Create a new credit note |
| `update_credit_note` | Update an existing credit note |
| `delete_credit_note` | Delete a credit note |
| `send_credit_note_email` | Send credit note via email |
| `book_credit_note_payment` | Book a payment for a credit note |
| `enshrine_credit_note` | Lock/finalize a credit note |
| `create_credit_note_from_invoice` | Create credit note from an invoice |

### Orders (6 Tools)

| Tool | Description |
|------|-------------|
| `list_orders` | List orders/quotes with filters |
| `get_order` | Get order details by ID |
| `create_order` | Create a new order/quote |
| `update_order` | Update an existing order |
| `delete_order` | Delete an order |
| `send_order_email` | Send order via email |

### Vouchers (5 Tools)

| Tool | Description |
|------|-------------|
| `list_vouchers` | List vouchers/receipts with filters |
| `get_voucher` | Get voucher details by ID |
| `create_voucher` | Create a new voucher |
| `update_voucher` | Update an existing voucher |
| `book_voucher` | Book a payment for a voucher |

### Transactions (5 Tools)

| Tool | Description |
|------|-------------|
| `list_check_accounts` | List payment accounts |
| `list_transactions` | List transactions with filters |
| `get_transaction` | Get transaction details by ID |
| `create_transaction` | Create a new transaction |
| `update_transaction` | Update an existing transaction |

### Parts/Inventory (4 Tools)

| Tool | Description |
|------|-------------|
| `list_parts` | List parts/articles with filters |
| `get_part` | Get part details by ID |
| `create_part` | Create a new part/article |
| `update_part` | Update an existing part |

### Basics (3 Tools)

| Tool | Description |
|------|-------------|
| `get_system_version` | Get sevDesk system version |
| `get_next_sequence_number` | Get next document number |
| `export_data` | Export data of a specific type |

## Common Parameters

### Status Codes

**Invoices/Credit Notes:**
- `100` - Draft
- `200` - Open/Delivered
- `1000` - Paid

**Orders:**
- `100` - Draft
- `200` - Delivered
- `300` - Accepted
- `500` - Partially invoiced
- `750` - Invoiced
- `1000` - Cancelled

**Vouchers:**
- `50` - Draft
- `100` - Unpaid
- `1000` - Paid

### Contact Categories

- `3` - Customer (Kunde)
- `4` - Supplier (Lieferant)
- `28` - Partner

### Order Types

- `AN` - Quote (Angebot)
- `AB` - Order Confirmation (Auftragsbestätigung)
- `LI` - Delivery Note (Lieferschein)

### Country IDs

- `1` - Germany
- See sevDesk documentation for other countries

### Unity IDs

- `1` - Piece (Stück)
- `2` - Hour (Stunde)
- See sevDesk documentation for other units

## Examples

### Create a Customer

```json
{
  "name": "ACME GmbH",
  "categoryId": 3,
  "defaultTimeToPay": 14,
  "vatNumber": "DE123456789"
}
```

### Create an Invoice

```json
{
  "contactId": 12345,
  "invoiceDate": "2024-01-15",
  "positions": [
    {
      "name": "Consulting",
      "quantity": 8,
      "price": 150.00,
      "taxRate": 19,
      "unityId": 2
    }
  ],
  "header": "Invoice for January 2024",
  "timeToPay": 14
}
```

### Create a Quote

```json
{
  "contactId": 12345,
  "orderDate": "2024-01-10",
  "orderType": "AN",
  "positions": [
    {
      "name": "Web Development",
      "quantity": 1,
      "price": 5000.00,
      "taxRate": 19,
      "unityId": 1,
      "optional": false
    }
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev
```

## Testing with MCP Inspector

```bash
npx @anthropic-ai/mcp-inspector dist/index.js
```

## License

MIT

## Links

- [sevDesk API Documentation](https://api.sevdesk.de/)
- [sevDesk Website](https://sevdesk.de)
- [GitHub Repository](https://github.com/Honeyfield-Org/sevdesk-mcp)
