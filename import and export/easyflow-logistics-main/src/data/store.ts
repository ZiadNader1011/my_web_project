export interface Supplier {
  id: string;
  name: string;
  country: string;
  contact: string;
  email: string;
  phone?: string;
  product?: string;
}

export interface Client {
  id: string;
  name: string;
  country: string;
  contact: string;
  email: string;
  phone?: string;
  telephone?: string;
  fax?: string;
  vat?: string;
  address?: string;
  dhl?: string;
  agentName?: string;
  operationsCount?: number;
operationsValue?: number;
remainingBalance?: number;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  jobTitle: string;
}

export interface PackingListProduct {
  id?: string;
  productName?: string;
  variety?: string;
  grade?: string;
  caliber?: string;
  packagesQtyKind?: string;
  numberOfPackages?: string;
  netWeight?: string;
  grossWeight?: string;
  shippingAgent?: string;
  dhlNumber?: string;
  shippingDate?: string;
  pol?: string;
  pod?: string;
  finalDestination?: string;
}

export interface StandalonePackingList {
  id: string;
  date: string;
  blNumber: string;
  containerNumber: string; // Legacy
  clientName: string;
  invoiceNumber: string;
  customRelease: string;
  note: string;
  
  // Containers
  numberOfContainers?: number;
  containerNumbers?: string[];

  // Legacy Shipment & Product fields
  dhlNumber?: string;
  productName?: string;
  variety?: string;
  grade?: string;
  caliber?: string;
  packagesQtyKind?: string;
  numberOfPackages?: string;
  netWeight?: string;
  grossWeight?: string;
  shippingAgent?: string;
  pol?: string; // Port of Loading
  pod?: string; // Port of Discharge
  finalDestination?: string;
  shippingDate?: string;

  // New multi-product structure
  numberOfProducts?: number;
  products?: PackingListProduct[];

  attachments: { id: string; url: string; description: string; createdAt: string }[];
}

export interface Commission {
  id: string;
  date: string;
  clientName: string;
  numberOfContainers: number;
  actualFiles?: File[];
  totalQuantityTon: number;
  commissionPerTon: number;
  currency: string;
  product: string;
  trader: string;
  qualityRepresentative?: string;
  attachments: { _id: string; url: string; description: string; createdAt: string }[];
}

export interface ShipmentOperation {
 id: string;
  operationDate: string;
  jobDate?: string; // legacy support
  jobId: string; // The job / bl number
  clientName: string;
  product: string;
  numberOfContainers: string;
  quantity: string;
  loadingDate: string;
  containerNumber: string;
  responsiblePerson?: string;
  qualityRepresentative?: string;
  notes: string;
  attachments?: any[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplierId: string; // legacy
  numberOfSuppliers?: number;
  supplierIds?: string[];
}

export interface ContainerProduct {
  productId: string;
  quantity: number;
  packages: string | number;
  netWeight?: number;
  grossWeight?: number;
  packageType?: string;
}

export interface Container {
  id: string;
  containerNumber: string;
  sourcePort: string;
  destinationPort: string;
  shippingDate: string;
  arrivalDate: string;
  status: 'loading' | 'in-transit' | 'arrived' | 'cleared';
  products: ContainerProduct[];
  attachments?: { id: string; url: string; description: string; createdAt: string }[];
}

export interface JobProduct {
  productId: string;
  quantity: number;
  unitPrice: number;
  packages: string | number;
  packageType?: string;
  numberOfPallets?: number;
  variety?: string;
  caliber?: string;
  grade?: string;
  currency?: string;
}

export interface JobAttachment {
  id: string;
  url: string;
  description: string;
  createdAt: string;
}

export type OperationType = 'export' | 'import' | 'supply';

export interface Job {
  id: string;
  operationType: OperationType;
  title: string;
  supplierId?: string; // Mostly for Import/Supply
  clientId?: string;   // Mostly for Export/Supply
  containerId?: string; // Legacy support
  numberOfContainers?: number;
  containerIds?: string[];
  
  // New specific fields
  invoiceNumber?: string;
  blNumber?: string;
  containerNumber?: string;
  customCountry?: string;
  productName?: string;
  exportCertificate?: string;
  shippingAgent?: string;
  incoterm?: string;
  departurePort?: string;
  arrivalPort?: string;
  transitTo?: string;
  numberOfReps?: number;
  repNames?: string[];
  packingListUrl?: string;
  isSold?: boolean;
  discountPercentage?: number;
  supplierDiscountPercentage?: number;
  rawMaterialPricePerTon?: number;
  rawMaterialCost?: number;
  rawMaterialWeight?: number;
  pettyCash?: number;
  otherCostReason?: string;
  
  products: JobProduct[];
  totalPrice: number;
  currency: string;
  paymentDate: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  notes: string;
  attachments?: JobAttachment[];
}

export interface Payment {
  id: string;
  supplierId?: string;
  clientId?: string;
  jobId?: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  relatedId?: string;
  entityId?: string;
  type: 'incoming' | 'outgoing' | 'petty_cash' | 'raw_material' | 'discount';
  amount: number;
  currency: string;
  date: string;
  incoterm?: string;
  variety?: string;
  caliber?: string;
  grade?: string;
  weightInTons?: number;
  pricePerTon?: number;
  otherCost?: number;
  blNumber?: string;
  invoiceNumber?: string;
  packages?: number;
  description: string;
  bank?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'bl' | 'invoice' | 'image' | 'pdf' | 'other';
  jobId?: string;
  agentId?: string;
  url: string;
  uploadedAt: string;
}

export interface ShippingAgent {
 id: string;
  name: string;
  company?: string;
  address?: string;
  telephone?: string;
  personalNumber?: string;
  email?: string;
  attachmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShippingAgentRecord {
  id: string;
  agentId: string;
  jobId?: string;
  date: string;
  blNumber?: string;
  country?: string;
  containerCount?: number;
  costEgp?: number;
  costEgpNote?: string;
  costEuro?: number;
  costEuroNote?: string;
  costUsd?: number;
  costUsdNote?: string;
  pdfUrl?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  suppliers: 'erp_suppliers',
  clients: 'erp_clients',
  products: 'erp_products',
  containers: 'erp_containers',
  jobs: 'erp_jobs',
  files: 'erp_files',
  payments: 'erp_payments',
  transactions: 'erp_transactions',
  bankBalances: 'erp_bankBalances',
  shippingAgents: 'erp_shipping_agents',
  shippingAgentRecords: 'erp_shipping_agent_records',
  employees: 'erp_employees',
  packingLists: 'erp_packing_lists',
  commissions: 'erp_commissions',
  shipmentOperations: 'erp_shipment_operations',
};

export type BankBalances = Record<string, Record<string, number>>;

export const EGYPTIAN_BANKS = [
  'NBE (National Bank of Egypt)',
  'Misr (Banque Misr)',
  'ABC (Arab Banking Corporation)',
  'FAB (First Abu Dhabi Bank)',
  'Banque du Caire',
  'Commercial International Bank (CIB)',
  'QNB Alahli',
  'HSBC Egypt',
  'AlexBank',
  'Abu Dhabi Islamic Bank (ADIB)',
  'Credit Agricole Egypt',
  'Faisal Islamic Bank',
  'Arab African International Bank (AAIB)',
  'Emirates NBD Egypt'
];

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getSuppliers(): Supplier[] { return load(STORAGE_KEYS.suppliers, []); }
export function getClients(): Client[] { return load(STORAGE_KEYS.clients, []); }
export function getProducts(): Product[] { return load(STORAGE_KEYS.products, []); }
export function getContainers(): Container[] { return load(STORAGE_KEYS.containers, []); }
export function getJobs(): Job[] { return load(STORAGE_KEYS.jobs, []); }
export function getFiles(): UploadedFile[] { return load(STORAGE_KEYS.files, []); }
export function getPayments(): Payment[] { return load(STORAGE_KEYS.payments, []); }
export function getTransactions(): Transaction[] { return load(STORAGE_KEYS.transactions, []); }
export function getShippingAgents(): ShippingAgent[] { return load(STORAGE_KEYS.shippingAgents, []); }
export function getShippingAgentRecords(): ShippingAgentRecord[] { return load(STORAGE_KEYS.shippingAgentRecords, []); }
export function getEmployees(): Employee[] { return load(STORAGE_KEYS.employees, []); }
export function getPackingLists(): StandalonePackingList[] { return load(STORAGE_KEYS.packingLists, []); }
export function getCommissions(): Commission[] { return load(STORAGE_KEYS.commissions, []); }
export function getShipmentOperations(): ShipmentOperation[] { return load(STORAGE_KEYS.shipmentOperations, []); }

export function getBankBalances(): BankBalances { 
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.bankBalances);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveSuppliers(d: Supplier[]) { save(STORAGE_KEYS.suppliers, d); }
export function saveClients(d: Client[]) { save(STORAGE_KEYS.clients, d); }
export function saveProducts(d: Product[]) { save(STORAGE_KEYS.products, d); }
export function saveContainers(d: Container[]) { save(STORAGE_KEYS.containers, d); }
export function saveJobs(d: Job[]) { save(STORAGE_KEYS.jobs, d); }
export function saveFiles(d: UploadedFile[]) { save(STORAGE_KEYS.files, d); }
export function savePayments(d: Payment[]) { save(STORAGE_KEYS.payments, d); }
export function saveTransactions(d: Transaction[]) { save(STORAGE_KEYS.transactions, d); }
export function saveShippingAgents(d: ShippingAgent[]) { save(STORAGE_KEYS.shippingAgents, d); }
export function saveShippingAgentRecords(d: ShippingAgentRecord[]) { save(STORAGE_KEYS.shippingAgentRecords, d); }
export function saveEmployees(d: Employee[]) { save(STORAGE_KEYS.employees, d); }
export function savePackingLists(d: StandalonePackingList[]) { save(STORAGE_KEYS.packingLists, d); }
export function saveCommissions(d: Commission[]) { save(STORAGE_KEYS.commissions, d); }
export function saveShipmentOperations(d: ShipmentOperation[]) { save(STORAGE_KEYS.shipmentOperations, d); }
export function saveBankBalances(d: BankBalances) { localStorage.setItem(STORAGE_KEYS.bankBalances, JSON.stringify(d)); }

export function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}

export function formatDate(dateStr: string | Date | undefined) {
  if (!dateStr) return '—';
  let d = new Date(dateStr);
  if (typeof dateStr === 'string' && dateStr.length === 10) {
    d = new Date(dateStr + 'T12:00:00');
  }
  if (isNaN(d.getTime())) return '—';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function sumByCurrency<T>(items: T[], getCurrency: (item: T) => string, getValue: (item: T) => number): Record<string, number> {
  return items.reduce((acc, it) => {
    const c = getCurrency(it) || 'USD';
    acc[c] = (acc[c] || 0) + getValue(it);
    return acc;
  }, {} as Record<string, number>);
}

export function computeBalances(debts: Record<string, number>, credits: Record<string, number>): Record<string, number> {
  const currencies = Array.from(new Set([...Object.keys(debts), ...Object.keys(credits)]));
  const balances: Record<string, number> = {};
  currencies.forEach(c => {
    const diff = (debts[c] || 0) - (credits[c] || 0);
    if (Math.abs(diff) > 0.001) balances[c] = diff;
  });
  return balances;
}

export function formatBalanceObj(balances: Record<string, number>): string {
  const parts = Object.entries(balances).map(([cur, val]) => formatCurrency(val, cur));
  return parts.length ? parts.join(' | ') : '0';
}
