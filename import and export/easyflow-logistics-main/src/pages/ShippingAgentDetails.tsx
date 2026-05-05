import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams as useRouterParams, useNavigate as useRouterNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { formatDate, formatCurrency, ShippingAgentRecord } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, FileText, Printer, Plus, Pencil, Trash2, Paperclip, Briefcase } from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { FileViewer } from '@/components/FileViewer';
import { toast } from 'sonner';

export default function ShippingAgentDetails() {
  const { id } = useRouterParams();
  const navigate = useRouterNavigate();
  const { t } = useTranslation();

  const [agents, setAgents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [records, setRecords] = useState<ShippingAgentRecord[]>([]);

  // 1. تعريف شكل البيانات (State) ليشمل الملف الفعلي
  const [form, setForm] = useState({
    date: '',
    jobId: 'none',
    blNumber: '',
    country: '',
    containerCount: '',
    costEgp: '',
    costEgpNote: '',
    costEuro: '',
    costEuroNote: '',
    costUsd: '',
    costUsdNote: '',
    pdfUrl: '',
    fileObject: null as File | null, // تم إضافة هذا السطر لحل الإيرور
  });

  const fetchData = async () => {
    try {
      const [resAgents, resTrans, resJobs, resRecords] = await Promise.all([
        axios.get('/api/shipping-agents'),
        axios.get('/api/transactions'),
        axios.get('/api/jobs'),
        axios.get('/api/shipping-agent-records')
      ]);
      setAgents(resAgents.data);
      setTransactions(resTrans.data);
      setJobs(resJobs.data);
      setRecords(resRecords.data);
    } catch (error) {
      toast.error("Failed to load data from server");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const agent = agents.find(a => a.id === id);

  const agentTransactions = useMemo(() => {
    return transactions.filter(t => t.relatedId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, id]);

  const agentRecords = useMemo(() => {
    return records.filter(r => r.agentId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, id]);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingAgentRecord | null>(null);
  const [deleting, setDeleting] = useState<ShippingAgentRecord | null>(null);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  if (!agent) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Shipping Agent not found</h2>
        <Button onClick={() => navigate('/shipping-agents')} className="mt-4">Back to Shipping Agents</Button>
      </div>
    );
  }

  const openNew = () => {
    setEditing(null);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      jobId: 'none',
      blNumber: '',
      country: '',
      containerCount: '',
      costEgp: '',
      costEgpNote: '',
      costEuro: '',
      costEuroNote: '',
      costUsd: '',
      costUsdNote: '',
      pdfUrl: '',
      fileObject: null // تصفير الملف عند فتح إضافة جديدة
    });
    setEditOpen(true);
  };

  const openEdit = (r: ShippingAgentRecord) => {
    setEditing(r);
    setForm({
      date: r.date,
      jobId: r.jobId || 'none',
      blNumber: r.blNumber || '',
      country: r.country || '',
      containerCount: r.containerCount?.toString() || '',
      costEgp: r.costEgp?.toString() || '',
      costEgpNote: r.costEgpNote || '',
      costEuro: r.costEuro?.toString() || '',
      costEuroNote: r.costEuroNote || '',
      costUsd: r.costUsd?.toString() || '',
      costUsdNote: r.costUsdNote || '',
      pdfUrl: r.pdfUrl || '',
      fileObject: null // تصفير كائن الملف ليبقى القديم ما لم يتم اختيار جديد
    });
    setEditOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(f => ({ ...f, fileObject: file }));
    toast.success('File selected: ' + file.name);
  };

  const handleSave = async () => {
    if (!form.date) {
      toast.error('Please select a date.');
      return;
    }

    const formData = new FormData();
    formData.append('agentId', agent.id);
    formData.append('date', form.date);
    formData.append('jobId', form.jobId === 'none' ? '' : form.jobId);
    formData.append('blNumber', form.blNumber || '');
    formData.append('country', form.country || '');
    formData.append('containerCount', form.containerCount || '0');
    formData.append('costEgp', form.costEgp || '0');
    formData.append('costEgpNote', form.costEgpNote || '');
    formData.append('costEuro', form.costEuro || '0');
    formData.append('costEuroNote', form.costEuroNote || '');
    formData.append('costUsd', form.costUsd || '0');
    formData.append('costUsdNote', form.costUsdNote || '');

    // إرسال الملف الفعلي إذا وجد
    if (form.fileObject) {
      formData.append('pdfFile', form.fileObject);
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editing) {
        await axios.put(`/api/shipping-agent-records/${editing.id}`, formData, config);
        toast.success('Record updated successfully!');
      } else {
        await axios.post('/api/shipping-agent-records', formData, config);
        toast.success('Record saved to database!');
      }

      fetchData();
      setEditOpen(false);
      setForm(f => ({ ...f, fileObject: null }));
    } catch (error) {
      console.error(error);
      toast.error("Error saving data to server");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await axios.delete(`/api/shipping-agent-records/${deleting.id}`);
      toast.success('Record deleted.');
      fetchData();
      setDeleting(null);
      setDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  // حساب الإجماليات والمدفوعات (بقيت كما هي مع تعديل بسيط لتفادي NaN)
  let totalEgp = 0, totalEuro = 0, totalUsd = 0;
  agentRecords.forEach(r => {
    totalEgp += Number(r.costEgp || 0);
    totalEuro += Number(r.costEuro || 0);
    totalUsd += Number(r.costUsd || 0);
  });

  let paidEgp = 0, paidEuro = 0, paidUsd = 0;
  agentTransactions.forEach(t => {
    const amt = Number(t.amount || 0);
    if (t.type === 'outgoing') {
      if (t.currency === 'EGP') paidEgp += amt;
      else if (t.currency === 'EUR') paidEuro += amt;
      else if (t.currency === 'USD') paidUsd += amt;
    } else {
      if (t.currency === 'EGP') paidEgp -= amt;
      else if (t.currency === 'EUR') paidEuro -= amt;
      else if (t.currency === 'USD') paidUsd -= amt;
    }
  });

  return (
    <div className="pb-10">
      {/* ... الواجهة كما هي (نفس الـ JSX الخاص بك) ... */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/shipping-agents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Agent Ledger: {agent.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Record</Button>
          <Button variant="secondary" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </div>
      </div>

      {/* الجدول وبقية العناصر هنا... تأكد من استخدام handleFileUpload في input الملفات */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto w-full">
         <table className="w-full text-sm text-left whitespace-nowrap">
            {/* ... الجدول كما كان لديك ... */}
            <thead className="bg-muted/80 text-muted-foreground text-xs uppercase font-semibold">
               <tr>
                 <th className="px-4 py-4 border-b">Date</th>
                 <th className="px-4 py-4 border-b">B/L Number</th>
                 <th className="px-4 py-4 border-b text-right">Cost (EGP)</th>
                 <th className="px-4 py-4 border-b text-center">Attachment</th>
                 <th className="px-4 py-4 border-b w-16"></th>
               </tr>
            </thead>
            <tbody>
              {agentRecords.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">{formatDate(row.date)}</td>
                  <td className="px-4 py-3 font-mono">{row.blNumber || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatCurrency(row.costEgp, 'EGP')}</td>
                  <td className="px-4 py-3 text-center">
                    {row.pdfUrl && (
                       <Button variant="ghost" size="sm" onClick={() => setViewingFile(row.pdfUrl!)}>
                          <Paperclip className="h-3 w-3 mr-1" /> View
                       </Button>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-3 w-3"/></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeleting(row); setDeleteOpen(true); }}><Trash2 className="h-3 w-3"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
      </div>

      {/* Dialog إضافة/تعديل */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
             {/* ... مدخلات البيانات ... */}
             <div className="col-span-2">
                <Label>Attachment</Label>
                <Input type="file" onChange={handleFileUpload} />
                {form.fileObject && <p className="text-xs text-green-600 mt-1">Selected: {form.fileObject.name}</p>}
                {form.pdfUrl && !form.fileObject && <p className="text-xs text-blue-600 mt-1">Current: {form.pdfUrl.split('/').pop()}</p>}
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} itemName="this record" />
      <FileViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />
    </div>
  );
}
