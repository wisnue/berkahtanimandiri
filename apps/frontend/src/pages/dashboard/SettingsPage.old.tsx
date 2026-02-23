import { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api } from '@/services/api';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'backup' | 'system'>('roles');
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
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: '2026-02-03 10:30:00', size: '2.5 MB', status: 'success', type: 'manual' },
    { id: 2, date: '2026-02-02 03:00:00', size: '2.4 MB', status: 'success', type: 'auto' },
    { id: 3, date: '2026-02-01 03:00:00', size: '2.4 MB', status: 'success', type: 'auto' },
  ]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('03:00');
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordExpiry: '90',
    enableEmailNotif: true,
    enableSMSNotif: false,
    maintenanceMode: false,
  });

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      const response = await api.post<{ backup: { filename: string; size: string; timestamp: string } }>('/api/settings/backup', {});
      if (response.success) {
        showToast.success('Backup database berhasil dibuat!');
        
        // Add to history
        const newBackup = {
          id: backupHistory.length + 1,
          date: new Date().toLocaleString('id-ID'),
          size: response.data.backup.size || '2.5 MB',
          status: 'success',
          type: 'manual'
        };
        setBackupHistory([newBackup, ...backupHistory]);
      }
    } catch (error: any) {
      showToast.error(error.message || 'Gagal membuat backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupId: number) => {
    try {
      // For file download, we need to use fetch directly
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
      link.setAttribute('download', `backup-${backupId}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast.success('Backup berhasil diunduh');
    } catch (error: any) {
      showToast.error('Gagal mengunduh backup');
    }
  };

  const handleRestoreBackup = async (file: File) => {
    if (!confirm('Restore database akan menimpa semua data yang ada. Lanjutkan?')) {
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('backup', file);
      
      // Use fetch for file upload
      const response = await fetch('/api/settings/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Restore failed');
      
      showToast.success('Database berhasil di-restore! Halaman akan di-refresh...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      showToast.error(error.message || 'Gagal restore database');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    try {
      const response = await api.put<{ settings: typeof systemSettings }>('/api/settings/system', systemSettings);
      if (response.success) {
        showToast.success('Pengaturan sistem berhasil disimpan');
      }
    } catch (error: any) {
      showToast.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
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
            Kelola pengaturan aplikasi, role user, dan backup database
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('roles')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'roles'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              User Roles
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'backup'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="inline-block w-4 h-4 mr-2" />
              Backup Database
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'system'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="inline-block w-4 h-4 mr-2" />
              Pengaturan Sistem
            </button>
          </div>
        </div>

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

        {/* Backup Database Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            {/* Backup Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#059669' }}
                  >
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Backup Manual</h3>
                    <p className="text-xs text-gray-600 mb-3">Buat backup database sekarang</p>
                    <button
                      onClick={handleBackupNow}
                      disabled={loading}
                      className="w-full px-3 py-1.5 text-white rounded-md text-sm transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#059669' }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
                      onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
                    >
                      {loading ? 'Memproses...' : 'Backup Sekarang'}
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Restore Database</h3>
                    <p className="text-xs text-gray-600 mb-3">Pulihkan dari file backup</p>
                    <label className="block">
                      <input
                        type="file"
                        accept=".sql,.zip"
                        onChange={(e) => e.target.files?.[0] && handleRestoreBackup(e.target.files[0])}
                        className="hidden"
                        id="restore-file"
                      />
                      <span
                        className="block w-full px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm text-center hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Pilih File
                      </span>
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Auto Backup</h3>
                    <p className="text-xs text-gray-600 mb-3">Jadwal backup otomatis</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={autoBackup}
                        onChange={(e) => setAutoBackup(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <input
                        type="time"
                        value={backupSchedule}
                        onChange={(e) => setBackupSchedule(e.target.value)}
                        disabled={!autoBackup}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Backup History */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Riwayat Backup</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Tanggal</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Ukuran</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Tipe</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupHistory.map((backup) => (
                      <tr key={backup.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{backup.date}</td>
                        <td className="py-2 px-3">{backup.size}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            backup.type === 'auto' 
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {backup.type === 'auto' ? 'Otomatis' : 'Manual'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Success
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => handleDownloadBackup(backup.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md text-sm transition-colors"
                            style={{ backgroundColor: '#0284C7' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369A1'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284C7'}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Keamanan & Autentikasi</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (menit)
                    </label>
                    <input
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => setSystemSettings({...systemSettings, maxLoginAttempts: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Expiry (hari)
                    </label>
                    <input
                      type="number"
                      value={systemSettings.passwordExpiry}
                      onChange={(e) => setSystemSettings({...systemSettings, passwordExpiry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Notifikasi</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={systemSettings.enableEmailNotif}
                    onChange={(e) => setSystemSettings({...systemSettings, enableEmailNotif: e.target.checked})}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-600">Kirim notifikasi via email</p>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={systemSettings.enableSMSNotif}
                    onChange={(e) => setSystemSettings({...systemSettings, enableSMSNotif: e.target.checked})}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-900">SMS Notifications</p>
                    <p className="text-xs text-gray-600">Kirim notifikasi via SMS</p>
                  </div>
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Maintenance Mode</h3>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-sm text-gray-900">Enable Maintenance Mode</p>
                  <p className="text-xs text-gray-600">Nonaktifkan akses aplikasi untuk maintenance</p>
                </div>
              </label>
              {systemSettings.maintenanceMode && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Warning!</p>
                    <p>Mode maintenance akan menonaktifkan akses untuk semua user kecuali admin.</p>
                  </div>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSystemSettings}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md text-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#059669' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
              >
                <Save size={16} />
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default SettingsPage;
