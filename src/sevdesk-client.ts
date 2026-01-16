import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = 'https://my.sevdesk.de/api/v1';

export interface SevDeskError {
  error: {
    code: number;
    message: string;
  };
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SevDeskResponse<T> {
  objects: T;
}

export interface SevDeskSingleResponse<T> {
  objects: T;
}

export class SevDeskClient {
  private client: AxiosInstance;

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error('SEVDESK_API_TOKEN is required');
    }

    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<SevDeskError>) => {
        if (error.response?.data?.error) {
          const sevDeskError = error.response.data.error;
          throw new Error(`sevDesk API Error (${sevDeskError.code}): ${sevDeskError.message}`);
        }
        throw error;
      }
    );
  }

  // Generic GET request
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<SevDeskResponse<T>>(endpoint, { params });
    return response.data.objects;
  }

  // GET request for single object
  async getOne<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<SevDeskSingleResponse<T>>(endpoint, { params });
    return response.data.objects;
  }

  // GET request for raw response (e.g., PDF)
  async getRaw(endpoint: string, params?: Record<string, unknown>): Promise<ArrayBuffer> {
    const response = await this.client.get(endpoint, {
      params,
      responseType: 'arraybuffer',
    });
    return response.data;
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.client.post<SevDeskResponse<T>>(endpoint, data);
    return response.data.objects;
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.client.put<SevDeskResponse<T>>(endpoint, data);
    return response.data.objects;
  }

  // Generic DELETE request
  async delete(endpoint: string): Promise<void> {
    await this.client.delete(endpoint);
  }

  // ==================== CONTACTS ====================

  async listContacts(params?: PaginationParams & {
    depth?: number;
    customerNumber?: string;
    name?: string;
  }) {
    return this.get<unknown[]>('/Contact', params ? { ...params } : undefined);
  }

  async getContact(contactId: string, embed?: string[]) {
    const params = embed ? { embed: embed.join(',') } : undefined;
    return this.getOne<unknown>(`/Contact/${contactId}`, params);
  }

  async createContact(data: Record<string, unknown>) {
    return this.post<unknown>('/Contact', data);
  }

  async updateContact(contactId: string, data: Record<string, unknown>) {
    return this.put<unknown>(`/Contact/${contactId}`, data);
  }

  async deleteContact(contactId: string) {
    return this.delete(`/Contact/${contactId}`);
  }

  async getNextCustomerNumber() {
    return this.getOne<{ nextCustomerNumber: string }>('/Contact/Factory/getNextCustomerNumber');
  }

  async listContactAddresses(contactId: string) {
    return this.get<unknown[]>('/ContactAddress', { 'contact[id]': contactId, 'contact[objectName]': 'Contact' });
  }

  async createContactAddress(data: Record<string, unknown>) {
    return this.post<unknown>('/ContactAddress', data);
  }

  // ==================== INVOICES ====================

  async listInvoices(params?: PaginationParams & {
    status?: number;
    invoiceNumber?: string;
    startDate?: string;
    endDate?: string;
    contactId?: string;
  }) {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.contactId) {
      queryParams['contact[id]'] = params.contactId;
      queryParams['contact[objectName]'] = 'Contact';
      delete queryParams.contactId;
    }
    return this.get<unknown[]>('/Invoice', queryParams);
  }

  async getInvoice(invoiceId: string, embed?: string[]) {
    const params = embed ? { embed: embed.join(',') } : undefined;
    return this.getOne<unknown>(`/Invoice/${invoiceId}`, params);
  }

  async createInvoice(data: Record<string, unknown>) {
    return this.post<unknown>('/Invoice/Factory/saveInvoice', data);
  }

  async updateInvoice(invoiceId: string, data: Record<string, unknown>) {
    return this.put<unknown>(`/Invoice/${invoiceId}`, data);
  }

  async deleteInvoice(invoiceId: string) {
    return this.delete(`/Invoice/${invoiceId}`);
  }

  async sendInvoiceEmail(invoiceId: string, data: {
    toEmail: string;
    subject: string;
    text: string;
    copy?: boolean;
    additionalAttachments?: string;
    ccEmail?: string;
    bccEmail?: string;
  }) {
    return this.post<unknown>(`/Invoice/${invoiceId}/sendViaEmail`, data);
  }

  async bookInvoicePayment(invoiceId: string, data: {
    amount: number;
    date: string;
    type: string;
    checkAccount?: { id: number; objectName: string };
    checkAccountTransaction?: { id: number; objectName: string };
    createFeed?: boolean;
  }) {
    return this.put<unknown>(`/Invoice/${invoiceId}/bookAmount`, data);
  }

  async enshrineInvoice(invoiceId: string) {
    return this.put<unknown>(`/Invoice/${invoiceId}/enshrine`, {});
  }

  async resetInvoiceToDraft(invoiceId: string) {
    return this.put<unknown>(`/Invoice/${invoiceId}/resetToDraft`, {});
  }

  async getInvoicePdf(invoiceId: string) {
    const response = await this.client.get(`/Invoice/${invoiceId}/getPdf`, {
      params: { download: true },
    });
    return response.data;
  }

  async exportInvoiceXml(invoiceId: string) {
    return this.getOne<{ content: string }>(`/Invoice/${invoiceId}/getXml`);
  }

  async createInvoiceFromOrder(orderId: string) {
    return this.post<unknown>('/Invoice/Factory/createInvoiceFromOrder', {
      order: { id: orderId, objectName: 'Order' },
    });
  }

  // ==================== CREDIT NOTES ====================

  async listCreditNotes(params?: PaginationParams & {
    status?: number;
    creditNoteNumber?: string;
    startDate?: string;
    endDate?: string;
    contactId?: string;
  }) {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.contactId) {
      queryParams['contact[id]'] = params.contactId;
      queryParams['contact[objectName]'] = 'Contact';
      delete queryParams.contactId;
    }
    return this.get<unknown[]>('/CreditNote', queryParams);
  }

  async getCreditNote(creditNoteId: string, embed?: string[]) {
    const params = embed ? { embed: embed.join(',') } : undefined;
    return this.getOne<unknown>(`/CreditNote/${creditNoteId}`, params);
  }

  async createCreditNote(data: Record<string, unknown>) {
    return this.post<unknown>('/CreditNote/Factory/saveCreditNote', data);
  }

  async updateCreditNote(creditNoteId: string, data: Record<string, unknown>) {
    return this.put<unknown>(`/CreditNote/${creditNoteId}`, data);
  }

  async deleteCreditNote(creditNoteId: string) {
    return this.delete(`/CreditNote/${creditNoteId}`);
  }

  async sendCreditNoteEmail(creditNoteId: string, data: {
    toEmail: string;
    subject: string;
    text: string;
    copy?: boolean;
    additionalAttachments?: string;
    ccEmail?: string;
    bccEmail?: string;
  }) {
    return this.post<unknown>(`/CreditNote/${creditNoteId}/sendViaEmail`, data);
  }

  async bookCreditNotePayment(creditNoteId: string, data: {
    amount: number;
    date: string;
    type: string;
    checkAccount?: { id: number; objectName: string };
    checkAccountTransaction?: { id: number; objectName: string };
    createFeed?: boolean;
  }) {
    return this.put<unknown>(`/CreditNote/${creditNoteId}/bookAmount`, data);
  }

  async enshrineCreditNote(creditNoteId: string) {
    return this.put<unknown>(`/CreditNote/${creditNoteId}/enshrine`, {});
  }

  async createCreditNoteFromInvoice(invoiceId: string) {
    return this.post<unknown>('/CreditNote/Factory/createFromInvoice', {
      invoice: { id: invoiceId, objectName: 'Invoice' },
    });
  }

  // ==================== ORDERS ====================

  async listOrders(params?: PaginationParams & {
    status?: number;
    orderNumber?: string;
    orderType?: string;
    startDate?: string;
    endDate?: string;
    contactId?: string;
  }) {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.contactId) {
      queryParams['contact[id]'] = params.contactId;
      queryParams['contact[objectName]'] = 'Contact';
      delete queryParams.contactId;
    }
    return this.get<unknown[]>('/Order', queryParams);
  }

  async getOrder(orderId: string, embed?: string[]) {
    const params = embed ? { embed: embed.join(',') } : undefined;
    return this.getOne<unknown>(`/Order/${orderId}`, params);
  }

  async createOrder(data: Record<string, unknown>) {
    return this.post<unknown>('/Order/Factory/saveOrder', data);
  }

  async updateOrder(orderId: string, data: Record<string, unknown>) {
    return this.put<unknown>(`/Order/${orderId}`, data);
  }

  async deleteOrder(orderId: string) {
    return this.delete(`/Order/${orderId}`);
  }

  async sendOrderEmail(orderId: string, data: {
    toEmail: string;
    subject: string;
    text: string;
    copy?: boolean;
    additionalAttachments?: string;
    ccEmail?: string;
    bccEmail?: string;
  }) {
    return this.post<unknown>(`/Order/${orderId}/sendViaEmail`, data);
  }

  // ==================== VOUCHERS ====================

  async listVouchers(params?: PaginationParams & {
    status?: number;
    voucherType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.get<unknown[]>('/Voucher', params ? { ...params } : undefined);
  }

  async getVoucher(voucherId: string, embed?: string[]) {
    const params = embed ? { embed: embed.join(',') } : undefined;
    return this.getOne<unknown>(`/Voucher/${voucherId}`, params);
  }

  async createVoucher(data: Record<string, unknown>) {
    return this.post<unknown>('/Voucher/Factory/saveVoucher', data);
  }

  async updateVoucher(voucherId: string, data: Record<string, unknown>) {
    return this.put<unknown>(`/Voucher/${voucherId}`, data);
  }

  async bookVoucher(voucherId: string, data: {
    amount: number;
    date: string;
    type: string;
    checkAccount?: { id: number; objectName: string };
    checkAccountTransaction?: { id: number; objectName: string };
    createFeed?: boolean;
  }) {
    return this.put<unknown>(`/Voucher/${voucherId}/bookAmount`, data);
  }

  // ==================== TRANSACTIONS ====================

  async listCheckAccounts(params?: PaginationParams) {
    return this.get<unknown[]>('/CheckAccount', params ? { ...params } : undefined);
  }

  async listTransactions(params?: PaginationParams & {
    checkAccountId?: string;
    startDate?: string;
    endDate?: string;
    isBooked?: boolean;
  }) {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.checkAccountId) {
      queryParams['checkAccount[id]'] = params.checkAccountId;
      queryParams['checkAccount[objectName]'] = 'CheckAccount';
      delete queryParams.checkAccountId;
    }
    return this.get<unknown[]>('/CheckAccountTransaction', queryParams);
  }

  async getTransaction(transactionId: string, embed?: string[]) {
    const params = embed ? { embed: embed.join(',') } : undefined;
    return this.getOne<unknown>(`/CheckAccountTransaction/${transactionId}`, params);
  }

  async createTransaction(data: Record<string, unknown>) {
    return this.post<unknown>('/CheckAccountTransaction', data);
  }

  async updateTransaction(transactionId: string, data: Record<string, unknown>) {
    return this.put<unknown>(`/CheckAccountTransaction/${transactionId}`, data);
  }

  // ==================== PARTS ====================

  async listParts(params?: PaginationParams & {
    partNumber?: string;
    name?: string;
  }) {
    return this.get<unknown[]>('/Part', params ? { ...params } : undefined);
  }

  async getPart(partId: string, embed?: string[]) {
    const params = embed ? { embed: embed.join(',') } : undefined;
    return this.getOne<unknown>(`/Part/${partId}`, params);
  }

  async createPart(data: Record<string, unknown>) {
    return this.post<unknown>('/Part', data);
  }

  async updatePart(partId: string, data: Record<string, unknown>) {
    return this.put<unknown>(`/Part/${partId}`, data);
  }

  // ==================== BASICS ====================

  async getSystemVersion() {
    const response = await this.client.get('/Tools/getVersion');
    return response.data;
  }

  async getNextSequenceNumber(objectType: string) {
    return this.getOne<{ nextSequenceNumber: string }>('/Tools/getNextSequenceNumber', { objectType });
  }

  async exportData(params: {
    objectType: string;
    startDate?: string;
    endDate?: string;
    format?: 'json' | 'csv' | 'xml';
  }) {
    return this.get<unknown[]>(`/${params.objectType}`, {
      startDate: params.startDate,
      endDate: params.endDate,
    });
  }
}

let clientInstance: SevDeskClient | null = null;

export function getSevDeskClient(): SevDeskClient {
  if (!clientInstance) {
    const apiToken = process.env.SEVDESK_API_TOKEN;
    if (!apiToken) {
      throw new Error('SEVDESK_API_TOKEN environment variable is not set');
    }
    clientInstance = new SevDeskClient(apiToken);
  }
  return clientInstance;
}
