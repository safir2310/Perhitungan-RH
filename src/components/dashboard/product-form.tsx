'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product, ProductFormData } from '@/hooks/use-products';
import { Loader2, Plus } from 'lucide-react';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => Promise<{ success: boolean; error?: string }>;
  editingProduct?: Product | null;
}

export function ProductForm({ open, onOpenChange, onSubmit, editingProduct }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    expirationDate: '',
    quantity: 1,
    rhDaysBefore: 14,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        expirationDate: new Date(editingProduct.expirationDate).toISOString().split('T')[0],
        quantity: editingProduct.quantity,
        rhDaysBefore: editingProduct.rhDaysBefore,
      });
    } else {
      setFormData({
        name: '',
        expirationDate: '',
        quantity: 1,
        rhDaysBefore: 14,
      });
    }
    setError('');
  }, [editingProduct, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.expirationDate || !formData.quantity) {
      setError('Semua field wajib diisi');
      return;
    }

    if (formData.quantity < 1) {
      setError('Jumlah minimal 1');
      return;
    }

    setLoading(true);

    try {
      const result = await onSubmit(formData);

      if (result.success) {
        onOpenChange(false);
        setFormData({
          name: '',
          expirationDate: '',
          quantity: 1,
          rhDaysBefore: 14,
        });
      } else {
        setError(result.error || 'Gagal menyimpan produk');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? 'Perbarui informasi produk di bawah ini'
              : 'Isi informasi produk baru untuk ditambahkan ke sistem'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nama Produk *</Label>
              <Input
                id="name"
                placeholder="Contoh: Paracetamol 500mg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Jumlah Item *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expirationDate">Tanggal Kadaluarsa *</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                disabled={loading}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rhDaysBefore">Hari Sebelum Kadaluarsa untuk RH</Label>
              <Input
                id="rhDaysBefore"
                type="number"
                min="1"
                max="365"
                value={formData.rhDaysBefore}
                onChange={(e) => setFormData({ ...formData, rhDaysBefore: parseInt(e.target.value) || 14 })}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Produk akan ditandai &quot;Wajib Retur&quot; {formData.rhDaysBefore} hari sebelum tanggal kadaluarsa
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  {editingProduct ? 'Simpan Perubahan' : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Produk
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
