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
import { Pencil, Trash2, Bell } from 'lucide-react';
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

  return (
    <div className="rounded-md border">
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
  );
}
