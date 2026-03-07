import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Download, Filter, Search, Calendar, User, Database, Eye } from 'lucide-react';
import { FilterDrawer, FilterField, FilterSelect, FilterInput, FilterDivider } from '@/components/ui/FilterDrawer';
import auditTrailService, { type AuditTrailEntry, type GetAuditTrailParams } from '@/services/auditTrail.service';
import AuditTrailDetailModal from '@/components/AuditTrailDetailModal';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/app/AuthContext';

export default function AuditTrailPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<GetAuditTrailParams>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await auditTrailService.getAll(filters);
      if (res.success) {
        const data = res.data as any;
        setEntries((data.entries || data) as AuditTrailEntry[]);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Load audit trail error:', error);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const blob = await auditTrailService.exportToCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-trail-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data');
    }
  };

  const handleResetFilter = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VERIFY': return 'bg-purple-100 text-purple-800';
      case 'APPROVE': return 'bg-emerald-100 text-emerald-800';
      case 'REJECT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const names: Record<string, string> = {
      'anggota': 'Anggota',
      'lahan_khdpk': 'Lahan KHDPK',
      'kegiatan': 'Kegiatan',
      'aset': 'Aset',
      'keuangan': 'Keuangan',
      'pnbp': 'PNBP',
      'dokumen': 'Dokumen',
      'dokumen_organisasi': 'Dokumen Organisasi',
    };
    return names[tableName] || tableName;
  };

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              Audit Trail
            </h1>
            <p className="text-sm text-gray-600 mt-1">Riwayat aktivitas sistem untuk audit compliance</p>
          </div>
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
            {(filters.tableName || filters.action || filters.startDate || filters.endDate || filters.ipAddress) && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                {[filters.tableName, filters.action, filters.startDate, filters.endDate, filters.ipAddress].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onReset={handleResetFilter}
          title="Filter Audit Trail"
        >
          <FilterField label="Pencarian">
            <FilterInput
              type="search"
              placeholder="Cari berdasarkan deskripsi atau user..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined, page: 1 })}
            />
          </FilterField>
          <FilterDivider label="Kriteria" />

          <FilterField label="Tabel / Entity">
            <FilterSelect
              value={filters.tableName || ''}
              onChange={(e) => setFilters({ ...filters, tableName: e.target.value || undefined, page: 1 })}
              options={[
                { value: 'anggota', label: 'Anggota' },
                { value: 'lahan_khdpk', label: 'Lahan KHDPK' },
                { value: 'kegiatan', label: 'Kegiatan' },
                { value: 'aset', label: 'Aset' },
                { value: 'keuangan', label: 'Keuangan' },
                { value: 'pnbp', label: 'PNBP' },
                { value: 'dokumen', label: 'Dokumen' },
                { value: 'dokumen_organisasi', label: 'Dokumen Organisasi' },
              ]}
              placeholder="Semua Tabel"
            />
          </FilterField>

          <FilterField label="Aksi">
            <FilterSelect
              value={filters.action || ''}
              onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined, page: 1 })}
              options={[
                { value: 'CREATE', label: 'CREATE' },
                { value: 'UPDATE', label: 'UPDATE' },
                { value: 'DELETE', label: 'DELETE' },
                { value: 'VERIFY', label: 'VERIFY' },
                { value: 'APPROVE', label: 'APPROVE' },
                { value: 'REJECT', label: 'REJECT' },
              ]}
              placeholder="Semua Aksi"
            />
          </FilterField>

          <FilterDivider label="Periode" />

          <FilterField label="Tanggal Mulai">
            <FilterInput
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
            />
          </FilterField>

          <FilterField label="Tanggal Akhir">
            <FilterInput
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
            />
          </FilterField>

          <FilterDivider label="Lanjutan" />

          <FilterField label="IP Address">
            <FilterInput
              type="text"
              placeholder="Contoh: 192.168.1.1"
              value={filters.ipAddress || ''}
              onChange={(e) => setFilters({ ...filters, ipAddress: e.target.value || undefined, page: 1 })}
            />
          </FilterField>
        </FilterDrawer>

        {/* Audit Log Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tabel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        Tidak ada data audit trail
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(entry.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900">
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-gray-400" />
                            {entry.userName || entry.userId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Database size={14} className="text-gray-400" />
                            {getTableDisplayName(entry.tableName)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(entry.action)}`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {entry.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {entry.ipAddress || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              setShowDetailModal(true);
                            }}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <Eye size={16} />
                            Lihat
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && entries.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Halaman {filters.page} dari {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={filters.page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <AuditTrailDetailModal
        entry={selectedEntry}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEntry(null);
        }}
      />
    </MainLayout>
  );
}
