import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Download, MapPin, FileText, Edit, Trash2, TrendingUp, Filter } from 'lucide-react';
import { FilterDrawer, FilterField, FilterSelect, FilterInput, FilterDivider } from '@/components/ui/FilterDrawer';
import { lahanService, type LahanKhdpk, type LahanStatistics } from '@/services/lahan.service';
import { authService, type User } from '@/services/auth.service';
import { LahanFormModal } from '@/components/lahan/LahanFormModal';
import { LahanDeleteModal } from '@/components/lahan/LahanDeleteModal';
import { exportToExcel, formatDate } from '@/lib/export';
import { MobileCardsList, StatusBadge } from '@/components/ui/MobileCard';
import { Pagination } from '@/components/ui/Pagination';

export default function LahanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [lahan, setLahan] = useState<LahanKhdpk[]>([]);
  const [statistics, setStatistics] = useState<LahanStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jenisTanamanFilter, setJenisTanamanFilter] = useState('');
  const [tahunTanamFilter, setTahunTanamFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLahan, setSelectedLahan] = useState<LahanKhdpk | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadUser();
    loadData();
    loadStatistics();
  }, [currentPage, searchTerm, statusFilter, jenisTanamanFilter, tahunTanamFilter]);

  const loadUser = async () => {
    const response = await authService.getCurrentUser();
    if (response.success) {
      setUser(response.data);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const response = await lahanService.getAll({
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      statusLegalitas: statusFilter || undefined,
      jenisTanaman: jenisTanamanFilter || undefined,
      tahunTanam: tahunTanamFilter ? parseInt(tahunTanamFilter) : undefined,
    });
    
    if (response.success) {
      setLahan(response.data);
      setTotalPages(Math.ceil((response.data.length || 0) / 10));
    }
    setLoading(false);
  };

  const loadStatistics = async () => {
    const response = await lahanService.getStatistics();
    if (response.success) {
      setStatistics(response.data);
    }
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedLahan(null);
    setShowFormModal(true);
  };

  const handleEdit = (item: LahanKhdpk) => {
    setFormMode('edit');
    setSelectedLahan(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: LahanKhdpk) => {
    setSelectedLahan(item);
    setShowDeleteModal(true);
  };

  const handleExportExcel = () => {
    const exportData = lahan.map((item) => ({
      kodeLahan: item.kodeLahan,
      nomorPetak: item.nomorPetak,
      anggotaNama: item.anggotaNama || '-',
      luasLahan: `${item.luasLahan} m²`,
      jenisTanaman: item.jenisTanaman || '-',
      tahunTanam: item.tahunTanam?.toString() || '-',
      statusLahan: item.statusLahan,
      koordinat: item.koordinat || '-',
      keterangan: item.keterangan || '-',
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Kode Lahan', key: 'kodeLahan', width: 18 },
        { header: 'Nomor Petak', key: 'nomorPetak', width: 15 },
        { header: 'Anggota', key: 'anggotaNama', width: 25 },
        { header: 'Luas Lahan', key: 'luasLahan', width: 15 },
        { header: 'Jenis Tanaman', key: 'jenisTanaman', width: 20 },
        { header: 'Tahun Tanam', key: 'tahunTanam', width: 12 },
        { header: 'Status', key: 'statusLahan', width: 15 },
        { header: 'Koordinat', key: 'koordinat', width: 25 },
        { header: 'Keterangan', key: 'keterangan', width: 30 },
      ],
      'Data_Lahan_KHDPK'
    );
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setStatusFilter('');
    setJenisTanamanFilter('');
    setTahunTanamFilter('');
    setCurrentPage(1);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    loadData();
    loadStatistics();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedLahan(null);
    loadData();
    loadStatistics();
  };

  // Mock data - will be replaced with real API
  const getStatusBadge = (status: string) => {
    const styles = {
      sah: 'bg-green-100 text-green-800 border-green-200',
      proses: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ditolak: 'bg-red-100 text-red-800 border-red-200',
    };
    const labels = {
      sah: 'Sah',
      proses: 'Proses',
      ditolak: 'Ditolak',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getKondisiBadge = (kondisi?: string) => {
    if (!kondisi) return null;
    const styles = {
      'baik': 'bg-green-100 text-green-800',
      'sedang': 'bg-yellow-100 text-yellow-800',
      'buruk': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[kondisi.toLowerCase() as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {kondisi}
      </span>
    );
  };

  if (!user) return <div>Loading...</div>;

  const userInfo = {
    fullName: user.namaLengkap,
    role: user.role,
  };

  const stats = statistics ? [
    {
      title: 'Total Lahan',
      value: statistics.total.toString(),
      subtitle: 'Petak lahan',
      icon: MapPin,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Luas',
      value: `${statistics.totalLuas} Ha`,
      subtitle: 'Hektar',
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      title: 'Status Sah',
      value: statistics.statusSah.toString(),
      subtitle: 'SK KHDPK',
      icon: FileText,
      color: 'bg-primary-500',
    },
    {
      title: 'Dalam Proses',
      value: statistics.statusProses.toString(),
      subtitle: 'Menunggu SK',
      icon: FileText,
      color: 'bg-yellow-500',
    },
  ] : [];

  return (
    <MainLayout user={userInfo}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-display font-bold text-secondary-900">
              Lahan KHDPK
            </h1>
            <p className="text-sm text-secondary-600 mt-0.5">
              Manajemen data lahan Kesatuan Hidrologis Dampak Penting Kawasan
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md text-xs transition-colors"
              style={{ backgroundColor: '#0284C7' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369A1'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284C7'}
            >
              <Download size={16} />
              Export Excel
            </button>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors text-xs font-medium"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
              {(statusFilter || jenisTanamanFilter || tahunTanamFilter) && (
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                  {[statusFilter, jenisTanamanFilter, tahunTanamFilter].filter(Boolean).length}
                </span>
              )}
            </button>
            <Button variant="primary" size="md" onClick={handleCreate}>
              <Plus size={16} className="mr-1.5" />
              Tambah Lahan
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const borderColors = ['border-teal-500', 'border-green-500', 'border-blue-500', 'border-yellow-500'];
            const bgColors = ['bg-teal-50', 'bg-green-50', 'bg-blue-50', 'bg-yellow-50'];
            const iconBgs = ['bg-teal-100', 'bg-green-100', 'bg-blue-100', 'bg-yellow-100'];
            const iconColors = ['text-teal-600', 'text-green-600', 'text-blue-600', 'text-yellow-600'];
            return (
              <div key={index} className={`${bgColors[index]} ${borderColors[index]} border-2 rounded-xl p-5 transition-all hover:shadow-md flex flex-col`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">{stat.title.toUpperCase()}</p>
                    <p className="text-xs text-gray-600">{stat.subtitle}</p>
                  </div>
                  <div className={`${iconBgs[index]} p-3 rounded-full`}>
                    <Icon className={iconColors[index]} size={20} />
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="card-number text-gray-900 mb-1">{stat.value}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <TrendingUp size={14} className="text-green-600" />
                    <span>{stat.subtitle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onReset={handleResetFilter}
          title="Filter Lahan"
        >
          <FilterField label="Pencarian">
            <FilterInput
              type="search"
              placeholder="Cari kode lahan, nomor petak, jenis tanaman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterField>
          <FilterDivider label="Status" />
          <FilterField label="Status Legalitas">
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'sah', label: '✅ Sah / Terverifikasi' },
                { value: 'proses', label: '⏳ Dalam Proses' },
                { value: 'ditolak', label: '❌ Ditolak' },
              ]}
              placeholder="Semua Status"
            />
          </FilterField>
          <FilterDivider label="Tanaman" />
          <FilterField label="Jenis Tanaman">
            <FilterSelect
              value={jenisTanamanFilter}
              onChange={(e) => setJenisTanamanFilter(e.target.value)}
              options={[
                { value: 'pohon', label: 'Pohon / Tegakan' },
                { value: 'bambu', label: 'Bambu' },
                { value: 'meranti', label: 'Meranti' },
                { value: 'jati', label: 'Jati' },
                { value: 'pinus', label: 'Pinus' },
                { value: 'mahoni', label: 'Mahoni' },
                { value: 'sengon', label: 'Sengon / Albasia' },
                { value: 'lainnya', label: 'Lainnya' },
              ]}
              placeholder="Semua Jenis Tanaman"
            />
          </FilterField>
          <FilterField label="Tahun Tanam">
            <FilterSelect
              value={tahunTanamFilter}
              onChange={(e) => setTahunTanamFilter(e.target.value)}
              options={[2018,2019,2020,2021,2022,2023,2024,2025].map(y => ({ value: String(y), label: String(y) }))}
              placeholder="Semua Tahun"
            />
          </FilterField>
        </FilterDrawer>

        {/* Desktop Data Table */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Daftar Lahan KHDPK</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Kode Lahan
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Anggota
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Petak
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Luas
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Jenis Tanaman
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Kondisi
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                      </td>
                    </tr>
                  ) : lahan.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-xs text-secondary-500">
                        Tidak ada data lahan
                      </td>
                    </tr>
                  ) : (
                    lahan.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {item.kodeLahan}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-secondary-900">{item.anggotaNama || '-'}</div>
                          <div className="text-xs text-secondary-500">{item.anggotaNomor || '-'}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">{item.nomorPetak}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {item.luasLahan} {item.satuanLuas}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">{item.jenisTanaman || '-'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-secondary-900">{item.lokasiLahan || '-'}</div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {getStatusBadge(item.statusLegalitas)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {getKondisiBadge(item.kondisiLahan)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && lahan.length > 0 && (
              <div className="px-3 py-2 border-t border-secondary-200 flex items-center justify-between">
                <div className="text-sm text-secondary-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="block md:hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
          ) : (
            <MobileCardsList
              title="Lahan KHDPK"
              count={lahan.length}
              cards={lahan.map((item) => ({
                id: item.id,
                fields: [
                  { 
                    label: 'Kode Lahan',
                    value: item.kodeLahan,
                    highlight: true
                  },
                  { 
                    label: 'Anggota',
                    value: item.anggotaNama || '-'
                  },
                  { 
                    label: 'Nomor Petak',
                    value: item.nomorPetak
                  },
                  { 
                    label: 'Luas',
                    value: `${item.luasLahan} ${item.satuanLuas}`
                  },
                  { 
                    label: 'Jenis Tanaman',
                    value: item.jenisTanaman || '-'
                  },
                  { 
                    label: 'Lokasi',
                    value: item.lokasiLahan || '-'
                  },
                  { 
                    label: 'Status Legalitas',
                    value: (
                      <StatusBadge 
                        status={item.statusLegalitas === 'sah' ? 'Sah' : item.statusLegalitas === 'proses' ? 'Proses' : 'Ditolak'} 
                        variant={item.statusLegalitas === 'sah' ? 'success' : item.statusLegalitas === 'proses' ? 'warning' : 'danger'}
                      />
                    ),
                    badge: true
                  },
                  ...(item.kondisiLahan ? [{ 
                    label: 'Kondisi',
                    value: (
                      <StatusBadge 
                        status={item.kondisiLahan} 
                        variant={item.kondisiLahan?.toLowerCase() === 'baik' ? 'success' : item.kondisiLahan?.toLowerCase() === 'sedang' ? 'warning' : 'danger'}
                      />
                    ),
                    badge: true
                  }] : []),
                ],
                actions: [
                  {
                    label: 'Edit',
                    icon: <Edit size={18} />,
                    onClick: () => handleEdit(item),
                    variant: 'primary'
                  },
                  {
                    label: 'Hapus',
                    icon: <Trash2 size={18} />,
                    onClick: () => handleDeleteClick(item),
                    variant: 'danger'
                  },
                ],
              }))}
              emptyMessage="Tidak ada data lahan"
            />
          )}

          {/* Mobile Pagination */}
          {!loading && lahan.length > 0 && (
            <div className="mt-4 flex items-center justify-between px-1">
              <p className="text-xs text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <LahanFormModal
          mode={formMode}
          lahan={selectedLahan}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDeleteModal && selectedLahan && (
        <LahanDeleteModal
          lahan={selectedLahan}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </MainLayout>
  );
}
