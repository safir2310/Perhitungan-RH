'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onToggleMode?: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg mx-4">
      <CardHeader className="space-y-2 sm:space-y-3 text-center px-6 py-4 sm:py-6">
        <div className="flex justify-center">
          <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full">
            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold">Sistem RH Kadaluarsa</CardTitle>
        <CardDescription className="text-sm sm:text-base">Masuk untuk mengelola retur harian produk</CardDescription>
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
            <Label htmlFor="username" className="text-sm">Username / Email</Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username atau email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              className="h-10 sm:h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="h-10 sm:h-11"
            />
          </div>

          <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </CardContent>
      {onToggleMode && (
        <CardFooter className="flex justify-center pb-6 sm:pb-6">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline font-medium"
            >
              Daftar sekarang
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
