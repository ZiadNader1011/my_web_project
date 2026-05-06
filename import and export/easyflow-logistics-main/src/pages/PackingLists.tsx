import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { StandalonePackingList, PackingListProduct, formatDate, getContainers } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DatePicker } from '@/components/DatePicker';
import { FileViewer } from '@/components/FileViewer';
import { PackingListPrintForm } from '@/components/PackingListPrintForm';
import { Plus, Pencil, Trash2, FileText, Calendar, Camera, PackageSearch, FileBox, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function PackingLists() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. جلب البيانات من PostgreSQL عبر API
  const { data: packingLists = [], isLoading } = useQuery({
    queryKey: ['packingLists'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/packing-lists');
      return res.data;
    }
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<StandalonePackingList | null>(null);
  const [deleting, setDeleting] = useState<StandalonePackingList | null>(null);
  const [printing, setPrinting] = useState<StandalonePackingList | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  const containersList = useMemo(() => getContainers(), []);

  const emptyForm = { 
    date: new Date().toISOString().split('T')[0], 
    blNumber: '', 
    clientName: '', 
    invoiceNumber: '', 
    customRelease: '', 
    note: '',
    dhlNumber: '',
    shippingAgent: '',
    pol: '',
    pod: '',
    finalDestination: '',
    shippingDate: '',
    numberOfContainers: '' as string | number,
    containerNumbers: [] as string[],
    numberOfProducts: '' as string | number,
    products: [] as PackingListProduct[],
    attachments: [] as { id: string; url: string; description: string; createdAt: string }[] 
  };

  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditOpen(true);
  };

// داخل دالة openEdit في ملف PackingLists.tsx
const openEdit = (pl: any) => {
  setEditing(pl);
  setForm({
    ...pl,
    // معالجة المصفوفة للتأكد من وجود id لكل ملف
    attachments: Array.isArray(pl.attachments) 
      ? pl.attachments.map((att: any) => ({
          id: att.id || att._id || String(Math.random()), // تأكد من وجود id
          url: att.url,
          description: att.description || '',
          createdAt: att.createdAt || new Date().toISOString()
        }))
      : []
  });
  setEditOpen(true);
};

  // 2. رفع الملفات للسيرفر وتخزين الرابط (URL) بدلاً من Base64
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (Max 10MB)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      const fileUrl = res.data.url;

      setForm(f => ({
        ...f,
        attachments: [...f.attachments, { 
          id: Date.now().toString(),
          url: fileUrl, 
          description: file.name, 
          createdAt: new Date().toISOString() 
        }]
      }));
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setForm(f => ({
      ...f,
      attachments: f.attachments.filter((_, i) => i !== index)
    }));
  };

  // 3. حفظ البيانات في الباك-إند (PostgreSQL)
  const handleSave = async () => {
    if (!form.clientName.trim()) {
      toast.error('Please enter a client name.');
      return;
    }

    const plData = {
      ...form,
      numberOfContainers: Number(form.numberOfContainers) || 0,
      numberOfProducts: Number(form.numberOfProducts) || 0,
      // تحويل التواريخ لصيغة يقبلها PostgreSQL
      date: new Date(form.date).toISOString(),
      shippingDate: form.shippingDate ? new Date(form.shippingDate).toISOString() : null,
    };

    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/packing-lists/${editing.id}`, plData);
        toast.success('Packing List updated');
      } else {
        await axios.post('http://localhost:5000/api/packing-lists', plData);
        toast.success('Packing List created');
      }
      
      queryClient.invalidateQueries({ queryKey: ['packingLists'] });
      setEditOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error('Failed to save to database');
    }
  };

  // 4. حذف البيانات من PostgreSQL
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await axios.delete(`http://localhost:5000/api/packing-lists/${deleting.id}`);
      queryClient.invalidateQueries({ queryKey: ['packingLists'] });
      toast.success('Packing List deleted');
      setDeleting(null);
      setDeleteOpen(false);
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="pb-10">
      <PageHeader 
        title={t('Packing Lists', 'Standalone Packing Lists')} 
        description={t('pages.packingListsDesc', 'Manage packing lists independently from operations.')}
        action={<Button onClick={openNew} size="lg"><Plus className="mr-2 h-4 w-4" /> Add Packing List</Button>} 
      />

      <div className="space-y-4">
        {packingLists.map((pl: any) => (
          <div key={pl.id} className="rounded-xl bg-card border shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileBox className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {pl.clientName || 'Unnamed Client'} 
                    {pl.invoiceNumber && <span className="text-muted-foreground font-normal ml-2 text-sm">| INV: {pl.invoiceNumber}</span>}
                  </h3>
                </div>
                
                {/* تفاصيل العرض المختصرة */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-4 text-sm border-b pb-4">
                  <div><span className="text-muted-foreground block text-[10px] uppercase">Date</span><span className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(pl.date)}</span></div>
                  <div><span className="text-muted-foreground block text-[10px] uppercase">B/L Number</span><span className="font-medium font-mono">{pl.blNumber || '—'}</span></div>
                  <div><span className="text-muted-foreground block text-[10px] uppercase">Custom Release</span><span className="font-medium">{pl.customRelease || '—'}</span></div>
                  <div><span className="text-muted-foreground block text-[10px] uppercase">Agent</span><span className="font-medium">{pl.shippingAgent || '—'}</span></div>
                </div>

                {pl.note && <div className="mt-3 text-sm text-muted-foreground italic">"{pl.note}"</div>}
              </div>

              <div className="flex sm:flex-col gap-2 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-3">
                <Button variant="outline" size="sm" onClick={() => { setPrinting(pl); setPrintOpen(true); }}><Printer className="h-4 w-4 mr-2" /> Print</Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(pl)}><Pencil className="h-4 w-4 mr-2" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => { setDeleting(pl); setDeleteOpen(true); }} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
              </div>
            </div>
          </div>
        ))}

        {packingLists.length === 0 && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center mt-6">
            <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No Packing Lists</h3>
          </div>
        )}
      </div>

      {/* نافذة الإضافة والتعديل */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Packing List' : 'Add Packing List'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Client Name</Label><Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} /></div>
            <div><Label>Date</Label><DatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></div>
            <div><Label>B/L Number</Label><Input value={form.blNumber} onChange={e => setForm(f => ({ ...f, blNumber: e.target.value }))} /></div>
            <div><Label>Invoice Number</Label><Input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} /></div>
            
            <div className="md:col-span-2">
              <Label>Note / Info</Label>
              <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>

            {/* قسم المرفقات المحدث */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <Label>Attachments</Label>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Camera className="h-4 w-4 mr-2" /> Upload</Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.xlsx,.xls,.csv" onChange={handleFileUpload} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.attachments.map((att, i) => (
                  <div key={att.id} className="flex gap-2 items-center border rounded-lg p-2 bg-muted/20">
                    <FileText className="h-5 w-5 text-primary" />
                    <Input className="h-8 text-xs flex-1" value={att.description} onChange={e => {
                      const newAtts = [...form.attachments];
                      newAtts[i].description = e.target.value;
                      setForm({...form, attachments: newAtts});
                    }} />
                    <button onClick={() => removeAttachment(i)} className="text-destructive"><Trash2 className="h-4 w-4"/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save To Database</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} itemName={deleting?.clientName || 'Packing List'} />
      <FileViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />
      <PackingListPrintForm open={printOpen} onOpenChange={setPrintOpen} packingList={printing} />
    </div>
  );
}
