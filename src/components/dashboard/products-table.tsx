'use client';

import { Product } from '@/hooks/use-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, getStatusInfo } from '@/lib/rh-helper';
import { Pencil, Trash2, Bell, Calendar, Package as PackageIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  onSendNotification?: (productId: string) => Promise<void>;
  loading?: boolean;
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  onSendNotification,
  loading = false,
}: ProductsTableProps) {
  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  // Card layout for mobile
  const ProductCard = ({ product }: { product: Product }) => {
    const statusInfo = getStatusInfo(product.status);
    return (
      <Card
        className={`${
          product.status === 'expired'
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            : product.status === 'warning'
            ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`${statusInfo.bgClass} ${statusInfo.textClass} border-0 text-xs`}
                >
                  {statusInfo.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {product.quantity} item
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground text-xs block">Kadaluarsa</span>
                <span className="font-medium truncate block">
                  {formatDate(new Date(product.expirationDate))}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground text-xs block">Tanggal RH</span>
                <span className="font-medium truncate block">
                  {formatDate(new Date(product.rhDate))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t pt-3">
            {onSendNotification && (product.status === 'warning' || product.status === 'expired') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendNotification(product.id)}
                className="flex-1 h-9 text-xs"
              >
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                Kirim WA
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="flex-1 h-9 text-xs"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus produk &quot;{product.name}&quot;?
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground px-4">
            <PackageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada data produk</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="text-center">Jumlah</TableHead>
              <TableHead>Tgl Kadaluarsa</TableHead>
              <TableHead>Tgl RH</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada data produk
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const statusInfo = getStatusInfo(product.status);
                return (
                  <TableRow
                    key={product.id}
                    className={
                      product.status === 'expired'
                        ? 'bg-red-50 dark:bg-red-950/20'
                        : product.status === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-950/20'
                        : ''
                    }
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-center">{product.quantity} item</TableCell>
                    <TableCell>{formatDate(new Date(product.expirationDate))}</TableCell>
                    <TableCell>{formatDate(new Date(product.rhDate))}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${statusInfo.bgClass} ${statusInfo.textClass} border-0`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onSendNotification && (product.status === 'warning' || product.status === 'expired') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSendNotification(product.id)}
                            title="Kirim Notifikasi WhatsApp"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus produk &quot;{product.name}&quot;?
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
