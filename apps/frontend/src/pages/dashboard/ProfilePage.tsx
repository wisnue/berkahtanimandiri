import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/app/AuthContext';
import { api } from '@/services/api';
import { showToast } from '@/lib/toast';
import {
  User,
  Lock,
  Bell,
  Shield,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type TabType = 'profile' | 'password' | 'notifications' | 'security';

interface ProfileData {
  namaLengkap: string;
  email: string;
  noTelepon: string;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  loginAlerts: boolean;
  dataChangeAlerts: boolean;
  weeklyReport: boolean;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    namaLengkap: user?.namaLengkap || '',
    email: user?.email || '',
    noTelepon: '',
    role: user?.role || '',
    status: user?.status || '',
    emailVerified: user?.emailVerified || false,
    phoneVerified: user?.phoneVerified || false,
    twoFactorEnabled: user?.twoFactorEnabled || false,
    createdAt: user?.createdAt || '',
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailEnabled: true,
    pushEnabled: false,
    loginAlerts: true,
    dataChangeAlerts: true,
    weeklyReport: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: 'gray',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        namaLengkap: user.namaLengkap || '',
        email: user.email || '',
        noTelepon: user.noTelepon || '',
        role: user.role || '',
        status: user.status || '',
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        createdAt: user.createdAt || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (passwordData.newPassword) {
      checkPasswordStrength(passwordData.newPassword);
    } else {
      setPasswordStrength({ score: 0, feedback: '', color: 'gray' });
    }
  }, [passwordData.newPassword]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (password.length < 8) feedback.push('minimal 8 karakter');
    if (!/[a-z]/.test(password)) feedback.push('huruf kecil');
    if (!/[A-Z]/.test(password)) feedback.push('huruf besar');
    if (!/[0-9]/.test(password)) feedback.push('angka');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('karakter spesial');

    let color = 'red';
    if (score >= 5) {
      color = 'green';
    } else if (score >= 3) {
      color = 'yellow';
    }

    setPasswordStrength({
      score,
      feedback: feedback.length > 0 ? `Tambahkan: ${feedback.join(', ')}` : 'Password kuat!',
      color,
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', {
        namaLengkap: profileData.namaLengkap,
        noTelepon: profileData.noTelepon,
      });

      if (response.success) {
        showToast.success('Profil berhasil diperbarui');
        await refreshUser();
      }
    } catch (error: any) {
      showToast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast.error('Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        showToast.success('Password berhasil diubah');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error: any) {
      showToast.error(error.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast.success('Pengaturan notifikasi disimpan');
    } catch (error) {
      showToast.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };


  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      ketua: 'bg-blue-100 text-blue-800',
      sekretaris: 'bg-green-100 text-green-800',
      bendahara: 'bg-yellow-100 text-yellow-800',
      anggota: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.anggota;
  };

  const tabs = [
    { id: 'profile', name: 'Profil Saya', icon: User },
    { id: 'password', name: 'Ubah Password', icon: Lock },
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'security', name: 'Keamanan', icon: Shield },
  ];

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Pengaturan Akun</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola profil dan preferensi akun Anda</p>
        </div>

        {/* Profile Summary Card */}
        <Card className="p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {profileData.namaLengkap
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Camera size={16} />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{profileData.namaLengkap}</h2>
              <p className="text-emerald-100 mb-3">{profileData.email}</p>

              <div className="flex gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(profileData.role)}`}>
                  {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                </span>
                {profileData.emailVerified && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle size={14} />
                    Email Terverifikasi
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-emerald-100">Member sejak</p>
                  <p className="font-medium">
                    {profileData.createdAt
                      ? new Date(profileData.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-100">Status</p>
                  <p className="font-medium">{profileData.status || 'Aktif'}</p>
                </div>
                <div>
                  <p className="text-emerald-100">Two-Factor Auth</p>
                  <p className="font-medium">
                    {profileData.twoFactorEnabled ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={14} /> Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle size={14} /> Tidak Aktif
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={profileData.namaLengkap}
                    onChange={(e) => setProfileData({ ...profileData, namaLengkap: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    />
                    {profileData.emailVerified ? (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600" size={18} />
                    ) : (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-600" size={18} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email tidak dapat diubah. Hubungi admin untuk perubahan email.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={profileData.noTelepon}
                      onChange={(e) => setProfileData({ ...profileData, noTelepon: e.target.value })}
                      placeholder="08123456789"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Akun
                    </label>
                    <input
                      type="text"
                      value={profileData.status || 'Aktif'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ubah Password</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Lama *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${passwordStrength.color}-500 transition-all`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                          {passwordStrength.score >= 5 ? 'Kuat' : passwordStrength.score >= 3 ? 'Sedang' : 'Lemah'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{passwordStrength.feedback}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password Baru *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && (
                    <p className={`text-xs mt-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordData.newPassword === passwordData.confirmPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Syarat Password:</p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                    <li>Minimal 8 karakter</li>
                    <li>Mengandung huruf besar (A-Z)</li>
                    <li>Mengandung huruf kecil (a-z)</li>
                    <li>Mengandung angka (0-9)</li>
                    <li>Mengandung karakter spesial (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock size={18} />
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Preferensi Notifikasi</h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Terima notifikasi via email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailEnabled}
                    onChange={(e) => setNotifications({ ...notifications, emailEnabled: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Notifikasi real-time di browser</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.pushEnabled}
                    onChange={(e) => setNotifications({ ...notifications, pushEnabled: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Login Alerts</p>
                      <p className="text-sm text-gray-600">Notifikasi saat ada login baru ke akun Anda</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.loginAlerts}
                    onChange={(e) => setNotifications({ ...notifications, loginAlerts: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Data Change Alerts</p>
                      <p className="text-sm text-gray-600">Notifikasi saat ada perubahan data penting</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.dataChangeAlerts}
                    onChange={(e) => setNotifications({ ...notifications, dataChangeAlerts: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Weekly Report</p>
                      <p className="text-sm text-gray-600">Laporan mingguan aktivitas organisasi</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReport}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Menyimpan...' : 'Simpan Preferensi'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Keamanan Akun</h3>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Tambahan keamanan dengan kode verifikasi</p>
                      </div>
                    </div>
                    {profileData.twoFactorEnabled ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Tidak Aktif
                      </span>
                    )}
                  </div>
                  <button className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    {profileData.twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA'}
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email Verification</p>
                      <p className="text-sm text-gray-600">Email Anda telah diverifikasi</p>
                    </div>
                  </div>
                  {!profileData.emailVerified && (
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Kirim Email Verifikasi
                    </button>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 mb-1">Password Expiry</p>
                      <p className="text-sm text-yellow-800">
                        Password akan kadaluarsa dalam 67 hari. Segera ubah password Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Aktivitas Login Terakhir</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="text-gray-600">Terakhir login:</p>
                      <p className="font-medium text-gray-900">
                        14 Februari 2026 pukul 23:07 WIB
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600">IP Address:</p>
                      <p className="font-medium text-gray-900">192.168.1.100</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600">Browser:</p>
                      <p className="font-medium text-gray-900">Chrome 121 on Windows</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
