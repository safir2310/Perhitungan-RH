'use client';

import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  expirationDate: string;
  rhDate: string;
  quantity: number;
  rhDaysBefore: number;
  status: 'safe' | 'warning' | 'expired';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  expirationDate: string;
  quantity: number;
  rhDaysBefore?: number;
  rhDate?: string;
}

export interface Statistics {
  summary: {
    totalProducts: number;
    totalQuantity: number;
    safe: { count: number; quantity: number; percentage: number };
    warning: { count: number; quantity: number; percentage: number };
    expired: { count: number; quantity: number; percentage: number };
  };
  upcomingRH: Array<{
    id: string;
    name: string;
    quantity: number;
    rhDate: string;
    expirationDate: string;
  }>;
  expiredList: Array<{
    id: string;
    name: string;
    quantity: number;
    expirationDate: string;
  }>;
}

export function useProducts(status?: 'safe' | 'warning' | 'expired') {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = status ? `/api/products?status=${status}` : '/api/products';
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        const data = await response.json();
        setError(data.error || 'Gagal mengambil data produk');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [status]);

  const createProduct = async (data: ProductFormData) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchProducts();
        return { success: true, product: result.product };
      } else {
        return { success: false, error: result.error || 'Gagal menambahkan produk' };
      }
    } catch (err) {
      return { success: false, error: 'Terjadi kesalahan jaringan' };
    }
  };

  const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchProducts();
        return { success: true, product: result.product };
      } else {
        return { success: false, error: result.error || 'Gagal memperbarui produk' };
      }
    } catch (err) {
      return { success: false, error: 'Terjadi kesalahan jaringan' };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        await fetchProducts();
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Gagal menghapus produk' };
      }
    } catch (err) {
      return { success: false, error: 'Terjadi kesalahan jaringan' };
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useStatistics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products/statistics');

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        const data = await response.json();
        setError(data.error || 'Gagal mengambil data statistik');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
}
