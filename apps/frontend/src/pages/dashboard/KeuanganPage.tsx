import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Filter, Clock, Download } from 'lucide-react';
import keuanganService, { Keuangan, KeuanganStatistics } from '../../services/keuangan.service';
import { authService } from '../../services/auth.service';
import { KeuanganFormModal, KeuanganVerifyModal } from '../../components/keuangan';
import { exportToExcel, formatCurrency, formatDate } from '../../lib/export';
import { Pagination } from '@/components/ui/Pagination';
import { MainLayout } from '../../components/layout/MainLayout';

export default function KeuanganPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Keuangan[]>([]);
  const [statistics, setStatistics] = useState<KeuanganStatistics | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedKeuangan, setSelectedKeuangan] = useState<Keuangan | undefined>(undefined);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = all months
  const [jenisFilter, setJenisFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth, jenisFilter, currentPage]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await keuanganService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data.map((c: any) => c.kategori));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, transRes] = await Promise.all([
        authService.getCurrentUser(),
        keuanganService.getStatistics(selectedYear),
        keuanganService.getAll({
          page: currentPage,
          limit: itemsPerPage,
          tahun: selectedYear,
          bulan: selectedMonth || undefined,
          jenis: jenisFilter,
          search: searchQuery,
        }),
      ]);

      if (userRes.success) setUser(userRes.data);
      if (statsRes.success) setStatistics(statsRes.data);
      if (transRes.success) setTransactions(transRes.data);
    } catch (error) {
      console.error('Failed to load keuangan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await keuanganService.create(data);
      if (res.success) {
        setShowFormModal(false);
        loadData();
        alert('Transaksi berhasil ditambahkan');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan transaksi');
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedKeuangan) return;
    try {
      const res = await keuanganService.update(selectedKeuangan.id, data);
      if (res.success) {
        setShowFormModal(false);
        setSelectedKeuangan(undefined);
        loadData();
        alert('Transaksi berhasil diupdate');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengupdate transaksi');
    }
  };

  const handleExportExcel = () => {
    const exportData = transactions.map((item) => ({
      nomorTransaksi: item.nomorTransaksi,
      tanggal: formatDate(item.tanggalTransaksi),
      jenis: item.jenisTransaksi,
      kategori: item.kategori || '-',
      keterangan: item.keterangan || '-',
      jumlah: formatCurrency(item.jumlah),
      status: item.statusVerifikasi,
      dibuatOleh: item.dibuatOleh || '-',
    }));

    exportToExcel(
      exportData,
      [
        { header: 'No. Transaksi', key: 'nomorTransaksi', width: 20 },
        { header: 'Tanggal', key: 'tanggal', width: 15 },
        { header: 'Jenis', key: 'jenis', width: 12 },
        { header: 'Kategori', key: 'kategori', width: 20 },
        { header: 'Keterangan', key: 'keterangan', width: 30 },
        { header: 'Jumlah', key: 'jumlah', width: 18 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Dibuat Oleh', key: 'dibuatOleh', width: 20 },
      ],
      'Laporan_Keuangan_KTH'
    );
  };

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      const res = await keuanganService.verify(id, status);
      if (res.success) {
        loadData();
        alert(`Transaksi berhasil ${status === 'verified' ? 'diverifikasi' : 'ditolak'}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memverifikasi transaksi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    try {
      const res = await keuanganService.delete(id);
      if (res.success) {
        loadData();
        alert('Transaksi berhasil dihapus');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus transaksi');
    }
  };

  const getJenisBadge = (jenis: string) => {
    const styles = {
      pemasukan: 'bg-green-100 text-green-800',
      pengeluaran: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[jenis as keyof typeof styles]}`}>
        {jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const canManageKeuangan = ['ketua', 'bendahara', 'sekretaris'].includes(user?.role);

  if (loading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Keuangan</h1>
          <p className="text-gray-600 text-sm mt-0.5">Kelola transaksi pemasukan dan pengeluaran KTH</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
            style={{ backgroundColor: '#0284C7' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369A1'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284C7'}
          >
            <Download size={16} />
            Export Excel
          </button>
          {canManageKeuangan && (
            <button
              onClick={() => {
                setSelectedKeuangan(undefined);
                setShowFormModal(true);
              }}
              className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Plus size={16} />
              Tambah Transaksi
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">SALDO KAS</p>
              <p className="text-xs text-gray-600">Kas tersedia</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">
              {formatCurrency(statistics?.saldoKas || 0)}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-blue-600" />
              <span>Saldo tersedia</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">PEMASUKAN</p>
              <p className="text-xs text-gray-600">Total pemasukan</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">
              {formatCurrency(statistics?.totalPemasukan || 0)}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-green-600" />
              <span>Dana masuk</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">PENGELUARAN</p>
              <p className="text-xs text-gray-600">Total pengeluaran</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="text-red-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">
              {formatCurrency(statistics?.totalPengeluaran || 0)}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingDown size={14} className="text-red-600" />
              <span>Dana keluar</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TRANSAKSI</p>
              <p className="text-xs text-gray-600">Total transaksi</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.jumlahTransaksi || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Calendar size={14} className="text-purple-600" />
              <span>Total keseluruhan</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">PENDING</p>
              <p className="text-xs text-gray-600">Menunggu verifikasi</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.transaksiPending || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={14} className="text-yellow-600" />
              <span>Perlu verifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[2023, 2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={0}>Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Jenis Transaksi
            </label>
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Semua Jenis</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nomor, kategori..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomor Transaksi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <DollarSign size={48} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">Tidak ada transaksi</p>
                      <p className="text-sm">Silakan tambah transaksi baru</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(trx.tanggalTransaksi)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trx.nomorTransaksi}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getJenisBadge(trx.jenisTransaksi)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {trx.kategori}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(trx.jumlah)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusBadge(trx.statusVerifikasi)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {canManageKeuangan && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedKeuangan(trx);
                              setShowFormModal(true);
                            }}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            Edit
                          </button>
                          {trx.statusVerifikasi === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedKeuangan(trx);
                                  setShowVerifyModal(true);
                                }}
                                className="text-green-600 hover:text-green-700 font-medium"
                              >
                                Verify
                              </button>
                              {user?.role === 'ketua' && (
                                <button
                                  onClick={() => handleDelete(trx.id)}
                                  className="text-red-600 hover:text-red-700 font-medium"
                                >
                                  Hapus
                                </button>
                              )}
                            </>
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

      {/* Modals */}
      <KeuanganFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedKeuangan(undefined);
        }}
        onSubmit={selectedKeuangan ? handleEdit : handleCreate}
        keuangan={selectedKeuangan}
        categories={categories}
      />

      <KeuanganVerifyModal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setSelectedKeuangan(undefined);
        }}
        onVerify={handleVerify}
        keuangan={selectedKeuangan}
      />
      </div>
    </MainLayout>
  );
}
