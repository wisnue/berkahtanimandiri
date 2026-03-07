import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
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
            <CardTitle>Lupa Password</CardTitle>
            <CardDescription>
              {submitted
                ? 'Permintaan berhasil dikirim'
                : 'Masukkan email Anda untuk menerima link reset password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
                  <div className="text-3xl mb-2">📧</div>
                  <p className="text-green-800 text-sm font-medium">
                    Jika email <strong>{email}</strong> terdaftar di sistem, link reset password telah dikirim.
                  </p>
                  <p className="text-green-700 text-xs mt-2">
                    Silakan cek inbox dan folder spam Anda. Link berlaku selama 1 jam.
                  </p>
                </div>
                <p className="text-xs text-secondary-500 text-center">
                  Tidak menerima email? Hubungi admin untuk bantuan.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setLocation('/login')}
                >
                  Kembali ke Halaman Login
                </Button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Masukkan email terdaftar Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}
                  </Button>
                </form>

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
