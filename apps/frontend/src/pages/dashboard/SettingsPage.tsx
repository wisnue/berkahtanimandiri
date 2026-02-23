import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/app/AuthContext';
import { 
  Settings, 
  Users, 
  Database, 
  Shield, 
  Download,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  FileText,
  Activity,
  Trash2,
  RefreshCw,
  HardDrive,
  Calendar,
  Eye
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api } from '@/services/api';

type TabType = 'roles' | 'backup' | 'system' | 'organization' | 'audit' | 'health' | 'compliance';

interface BackupItem {
  id: number;
  filename: string;
  createdAt: string;
  fileSize: number;
  backupType: string;
  status: string;
}

interface AuditLogItem {
  id: number;
  settingCategory: string;
  settingKey: string | null;
  oldValue: string | null;
  newValue: string | null;
  changeType: string;
  changedBy: number;
  createdAt: string;
}

interface OrganizationSettings {
  organizationName: string;
  organizationShortName: string;
  organizationAddress: string;
  organizationPhone: string;
  organizationEmail: string;
  organizationWebsite: string;
  headName: string;
  headPosition: string;
  secretaryName: string;
  treasurerName: string;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [loading, setLoading] = useState(false);
  
  // User Roles State
  const roles = [
    { id: 1, name: 'Admin', permissions: ['all'], users: 1, color: 'red' },
    { id: 2, name: 'Ketua', permissions: ['view', 'create', 'edit', 'verify'], users: 1, color: 'blue' },
    { id: 3, name: 'Sekretaris', permissions: ['view', 'create', 'edit'], users: 2, color: 'green' },
    { id: 4, name: 'Bendahara', permissions: ['view', 'create', 'edit'], users: 1, color: 'yellow' },
    { id: 5, name: 'Anggota', permissions: ['view'], users: 25, color: 'gray' },
  ];
  
  // Backup State
  const [backupHistory, setBackupHistory] = useState<BackupItem[]>([]);
  const [backupStats, setBackupStats] = useState({
    totalBackups: 0,
    successfulBackups: 0,
    failedBackups: 0,
    totalSize: 0,
    latestBackup: null as string | null,
  });
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('03:00');
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState<any>({});
  
  // Organization Settings State
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    organizationName: 'Kelompok Tani Hutan Bina Taruna Mandiri',
    organizationShortName: 'KTH BTM',
    organizationAddress: '',
    organizationPhone: '',
    organizationEmail: '',
    organizationWebsite: '',
    headName: '',
    headPosition: 'Ketua',
    secretaryName: '',
    treasurerName: '',
  });

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);

  // Load data on mount
  useEffect(() => {
    if (user?.role === 'admin') {
      loadSystemSettings();
      loadOrganizationSettings();
      loadBackupHistory();
      loadBackupStatistics();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'audit' && user?.role === 'admin') {
      loadAuditLogs();
    }
  }, [activeTab, auditPage, user]);

  const loadSystemSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: any }>('/settings/system');
      if (response.success && response.data.data) {
        setSystemSettings(response.data.data);
      } else {
        showToast.error('Gagal memuat pengaturan sistem');
        console.error('Invalid response:', response);
      }
    } catch (error: any) {
      console.error('Failed to load system settings:', error);
      showToast.error(error.response?.data?.message || error.message || 'Gagal memuat pengaturan sistem');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ data: OrganizationSettings }>('/settings/organization');
      if (response.success && response.data.data) {
        setOrgSettings(response.data.data);
      } else {
        showToast.error('Gagal memuat informasi organisasi');
        console.error('Invalid response:', response);
      }
    } catch (error: any) {
      console.error('Failed to load organization settings:', error);
      showToast.error(error.response?.data?.message || error.message || 'Gagal memuat informasi organisasi');
    } finally {
      setLoading(false);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const response = await api.get<{ data: { backups: BackupItem[] } }>('/settings/backup/history?limit=20');
      if (response.success) {
        setBackupHistory(response.data.data.backups);
      }
    } catch (error) {
      console.error('Failed to load backup history:', error);
    }
  };

  const loadBackupStatistics = async () => {
    try {
      const response = await api.get<{ data: typeof backupStats }>('/settings/backup/statistics');
      if (response.success) {
        setBackupStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load backup statistics:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await api.get<{ data: { logs: AuditLogItem[]; total: number } }>(
        `/settings/audit-log?limit=20&offset=${(auditPage - 1) * 20}`
      );
      if (response.success) {
        setAuditLogs(response.data.data.logs);
        setAuditTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      const response = await api.post('/settings/backup', {});
      if (response.success) {
        showToast.success('Backup database berhasil dibuat!');
        await loadBackupHistory();
        await loadBackupStatistics();
      }
    } catch (error: any) {
      showToast.error(error.message || 'Gagal membuat backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupId: number, filename: string) => {
    try {
      const response = await fetch(`/api/settings/backup/${backupId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast.success('Backup berhasil diunduh');
    } catch (error: any) {
      showToast.error('Gagal mengunduh backup');
    }
  };

  const handleDeleteBackup = async (backupId: number) => {
    if (!confirm('Yakin ingin menghapus backup ini?')) return;

    try {
      const response = await api.delete(`/settings/backup/${backupId}`);
      if (response.success) {
        showToast.success('Backup berhasil dihapus');
        await loadBackupHistory();
        await loadBackupStatistics();
      }
    } catch (error: any) {
      showToast.error('Gagal menghapus backup');
    }
  };

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    try {
      // Convert grouped settings to flat key-value pairs
      const flatSettings: any = {};
      Object.values(systemSettings).forEach((category: any) => {
        Object.entries(category).forEach(([key, setting]: [string, any]) => {
          flatSettings[key] = setting.value;
        });
      });

      const response = await api.put('/settings/system', flatSettings);
      if (response.success) {
        showToast.success('Pengaturan sistem berhasil disimpan');
        await loadSystemSettings();
      }
    } catch (error: any) {
      showToast.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrgSettings = async () => {
    console.log('💾 Saving organization settings:', orgSettings);
    setLoading(true);
    try {
      const response = await api.put('/settings/organization', orgSettings);
      console.log('📡 Response:', response);
      
      if (response.success) {
        showToast.success('✅ Pengaturan organisasi berhasil disimpan');
        await loadOrganizationSettings(); // Reload to show updated data
      } else {
        showToast.error(response.message || 'Gagal menyimpan pengaturan organisasi');
      }
    } catch (error: any) {
      console.error('❌ Save error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Gagal menyimpan pengaturan organisasi';
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCleanup = async () => {
    if (!confirm('Jalankan cleanup untuk menghapus backup lama?')) return;

    setLoading(true);
    try {
      const response = await api.post<{ data: { deletedCount: number } }>('/settings/backup/cleanup', {});
      if (response.success) {
        showToast.success(`Cleanup selesai: ${response.data.data.deletedCount} backup lama dihapus`);
        await loadBackupHistory();
        await loadBackupStatistics();
      }
    } catch (error: any) {
      showToast.error('Gagal menjalankan cleanup');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (user?.role !== 'admin') {
    return (
      <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Hanya Admin yang dapat mengakses halaman pengaturan</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-display font-bold text-secondary-900">
            Pengaturan Sistem
          </h1>
          <p className="text-secondary-600 text-sm mt-0.5">
            Kelola seluruh konfigurasi aplikasi, backup data, dan monitoring sistem
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            <button
              onClick={() => setActiveTab('system')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'system'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="inline-block w-4 h-4 mr-2" />
              Pengaturan Sistem
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'organization'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="inline-block w-4 h-4 mr-2" />
              Info Organisasi
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'backup'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="inline-block w-4 h-4 mr-2" />
              Backup Database
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              User Roles
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="inline-block w-4 h-4 mr-2" />
              Audit Log
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'compliance'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="inline-block w-4 h-4 mr-2" />
              Compliance
            </button>
          </div>
        </div>

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            {Object.keys(systemSettings).length === 0 ? (
              <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat pengaturan sistem...</p>
              </Card>
            ) : (
              <>
            {systemSettings.general && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Pengaturan Umum</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Aplikasi
                    </label>
                    <input
                      type="text"
                      value={systemSettings.general.app_name?.value || ''}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        general: {
                          ...systemSettings.general,
                          app_name: { ...systemSettings.general.app_name, value: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Versi Aplikasi
                    </label>
                    <input
                      type="text"
                      value={systemSettings.general.app_version?.value || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    />
                  </div>
                </div>
              </Card>
            )}

            {systemSettings.security && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Keamanan & Autentikasi</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (detik)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.security.session_timeout?.value || ''}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          security: {
                            ...systemSettings.security,
                            session_timeout: { ...systemSettings.security.session_timeout, value: parseInt(e.target.value) }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Default: 1800 (30 menit)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={systemSettings.security.max_login_attempts?.value || ''}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          security: {
                            ...systemSettings.security,
                            max_login_attempts: { ...systemSettings.security.max_login_attempts, value: parseInt(e.target.value) }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Expiry (hari)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.security.password_expiry_days?.value || ''}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          security: {
                            ...systemSettings.security,
                            password_expiry_days: { ...systemSettings.security.password_expiry_days, value: parseInt(e.target.value) }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Kebijakan Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.security.password_require_uppercase?.value || false}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            security: {
                              ...systemSettings.security,
                              password_require_uppercase: { ...systemSettings.security.password_require_uppercase, value: e.target.checked }
                            }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Wajib huruf besar</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.security.password_require_lowercase?.value || false}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            security: {
                              ...systemSettings.security,
                              password_require_lowercase: { ...systemSettings.security.password_require_lowercase, value: e.target.checked }
                            }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Wajib huruf kecil</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.security.password_require_number?.value || false}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            security: {
                              ...systemSettings.security,
                              password_require_number: { ...systemSettings.security.password_require_number, value: e.target.checked }
                            }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Wajib angka</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={systemSettings.security.password_require_special?.value || false}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            security: {
                              ...systemSettings.security,
                              password_require_special: { ...systemSettings.security.password_require_special, value: e.target.checked }
                            }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Wajib karakter spesial</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {systemSettings.notification && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Notifikasi</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={systemSettings.notification.notification_email_enabled?.value || false}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        notification: {
                          ...systemSettings.notification,
                          notification_email_enabled: { ...systemSettings.notification.notification_email_enabled, value: e.target.checked }
                        }
                      })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-600">Kirim notifikasi via email</p>
                    </div>
                  </label>
                </div>
              </Card>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveSystemSettings}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-md text-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#059669' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
              >
                <Save size={16} />
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
            </>
            )}
          </div>
        )}

        {/* Organization Settings Tab */}
        {activeTab === 'organization' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informasi Organisasi</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap Organisasi
                    </label>
                    <input
                      type="text"
                      value={orgSettings.organizationName}
                      onChange={(e) => setOrgSettings({...orgSettings, organizationName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Singkat
                    </label>
                    <input
                      type="text"
                      value={orgSettings.organizationShortName}
                      onChange={(e) => setOrgSettings({...orgSettings, organizationShortName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={orgSettings.organizationAddress}
                    onChange={(e) => setOrgSettings({...orgSettings, organizationAddress: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      value={orgSettings.organizationPhone}
                      onChange={(e) => setOrgSettings({...orgSettings, organizationPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={orgSettings.organizationEmail}
                      onChange={(e) => setOrgSettings({...orgSettings, organizationEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={orgSettings.organizationWebsite}
                      onChange={(e) => setOrgSettings({...orgSettings, organizationWebsite: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Struktur Kepengurusan</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Ketua
                    </label>
                    <input
                      type="text"
                      value={orgSettings.headName}
                      onChange={(e) => setOrgSettings({...orgSettings, headName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={orgSettings.headPosition}
                      onChange={(e) => setOrgSettings({...orgSettings, headPosition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Sekretaris
                    </label>
                    <input
                      type="text"
                      value={orgSettings.secretaryName}
                      onChange={(e) => setOrgSettings({...orgSettings, secretaryName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Bendahara
                    </label>
                    <input
                      type="text"
                      value={orgSettings.treasurerName}
                      onChange={(e) => setOrgSettings({...orgSettings, treasurerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveOrgSettings}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 hover:shadow-lg"
                style={{ backgroundColor: '#059669' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
              >
                <Save size={18} />
                {loading ? 'Menyimpan...' : 'Simpan Informasi'}
              </button>
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            {/* Backup Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Backups</p>
                    <p className="text-2xl font-bold text-gray-900">{backupStats.totalBackups}</p>
                  </div>
                  <Database className="w-8 h-8 text-emerald-600" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Berhasil</p>
                    <p className="text-2xl font-bold text-green-600">{backupStats.successfulBackups}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Gagal</p>
                    <p className="text-2xl font-bold text-red-600">{backupStats.failedBackups}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Ukuran</p>
                    <p className="text-2xl font-bold text-blue-600">{formatBytes(backupStats.totalSize)}</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
            </div>

            {/* Backup Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Kelola Backup</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleBackupNow}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-white rounded-md text-sm transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#059669' }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
                >
                  <Database size={16} />
                  {loading ? 'Membuat Backup...' : 'Backup Sekarang'}
                </button>
                <button
                  onClick={handleRunCleanup}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  Cleanup Backup Lama
                </button>
              </div>
              {backupStats.latestBackup && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    Backup terakhir: <span className="font-medium">{formatDate(backupStats.latestBackup)}</span>
                  </p>
                </div>
              )}
            </Card>

            {/* Backup History */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Riwayat Backup</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">File</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Tanggal</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Ukuran</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Tipe</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Belum ada backup
                        </td>
                      </tr>
                    ) : (
                      backupHistory.map((backup) => (
                        <tr key={backup.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 font-mono text-xs">{backup.filename}</td>
                          <td className="py-2 px-3">{formatDate(backup.createdAt)}</td>
                          <td className="py-2 px-3">{formatBytes(backup.fileSize)}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              backup.backupType === 'auto' 
                                ? 'bg-purple-100 text-purple-700'
                                : backup.backupType === 'scheduled'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {backup.backupType === 'auto' ? 'Otomatis' : backup.backupType === 'scheduled' ? 'Terjadwal' : 'Manual'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {backup.status === 'success' ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Success
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                                className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteBackup(backup.id)}
                                className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* User Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Manajemen Role & Permission</h2>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md text-sm transition-colors"
                style={{ backgroundColor: '#059669' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <Users size={16} />
                Tambah Role
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{role.users} pengguna</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full bg-${role.color}-500`}></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    {role.name !== 'Admin' && (
                      <button
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Permission Matrix */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Permission Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Role</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">View</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Create</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Edit</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Delete</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Verify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{role.name}</td>
                        <td className="text-center py-2 px-3">
                          {(role.permissions.includes('all') || role.permissions.includes('view')) && (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2 px-3">
                          {(role.permissions.includes('all') || role.permissions.includes('create')) && (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2 px-3">
                          {(role.permissions.includes('all') || role.permissions.includes('edit')) && (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2 px-3">
                          {role.permissions.includes('all') && (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2 px-3">
                          {(role.permissions.includes('all') || role.permissions.includes('verify')) && (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Audit Trail - Perubahan Pengaturan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Waktu</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Kategori</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Setting</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Tipe</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">User ID</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Belum ada audit log
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 text-xs">{formatDate(log.createdAt)}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {log.settingCategory}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-xs">{log.settingKey || '-'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              log.changeType === 'create' ? 'bg-green-100 text-green-700' :
                              log.changeType === 'update' ? 'bg-yellow-100 text-yellow-700' :
                              log.changeType === 'delete' ? 'bg-red-100 text-red-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {log.changeType}
                            </span>
                          </td>
                          <td className="py-2 px-3">{log.changedBy}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors mx-auto"
                              title="Lihat Detail"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {auditTotal > 20 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Menampilkan {((auditPage - 1) * 20) + 1} - {Math.min(auditPage * 20, auditTotal)} dari {auditTotal} log
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAuditPage(Math.max(1, auditPage - 1))}
                      disabled={auditPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setAuditPage(auditPage + 1)}
                      disabled={auditPage * 20 >= auditTotal}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Compliance Checklist Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            {/* Compliance Score Overview */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Compliance Score</h3>
                  <p className="text-gray-600 mt-1">Tingkat kesiapan audit sistem</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-600">87%</div>
                  <p className="text-sm text-gray-600">Good</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-emerald-600 h-3 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </Card>

            {/* Compliance Checklist */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-emerald-600" size={20} />
                Compliance Checklist
              </h3>
              
              <div className="space-y-6">
                {/* Audit Trail */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Audit Trail & Logging</h4>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Audit trail aktif dan berjalan</p>
                        <p className="text-xs text-gray-600">Semua perubahan data tercatat dengan before/after values</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ IP address & user agent tracking</p>
                        <p className="text-xs text-gray-600">Informasi akses tersimpan untuk investigasi</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Changed fields tracking</p>
                        <p className="text-xs text-gray-600">Field yang berubah tercatat detail</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Backup & Recovery */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Backup & Recovery</h4>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Backup otomatis berjalan</p>
                        <p className="text-xs text-gray-600">Setiap hari jam 03:00, retention 90 hari</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Manual backup tersedia</p>
                        <p className="text-xs text-gray-600">Admin dapat backup on-demand kapan saja</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">⚠️ Disaster recovery plan terdokumentasi</p>
                        <p className="text-xs text-amber-600">Perlu dibuat dokumentasi prosedur recovery</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Security */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Keamanan & Autentikasi</h4>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Password policy enforced</p>
                        <p className="text-xs text-gray-600">Min 8 karakter, huruf besar/kecil/angka/spesial</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Session timeout aktif</p>
                        <p className="text-xs text-gray-600">Auto logout setelah 30 menit tidak aktif</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Role-based access control</p>
                        <p className="text-xs text-gray-600">5 level user dengan permission berbeda</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">⚠️ Two-factor authentication (2FA)</p>
                        <p className="text-xs text-amber-600">Belum diimplementasi - planned untuk Q2</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Data Governance */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Data Governance</h4>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">⚠️ Data retention policy terdokumentasi</p>
                        <p className="text-xs text-amber-600">PerluPolicy tertulis berapa lama data disimpan</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ PNBP tracking lengkap</p>
                        <p className="text-xs text-gray-600">Semua transaksi PNBP tercatat dengan bukti</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Dokumen organisasi terarsip</p>
                        <p className="text-xs text-gray-600">SK, AD/ART, dan dokumen legal tersimpan sistematis</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Reporting */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pelaporan & Transparansi</h4>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" checked readOnly className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">✅ Export laporan tersedia</p>
                        <p className="text-xs text-gray-600">Semua data dapat di-export ke Excel/PDF</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">⚠️ Compliance report generator</p>
                        <p className="text-xs text-amber-600">Auto-generate laporan untuk auditor</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="checkbox" className="mt-1 rounded text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">⚠️ Email notification untuk admin</p>
                        <p className="text-xs text-amber-600">Alert untuk security events & backup failures</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="text-blue-600" size={20} />
                Rekomendasi Perbaikan
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <p className="text-gray-700">
                    <strong>Data Retention Policy:</strong> Buat dokumentasi tertulis tentang berapa lama setiap jenis data disimpan (PNBP: 10 tahun, Keuangan: 10 tahun, Audit Trail: Permanent)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <p className="text-gray-700">
                    <strong>Disaster Recovery Plan:</strong> Dokumentasikan prosedur pemulihan sistem jika terjadi bencana (step-by-step restore dari backup)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <p className="text-gray-700">
                    <strong>Email Notifications:</strong> Setup email alerts untuk admin ketika terjadi failed login, backup failure, atau data deletion
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <p className="text-gray-700">
                    <strong>2FA Implementation:</strong> Implementasi Two-Factor Authentication untuk layer keamanan tambahan (target Q2 2026)
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('backup')}
                  className="flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                >
                  <Database size={20} />
                  <span className="text-sm font-medium">Backup Now</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  <FileText size={20} />
                  <span className="text-sm font-medium">View Audit Log</span>
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                  onClick={() => showToast.info('Feature coming soon!')}
                >
                  <Download size={20} />
                  <span className="text-sm font-medium">Export Report</span>
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default SettingsPage;
