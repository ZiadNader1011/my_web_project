import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Users, Globe, Mail, User, Receipt, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// الرابط الموحد للـ API (تأكد من وجوده في server.js)
const API_URL = 'http://localhost:5000/api/clients';

export default function Clients() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 1. جلب البيانات من PostgreSQL (تعديل الرابط والـ Key)
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await axios.get(API_URL);
      return response.data;
    }
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  
  // الفورم الموحد
  const [form, setForm] = useState({ 
    name: '', country: '', contact: '', email: '', 
    phone: '', telephone: '', fax: '', vat: '', 
    address: '', dhl: '', agentName: '' 
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', country: '', contact: '', email: '', phone: '', telephone: '', fax: '', vat: '', address: '', dhl: '', agentName: '' });
    setEditOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ 
      name: c.name, country: c.country, contact: c.contact || '', 
      email: c.email || '', phone: c.phone || '', telephone: c.telephone || '', 
      fax: c.fax || '', vat: c.vat || '', address: c.address || '', 
      dhl: c.dhl || '', agentName: c.agentName || '' 
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim()) { 
      toast.error('Please enter name and country.'); 
      return; 
    }

    try {
      if (editing) {
        // PostgreSQL ID عادة ما يكون id وليس _id
        await axios.put(`${API_URL}/${editing.id}`, form);
        toast.success(`"${form.name}" has been updated! ✨`);
      } else {
        await axios.post(API_URL, form);
        toast.success(`"${form.name}" has been saved! 🚀`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error saving data ❌");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      // استخدام id الرقمي لـ PostgreSQL
      await axios.delete(`${API_URL}/${deleting.id}`);
      toast.success(`"${deleting.name}" has been removed. 🗑️`);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete client ❌");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="p-4">
      <PageHeader 
        title={t('common.clients')} 
        description={t('pages.clientsDesc', 'Manage your network in PostgreSQL.')}
        action={<Button onClick={openNew} size="lg"><Plus className="mr-2 h-4 w-4" /> {t('pages.addClient')}</Button>} 
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {clients.map((c: any) => (
          <div key={c.id} className="rounded-xl bg-card p-5 shadow-sm border transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Globe className="h-3 w-3" />{c.country}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => navigate(`/clients/${c.id}`)} className="rounded-md p-1.5 hover:bg-accent text-primary">
                   <Receipt className="h-4 w-4" />
                </button>
                <button onClick={() => openEdit(c)} className="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
                   <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { setDeleting(c); setDeleteOpen(true); }} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive">
                   <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{c.contact || '—'}</div>
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{c.email || '—'}</div>
              <div className="flex items-center gap-2" dir="ltr"><Phone className="h-3.5 w-3.5" />{c.phone || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 py-2">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Client Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
               <div className="space-y-2"><Label>Country *</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" /></div>
               <div className="space-y-2"><Label>Mobile Number</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel" /></div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog 
        open={deleteOpen} 
        onOpenChange={setDeleteOpen} 
        onConfirm={handleDelete} 
        itemName={deleting?.name || ''} 
      />
    </div>
  );
}