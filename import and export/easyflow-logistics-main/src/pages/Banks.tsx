import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Building2, Receipt, Pencil, Trash2, Paperclip, Printer, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { FileViewer } from '@/components/FileViewer';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatCurrency, formatDate, EGYPTIAN_BANKS } from '@/data/store';

const API_BASE = 'http://localhost:5000/api';

export default function Banks() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedBankName, setSelectedBankName] = useState<string | null>(null);

  // 1. جلب ملخص البنوك من الباك إند
  const { data: bankSummary = [], isLoading } = useQuery({
    queryKey: ['banks-summary'],
    queryFn: async () => (await axios.get(`${API_BASE}/banks/summary`)).data
  });

  // 2. جلب كل المعاملات (لعرض الجدول داخل المودال)
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => (await axios.get(`${API_BASE}/transactions`)).data
  });

  // البيانات المساعدة (Dropdowns)
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: async () => (await axios.get(`${API_BASE}/jobs`)).data });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await axios.get(`${API_BASE}/suppliers`)).data });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: async () => (await axios.get(`${API_BASE}/clients`)).data });

  // الحالات المحلية للفورم والمودالات
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ 
    type: 'incoming', relatedId: 'none', amount: '', currency: 'USD', 
    date: '', description: '', bank: '', blNumber: '', attachmentUrl: '' 
  });

  // Mutations (الحذف والتعديل)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${API_BASE}/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks-summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Record removed.');
      setDeleteOpen(false);
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing 
      ? axios.put(`${API_BASE}/transactions/${editing.id}`, data)
      : axios.post(`${API_BASE}/transactions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks-summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Saved successfully!');
      setEditOpen(false);
    }
  });

  const handleSave = () => {
    if (!form.amount || !form.date || !form.description) { toast.error('Required fields missing'); return; }
    saveMutation.mutate({ ...form, amount: parseFloat(form.amount) });
  };

  const currentBankData = useMemo(() => 
    bankSummary.find((b: any) => b.name === selectedBankName), 
  [bankSummary, selectedBankName]);

  const bankTransactions = useMemo(() => 
    allTransactions.filter((t: any) => t.bank === selectedBankName),
  [allTransactions, selectedBankName]);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div>
      <PageHeader title={t('Banks & Accounts')} description="Real-time PostgreSQL linked bank ledgers." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankSummary.map((bank: any) => (
          <div key={bank.name} onClick={() => setSelectedBankName(bank.name)} className="rounded-xl border bg-card p-6 shadow-sm cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary"><Building2 className="h-6 w-6" /></div>
              <div>
                <h3 className="font-semibold text-lg">{bank.name}</h3>
                <p className="text-xs text-muted-foreground">{bank.transactionCount} Transactions</p>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</h4>
              {Object.entries(bank.balances).map(([cur, amount]: any) => (
                <div key={cur} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{cur}</span>
                  <span className={`font-semibold ${amount < 0 ? 'text-destructive' : 'text-success'}`}>
                    {formatCurrency(amount, cur)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* مودال تفاصيل البنك */}
      <Dialog open={!!selectedBankName} onOpenChange={() => setSelectedBankName(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bank Ledger: {selectedBankName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {bankTransactions.map((t: any) => (
                  <tr key={t.id} className="border-b hover:bg-muted/10">
                    <td className="px-4 py-3">{formatDate(t.date)}</td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className={`px-4 py-3 text-right font-bold ${t.type === 'incoming' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'incoming' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                    </td>
                    <td className="px-4 py-3 text-right flex gap-1">
                      <button onClick={() => { setEditing(t); setForm({...t, amount: t.amount.toString()}); setEditOpen(true); }} className="p-1 hover:bg-accent rounded"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { setDeletingId(t.id); setDeleteOpen(true); }} className="p-1 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={() => deletingId && deleteMutation.mutate(deletingId)} itemName="this transaction" />
      
      {/* مودال التعديل - تم توحيده ليعمل مع الباك إند */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          <div className="space-y-4">
             <Label>Amount</Label>
             <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
             <Label>Description</Label>
             <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
