import { useState, useEffect } from 'react';
import { Package, TrendingDown, TrendingUp, AlertTriangle, Calendar, Plus, Filter, Download } from 'lucide-react';
import asetService, { Aset, AsetStatistics } from '../../services/aset.service';
import { authService } from '../../services/auth.service';
import { AsetFormModal } from '../../components/aset';
import { exportToExcel, formatCurrency, formatDate } from '../../lib/export';
import { MainLayout } from '../../components/layout/MainLayout';
import { Pagination } from '@/components/ui/Pagination';

export default function AsetPage() {
  const [user, setUser] = useState<any>(null);
  const [asetList, setAsetList] = useState<Aset[]>([]);
  const [statistics, setStatistics] = useState<AsetStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedAset, setSelectedAset] = useState<Aset | undefined>(undefined);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(0); // 0 = all years
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedKondisi, setSelectedKondisi] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedKategori, selectedKondisi, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, asetRes] = await Promise.all([
        authService.getCurrentUser(),
        asetService.getStatistics(selectedYear || undefined),
        asetService.getAll({
          page: currentPage,
          limit: itemsPerPage,
          kategori: selectedKategori,
          kondisi: selectedKondisi,
          tahun: selectedYear || undefined,
          search: searchQuery,
        }),
      ]);

      if (userRes.success) setUser(userRes.data);
      if (statsRes.success) setStatistics(statsRes.data as AsetStatistics);
      if (asetRes.success) setAsetList(asetRes.data as Aset[]);
    } catch (error) {
      console.error('Failed to load aset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await asetService.create(data);
      if (res.success) {
        setShowFormModal(false);
        loadData();
        alert('Aset berhasil ditambahkan');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan aset');
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedAset) return;
    try {
      const res = await asetService.update(selectedAset.id, data);
      if (res.success) {
        setShowFormModal(false);
        setSelectedAset(undefined);
        loadData();
        alert('Aset berhasil diupdate');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengupdate aset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus aset ini?')) return;
    try {
      const res = await asetService.delete(id);
      if (res.success) {
        loadData();
        alert('Aset berhasil dihapus');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus aset');
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getKondisiBadge = (kondisi: string) => {
    const styles = {
      baik: 'bg-green-100 text-green-800',
      rusak: 'bg-yellow-100 text-yellow-800',
      hilang: 'bg-red-100 text-red-800',
    };
    const labels = {
      baik: 'Baik',
      rusak: 'Rusak',
      hilang: 'Hilang',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[kondisi as keyof typeof styles]}`}>
        {labels[kondisi as keyof typeof labels]}
      </span>
    );
  };

  const canManageAset = user?.role === 'ketua' || user?.role === 'sekretaris' || user?.role === 'bendahara';

  const handleExportExcel = () => {
    const exportData = asetList.map((item) => ({
      kodeAset: item.kodeAset,
      namaAset: item.namaAset,
      kategori: item.kategoriAset,
      tanggalPerolehan: formatDate(item.tanggalPerolehan),
      nilaiPerolehan: formatCurrency(item.nilaiPerolehan),
      nilaiSekarang: formatCurrency(item.nilaiSekarang || item.nilaiPerolehan),
      kondisi: item.kondisiAset,
      lokasi: item.lokasiAset || '-',
      keterangan: item.keterangan || '-',
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Kode Aset', key: 'kodeAset', width: 20 },
        { header: 'Nama Aset', key: 'namaAset', width: 25 },
        { header: 'Kategori', key: 'kategori', width: 20 },
        { header: 'Tanggal Perolehan', key: 'tanggalPerolehan', width: 18 },
        { header: 'Nilai Perolehan', key: 'nilaiPerolehan', width: 18 },
        { header: 'Nilai Sekarang', key: 'nilaiSekarang', width: 18 },
        { header: 'Kondisi', key: 'kondisi', width: 12 },
        { header: 'Lokasi', key: 'lokasi', width: 20 },
        { header: 'Keterangan', key: 'keterangan', width: 30 },
      ],
      'Inventaris_Aset_KTH'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data aset...</p>
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
          <h1 className="text-xl font-bold text-gray-900">Aset KTH</h1>
          <p className="text-gray-600 text-sm mt-0.5">Inventaris dan manajemen aset KTH Berkah Tani Mandiri</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
          {canManageAset && (
            <button
              onClick={() => {
                setSelectedAset(undefined);
                setShowFormModal(true);
              }}
              className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md transition-colors text-sm"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Plus size={16} />
              Tambah Aset
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TOTAL ASET</p>
              <p className="text-xs text-gray-600">Unit terdaftar</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.totalAset || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-blue-600" />
              <span>Total unit</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">NILAI PEROLEHAN</p>
              <p className="text-xs text-gray-600">Total investasi</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-2">{formatCurrency(statistics?.totalNilaiPerolehan || 0)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-green-600" />
              <span>Investasi aset</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">NILAI SEKARANG</p>
              <p className="text-xs text-gray-600">Setelah penyusutan</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingDown className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-2">{formatCurrency(statistics?.totalNilaiSekarang || 0)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingDown size={14} className="text-purple-600" />
              <span>Nilai terkini</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">PERLU PERHATIAN</p>
              <p className="text-xs text-gray-600">Rusak/hilang</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{(statistics?.kondisi?.rusak || 0) + (statistics?.kondisi?.hilang || 0)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <AlertTriangle size={14} className="text-yellow-600" />
              <span>Butuh tindakan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Perolehan
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">Semua Tahun</option>
              {[2023, 2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={selectedKategori}
              onChange={(e) => {
                setSelectedKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="Kendaraan">Kendaraan</option>
              <option value="Peralatan">Peralatan</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Furniture">Furniture</option>
              <option value="Bangunan">Bangunan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kondisi
            </label>
            <select
              value={selectedKondisi}
              onChange={(e) => {
                setSelectedKondisi(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak">Rusak</option>
              <option value="hilang">Hilang</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  loadData();
                }
              }}
              placeholder="Nama, kode, atau merk..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Aset Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Aset
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Aset
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tahun
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai Perolehan
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kondisi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asetList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Belum ada data aset</p>
                      <p className="text-sm">Silakan tambah aset baru</p>
                    </div>
                  </td>
                </tr>
              ) : (
                asetList.map((aset) => (
                  <tr key={aset.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                      {aset.kodeAset}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{aset.namaAset}</div>
                      {aset.merkTipe && (
                        <div className="text-xs text-gray-500">{aset.merkTipe}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {aset.kategoriAset}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {aset.tahunPerolehan}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-900">
                      {formatCurrency(aset.nilaiPerolehan)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getKondisiBadge(aset.kondisiAset)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {canManageAset && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAset(aset);
                              setShowFormModal(true);
                            }}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            Edit
                          </button>
                          {user?.role === 'ketua' && (
                            <button
                              onClick={() => handleDelete(aset.id)}
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
        <Pagination
          currentPage={currentPage}
          totalPages={1}
          onPageChange={setCurrentPage}
          itemsPerPage={10}
        />
      </div>

      {/* Modal */}
      <AsetFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedAset(undefined);
        }}
        onSubmit={selectedAset ? handleEdit : handleCreate}
        aset={selectedAset}
      />
      </div>
    </MainLayout>
  );
}
