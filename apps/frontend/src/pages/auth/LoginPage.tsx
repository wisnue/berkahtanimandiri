import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/app/AuthContext';
import { AlertTriangle, WifiOff } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isConnectionError = error.includes('server') || error.includes('terhubung') || error.includes('jaringan');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
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

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Masuk ke Sistem</CardTitle>
            <CardDescription>
              Masukkan username dan password Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className={`mb-3 p-3 rounded-md border text-sm ${
                isConnectionError
                  ? 'bg-orange-50 border-orange-200 text-orange-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-start gap-2">
                  {isConnectionError
                    ? <WifiOff className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  }
                  <div>
                    <p className="font-medium">{error}</p>
                    {isConnectionError && (
                      <p className="text-xs mt-1 opacity-80">
                        Server sedang tidak dapat dijangkau. Pastikan koneksi internet Anda aktif dan coba lagi dalam beberapa menit.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                  />
                  <span className="text-secondary-700">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => setLocation('/forgot-password')}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Lupa password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-secondary-600">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setLocation('/register')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Daftar sekarang
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-secondary-500 mt-6">
          © 2025 KTH Berkah Tani Mandiri. All rights reserved.
        </p>
      </div>
    </div>
  );
}
