// ==================== BASE TYPES ====================

export interface SevDeskObject {
  id: string;
  objectName: string;
}

export interface SevDeskModelObject extends SevDeskObject {
  create: string;
  update: string;
  sevClient: SevDeskObject;
}

// ==================== CONTACT TYPES ====================

export interface Contact extends SevDeskModelObject {
  objectName: 'Contact';
  name: string;
  name2?: string;
  customerNumber?: string;
  surename?: string;
  familyname?: string;
  titel?: string;
  category: SevDeskObject;
  description?: string;
  academicTitle?: string;
  gender?: string;
  birthday?: string;
  vatNumber?: string;
  bankAccount?: string;
  bankNumber?: string;
  defaultCashbackTime?: number;
  defaultCashbackPercent?: number;
  defaultTimeToPay?: number;
  taxNumber?: string;
  taxType?: string;
  taxSet?: SevDeskObject;
  defaultDiscountAmount?: number;
  defaultDiscountPercentage?: boolean;
  buyerReference?: string;
  exemptVat?: boolean;
}

export interface ContactAddress extends SevDeskModelObject {
  objectName: 'ContactAddress';
  contact: SevDeskObject;
  street?: string;
  zip?: string;
  city?: string;
  country: SevDeskObject;
  category?: SevDeskObject;
  name?: string;
  name2?: string;
  name3?: string;
  name4?: string;
}

export interface CommunicationWay extends SevDeskModelObject {
  objectName: 'CommunicationWay';
  contact: SevDeskObject;
  type: 'EMAIL' | 'PHONE' | 'WEB' | 'MOBILE' | 'FAX';
  value: string;
  key: SevDeskObject;
  main?: boolean;
}

// ==================== INVOICE TYPES ====================

export interface Invoice extends SevDeskModelObject {
  objectName: 'Invoice';
  invoiceNumber: string;
  contact: SevDeskObject;
  contactPerson: SevDeskObject;
  invoiceDate: string;
  header?: string;
  headText?: string;
  footText?: string;
  timeToPay?: number;
  discountTime?: number;
  discount?: number;
  addressName?: string;
  addressStreet?: string;
  addressZip?: string;
  addressCity?: string;
  addressCountry: SevDeskObject;
  payDate?: string;
  deliveryDate?: string;
  deliveryDateUntil?: string;
  status: 100 | 200 | 1000; // 100 = Draft, 200 = Delivered/Open, 1000 = Paid
  smallSettlement?: boolean;
  taxRate: number;
  taxText?: string;
  taxType?: string;
  taxSet?: SevDeskObject;
  paymentMethod?: SevDeskObject;
  costCentre?: SevDeskObject;
  sendDate?: string;
  origin?: SevDeskObject;
  invoiceType: 'RE' | 'WKR' | 'SR' | 'MA' | 'TR' | 'ER';
  accountIntervall?: string;
  accountNextInvoice?: string;
  reminderTotal?: number;
  reminderDebit?: number;
  reminderDeadline?: string;
  reminderCharge?: number;
  currency: string;
  sumNet?: string;
  sumTax?: string;
  sumGross?: string;
  sumDiscounts?: string;
  sumNetForeignCurrency?: string;
  sumTaxForeignCurrency?: string;
  sumGrossForeignCurrency?: string;
  sumDiscountsForeignCurrency?: string;
  sumNetAccounting?: string;
  sumTaxAccounting?: string;
  sumGrossAccounting?: string;
  paidAmount?: number;
  customerInternalNote?: string;
  showNet?: boolean;
  enshrined?: string;
  sendType?: 'VPR' | 'VPDF' | 'VM' | 'VP';
  datevConnectOnline?: SevDeskObject;
  sendPaymentReceivedNotificationDate?: string;
}

export interface InvoicePos extends SevDeskModelObject {
  objectName: 'InvoicePos';
  invoice: SevDeskObject;
  part?: SevDeskObject;
  quantity: number;
  price: number;
  priceNet?: number;
  priceTax?: number;
  priceGross?: number;
  name: string;
  unity: SevDeskObject;
  positionNumber?: number;
  text?: string;
  discount?: number;
  taxRate: number;
  temporary?: boolean;
  sumNet?: string;
  sumGross?: string;
  sumDiscount?: string;
}

// ==================== CREDIT NOTE TYPES ====================

export interface CreditNote extends SevDeskModelObject {
  objectName: 'CreditNote';
  creditNoteNumber: string;
  contact: SevDeskObject;
  contactPerson: SevDeskObject;
  creditNoteDate: string;
  header?: string;
  headText?: string;
  footText?: string;
  addressName?: string;
  addressStreet?: string;
  addressZip?: string;
  addressCity?: string;
  addressCountry: SevDeskObject;
  status: 100 | 200 | 1000;
  taxRate: number;
  taxText?: string;
  taxType?: string;
  taxSet?: SevDeskObject;
  sendDate?: string;
  currency: string;
  sumNet?: string;
  sumTax?: string;
  sumGross?: string;
  sumDiscounts?: string;
  customerInternalNote?: string;
  showNet?: boolean;
  enshrined?: string;
  sendType?: 'VPR' | 'VPDF' | 'VM' | 'VP';
}

export interface CreditNotePos extends SevDeskModelObject {
  objectName: 'CreditNotePos';
  creditNote: SevDeskObject;
  part?: SevDeskObject;
  quantity: number;
  price: number;
  priceNet?: number;
  priceTax?: number;
  priceGross?: number;
  name: string;
  unity: SevDeskObject;
  positionNumber?: number;
  text?: string;
  discount?: number;
  taxRate: number;
  sumNet?: string;
  sumGross?: string;
  sumDiscount?: string;
}

// ==================== ORDER TYPES ====================

export interface Order extends SevDeskModelObject {
  objectName: 'Order';
  orderNumber: string;
  contact: SevDeskObject;
  contactPerson: SevDeskObject;
  orderDate: string;
  header?: string;
  headText?: string;
  footText?: string;
  addressName?: string;
  addressStreet?: string;
  addressZip?: string;
  addressCity?: string;
  addressCountry: SevDeskObject;
  status: 100 | 200 | 300 | 500 | 750 | 1000;
  taxRate: number;
  taxText?: string;
  taxType?: string;
  taxSet?: SevDeskObject;
  sendDate?: string;
  currency: string;
  sumNet?: string;
  sumTax?: string;
  sumGross?: string;
  sumDiscounts?: string;
  customerInternalNote?: string;
  showNet?: boolean;
  sendType?: 'VPR' | 'VPDF' | 'VM' | 'VP';
  orderType: 'AN' | 'AB' | 'LI';
  origin?: SevDeskObject;
  version?: number;
  smallSettlement?: boolean;
  deliveryDate?: string;
  deliveryDateUntil?: string;
}

export interface OrderPos extends SevDeskModelObject {
  objectName: 'OrderPos';
  order: SevDeskObject;
  part?: SevDeskObject;
  quantity: number;
  price: number;
  priceNet?: number;
  priceTax?: number;
  priceGross?: number;
  name: string;
  unity: SevDeskObject;
  positionNumber?: number;
  text?: string;
  discount?: number;
  taxRate: number;
  optional?: boolean;
  sumNet?: string;
  sumGross?: string;
  sumDiscount?: string;
}

// ==================== VOUCHER TYPES ====================

export interface Voucher extends SevDeskModelObject {
  objectName: 'Voucher';
  voucherDate: string;
  supplier?: SevDeskObject;
  supplierName?: string;
  description?: string;
  payDate?: string;
  status: 50 | 100 | 1000; // 50 = Draft, 100 = Unpaid, 1000 = Paid
  sumNet: string;
  sumTax: string;
  sumGross: string;
  sumNetAccounting: string;
  sumTaxAccounting: string;
  sumGrossAccounting: string;
  taxType: string;
  creditDebit: 'C' | 'D';
  voucherType: 'VOU' | 'RV';
  currency: string;
  propertyForeignCurrencyDeadline?: string;
  propertyExchangeRate?: string;
  taxSet?: SevDeskObject;
  paymentDeadline?: string;
  deliveryDate?: string;
  deliveryDateUntil?: string;
  document?: SevDeskObject;
  costCentre?: SevDeskObject;
}

export interface VoucherPos extends SevDeskModelObject {
  objectName: 'VoucherPos';
  voucher: SevDeskObject;
  accountingType: SevDeskObject;
  estimatedAccountingType?: SevDeskObject;
  taxRate: number;
  net?: boolean;
  isAsset?: boolean;
  sumNet: string;
  sumTax: string;
  sumGross: string;
  comment?: string;
}

// ==================== CHECK ACCOUNT / TRANSACTION TYPES ====================

export interface CheckAccount extends SevDeskModelObject {
  objectName: 'CheckAccount';
  name: string;
  type: 'online' | 'offline';
  importType?: string;
  currency: string;
  defaultAccount?: boolean;
  status: 0 | 100; // 0 = Archived, 100 = Active
  bankServer?: string;
  autoMapTransactions?: boolean;
}

export interface CheckAccountTransaction extends SevDeskModelObject {
  objectName: 'CheckAccountTransaction';
  checkAccount: SevDeskObject;
  valueDate: string;
  entryDate?: string;
  amount: number;
  gvCode?: string;
  entryText?: string;
  primaNotaNo?: string;
  paymtPurpose?: string;
  payeePayerBankCode?: string;
  payeePayerAcctNo?: string;
  payeePayerName?: string;
  enshrined?: string;
  status: 100 | 200 | 300 | 400;
  sourceTransaction?: SevDeskObject;
  targetTransaction?: SevDeskObject;
}

// ==================== PART TYPES ====================

export interface Part extends SevDeskModelObject {
  objectName: 'Part';
  name: string;
  partNumber: string;
  text?: string;
  category?: SevDeskObject;
  stock?: number;
  stockEnabled?: boolean;
  unity: SevDeskObject;
  price?: number;
  priceNet?: number;
  priceGross?: number;
  pricePurchase?: number;
  taxRate: number;
  status?: 0 | 100; // 0 = Inactive, 100 = Active
  internalComment?: string;
}

// ==================== COUNTRY TYPE ====================

export interface StaticCountry {
  id: string;
  objectName: 'StaticCountry';
  code: string;
  name: string;
  nameEn: string;
  translationCode: string;
  locale: string;
  priority: number;
}

// ==================== UNITY TYPE ====================

export interface Unity {
  id: string;
  objectName: 'Unity';
  name: string;
  translationCode?: string;
}

// ==================== CATEGORY TYPE ====================

export interface Category {
  id: string;
  objectName: 'Category';
  name: string;
  code?: string;
  color?: string;
  objectType?: string;
  translationCode?: string;
  priority?: number;
}

// ==================== TAX SET TYPE ====================

export interface TaxSet {
  id: string;
  objectName: 'TaxSet';
  name: string;
  taxRate: number;
  text?: string;
  taxRule?: SevDeskObject;
  createDate?: string;
}

// ==================== PAYMENT METHOD TYPE ====================

export interface PaymentMethod {
  id: string;
  objectName: 'PaymentMethod';
  name: string;
  text?: string;
  active?: boolean;
  translationCode?: string;
}

// ==================== DOCUMENT TYPE ====================

export interface Document extends SevDeskModelObject {
  objectName: 'Document';
  filename: string;
  status?: number;
  extension?: string;
  filesize?: number;
  mimeType?: string;
  baseObject?: SevDeskObject;
  folder?: SevDeskObject;
}

// ==================== INPUT TYPES FOR CREATION ====================

export interface CreateContactInput {
  customerNumber?: string;
  name: string;
  name2?: string;
  surename?: string;
  familyname?: string;
  titel?: string;
  category: { id: number; objectName: 'Category' };
  description?: string;
  academicTitle?: string;
  gender?: string;
  birthday?: string;
  vatNumber?: string;
  bankAccount?: string;
  bankNumber?: string;
  defaultCashbackTime?: number;
  defaultCashbackPercent?: number;
  defaultTimeToPay?: number;
  taxNumber?: string;
  taxType?: string;
  taxSet?: { id: number; objectName: 'TaxSet' };
  defaultDiscountAmount?: number;
  defaultDiscountPercentage?: boolean;
  buyerReference?: string;
  exemptVat?: boolean;
}

export interface CreateContactAddressInput {
  contact: { id: number; objectName: 'Contact' };
  street?: string;
  zip?: string;
  city?: string;
  country: { id: number; objectName: 'StaticCountry' };
  category?: { id: number; objectName: 'Category' };
  name?: string;
  name2?: string;
  name3?: string;
  name4?: string;
}

export interface CreateInvoiceInput {
  invoice: {
    objectName: 'Invoice';
    contact: { id: number; objectName: 'Contact' };
    contactPerson?: { id: number; objectName: 'SevUser' };
    invoiceDate: string;
    header?: string;
    headText?: string;
    footText?: string;
    timeToPay?: number;
    discountTime?: number;
    discount?: number;
    addressName?: string;
    addressStreet?: string;
    addressZip?: string;
    addressCity?: string;
    addressCountry?: { id: number; objectName: 'StaticCountry' };
    deliveryDate?: string;
    deliveryDateUntil?: string;
    status?: 100 | 200 | 1000;
    smallSettlement?: boolean;
    taxRate?: number;
    taxText?: string;
    taxType?: string;
    taxSet?: { id: number; objectName: 'TaxSet' };
    paymentMethod?: { id: number; objectName: 'PaymentMethod' };
    invoiceType?: 'RE' | 'WKR' | 'SR' | 'MA' | 'TR' | 'ER';
    currency?: string;
    showNet?: boolean;
    mapAll: true;
  };
  invoicePosSave?: Array<{
    objectName: 'InvoicePos';
    part?: { id: number; objectName: 'Part' };
    quantity: number;
    price: number;
    name: string;
    unity: { id: number; objectName: 'Unity' };
    positionNumber?: number;
    text?: string;
    discount?: number;
    taxRate: number;
    mapAll: true;
  }>;
  invoicePosDelete?: Array<{ id: number; objectName: 'InvoicePos' }>;
}

export interface CreateOrderInput {
  order: {
    objectName: 'Order';
    contact: { id: number; objectName: 'Contact' };
    contactPerson?: { id: number; objectName: 'SevUser' };
    orderDate: string;
    header?: string;
    headText?: string;
    footText?: string;
    addressName?: string;
    addressStreet?: string;
    addressZip?: string;
    addressCity?: string;
    addressCountry?: { id: number; objectName: 'StaticCountry' };
    deliveryDate?: string;
    deliveryDateUntil?: string;
    status?: 100 | 200 | 300 | 500 | 750 | 1000;
    taxRate?: number;
    taxText?: string;
    taxType?: string;
    taxSet?: { id: number; objectName: 'TaxSet' };
    orderType: 'AN' | 'AB' | 'LI';
    currency?: string;
    showNet?: boolean;
    mapAll: true;
  };
  orderPosSave?: Array<{
    objectName: 'OrderPos';
    part?: { id: number; objectName: 'Part' };
    quantity: number;
    price: number;
    name: string;
    unity: { id: number; objectName: 'Unity' };
    positionNumber?: number;
    text?: string;
    discount?: number;
    taxRate: number;
    optional?: boolean;
    mapAll: true;
  }>;
  orderPosDelete?: Array<{ id: number; objectName: 'OrderPos' }>;
}

export interface CreateCreditNoteInput {
  creditNote: {
    objectName: 'CreditNote';
    contact: { id: number; objectName: 'Contact' };
    contactPerson?: { id: number; objectName: 'SevUser' };
    creditNoteDate: string;
    header?: string;
    headText?: string;
    footText?: string;
    addressName?: string;
    addressStreet?: string;
    addressZip?: string;
    addressCity?: string;
    addressCountry?: { id: number; objectName: 'StaticCountry' };
    status?: 100 | 200 | 1000;
    taxRate?: number;
    taxText?: string;
    taxType?: string;
    taxSet?: { id: number; objectName: 'TaxSet' };
    currency?: string;
    showNet?: boolean;
    mapAll: true;
  };
  creditNotePosSave?: Array<{
    objectName: 'CreditNotePos';
    part?: { id: number; objectName: 'Part' };
    quantity: number;
    price: number;
    name: string;
    unity: { id: number; objectName: 'Unity' };
    positionNumber?: number;
    text?: string;
    discount?: number;
    taxRate: number;
    mapAll: true;
  }>;
  creditNotePosDelete?: Array<{ id: number; objectName: 'CreditNotePos' }>;
}

export interface CreateVoucherInput {
  voucher: {
    objectName: 'Voucher';
    voucherDate: string;
    supplier?: { id: number; objectName: 'Contact' };
    supplierName?: string;
    description?: string;
    status?: 50 | 100 | 1000;
    taxType: string;
    creditDebit: 'C' | 'D';
    voucherType?: 'VOU' | 'RV';
    currency?: string;
    taxSet?: { id: number; objectName: 'TaxSet' };
    paymentDeadline?: string;
    deliveryDate?: string;
    deliveryDateUntil?: string;
    mapAll: true;
  };
  voucherPosSave?: Array<{
    objectName: 'VoucherPos';
    accountingType: { id: number; objectName: 'AccountingType' };
    taxRate: number;
    net: boolean;
    isAsset?: boolean;
    sumNet: number;
    sumGross: number;
    comment?: string;
    mapAll: true;
  }>;
  voucherPosDelete?: Array<{ id: number; objectName: 'VoucherPos' }>;
}

export interface CreatePartInput {
  name: string;
  partNumber: string;
  text?: string;
  category?: { id: number; objectName: 'Category' };
  stock?: number;
  stockEnabled?: boolean;
  unity: { id: number; objectName: 'Unity' };
  price?: number;
  priceNet?: number;
  priceGross?: number;
  pricePurchase?: number;
  taxRate: number;
  status?: 0 | 100;
  internalComment?: string;
}

export interface CreateTransactionInput {
  checkAccount: { id: number; objectName: 'CheckAccount' };
  valueDate: string;
  entryDate?: string;
  amount: number;
  gvCode?: string;
  entryText?: string;
  primaNotaNo?: string;
  paymtPurpose?: string;
  payeePayerBankCode?: string;
  payeePayerAcctNo?: string;
  payeePayerName?: string;
  status?: 100 | 200 | 300 | 400;
}
