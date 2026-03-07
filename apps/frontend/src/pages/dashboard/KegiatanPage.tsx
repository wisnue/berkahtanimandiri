import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Plus, Filter, Clock, Download, TrendingUp, Search } from 'lucide-react';
import kegiatanService, { Kegiatan, KegiatanStatistics, CreateKegiatanRequest, UpdateKegiatanRequest } from '../../services/kegiatan.service';
import { authService } from '../../services/auth.service';
import { KegiatanFormModal } from '../../components/kegiatan/KegiatanFormModal';
import { exportToExcel, formatCurrency, formatDate } from '../../lib/export';
import { Pagination } from '@/components/ui/Pagination';
import { MainLayout } from '../../components/layout/MainLayout';
import { FilterDrawer, FilterField, FilterSelect, FilterInput, FilterDivider } from '@/components/ui/FilterDrawer';

export default function KegiatanPage() {
  const [user, setUser] = useState<any>(null);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [statistics, setStatistics] = useState<KegiatanStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = all months
  const [jenisFilter, setJenisFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [lokasiFilter, setLokasiFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, jenisFilter, statusFilter, lokasiFilter, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, kegiatanRes] = await Promise.all([
        authService.getCurrentUser(),
        kegiatanService.getStatistics(selectedYear),
        kegiatanService.getAll({
          page: currentPage,
          limit: itemsPerPage,
          tahun: selectedYear,
          bulan: selectedMonth || undefined,
          jenis: jenisFilter,
          status: statusFilter,
          lokasi: lokasiFilter || undefined,
          search: searchQuery,
        }),
      ]);

      if (userRes.success) setUser(userRes.data);
      if (statsRes.success) setStatistics(statsRes.data as KegiatanStatistics);
      if (kegiatanRes.success) setKegiatanList(kegiatanRes.data as Kegiatan[]);
    } catch (error) {
      console.error('Failed to load kegiatan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      rencana: 'bg-blue-100 text-blue-800',
      berlangsung: 'bg-yellow-100 text-yellow-800',
      selesai: 'bg-green-100 text-green-800',
      batal: 'bg-red-100 text-red-800',
    };
    const labels = {
      rencana: 'Rencana',
      berlangsung: 'Berlangsung',
      selesai: 'Selesai',
      batal: 'Batal',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const canManageKegiatan = user?.role === 'ketua' || user?.role === 'sekretaris';

  const handleExportExcel = () => {
    const exportData = kegiatanList.map((item) => ({
      kodeKegiatan: item.kodeKegiatan,
      namaKegiatan: item.namaKegiatan,
      jenisKegiatan: item.jenisKegiatan,
      tanggalMulai: formatDate(item.tanggalMulai),
      tanggalSelesai: formatDate(item.tanggalSelesai),
      lokasiKegiatan: item.lokasiKegiatan || '-',
      penanggungJawab: item.penanggungJawabNama || '-',
      biayaKegiatan: formatCurrency(item.biayaKegiatan || 0),
      statusKegiatan: item.statusKegiatan,
      keterangan: item.keterangan || '-',
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Kode Kegiatan', key: 'kodeKegiatan', width: 18 },
        { header: 'Nama Kegiatan', key: 'namaKegiatan', width: 30 },
        { header: 'Jenis Kegiatan', key: 'jenisKegiatan', width: 20 },
        { header: 'Tanggal Mulai', key: 'tanggalMulai', width: 15 },
        { header: 'Tanggal Selesai', key: 'tanggalSelesai', width: 15 },
        { header: 'Lokasi', key: 'lokasiKegiatan', width: 25 },
        { header: 'Penanggung Jawab', key: 'penanggungJawab', width: 25 },
        { header: 'Biaya', key: 'biayaKegiatan', width: 18 },
        { header: 'Status', key: 'statusKegiatan', width: 15 },
        { header: 'Keterangan', key: 'keterangan', width: 30 },
      ],
      'Laporan_Kegiatan_KTH'
    );
  };

  const handleResetFilter = () => {
    setSelectedMonth(0);
    setJenisFilter('');
    setStatusFilter('');
    setLokasiFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedKegiatan(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = (kegiatan: Kegiatan) => {
    setModalMode('edit');
    setSelectedKegiatan(kegiatan);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateKegiatanRequest) => {
    try {
      if (modalMode === 'create') {
        await kegiatanService.create(data);
        alert('Kegiatan berhasil ditambahkan');
      } else if (selectedKegiatan) {
        await kegiatanService.update(selectedKegiatan.id, data as UpdateKegiatanRequest);
        alert('Kegiatan berhasil diupdate');
      }
      await loadData();
    } catch (error) {
      alert('Gagal menyimpan kegiatan');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return;
    
    try {
      await kegiatanService.delete(id);
      alert('Kegiatan berhasil dihapus');
      await loadData();
    } catch (error) {
      alert('Gagal menghapus kegiatan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data kegiatan...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Kegiatan KTH</h1>
          <p className="text-sm text-gray-600 mt-0.5">Kelola jadwal dan dokumentasi kegiatan KTH Berkah Tani Mandiri</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md transition-colors text-xs"
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
            {(selectedMonth > 0 || jenisFilter || statusFilter || lokasiFilter) && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                {[selectedMonth > 0, jenisFilter, statusFilter, lokasiFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          {canManageKegiatan && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md transition-colors text-xs"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Plus size={16} />
              Tambah Kegiatan
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TOTAL KEGIATAN</p>
              <p className="text-xs text-gray-600">Tahun {selectedYear}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.totalKegiatan || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-blue-600" />
              <span>Total keseluruhan</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TOTAL BIAYA</p>
              <p className="text-xs text-gray-600">Dana kegiatan</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-2">{formatCurrency(statistics?.totalBiaya || 0)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-green-600" />
              <span>Anggaran kegiatan</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">BERLANGSUNG</p>
              <p className="text-xs text-gray-600">Kegiatan aktif</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.status?.berlangsung || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={14} className="text-yellow-600" />
              <span>Sedang berjalan</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">SELESAI</p>
              <p className="text-xs text-gray-600">Kegiatan terlaksana</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.status?.selesai || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-purple-600" />
              <span>Berhasil selesai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
        title="Filter Kegiatan"
      >
        <FilterField label="Pencarian">
          <FilterInput
            type="search"
            placeholder="Cari nama atau kode kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FilterField>
        <FilterDivider label="Periode" />
        <FilterField label="Tahun">
          <FilterSelect
            value={selectedYear.toString()}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            options={[
              { value: '2023', label: '2023' },
              { value: '2024', label: '2024' },
              { value: '2025', label: '2025' },
              { value: '2026', label: '2026' },
              { value: '2027', label: '2027' },
            ]}
            placeholder="Pilih Tahun"
          />
        </FilterField>
        <FilterField label="Bulan">
          <FilterSelect
            value={selectedMonth.toString()}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: (i + 1).toString(),
              label: new Date(2024, i).toLocaleString('id-ID', { month: 'long' })
            }))}
            placeholder="Semua Bulan"
          />
        </FilterField>
        <FilterDivider label="Kriteria" />
        <FilterField label="Jenis Kegiatan">
          <FilterSelect
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            options={[
              { value: 'Rapat', label: 'Rapat / Musyawarah' },
              { value: 'Pelatihan', label: 'Pelatihan / Workshop' },
              { value: 'Penanaman', label: 'Penanaman / Rehabilitasi' },
              { value: 'Panen', label: 'Panen / Pemungutan Hasil' },
              { value: 'Pemeliharaan', label: 'Pemeliharaan Lahan' },
              { value: 'Monitoring', label: 'Monitoring & Evaluasi' },
              { value: 'Lainnya', label: 'Lainnya' },
            ]}
            placeholder="Semua Jenis"
          />
        </FilterField>
        <FilterField label="Status Kegiatan">
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'rencana', label: '🗓️ Rencana' },
              { value: 'berlangsung', label: '▶️ Berlangsung' },
              { value: 'selesai', label: '✅ Selesai' },
              { value: 'batal', label: '❌ Dibatalkan' },
            ]}
            placeholder="Semua Status"
          />
        </FilterField>
        <FilterDivider label="Lokasi" />
        <FilterField label="Lokasi Kegiatan">
          <FilterInput
            type="text"
            placeholder="Cari lokasi kegiatan..."
            value={lokasiFilter}
            onChange={(e) => setLokasiFilter(e.target.value)}
          />
        </FilterField>
      </FilterDrawer>

      {/* Kegiatan Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Kegiatan
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kegiatanList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Calendar size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Belum ada data kegiatan</p>
                      <p className="text-sm">Silakan tambah kegiatan baru</p>
                    </div>
                  </td>
                </tr>
              ) : (
                kegiatanList.map((kegiatan) => (
                  <tr key={kegiatan.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                      {kegiatan.kodeKegiatan}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{kegiatan.namaKegiatan}</div>
                      {kegiatan.penanggungJawabNama && (
                        <div className="text-sm text-gray-500">PJ: {kegiatan.penanggungJawabNama}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {kegiatan.jenisKegiatan}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(kegiatan.tanggalMulai)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {kegiatan.lokasiKegiatan || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusBadge(kegiatan.statusKegiatan)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {canManageKegiatan && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(kegiatan)}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            Edit
                          </button>
                          {user?.role === 'ketua' && (
                            <button
                              onClick={() => handleDelete(kegiatan.id)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Halaman {currentPage}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <KegiatanFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        kegiatan={selectedKegiatan}
        mode={modalMode}
      />
      </div>
    </MainLayout>
  );
}
