import { useState, useMemo, useEffect } from 'react';
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
import { ArrowLeft, Printer, Plus, Pencil, Trash2, Paperclip } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { FileViewer } from '@/components/FileViewer';
import { toast } from 'sonner';
import {  useQueryClient } from '@tanstack/react-query';


export default function ShippingAgentDetails() {
  const { id } = useRouterParams();
  const navigate = useRouterNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [agents, setAgents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [records, setRecords] = useState<ShippingAgentRecord[]>([]);

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
    fileObject: null as File | null,
  });

  const fetchData = async () => {
    try {
      const [resAgents, resTrans, resJobs, resRecords] = await Promise.all([
        axios.get('http://localhost:5000/api/shipping-agents'),
        axios.get('http://localhost:5000/api/transactions'),
        axios.get('http://localhost:5000/api/jobs'),
        axios.get('http://localhost:5000/api/shipping-agent-records')
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

  const agentIdNumber = Number(id);
  const agent = agents.find(a => a.id === agentIdNumber);

  const agentTransactions = useMemo(() => {
    return transactions
      .filter(t => Number(t.relatedId) === agentIdNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, agentIdNumber]);

  const agentRecords = useMemo(() => {
    return records
      .filter(r => Number(r.agentId) === agentIdNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, agentIdNumber]);

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
      fileObject: null
    });
    setEditOpen(true);
  };

  const openEdit = (r: ShippingAgentRecord) => {
    setEditing(r);
    setForm({
      date: r.date,
      jobId: r.jobId?.toString() || 'none',
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
      fileObject: null
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
    if (!form.date) { toast.error('Please select a date.'); return; }

    const formData = new FormData();
    formData.append('agentId', String(agentIdNumber));
    formData.append('date', form.date);
    formData.append('jobId', (form.jobId === 'none' || !form.jobId) ? '' : form.jobId);
    formData.append('blNumber', form.blNumber || '');
    formData.append('country', form.country || '');
    formData.append('containerCount', form.containerCount || '0');
    formData.append('costEgp', form.costEgp || '0');
    formData.append('costEuro', form.costEuro || '0');
    formData.append('costUsd', form.costUsd || '0');
    formData.append('costEgpNote', form.costEgpNote || '');
    formData.append('costEuroNote', form.costEuroNote || '');
    formData.append('costUsdNote', form.costUsdNote || '');

    if (form.fileObject) {
      formData.append('pdfFile', form.fileObject);
    }

    try {
      const baseUrl = 'http://localhost:5000/api/shipping-agent-records';
      const url = editing ? `${baseUrl}/${editing.id}` : baseUrl;
      const method = editing ? 'put' : 'post';

      await axios({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(editing ? 'Updated!' : 'Saved to Database!');
      queryClient.invalidateQueries({ queryKey: ['shippingAgentRecords'] });
      queryClient.invalidateQueries({ queryKey: ['shippingAgents'] });
      setEditOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save data");
    }
  }; 

const handleDelete = async () => {
  if (!deleting) return;
  try {
    
    await axios.delete(`http://localhost:5000/api/shipping-agent-records/${deleting.id}`);
    
   
    toast.success('Record deleted.');

    
    setDeleteOpen(false);
    setDeleting(null);

    
    queryClient.invalidateQueries({ queryKey: ['shippingAgentRecords'] });
    queryClient.invalidateQueries({ queryKey: ['shippingAgents'] });

  } catch (error) {
    console.error(error);
    toast.error("Failed to delete record");
  }
};

  // الإجماليات
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/shipping-agents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Agent Ledger: {agent.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Record</Button>
          <Button variant="secondary" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <p className="text-sm text-muted-foreground">Remaining (EGP)</p>
          <p className={`text-xl font-bold ${totalEgp - paidEgp > 0 ? 'text-destructive' : 'text-green-600'}`}>
            {formatCurrency(totalEgp - paidEgp, 'EGP')}
          </p>
        </div>
        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <p className="text-sm text-muted-foreground">Remaining (USD)</p>
          <p className={`text-xl font-bold ${totalUsd - paidUsd > 0 ? 'text-destructive' : 'text-green-600'}`}>
            {formatCurrency(totalUsd - paidUsd, 'USD')}
          </p>
        </div>
        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <p className="text-sm text-muted-foreground">Remaining (EUR)</p>
          <p className={`text-xl font-bold ${totalEuro - paidEuro > 0 ? 'text-destructive' : 'text-green-600'}`}>
            {formatCurrency(totalEuro - paidEuro, 'EUR')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto w-full">
         <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/80 text-muted-foreground text-xs uppercase font-semibold">
               <tr>
                 <th className="px-4 py-4 border-b">Date</th>
                 <th className="px-4 py-4 border-b">B/L Number</th>
                 <th className="px-4 py-4 border-b text-right">Cost (EGP)</th>
                 <th className="px-4 py-4 border-b text-right">Cost (USD)</th>
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
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(row.costUsd, 'USD')}</td>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Record' : 'Add New Record'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>B/L Number</Label>
              <Input placeholder="e.g. MSCU123456" value={form.blNumber} onChange={e => setForm({...form, blNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Linked Job</Label>
              <Select value={form.jobId} onValueChange={val => setForm({...form, jobId: val})}>
                <SelectTrigger><SelectValue placeholder="Select Job" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Job Linked</SelectItem>
                  {jobs.map(j => (
                    <SelectItem key={j.id} value={j.id.toString()}>{j.jobNumber} - {j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Container Count</Label>
              <Input type="number" value={form.containerCount} onChange={e => setForm({...form, containerCount: e.target.value})} />
            </div>
            <div className="col-span-1 space-y-2 border-t pt-2">
              <Label className="text-primary font-bold">Cost (EGP)</Label>
              <Input type="number" value={form.costEgp} onChange={e => setForm({...form, costEgp: e.target.value})} />
              <Input placeholder="EGP Note..." value={form.costEgpNote} onChange={e => setForm({...form, costEgpNote: e.target.value})} className="text-xs" />
            </div>
            <div className="col-span-1 space-y-2 border-t pt-2">
              <Label className="text-green-600 font-bold">Cost (USD)</Label>
              <Input type="number" value={form.costUsd} onChange={e => setForm({...form, costUsd: e.target.value})} />
              <Input placeholder="USD Note..." value={form.costUsdNote} onChange={e => setForm({...form, costUsdNote: e.target.value})} className="text-xs" />
            </div>
            <div className="col-span-1 space-y-2 border-t pt-2">
              <Label className="text-blue-600 font-bold">Cost (EUR)</Label>
              <Input type="number" value={form.costEuro} onChange={e => setForm({...form, costEuro: e.target.value})} />
              <Input placeholder="EUR Note..." value={form.costEuroNote} onChange={e => setForm({...form, costEuroNote: e.target.value})} className="text-xs" />
            </div>
            <div className="col-span-2 space-y-2 border-t pt-4">
              <Label className="flex items-center gap-2"><Paperclip className="w-4 h-4" /> PDF Document / Receipt</Label>
              <div className="flex items-center gap-4">
                <Input type="file" accept=".pdf,image/*" onChange={handleFileUpload} />
                {form.fileObject && <Badge>New Selected</Badge>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update Record' : 'Create Record'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} itemName="this record" />
      <FileViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />
    </div>
  );
}