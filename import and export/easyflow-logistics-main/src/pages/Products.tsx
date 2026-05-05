import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Wheat, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

export default function Products() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // 1. جلب الموردين من PostgreSQL
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      // تم توحيد المسار ليكون متوافق مع الراوت الجديد
      const res = await axios.get('http://localhost:5000/api/suppliers');
      return res.data;
    }
  });

  // 2. جلب المنتجات من PostgreSQL
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/products');
      return res.data;
    }
  });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  
  const emptyForm = { name: '', category: '', supplierId: '', price: '' };
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ 
      name: p.name, 
      category: p.category || '', 
      // نحول الـ ID لنص فقط من أجل الـ Select Component
      supplierId: p.supplierId ? String(p.supplierId) : '', 
      price: String(p.price || '')
    });
    setEditOpen(true);
  };

  // 3. حفظ المنتج في PostgreSQL
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Please enter a product name.'); return; }

    const finalData = {
      name: form.name,
      category: form.category,
      // تحويل لـ Number لأن PostgreSQL/Prisma تتوقع Int
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      price: parseFloat(form.price) || 0
    };

    try {
      if (editing) {
        await axios.put(`http://localhost:5000/api/products/${editing.id}`, finalData);
        toast.success(`"${form.name}" updated! ✨`);
      } else {
        await axios.post('http://localhost:5000/api/products', finalData);
        toast.success(`"${form.name}" saved to PostgreSQL! 🚀`);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error saving product ❌");
    }
  };

  // 4. حذف المنتج
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${deleting.id}`);
      toast.success(`"${deleting.name}" removed.`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteOpen(false);
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="p-4">
      <PageHeader 
        title={t('common.products')} 
        description="Catalog managed by PostgreSQL"
        action={<Button onClick={openNew} size="lg"><Plus className="mr-2 h-4 w-4" /> {t('pages.addProduct', 'Add Product')}</Button>} 
      />

      <div className="overflow-x-auto rounded-xl bg-card border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('Product')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('Category')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('Supplier')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('Price')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-primary" /> {p.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {/* Prisma يرجع الكائن كـ supplier لو تم عمل include */}
                  {p.supplier?.name || '—'} 
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {p.price ? `${p.price.toFixed(2)} ${p.currency || 'USD'}` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-md p-1.5 hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => { setDeleting(p); setDeleteOpen(true); }} className="rounded-md p-1.5 hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t('Edit Product') : t('Add New Product')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('Product Name')} *</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                placeholder="e.g. Wheat Flour"
              />
            </div>

            <div>
              <Label>{t('Category')}</Label>
              <Input 
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                placeholder="e.g. Grains"
              />
            </div>

            <div>
              <Label>{t('Price')}</Label>
              <Input 
                type="number"
                value={form.price} 
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>{t('Supplier')}</Label>
              <Select 
                value={form.supplierId} 
                onValueChange={v => setForm(f => ({ ...f, supplierId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Select supplier...')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
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
