import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/app/AuthContext';
import { Shield, Lock, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { get2FAStatus } from '@/services/twoFactor';
import { changePassword } from '@/services/auth.service';
import TwoFactorSetupModal from '@/components/TwoFactorSetupModal';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { useEffect } from 'react';

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Password Expiry State
  const [passwordStatus, setPasswordStatus] = useState<{
    daysUntilExpiry: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    loadSecurityStatus();
  }, []);

  const loadSecurityStatus = async () => {
    try {
      // Load 2FA status
      const twoFAResponse = await get2FAStatus();
      if (twoFAResponse.success && twoFAResponse.data) {
        setTwoFactorEnabled(twoFAResponse.data.enabled);
        setBackupCodesRemaining(twoFAResponse.data.backupCodesRemaining);
      }

      // Load password status
      const passwordResponse = await fetch('/api/auth/password/status', {
        credentials: 'include',
      });
      if (passwordResponse.ok) {
        const data = await passwordResponse.json();
        if (data.success) {
          setPasswordStatus(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading security status:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validate
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Semua field wajib diisi');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (!isPasswordValid) {
      setPasswordError('Password baru tidak memenuhi persyaratan');
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        showToast.success('Password berhasil diubah');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Reload password status
        loadSecurityStatus();
      } else {
        setPasswordError(response.message || 'Gagal mengubah password');
      }
    } catch (error: any) {
      setPasswordError(error.message || 'Terjadi kesalahan saat mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSetupComplete = () => {
    setShowTwoFactorSetup(false);
    loadSecurityStatus();
    showToast.success('Two-Factor Authentication berhasil diaktifkan');
  };

  const handleDisable2FA = async () => {
    if (!confirm('Yakin ingin menonaktifkan Two-Factor Authentication?')) {
      return;
    }

    const password = prompt('Masukkan password untuk konfirmasi:');
    if (!password) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        showToast.success('2FA berhasil dinonaktifkan');
        loadSecurityStatus();
      } else {
        showToast.error(data.message || 'Gagal menonaktifkan 2FA');
      }
    } catch (error) {
      showToast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout
      user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8" style={{ color: '#059669' }} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keamanan & Profil</h1>
            <p className="text-sm text-gray-600">
              Kelola pengaturan keamanan akun Anda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Informasi Profil
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Nama</p>
                <p className="font-medium text-gray-900">{user?.namaLengkap}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Password Expiry Warning */}
            {passwordStatus && passwordStatus.daysUntilExpiry <= 7 && !passwordStatus.isExpired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800">Password Akan Kedaluwarsa</p>
                  <p className="text-yellow-700">
                    Password Anda akan kedaluwarsa dalam {passwordStatus.daysUntilExpiry} hari.
                    Silakan ubah password Anda sekarang.
                  </p>
                </div>
              </div>
            )}

            {passwordStatus && passwordStatus.isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-800">Password Telah Kedaluwarsa</p>
                  <p className="text-red-700">
                    Password Anda telah kedaluwarsa. Anda harus mengubah password sekarang.
                  </p>
                </div>
              </div>
            )}

            {/* Two-Factor Authentication */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Key size={20} />
                Two-Factor Authentication (2FA)
              </h2>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">Status 2FA:</p>
                      {twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <CheckCircle size={14} />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          <AlertCircle size={14} />
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Tingkatkan keamanan akun dengan autentikasi dua faktor menggunakan aplikasi authenticator.
                    </p>
                    {twoFactorEnabled && (
                      <p className="text-sm text-gray-600 mt-2">
                        Backup codes tersisa: <span className="font-semibold">{backupCodesRemaining}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!twoFactorEnabled ? (
                    <Button
                      onClick={() => setShowTwoFactorSetup(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Aktifkan 2FA
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDisable2FA}
                      variant="outline"
                      isLoading={loading}
                    >
                      Nonaktifkan 2FA
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={20} />
                Ubah Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Lama
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Masukkan password lama"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Masukkan password baru"
                    required
                  />
                  {passwordForm.newPassword && (
                    <div className="mt-3">
                      <PasswordStrengthMeter
                        password={passwordForm.newPassword}
                        onValidationChange={setIsPasswordValid}
                        showRequirements={true}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Ketik ulang password baru"
                    required
                  />
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Password tidak cocok</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword ||
                      passwordForm.newPassword !== passwordForm.confirmPassword ||
                      !isPasswordValid
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Ubah Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
        onComplete={handleTwoFactorSetupComplete}
      />
    </MainLayout>
  );
}

export default ProfilePage;
