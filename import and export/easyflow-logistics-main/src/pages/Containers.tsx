import { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import {
  getContainers, saveContainers, getProducts, generateId,
  Container, ContainerProduct, formatDate
} from '@/data/store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Ship, Package, Camera, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { FileViewer } from '@/components/FileViewer';

const statusColors: Record<string, string> = {
  loading: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  'in-transit': 'bg-blue-500/10 text-blue-600 border-blue-200',
  arrived: 'bg-green-500/10 text-green-600 border-green-200',
  cleared: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

const statusIcons: Record<string, string> = {
  loading: '📦',
  'in-transit': '🚢',
  arrived: '✅',
  cleared: '🏁',
};

export default function Containers() {
  const { t } = useTranslation();

  const [containers, setContainers] = useState<Container[]>(() => getContainers());
  const products = useMemo(() => getProducts(), []);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Container | null>(null);
  const [deleting, setDeleting] = useState<Container | null>(null);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    containerNumber: '',
    sourcePort: '',
    destinationPort: '',
    shippingDate: '',
    arrivalDate: '',
    status: 'loading' as Container['status'],
    products: [] as ContainerProduct[],
    attachments: [] as { id: string; url: string; description: string; createdAt: string }[],
  };

  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditOpen(true);
  };

  const openEdit = (c: Container) => {
    setEditing(c);
    setForm({
      containerNumber: c.containerNumber || '',
      sourcePort: c.sourcePort || '',
      destinationPort: c.destinationPort || '',
      shippingDate: c.shippingDate || '',
      arrivalDate: c.arrivalDate || '',
      status: c.status || 'loading',
      products: c.products || [],
      attachments: c.attachments || [],
    });
    setEditOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      setForm(f => ({
        ...f,
        attachments: [
          ...f.attachments,
          {
            id: generateId(),
            url: data.url,
            description: file.name,
            createdAt: new Date().toISOString()
          }
        ]
      }));

      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const addProductToForm = () => {
  setForm(f => ({
    ...f,
    products: [
      ...f.products,
      { productId: '', quantity: 1, packages: 1, netWeight: 0, grossWeight: 0 } as any
    ]
  }));
};

const removeProductFromForm = (index: number) => {
  setForm(f => ({
    ...f,
    products: f.products.filter((_, i) => i !== index)
  }));
};

const updateProductInForm = (index: number, field: string, value: any) => {
  const newProducts = [...form.products];
  newProducts[index] = { ...newProducts[index], [field]: value };
  setForm(f => ({ ...f, products: newProducts }));
}

  const handleSave = async () => {
    if (!form.containerNumber.trim()) {
      toast.error("Container number required");
      return;
    }
    if (form.products.some(p => !p.productId)) {
    toast.error("Please select a product for all items");
    return;
  }

 const payload = {
    ...form,
    id: editing?.id,
    products: form.products.map(p => ({
      ...p,
      quantity: Number(p.quantity) || 0,
      packages: Number(p.packages) || 0,
      netWeight: Number(p.netWeight) || 0,
      grossWeight: Number(p.grossWeight) || 0,
    }))
  };

    try {
      const res = await fetch("http://localhost:5000/api/containers", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      const updated = await fetch("http://localhost:5000/api/containers")
        .then(r => r.json());

      setContainers(updated);
      setEditOpen(false);

      toast.success("Saved successfully");
    } catch {
      toast.error("Save failed");
    }
  };

  const handleDelete = useCallback(async () => {
    if (!deleting) return;

    await fetch(`http://localhost:5000/api/containers/${deleting.id}`, {
      method: "DELETE"
    });

    setContainers(prev => prev.filter(c => c.id !== deleting.id));
    setDeleteOpen(false);
    setDeleting(null);

    toast.success("Deleted");
  }, [deleting]);

  return (
    <div className="space-y-6">

      <PageHeader
        title={t('Containers & Shipping')}
        description={t('Manage shipments easily and efficiently')}
        action={<Button onClick={openNew}><Plus className="mr-2 w-4 h-4" /> Add</Button>}
      />

      {/* LIST */}
      <div className="grid gap-4">
        {containers.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            No containers yet
          </div>
        )}

        {containers.map(c => (
          <div key={c.id} className="border rounded-xl p-5 bg-card shadow-sm">

            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">{c.containerNumber}</div>

              <Badge className={statusColors[c.status]}>
                {statusIcons[c.status]} {t(`status.${c.status}`, c.status)}
              </Badge>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                <Pencil className="w-4 h-4" />
              </Button>

              <Button size="sm" variant="outline" onClick={() => {
                setDeleting(c);
                setDeleteOpen(true);
              }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* attachments preview */}
            {c.attachments?.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {c.attachments.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 text-xs border rounded px-2 py-1 cursor-pointer"
                    onClick={() => setViewingFile(a.url)}
                  >
                    <FileText className="w-3 h-3" />
                    {a.description}
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Container" : "Add Container"}</DialogTitle>
          </DialogHeader> 

          <div className="space-y-3">
            <Input
              placeholder="Container Number"
              value={form.containerNumber}
              onChange={e => setForm({ ...form, containerNumber: e.target.value })}
            />

            <Button onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <div className="border-t pt-4">
  <div className="flex justify-between items-center mb-2">
    <h3 className="text-sm font-semibold flex items-center gap-2">
      <Package className="w-4 h-4" /> Products
    </h3>
    <Button type="button" variant="ghost" size="sm" onClick={addProductToForm}>
      <Plus className="w-4 h-4 mr-1" /> Add Item
    </Button>
  </div>

  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
    {form.products.map((p, index) => (
      <div key={index} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-lg bg-gray-50/50">
        <div className="col-span-5">
          <label className="text-[10px] text-gray-500">Product Name</label>
          <Select 
            value={p.productId} 
            onValueChange={(val) => updateProductInForm(index, 'productId', val)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Product" />
            </SelectTrigger>
            <SelectContent>
              {products.map(prod => (
                <SelectItem key={prod.id} value={prod.id}>{prod.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-3">
          <label className="text-[10px] text-gray-500">Qty</label>
          <Input 
            type="number" 
            className="h-8 text-xs" 
            value={p.quantity} 
            onChange={(e) => updateProductInForm(index, 'quantity', e.target.value)}
          />
        </div>

        <div className="col-span-3">
          <label className="text-[10px] text-gray-500">Pkgs</label>
          <Input 
            type="number" 
            className="h-8 text-xs" 
            value={p.packages} 
            onChange={(e) => updateProductInForm(index, 'packages', e.target.value)}
          />
        </div>

        <div className="col-span-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 text-red-500 hover:text-red-700" 
            onClick={() => removeProductFromForm(index)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    ))}
    
    {form.products.length === 0 && (
      <div className="text-center text-xs text-gray-400 py-4 border-2 border-dashed rounded-lg">
        No products added yet.
      </div>
    )}
  </div>
</div>

            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        itemName={deleting?.containerNumber || ''}
      />

      <FileViewer fileUrl={viewingFile} onClose={() => setViewingFile(null)} />

    </div>
  );
}