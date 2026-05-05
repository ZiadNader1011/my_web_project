import { useState } from 'react';
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
import { Plus, Pencil, Trash2, Users, Globe, Mail, User, Package, Receipt, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// الرابط الأساسي للسيرفر
const API_BASE_URL = 'http://localhost:5000/api/suppliers';

export default function Suppliers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. جلب الموردين (تعديل الرابط)
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await axios.get(API_BASE_URL);
      return res.data;
    }
  });

  // جلب المنتجات (تعديل الرابط لو بورت 5000)
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/products'); // تأكد من المسار في السيرفر
      return res.data;
    }
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', country: '', contact: '', email: '', phone: '', product: '' });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', country: '', contact: '', email: '', phone: '', product: '' });
    setEditOpen(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ 
      name: s.name, 
      country: s.country, 
      contact: s.contact || '', 
      email: s.email || '', 
      phone: s.phone || '', 
      product: s.agentName || '' // ربطنا الحقل بـ agentName الموجود في السيرفر
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim()) { 
      toast.error('Please fill in required fields (Name & Country).'); 
      return; 
    }
    
    try {
      if (editing) {
        // تعديل مورد: http://localhost:5000/api/suppliers/:id
        await axios.put(`${API_BASE_URL}/${editing.id}`, form);
        toast.success(`"${form.name}" updated! ✨`);
      } else {
        // إضافة مورد: http://localhost:5000/api/suppliers
        await axios.post(API_BASE_URL, form);
        toast.success(`"${form.name}" saved to Database! 🎉`);
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setEditOpen(false);
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error.response?.data?.error || "Server Error ❌");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      // حذف مورد: http://localhost:5000/api/suppliers/:id
      await axios.delete(`${API_BASE_URL}/${deleting.id}`);
      toast.success("Supplier removed.");
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete ❌");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="p-6">
      <PageHeader 
        title={t('common.suppliers')} 
        description={t('pages.suppliersDesc', 'Global network managed in Database.')}
        action={<Button onClick={openNew} size="lg"><Plus className="mr-2 h-4 w-4" /> {t('pages.addSupplier')}</Button>} 
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {suppliers.map((s: any) => {
          const supplierProductsCount = products.filter((p: any) => 
            (p.supplierId === s.id) || (p.supplierId?.id === s.id) 
          ).length;

          return (
            <div key={s.id} className="rounded-xl bg-card p-5 border shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-3 w-3" />{s.country}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/suppliers/${s.id}`)} className="rounded-md p-1.5 hover:bg-accent text-primary">
                    <Receipt className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEdit(s)} className="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setDeleting(s); setDeleteOpen(true); }} className="rounded-md p-1.5 hover:bg-destructive/10 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{s.contact || '—'}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{s.email || '—'}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{s.phone || '—'}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed">
                  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Products:</span>
                  <span className="font-medium text-foreground">{supplierProductsCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {suppliers.length === 0 && (
        <div className="p-20 text-center border-2 border-dashed rounded-2xl mt-6">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No suppliers found. Start adding your global partners!</p>
        </div>
      )}

      {/* Dialog إضافة وتعديل */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Main Product</Label>
              <Input value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} placeholder="e.g. Soybeans, Wheat" />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel" />
              </div>
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