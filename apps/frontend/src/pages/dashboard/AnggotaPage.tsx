import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Download, Edit, Trash2, Users, TrendingUp, Eye, Upload } from 'lucide-react';
import { anggotaService, type Anggota, type AnggotaStatistics } from '@/services/anggota.service';
import { authService, type User } from '@/services/auth.service';
import { AnggotaFormModal } from '@/components/anggota/AnggotaFormModal';
import { AnggotaImportModal } from '@/components/anggota/AnggotaImportModal';
import { AnggotaDetailModal } from '@/components/anggota/AnggotaDetailModal';
import { DeleteConfirmModal } from '@/components/anggota/DeleteConfirmModal';
import { exportToExcel, formatDate } from '@/lib/export';
import { TableSkeleton, StatsSkeleton } from '@/components/ui/Skeleton';
import { MobileCardsList, StatusBadge } from '@/components/ui/MobileCard';
import { Pagination } from '@/components/ui/Pagination';

export default function AnggotaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [statistics, setStatistics] = useState<AnggotaStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadUser();
    loadData();
    loadStatistics();
  }, [currentPage, searchTerm, statusFilter]);

  const loadUser = async () => {
    const response = await authService.getCurrentUser();
    if (response.success) {
      setUser(response.data);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const response = await anggotaService.getAll({
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    });
    
    console.log('📊 Anggota Response:', {
      success: response.success,
      dataLength: response.success ? response.data?.length : 0,
      pagination: response.success ? response.pagination : null,
      fullResponse: response
    });
    
    if (response.success) {
      setAnggota(response.data);
      // Use pagination info from backend response
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    }
    setLoading(false);
  };

  const loadStatistics = async () => {
    const response = await anggotaService.getStatistics();
    if (response.success) {
      setStatistics(response.data);
    }
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedAnggota(null);
    setShowFormModal(true);
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    loadData();
    loadStatistics();
  };

  const handleEdit = (item: Anggota) => {
    setFormMode('edit');
    setSelectedAnggota(item);
    setShowFormModal(true);
  };

  const handleViewDetail = (item: Anggota) => {
    setSelectedAnggota(item);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (item: Anggota) => {
    setSelectedAnggota(item);
    setShowDeleteModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    loadData();
    loadStatistics();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedAnggota(null);
    loadData();
    loadStatistics();
  };

  const getStatusBadge = (status: string) => {
    return status === 'aktif' ? 'badge-success' : 'badge-warning';
  };

  const handleExportExcel = () => {
    const exportData = anggota.map((item) => ({
      nomorAnggota: item.nomorAnggota,
      nik: item.nik,
      namaLengkap: item.namaLengkap,
      jenisKelamin: item.jenisKelamin,
      tempatLahir: item.tempatLahir,
      tanggalLahir: formatDate(item.tanggalLahir),
      alamat: `${item.alamatLengkap}, RT ${item.rt}/RW ${item.rw}, ${item.desa}, ${item.kecamatan}`,
      nomorTelepon: item.nomorTelepon || '-',
      email: item.email || '-',
      pendidikan: item.pendidikan || '-',
      pekerjaan: item.pekerjaan || '-',
      statusAnggota: item.statusAnggota,
      tanggalBergabung: formatDate(item.tanggalBergabung),
    }));

    exportToExcel(
      exportData,
      [
        { header: 'No Anggota', key: 'nomorAnggota', width: 15 },
        { header: 'NIK', key: 'nik', width: 18 },
        { header: 'Nama Lengkap', key: 'namaLengkap', width: 25 },
        { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
        { header: 'Tempat Lahir', key: 'tempatLahir', width: 20 },
        { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 20 },
        { header: 'Alamat', key: 'alamat', width: 40 },
        { header: 'No Telepon', key: 'nomorTelepon', width: 18 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Pendidikan', key: 'pendidikan', width: 20 },
        { header: 'Pekerjaan', key: 'pekerjaan', width: 20 },
        { header: 'Bank', key: 'bank', width: 15 },
        { header: 'No Rekening', key: 'noRekening', width: 18 },
        { header: 'Status', key: 'statusAnggota', width: 12 },
        { header: 'Tanggal Bergabung', key: 'tanggalBergabung', width: 20 },
      ],
      'Data_Anggota_KTH'
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <StatsSkeleton count={3} />
          <TableSkeleton rows={8} columns={7} />
        </div>
      </div>
    );
  }

  const userInfo = {
    fullName: user.namaLengkap,
    role: user.role,
  };

  return (
    <MainLayout user={userInfo}>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-secondary-900">
              Manajemen Anggota
            </h1>
            <p className="text-secondary-600 text-sm mt-0.5">
              Kelola data anggota KTH Berkah Tani Mandiri
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={handleImport}>
              <Upload size={16} />
              Import Excel
            </Button>
            <Button variant="secondary" size="md" onClick={handleExportExcel}>
              <Download size={16} />
              Export
            </Button>
            <Button variant="primary" size="md" onClick={handleCreate}>
              <Plus size={16} />
              Tambah Anggota
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TOTAL ANGGOTA</p>
                  <p className="text-xs text-gray-600">Semua anggota terdaftar</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="text-blue-600" size={20} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="card-number text-gray-900 mb-1">
                  {statistics.total}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <TrendingUp size={14} className="text-blue-600" />
                  <span>Anggota terdaftar</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">ANGGOTA AKTIF</p>
                  <p className="text-xs text-gray-600">Status aktif saat ini</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="text-green-600" size={20} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="card-number text-gray-900 mb-1">
                  {statistics.active}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <TrendingUp size={14} className="text-green-600" />
                  <span>+{Math.round((statistics.active / statistics.total) * 100)}% dari total</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TIDAK AKTIF</p>
                  <p className="text-xs text-gray-600">Anggota non-aktif</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Users className="text-yellow-600" size={20} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="card-number text-gray-900 mb-1">
                  {statistics.inactive}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <TrendingUp size={14} className="text-yellow-600" />
                  <span>{Math.round((statistics.inactive / statistics.total) * 100)}% dari total</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                <input
                  type="search"
                  placeholder="Cari nama, NIK, atau nomor anggota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-secondary-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-secondary-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md text-sm transition-colors"
                style={{ backgroundColor: '#0284C7' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369A1'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284C7'}
              >
                <Download size={16} />
                Export Excel
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Table */}
        <Card className="hidden md:block">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-xs">No. Anggota</th>
                  <th className="text-xs">Nama Lengkap</th>
                  <th className="text-xs">NIK</th>
                  <th className="text-xs">No. Telepon</th>
                  <th className="text-xs">Status</th>
                  <th className="text-xs text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                    </td>
                  </tr>
                ) : anggota.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-secondary-500">
                      Tidak ada data anggota
                    </td>
                  </tr>
                ) : (
                  anggota.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="text-xs font-medium text-primary-600">{item.nomorAnggota || '-'}</td>
                      <td className="text-xs">{item.namaLengkap}</td>
                      <td className="text-xs">{item.nik}</td>
                      <td className="text-xs">{item.nomorTelepon || '-'}</td>
                      <td className="text-xs">
                        <span className={`badge ${getStatusBadge(item.statusAnggota)}`}>
                          {item.statusAnggota}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetail(item)}
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </Button>
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
          {!loading && anggota.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={10}
            />
          )}
        </Card>

        {/* Mobile Cards */}
        <div className="block md:hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
          ) : (
            <MobileCardsList
              count={anggota.length}
              cards={anggota.map((item) => ({
                id: item.id,
                fields: [
                  { 
                    label: 'Nama',
                    value: item.namaLengkap,
                    highlight: true
                  },
                  { 
                    label: 'No. Anggota',
                    value: item.nomorAnggota || '-'
                  },
                  { 
                    label: 'NIK',
                    value: item.nik
                  },
                  { 
                    label: 'No. Telepon',
                    value: item.nomorTelepon || '-'
                  },
                  { 
                    label: 'Status',
                    value: (
                      <StatusBadge 
                        status={item.statusAnggota} 
                        variant={item.statusAnggota === 'aktif' ? 'success' : 'warning'}
                      />
                    ),
                    badge: true
                  },
                ],
                actions: [
                  {
                    label: 'Lihat Detail',
                    icon: <Eye size={18} />,
                    onClick: () => handleViewDetail(item),
                    variant: 'default'
                  },
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
                onCardClick: () => handleViewDetail(item)
              }))}
              emptyMessage="Tidak ada data anggota"
            />
          )}

          {/* Mobile Pagination */}
          {!loading && anggota.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={10}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <AnggotaFormModal
          mode={formMode}
          anggota={selectedAnggota}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showImportModal && (
        <AnggotaImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {showDetailModal && selectedAnggota && (
        <AnggotaDetailModal
          anggota={selectedAnggota}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showDeleteModal && selectedAnggota && (
        <DeleteConfirmModal
          anggota={selectedAnggota}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </MainLayout>
  );
}
