import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { FileViewer } from '@/components/FileViewer';
import { ShippingAgent, formatCurrency } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Ship, Globe, Mail, User, Phone, Receipt, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ShippingAgents() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. جلب البيانات من الداتابيز
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['shippingAgents'],
    queryFn: () => axios.get('http://localhost:5000/api/shipping-agents').then(res => res.data)
  });

const { data: records = [] } = useQuery({
  queryKey: ['shippingAgentRecords'],
  queryFn: () => axios.get('http://localhost:5000/api/shipping-agent-records').then(res => res.data)
});

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => axios.get('http://localhost:5000/api/transactions').then(res => res.data)
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingAgent | null>(null);
  const [deleting, setDeleting] = useState<ShippingAgent | null>(null);
  const [form, setForm] = useState({ name: '',company: '', address: '', telephone: '', personalNumber: '', email: '', attachmentUrl: '' });
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '',company: '', address: '', telephone: '', personalNumber: '', email: '', attachmentUrl: '' });
    setEditOpen(true);
  };
const openEdit = (a: ShippingAgent) => {
  setEditing(a);
  setForm({ 
    name: a.name,
    company: a.company || '', 
    address: a.address || '', 
    telephone: a.telephone || '', 
    personalNumber: a.personalNumber || '', 
    email: a.email || '', 
    attachmentUrl: a.attachmentUrl || '' 
  });
  setEditOpen(true);
};

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      setForm(f => ({ ...f, attachmentUrl: res.data.url }));
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('File upload failed');
    }
  };

 const handleSave = async () => {
  if (!form.name.trim()) { 
    toast.error('Please enter a name.'); 
    return; 
  }

  // نحول البيانات لـ Object عادي لأننا رفعنا الملف بالفعل وحصلنا على الرابط
  const payload = {
    ...form,
    // نضمن أن أي قيمة فارغة ترسل كـ null لتتوافق مع Postgres
    company: form.company || null,
    address: form.address || null,
    telephone: form.telephone || null,
    personalNumber: form.personalNumber || null,
    email: form.email || null,
    attachmentUrl: form.attachmentUrl || null
  };

  try {
    const url = editing 
      ? `http://localhost:5000/api/shipping-agents/${editing.id}` 
      : 'http://localhost:5000/api/shipping-agents';
    
    // استخدام axios بطريقة مباشرة أسهل
    if (editing) {
      await axios.put(url, payload);
    } else {
      await axios.post(url, payload);
    }

    toast.success(editing ? `"${form.name}" updated!` : `"${form.name}" added!`);
    queryClient.invalidateQueries({ queryKey: ['shippingAgents'] });
    setEditOpen(false);
  } catch (error: any) {
    console.error("Save Error:", error);
    toast.error(error.response?.data?.error || 'Failed to save to database');
  }
};
const handleDelete = async () => {
    if (!deleting) return;
    try {
        await axios.delete(`http://localhost:5000/api/shipping-agents/${deleting.id}`);
        
        // غلق النافذة وتصفير الحالة فوراً 🟢
        setDeleteOpen(false);
        setDeleting(null);

        // تحديث البيانات عن طريق React Query فقط 🟢
        queryClient.invalidateQueries({ queryKey: ['shippingAgents'] });
        
        toast.success('Deleted successfully');
    } catch (error) {
        // إذا اتمسح بالفعل، لا تظهر رسالة فشل
        if (error.response?.status === 404 || error.message.includes('not found')) {
            setDeleteOpen(false);
            setDeleting(null);
            return;
        }
        toast.error("Delete failed");
    }
};


  if (isLoading) return <div className="p-8 text-center">Loading Agents...</div>;

  return (
    <div>
      <PageHeader title={t('Shipping Agents', 'Shipping Agents')} description={t('pages.shippingAgentsDesc', 'Manage your shipping agents and their ledgers.')}
        action={<Button onClick={openNew} size="lg"><Plus className="mr-2 h-4 w-4" /> {t('Add Shipping Agent', 'Add Shipping Agent')}</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map(a => {
          const agentRecords = records.filter(r => r.agentId === a.id);
          
          let totalEgp = 0, totalEuro = 0, totalUsd = 0;
          agentRecords.forEach(r => {
            if (r.costEgp) totalEgp += Number(r.costEgp);
            if (r.costEuro) totalEuro += Number(r.costEuro);
            if (r.costUsd) totalUsd += Number(r.costUsd);
          });

          let paidEgp = 0, paidEuro = 0, paidUsd = 0;
          transactions.filter(t => t.relatedId === String(a.id)).forEach(t => {
            const amt = Number(t.amount || 0);
            if (t.type === 'outgoing') {
              if (t.currency === 'EGP') paidEgp += amt;
              else if (t.currency === 'EUR') paidEuro += amt;
              else if (t.currency === 'USD') paidUsd += amt;
            } else if (t.type === 'incoming') {
              if (t.currency === 'EGP') paidEgp -= amt;
              else if (t.currency === 'EUR') paidEuro -= amt;
              else if (t.currency === 'USD') paidUsd -= amt;
            }
          });

          const remainingEgp = totalEgp - paidEgp;
          const remainingEuro = totalEuro - paidEuro;
          const remainingUsd = totalUsd - paidUsd;

          return (
            <div key={a.id} className="rounded-xl bg-card p-5 shadow-sm border transition-shadow hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Ship className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {a.name}
                        {a.attachmentUrl && (
                          <button onClick={() => setViewingFile(a.attachmentUrl!)} title="View Agent Document" className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors">
                            <Paperclip className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/shipping-agents/${a.id}`)} className="rounded-md p-1.5 hover:bg-accent" title="Detailed Ledger"><Receipt className="h-4 w-4 text-primary" /></button>
                    <button onClick={() => openEdit(a)} className="rounded-md p-1.5 hover:bg-accent"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => { setDeleting(a); setDeleteOpen(true); }} className="rounded-md p-1.5 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {a.address && <div className="flex items-center gap-1.5"><Globe className="h-3 w-3" />{a.address}</div>}
                  {a.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{a.email}</div>}
                  {a.telephone && <div className="flex items-center gap-1.5" dir="ltr"><Phone className="h-3 w-3 shrink-0" /><span className="truncate">{a.telephone}</span></div>}
                  {a.personalNumber && <div className="flex items-center gap-1.5" dir="ltr"><User className="h-3 w-3 shrink-0" /><span className="truncate">{a.personalNumber}</span></div>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">Records</span>
                  <Badge variant="outline" className="text-xs">{agentRecords.length}</Badge>
                </div>
                
                {(remainingUsd !== 0 || remainingEuro !== 0 || remainingEgp !== 0) && (
                  <div className="pt-2 mt-2 border-t text-xs space-y-1">
                    <div className="text-muted-foreground mb-1 font-medium">Remaining Debt:</div>
                    {remainingUsd !== 0 && <div className="flex justify-between"><span>USD:</span> <span className={`font-bold ${remainingUsd > 0 ? 'text-destructive' : 'text-success'}`}>{formatCurrency(remainingUsd, 'USD')}</span></div>}
                    {remainingEuro !== 0 && <div className="flex justify-between"><span>EUR:</span> <span className={`font-bold ${remainingEuro > 0 ? 'text-destructive' : 'text-success'}`}>{formatCurrency(remainingEuro, 'EUR')}</span></div>}
                    {remainingEgp !== 0 && <div className="flex justify-between"><span>EGP:</span> <span className={`font-bold ${remainingEgp > 0 ? 'text-destructive' : 'text-success'}`}>{formatCurrency(remainingEgp, 'EGP')}</span></div>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {agents.length === 0 && (
        <div className="rounded-xl border-2 border-dashed p-12 text-center">
          <Ship className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">{t('No shipping agents yet.', 'No shipping agents yet.')}</p>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t('Edit Shipping Agent', 'Edit Shipping Agent') : t('Add Shipping Agent', 'Add Shipping Agent')}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div><Label>{t('Name *', 'Name *')}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>{t('Company', 'Company')}</Label><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
            <div><Label>{t('Address', 'Address')}</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>{t('Telephone', 'Telephone')}</Label><Input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} type="tel" dir="ltr" className="text-left" /></div>
            <div><Label>{t('Personal Number', 'Personal Number')}</Label><Input value={form.personalNumber} onChange={e => setForm(f => ({ ...f, personalNumber: e.target.value }))} type="tel" dir="ltr" className="text-left" /></div>
            <div><Label>{t('Email', 'Email')}</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" /></div>
            <div className="border-t pt-4 mt-2">
              <Label>{t('Attachment (Photo/PDF/Excel)', 'Attachment (Photo/PDF/Excel)')}</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input type="file" accept="image/*,.pdf,.xlsx,.xls,.csv" onChange={handleFileUpload} className="flex-1" />
                {form.attachmentUrl && <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white shrink-0">Attached</Badge>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t('Cancel', 'Cancel')}</Button>
            <Button onClick={handleSave}>{editing ? t('Save Changes', 'Save Changes') : t('Add Shipping Agent', 'Add Shipping Agent')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} itemName={deleting?.name || ''} />
      <FileViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />
    </div>
  );
}