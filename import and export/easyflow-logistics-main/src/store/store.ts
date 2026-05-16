import axios from 'axios';

// ============================================================================
// 1. الإبقاء على جميع الـ Interfaces والـ Types كما هي تماماً لحماية الـ UI
// ============================================================================
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
  containerNumber: string;
  clientName: string;
  invoiceNumber: string;
  customRelease: string;
  note: string;
  numberOfContainers?: number;
  containerNumbers?: string[];
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
  pol?: string;
  pod?: string;
  finalDestination?: string;
  shippingDate?: string;
  numberOfProducts?: number;
  products?: PackingListProduct[];
  attachments: { id: string; url: string; description: string; createdAt: string }[];
}

export interface Commission {
  id: string;
  date: string;
  clientName: string;
  numberOfContainers: number;
  totalQuantityTon: number;
  commissionPerTon: number;
  currency: string;
  product: string;
  trader: string;
  qualityRepresentative?: string;
  attachments: { id: string; _id?: string; url: string; description: string; createdAt: string }[];
}

export interface ShipmentOperation {
  id: string;
  operationDate: string;
  jobDate?: string;
  jobId: string | number | null;
  clientName: string;
  product: string;
  numberOfContainers: string;
  quantity: string;
  loadingDate: string;
  containerNumber: string;
  responsiblePerson?: string;
  qualityRepresentative?: string;
  notes: string;
  attachments?: { id: string; url: string; description: string; createdAt: string }[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplierId: string;
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
  supplierId?: string;
  clientId?: string;
  containerId?: string;
  numberOfContainers?: number;
  containerIds?: string[];
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
  address?: string;
  telephone?: string;
  personalNumber?: string;
  email?: string;
  attachmentUrl?: string;
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

const BACKEND_URL = 'http://localhost:5000/api';
if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
  localStorage.setItem('token', 'bypass_token_easyflow_logistics');
}


const globalStoreCache: Record<string, any[]> = {
  suppliers: [], clients: [], products: [], containers: [], jobs: [],
  archive: [], payments: [], transactions: [], 'shipping-agents': [],
  'shipping-agent-records': [], employees: [], 'packing-lists': [],
  commissions: [], operations: []
};


if (typeof window !== 'undefined') {
  Object.keys(globalStoreCache).forEach(endpoint => {
    axios.get(`${BACKEND_URL}/${endpoint}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          globalStoreCache[endpoint].length = 0;
          globalStoreCache[endpoint].push(...res.data);
        }
      })
      .catch(err => console.error(`❌ Initial fetch error for [${endpoint}]:`, err));
  });
}

// دالة تحديث قائمة معينة عند إضافة عنصر جديد
async function saveLive<T>(endpoint: string, dataArray: T[]) {
  if (!dataArray || dataArray.length === 0) return;
  const payload = dataArray[dataArray.length - 1];
  
  // تحديث الكاش الفوري
  if (globalStoreCache[endpoint]) {
    const isExist = globalStoreCache[endpoint].some((item: any) => item.id === (payload as any).id);
    if (!isExist) {
      globalStoreCache[endpoint].push(payload);
    }
  }

  try {
    await axios.post(`${BACKEND_URL}/${endpoint}`, payload);
  } catch (err) {
    console.error(`❌ Store write error for [${endpoint}]:`, err);
  }
}

// ============================================================================
// 3. الدوال المصدرة لخدمة واجهات التطبيق (Getters & Setters الحية والمباشرة)
// ============================================================================
export function getSuppliers(): Supplier[] { return globalStoreCache['suppliers']; }
export function getClients(): Client[] { return globalStoreCache['clients']; }
export function getProducts(): Product[] { return globalStoreCache['products']; }
export function getContainers(): Container[] { return globalStoreCache['containers']; }
export function getJobs(): Job[] { return globalStoreCache['jobs']; }
export function getFiles(): UploadedFile[] { return globalStoreCache['archive']; }
export function getPayments(): Payment[] { return globalStoreCache['payments']; }
export function getTransactions(): Transaction[] { return globalStoreCache['transactions']; }
export function getShippingAgents(): ShippingAgent[] { return globalStoreCache['shipping-agents']; }
export function getShippingAgentRecords(): ShippingAgentRecord[] { return globalStoreCache['shipping-agent-records']; }
export function getEmployees(): Employee[] { return globalStoreCache['employees']; }
export function getPackingLists(): StandalonePackingList[] { return globalStoreCache['packing-lists']; }
export function getCommissions(): Commission[] { return globalStoreCache['commissions']; }
export function getShipmentOperations(): ShipmentOperation[] { return globalStoreCache['operations']; }

const globalBankCache: BankBalances = {};
if (typeof window !== 'undefined') {
  axios.get(`${BACKEND_URL}/banks`)
    .then(res => { Object.assign(globalBankCache, res.data); })
    .catch(err => console.error("❌ Initial Bank fetch failed:", err));
}

export function getBankBalances(): BankBalances {
  return globalBankCache;
}

export function saveSuppliers(d: Supplier[]) { saveLive('suppliers', d); }
export function saveClients(d: Client[]) { saveLive('clients', d); }
export function saveProducts(d: Product[]) { saveLive('products', d); }
export function saveContainers(d: Container[]) { saveLive('containers', d); }
export function saveJobs(d: Job[]) { saveLive('jobs', d); }
export function saveFiles(d: UploadedFile[]) { saveLive('archive', d); }
export function savePayments(d: Payment[]) { saveLive('payments', d); }
export function saveTransactions(d: Transaction[]) { saveLive('transactions', d); }
export function saveShippingAgents(d: ShippingAgent[]) { saveLive('shipping-agents', d); }
export function saveShippingAgentRecords(d: ShippingAgentRecord[]) { saveLive('shipping-agent-records', d); }
export function saveEmployees(d: Employee[]) { saveLive('employees', d); }
export function savePackingLists(d: StandalonePackingList[]) { saveLive('packing-lists', d); }
export function saveCommissions(d: Commission[]) { saveLive('commissions', d); }
export function saveShipmentOperations(d: ShipmentOperation[]) { saveLive('operations', d); }
export function saveBankBalances(d: BankBalances) {
  Object.assign(globalBankCache, d);
  axios.post(`${BACKEND_URL}/banks`, d).catch(err => console.error(err));
}
// ============================================================================
// 4. الدوال المساعدة الحسابية (تظل محلية سريعة كما هي لتغذية الرندر المباشر)
// ============================================================================
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
