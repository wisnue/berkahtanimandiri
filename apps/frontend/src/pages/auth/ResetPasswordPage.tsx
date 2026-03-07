import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const token = new URLSearchParams(search).get('token') || '';

  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Link reset password tidak valid. Silakan minta link baru.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (password !== konfirmasi) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => setLocation('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal mereset password. Silakan minta link baru.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-primary-600 rounded-xl mb-3">
            <span className="text-white text-2xl">🌳</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-secondary-900">
            KTH Berkah Tani Mandiri
          </h1>
          <p className="text-secondary-600 mt-1 text-sm">
            Sistem Informasi Administrasi KTH
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buat Password Baru</CardTitle>
            <CardDescription>
              {success
                ? 'Password berhasil diubah'
                : 'Masukkan password baru untuk akun Anda'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-green-800 text-sm font-medium">
                    Password berhasil diubah!
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    Anda akan diarahkan ke halaman login dalam beberapa detik...
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setLocation('/login')}
                >
                  Login Sekarang
                </Button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                    {error}
                  </div>
                )}

                {!token ? (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setLocation('/forgot-password')}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Minta link reset password baru
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      label="Password Baru"
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <Input
                      label="Konfirmasi Password Baru"
                      type="password"
                      placeholder="Ulangi password baru"
                      value={konfirmasi}
                      onChange={(e) => setKonfirmasi(e.target.value)}
                      required
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                    </Button>
                  </form>
                )}

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setLocation('/login')}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    ← Kembali ke Login
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-secondary-500 mt-6">
          © 2025 KTH Berkah Tani Mandiri. All rights reserved.
        </p>
      </div>
    </div>
  );
}
