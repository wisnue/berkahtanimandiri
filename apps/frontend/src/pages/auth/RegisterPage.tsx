import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { authService } from '@/services/auth.service';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    namaLengkap: '',
    email: '',
    noTelepon: '',
    password: '',
    konfirmasiPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.konfirmasiPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        namaLengkap: form.namaLengkap,
        email: form.email,
        noTelepon: form.noTelepon || undefined,
        password: form.password,
      });
      setSuccess('Registrasi berhasil! Silakan login dengan akun Anda.');
      setTimeout(() => setLocation('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
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
            <CardTitle>Daftar Akun Baru</CardTitle>
            <CardDescription>
              Isi data diri Anda untuk membuat akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-md text-green-700 text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Nama Lengkap"
                type="text"
                name="namaLengkap"
                placeholder="Masukkan nama lengkap Anda"
                value={form.namaLengkap}
                onChange={handleChange}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="contoh@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Nomor Telepon (opsional)"
                type="tel"
                name="noTelepon"
                placeholder="08xxxxxxxxxx"
                value={form.noTelepon}
                onChange={handleChange}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={handleChange}
                required
              />

              <Input
                label="Konfirmasi Password"
                type="password"
                name="konfirmasiPassword"
                placeholder="Ulangi password Anda"
                value={form.konfirmasiPassword}
                onChange={handleChange}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-secondary-600">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setLocation('/login')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-secondary-500 mt-6">
          © 2025 KTH Berkah Tani Mandiri. All rights reserved.
        </p>
      </div>
    </div>
  );
}
