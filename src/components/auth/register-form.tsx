'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, UserPlus, Package } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
  onToggleMode?: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const validateWhatsApp = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const pattern = /^(62|0)8[1-9][0-9]{6,10}$/;
    return pattern.test(cleaned);
  };

  const formatWhatsApp = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.whatsapp || !formData.password) {
      setError('Username, WhatsApp, dan password wajib diisi');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (!validateWhatsApp(formData.whatsapp)) {
      setError('Nomor WhatsApp tidak valid');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email || undefined,
        whatsapp: formatWhatsApp(formData.whatsapp),
        password: formData.password,
      });

      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Pendaftaran gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  return (
    <Card className="w-full max-w-md shadow-lg mx-4">
      <CardHeader className="space-y-2 sm:space-y-3 text-center px-6 py-4 sm:py-6">
        <div className="flex justify-center">
          <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full">
            <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold">Daftar Akun Baru</CardTitle>
        <CardDescription className="text-sm sm:text-base">Bergabung untuk mengelola retur harian produk</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm">Username *</Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email (Opsional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm">Nomor WhatsApp *</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="081234567890"
              value={formData.whatsapp}
              onChange={handleChange}
              disabled={loading}
              required
              className="h-10 sm:h-11"
            />
            <p className="text-xs text-muted-foreground">
              Digunakan untuk notifikasi RH otomatis
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              minLength={6}
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm">Konfirmasi Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
              className="h-10 sm:h-11"
            />
          </div>

          <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Mendaftar...
              </>
            ) : (
              'Daftar'
            )}
          </Button>
        </form>
      </CardContent>
      {onToggleMode && (
        <CardFooter className="flex justify-center pb-6 sm:pb-6">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline font-medium"
            >
              Masuk sekarang
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
