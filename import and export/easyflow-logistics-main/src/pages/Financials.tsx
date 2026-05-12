import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import {
  formatCurrency, formatDate    ,EGYPTIAN_BANKS
} from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/DatePicker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Book,
  Calendar,
  Pencil,
  Loader2
} from 'lucide-react';
import type { Transaction } from '@/data/store';




export default function Financials() {
const queryClient = useQueryClient();
const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEntityId, setFilterEntityId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 2. جلب البيانات من السيرفر (Server-side Filtering)
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', filterCategory, filterEntityId],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/transactions', {
        params: { 
          category: filterCategory, 
          entityId: filterEntityId === 'all' ? undefined : filterEntityId 
        }
      });
      return res.data;
    }
  });

  const { t } = useTranslation();
const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await axios.get('http://localhost:5000/api/suppliers')).data });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: async () => (await axios.get('http://localhost:5000/api/clients')).data });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: async () => (await axios.get('http://localhost:5000/api/jobs')).data });
  const { data: shippingAgents = [] } = useQuery({ queryKey: ['shippingAgents'], queryFn: async () => (await axios.get('http://localhost:5000/api/shipping-agents')).data });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: async () => (await axios.get('http://localhost:5000/api/employees')).data });
  const { data: containers = [] } = useQuery({ queryKey: ['containers'], queryFn: async () => (await axios.get('http://localhost:5000/api/containers')).data });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const emptyForm = { 
    type: 'incoming' as Transaction['type'], 
    relatedId: 'none', 
    amount: '', 
    currency: 'USD', 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    bank: '',
    blNumber: '',
    invoiceNumber: '',
    weightInTons: undefined as number | undefined,
    packages: undefined as number | undefined
  };
  const [form, setForm] = useState(emptyForm);

const sumByCurrency = (type: string) => {
  const subset = transactions.filter((t: any) => t.type === type);
  const obj: Record<string, number> = subset.reduce((acc: any, t: any) => {
    acc[t.currency] = (acc[t.currency] || 0) + Number(t.amount);
    return acc;
  }, {}); 
  const parts = Object.entries(obj).map(([cur, val]) => formatCurrency(val as number, cur));
  return parts.length ? parts.join(' | ') : '0';
};

  const incomingTotalStr = sumByCurrency('incoming');
  const outgoingTotalStr = sumByCurrency('outgoing');
  const rawMaterialTotalStr = sumByCurrency('raw_material');
  const pettyCashTotalStr = sumByCurrency('petty_cash');

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({
      type: t.type,
      relatedId: t.relatedId ? String(t.relatedId) : 'none',
      amount: Number(t.amount).toString(),
      currency: t.currency,
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
      description: t.description,
      bank: t.bank || '',
      blNumber: t.blNumber || '',
      invoiceNumber: t.invoiceNumber || '',
      weightInTons: t.weightInTons,
      packages: t.packages
    });
    setEditOpen(true);
  };

const handleSave = async () => {
  if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Please enter a valid amount.'); return; }
  
  const payload = {
    ...form,
    amount: parseFloat(form.amount),
    relatedId: form.relatedId === 'none' ? null : form.relatedId,
    date: new Date(form.date).toISOString()
  };

  try {
    if (editing) {
      await axios.put(`http://localhost:5000/api/transactions/${editing.id}`, payload);
      toast.success('Transaction updated successfully!');
    } else {
      await axios.post('http://localhost:5000/api/transactions', payload);
      toast.success('Transaction recorded successfully!');
    }
    
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setEditOpen(false);
} catch (error: any) {
  toast.error(error.response?.data?.message || 'Save failed');
}
};

const handleDelete = async () => {
  if (!deleting) return;

  // خدي نسخة من الـ ID عشان نضمن استخدامه صح
  const targetId = deleting.id;

  try {
    // 1. ابعتي طلب الحذف للسيرفر
    await axios.delete(`http://localhost:5000/api/transactions/${targetId}`);

    // 2. اقفلي المودال وصفرّي الـ State فوراً (قبل الـ Toast والـ Invalidate)
    // ده بيمنع أي Double Click أو محاولة إعادة رسم للعنصر الممسوح
    setDeleteOpen(false);
    setDeleting(null);

    // 3. ظهري رسالة النجاح
    toast.success('Record removed successfully.');

    // 4. حديثي البيانات في الجدول
    queryClient.invalidateQueries({ queryKey: ['transactions'] });

  } catch (error) {
    console.error("❌ Delete Error:", error);

    // في حالة الخطأ، اقفلي المودال برضه عشان ميفضلش معلق
    setDeleteOpen(false);

    // لو السيرفر رد بـ 404 (يعني اتمسح فعلاً)، اعتبريه نجاح
    if (error.response?.status === 404) {
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return;
    }

    toast.error('Delete failed');
  }
};

  const linkableEntities = [
    { label: '--- Jobs ---', isLabel: true, value: 'label-jobs' },
    ...jobs.map(j => ({ label: `Job: ${j.title}`, value: j.id })),
    { label: '--- Suppliers ---', isLabel: true, value: 'label-suppliers' },
    ...suppliers.map(s => ({ label: `Supplier: ${s.name}`, value: s.id })),
    { label: '--- Clients ---', isLabel: true, value: 'label-clients' },
    ...clients.map(c => ({ label: `Client: ${c.name}`, value: c.id })),
    { label: '--- Shipping Agents ---', isLabel: true, value: 'label-agents' },
    ...shippingAgents.map(a => ({ label: `Agent: ${a.name}`, value: a.id })),
    { label: '--- Employees ---', isLabel: true, value: 'label-employees' },
    ...employees.map(e => ({ label: `Employee: ${e.name}`, value: e.id }))
  ];

  const getRelatedEntityName = (id?: string) => {
    if (!id) return null;
    const j = jobs.find(x => x.id === id);
    if (j) return `Job: ${j.title}`;
    const s = suppliers.find(x => x.id === id);
    if (s) return `Supplier: ${s.name}`;
    const c = clients.find(x => x.id === id);
    if (c) return `Client: ${c.name}`;
    const a = shippingAgents.find(x => x.id === id);
    if (a) return `Agent: ${a.name}`;
    const e = employees.find(x => x.id === id);
    if (e) return `Employee: ${e.name}`;
    return null;
  };

  const entitiesOptions = useMemo(() => {
    switch (filterCategory) {
      case 'jobs': return jobs.map(x => ({ label: x.title, value: x.id }));
      case 'clients': return clients.map(x => ({ label: x.name, value: x.id }));
      case 'suppliers': return suppliers.map(x => ({ label: x.name, value: x.id }));
      case 'agents': return shippingAgents.map(x => ({ label: x.name, value: x.id }));
      case 'employees': return employees.map(x => ({ label: x.name, value: x.id }));
      default: return [];
    }
  }, [filterCategory, jobs, clients, suppliers, shippingAgents, employees]);

  // When category changes, reset entity selection
  const handleCategoryChange = (val: string) => {
    setFilterCategory(val);
    setFilterEntityId('all');
  };

const filteredTransactions = useMemo(() => {
  if (!searchTerm) {
    return [...transactions].sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
  }

  const q = searchTerm.toLowerCase();

  return transactions
    .filter((t: any) => {
      const related =
        getRelatedEntityName(t.relatedId)?.toLowerCase() || '';

      const formattedDate = formatDate(t.date) || '';

      const normalizedDate = formattedDate.replace(/[\-\.\s]+/g, '/');

      const normalizedQuery = q.replace(/[\-\.\s]+/g, '/');

      const dateStringMatch =
        normalizedQuery.length > 0 &&
        normalizedDate.includes(normalizedQuery);

      const rawDateStr = formattedDate.replace(/[^0-9]/g, '');

      const rawQueryStr = q.replace(/[^0-9]/g, '');

      const numericMatch =
        rawQueryStr.length > 0 &&
        rawDateStr.includes(rawQueryStr);

      const directInvoiceSearch =
        t.invoiceNumber?.toLowerCase() || '';

      const directBlSearch =
        t.blNumber?.toLowerCase() || '';

      const bankSearch =
        t.bank?.toLowerCase() || '';

      const j = jobs.find((x: any) => x.id === t.relatedId);

      const invoiceSearch =
        j?.invoiceNumber?.toLowerCase() || '';

      const blSearch =
        j?.blNumber?.toLowerCase() || '';

      const c =
        j?.containerId
          ? containers.find(
              (cont: any) =>
                cont.id === j.containerId
            )
          : null;

      const containerSearch =
        c?.containerNumber?.toLowerCase() || '';

      const supplierSearch =
        suppliers.find(
          (x: any) => x.id === j?.supplierId
        )?.name?.toLowerCase() || '';

      const clientSearch =
        clients.find(
          (x: any) => x.id === j?.clientId
        )?.name?.toLowerCase() || '';

      const directSupplierSearch =
        suppliers.find(
          (x: any) => x.id === t.relatedId
        )?.name?.toLowerCase() || '';

      const directClientSearch =
        clients.find(
          (x: any) => x.id === t.relatedId
        )?.name?.toLowerCase() || '';

      const agentSearch =
        shippingAgents.find(
          (x: any) => x.id === t.relatedId
        )?.name?.toLowerCase() || '';

      const employeeSearch =
        employees.find(
          (x: any) => x.id === t.relatedId
        )?.name?.toLowerCase() || '';

      return (
        t.description?.toLowerCase().includes(q) ||
        t.type?.replace('_', ' ').toLowerCase().includes(q) ||
        related.includes(q) ||
        formattedDate.toLowerCase().includes(q) ||
        dateStringMatch ||
        numericMatch ||
        t.amount?.toString().includes(q) ||
        directInvoiceSearch.includes(q) ||
        invoiceSearch.includes(q) ||
        directBlSearch.includes(q) ||
        blSearch.includes(q) ||
        containerSearch.includes(q) ||
        bankSearch.includes(q) ||
        supplierSearch.includes(q) ||
        clientSearch.includes(q) ||
        directSupplierSearch.includes(q) ||
        directClientSearch.includes(q) ||
        agentSearch.includes(q) ||
        employeeSearch.includes(q)
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
}, [
  transactions,
  searchTerm,
  jobs,
  containers,
  suppliers,
  clients,
  shippingAgents,
  employees
]);


    if (isLoading) return (
  <div className="flex h-96 items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

  return (
    <div>
      <PageHeader title={t('Financials', 'Financials - Daybook / يومية')} description={t('pages.financialsDescRoot', "Track all payments and transactions across the system.")}
        action={<Button onClick={openNew} size="lg"><Plus className="mr-2 h-4 w-4" /> Add Transaction</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
        <StatCard title="Total Incoming" value={incomingTotalStr} icon={TrendingUp} variant="success" description="Revenues & Collections" />
        <StatCard title="Total Outgoing" value={outgoingTotalStr} icon={TrendingDown} variant="warning" description="Payments & Expenses" />
        <StatCard title="Total Raw Material" value={rawMaterialTotalStr} icon={DollarSign} variant="warning" description="Material costs" />
        <StatCard title="Total Other Costs" value={pettyCashTotalStr} icon={DollarSign} variant="info" description="Other costs" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Book className="h-5 w-5"/> Daybook (يومية)</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="jobs">Operations</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="suppliers">Suppliers</SelectItem>
              <SelectItem value="agents">Shipping Agents</SelectItem>
              <SelectItem value="employees">Employees</SelectItem>
            </SelectContent>
          </Select>

          {filterCategory !== 'all' && (
            <Select value={filterEntityId} onValueChange={setFilterEntityId}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All in Category</SelectItem>
                {entitiesOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input 
            placeholder="Search daybook... (بحث)" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-[200px] h-9" 
          />
        </div>
      </div>

      <div className="bg-card shadow-sm border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Invoice / B/L</th>
              <th className="px-4 py-3">Bank</th>
              <th className="px-4 py-3">Related To</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No records match your search.</td></tr>
            ) : (
              filteredTransactions.map((t: any) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap"><Calendar className="h-3 w-3 inline mr-1 text-muted-foreground"/> {formatDate(t.date)}</td>
                  <td className="px-4 py-4"><Badge variant="outline">{t.type.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-4">{t.description}</td>
                  <td className="px-4 py-4 text-xs font-medium">
                    {t.invoiceNumber ? <div className="text-primary font-bold">{t.invoiceNumber}</div> : null}
                    {t.blNumber ? <div className="text-muted-foreground">{t.blNumber}</div> : null}
                    {!t.invoiceNumber && !t.blNumber && '—'}
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-muted-foreground">{t.bank || '—'}</td>
                  <td className="px-4 py-4 text-muted-foreground max-w-[200px] truncate">{getRelatedEntityName(t.relatedId) || '—'}</td>
                  <td className={`px-4 py-4 text-right font-semibold ${t.type === 'incoming' ? 'text-success' : t.type === 'outgoing' ? 'text-destructive' : ''}`}>
                    {formatCurrency(t.amount, t.currency || 'USD')}
                  </td>
                  <td className="px-4 py-4 text-right flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(t)} className="rounded-md p-1.5 hover:bg-accent text-muted-foreground"><Pencil className="h-4 w-4"/></button>
                    <button onClick={() => { setDeleting(t); setDeleteOpen(true); }} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4"/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Transaction Record</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Record Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({...f, type: v as Transaction['type']}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Incoming (إيرادات / تحصيلات)</SelectItem>
                  <SelectItem value="outgoing">Outgoing (مدفوعات)</SelectItem>
                  <SelectItem value="petty_cash">Other Cost (التكاليف والنثريات)</SelectItem>
                  <SelectItem value="raw_material">Raw Material (شراء خام)</SelectItem>
                  <SelectItem value="discount">Discount (خصم)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Link to Entity (Optional)</Label>
              <Select value={form.relatedId} onValueChange={v => setForm(f => ({ ...f, relatedId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select link" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Link</SelectItem>
                  {linkableEntities.map(e => (
                    <SelectItem key={e.value} value={e.value} disabled={'isLabel' in e}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bank (Optional)</Label>
              <Select value={form.bank} onValueChange={v => setForm(f => ({ ...f, bank: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Select or type bank name" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Bank</SelectItem>
                  {EGYPTIAN_BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Removed Weight, Packages */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Invoice Number (Optional)</Label>
                <Input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="e.g. INV-2023" />
              </div>
              <div>
                <Label>B/L Number (Optional)</Label>
                <Input value={form.blNumber} onChange={e => setForm(f => ({ ...f, blNumber: e.target.value }))} placeholder="e.g. BL123456" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount *</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="number" step="any" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="flex-1" />
                  <Select value={form.currency} onValueChange={(v) => setForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EGP">EGP (ج.م)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Date *</Label>
                <DatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} itemName={`${deleting ? formatCurrency(deleting.amount, deleting.currency) : ''} record`} />
    </div>
  );
}