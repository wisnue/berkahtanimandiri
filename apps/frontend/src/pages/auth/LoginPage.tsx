import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/app/AuthContext';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                {error}
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

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <p className="text-xs font-medium text-secondary-700 mb-3 text-center">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Admin Credentials */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 mb-1.5">Admin</p>
                  <p className="text-xs text-blue-700 font-mono">admin@kthbtm.com</p>
                  <p className="text-xs text-blue-700 font-mono">admin123</p>
                </div>
                
                {/* Petugas Credentials */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs font-semibold text-green-900 mb-1.5">Petugas</p>
                  <p className="text-xs text-green-700 font-mono">test@kthbtm.com</p>
                  <p className="text-xs text-green-700 font-mono">test123</p>
                </div>
              </div>
            </div>

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
