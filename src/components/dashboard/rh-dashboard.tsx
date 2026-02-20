'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useStatistics, Product, ProductFormData } from '@/hooks/use-products';
import { useSocket } from '@/hooks/use-socket';
import { StatisticsCards } from './statistics-cards';
import { ProductsTable } from './products-table';
import { ProductForm } from './product-form';
import { NotificationToast } from './notification-toast';
import { Plus, Bell, RefreshCw, LogOut, User, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function RHDashboard() {
  const { user, logout } = useAuth();
  const { products, loading, error, refetch, createProduct, updateProduct, deleteProduct } = useProducts();
  const { statistics, loading: statsLoading, refetch: refetchStats } = useStatistics();
  const { connected, notifyNewProduct, notifyProductUpdated } = useSocket(user?.id);

  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'warning' | 'expired'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleAddProduct = async (data: ProductFormData) => {
    const result = await createProduct(data);
    if (result.success && result.product) {
      toast({
        title: 'Berhasil',
        description: 'Produk berhasil ditambahkan',
      });
      refetchStats();
      // Send real-time notification
      notifyNewProduct(result.product);
    }
    return result;
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return { success: false, error: 'No product selected' };
    const result = await updateProduct(editingProduct.id, data);
    if (result.success && result.product) {
      toast({
        title: 'Berhasil',
        description: 'Produk berhasil diperbarui',
      });
      refetchStats();
      // Send real-time notification if product status changed
      if (result.product.status !== editingProduct.status) {
        notifyProductUpdated(result.product);
      }
    }
    return result;
  };

  const handleDeleteProduct = async (id: string) => {
    const result = await deleteProduct(id);
    if (result.success) {
      toast({
        title: 'Berhasil',
        description: 'Produk berhasil dihapus',
      });
      refetchStats();
    } else {
      toast({
        title: 'Gagal',
        description: result.error || 'Gagal menghapus produk',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSendNotification = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type: product.status === 'warning' ? 'warning' : 'expired',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Notifikasi Terkirim',
          description: result.message || 'Notifikasi WhatsApp berhasil dikirim',
        });
      } else {
        throw new Error(result.error || 'Gagal mengirim notifikasi');
      }
    } catch (err) {
      toast({
        title: 'Gagal',
        description: err instanceof Error ? err.message : 'Gagal mengirim notifikasi',
        variant: 'destructive',
      });
    }
  };

  const handleCheckNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/check', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Notifikasi Diperiksa',
          description: `${result.warningSent} notifikasi warning dan ${result.expiredSent} notifikasi expired dikirim`,
        });
        if (result.errors && result.errors.length > 0) {
          console.error('Notification errors:', result.errors);
        }
      } else {
        throw new Error(result.error || 'Gagal memeriksa notifikasi');
      }
    } catch (err) {
      toast({
        title: 'Gagal',
        description: err instanceof Error ? err.message : 'Gagal memeriksa notifikasi',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logout Berhasil',
      description: 'Anda telah keluar dari sistem',
    });
  };

  const handleSubmit = editingProduct ? handleUpdateProduct : handleAddProduct;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">Sistem RH</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Retur Harian H-14</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Connection Status - Icon only on mobile */}
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                {connected ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Wifi className="h-4 w-4" />
                    <span className="hidden sm:inline">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <WifiOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>

              {/* User info - hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium truncate max-w-[100px]">{user?.username}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-2 sm:h-9 sm:px-4"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Statistics */}
        {!statsLoading && statistics && (
          <StatisticsCards statistics={statistics} />
        )}

        {/* Warning Alerts */}
        {statistics && (statistics.summary.warning.count > 0 || statistics.summary.expired.count > 0) && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <div className="flex flex-col gap-2">
                <span>
                  <strong>Perhatian:</strong> Ada{' '}
                  {statistics.summary.warning.count} produk wajib retur dan{' '}
                  {statistics.summary.expired.count} produk sudah jatuh RH.
                </span>
                {statistics.summary.warning.count > 0 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-yellow-800 dark:text-yellow-200 underline justify-start"
                    onClick={handleCheckNotifications}
                  >
                    Kirim Notifikasi Sekarang
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => { setEditingProduct(null); setFormOpen(true); }}
              className="w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
            <Button
              variant="outline"
              onClick={handleCheckNotifications}
              className="w-full sm:w-auto"
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Cek Notifikasi
            </Button>
            <Button
              variant="outline"
              onClick={() => { refetch(); refetchStats(); }}
              className="w-full sm:w-auto"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-muted-foreground flex items-center">Filter:</span>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="safe">Aman</SelectItem>
                <SelectItem value="warning">Wajib Retur</SelectItem>
                <SelectItem value="expired">Jatuh RH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-lg border bg-card p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Daftar Produk</h2>
          <ProductsTable
            products={filteredProducts}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onSendNotification={handleSendNotification}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sistem RH Kadaluarsa. Semua hak dilindungi.</p>
        </div>
      </footer>

      {/* Product Form Dialog */}
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
      />

      {/* Real-time Notification Toast */}
      <NotificationToast userId={user?.id} />
    </div>
  );
}
