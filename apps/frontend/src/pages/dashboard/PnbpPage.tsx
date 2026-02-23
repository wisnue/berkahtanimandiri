import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, Plus, Calendar, Filter, Download, Printer, Search } from 'lucide-react';
import { FilterDrawer, FilterField, FilterSelect, FilterInput, FilterDivider } from '@/components/ui/FilterDrawer';
import pnbpService, { Pnbp, PnbpStatistics } from '../../services/pnbp.service';
import { authService } from '../../services/auth.service';
import { PnbpPaymentModal, PnbpGenerateModal, PnbpPrintPreview } from '../../components/pnbp';
import { exportToExcel, formatCurrency, formatDate } from '../../lib/export';
import { Pagination } from '@/components/ui/Pagination';
import { MainLayout } from '../../components/layout/MainLayout';
import { TableSkeleton, StatsSkeleton } from '@/components/ui/Skeleton';

export default function PnbpPage() {
  const [user, setUser] = useState<any>(null);
  const [pnbpList, setPnbpList] = useState<Pnbp[]>([]);
  const [statistics, setStatistics] = useState<PnbpStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedPnbp, setSelectedPnbp] = useState<Pnbp | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedYear, statusFilter, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, pnbpRes] = await Promise.all([
        authService.getCurrentUser(),
        pnbpService.getStatistics(selectedYear),
        pnbpService.getAll({
          page: currentPage,
          limit: itemsPerPage,
          tahun: selectedYear,
          statusPembayaran: statusFilter,
          search: searchQuery,
        }),
      ]);

      if (userRes.success) setUser(userRes.data);
      if (statsRes.success) setStatistics(statsRes.data);
      if (pnbpRes.success) setPnbpList(pnbpRes.data);
      
      // Calculate total pages (estimate based on statistics)
      if (statsRes.success && statsRes.data) {
        const total = statsRes.data.totalBelumBayar + statsRes.data.totalLunas + statsRes.data.totalTerlambat;
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to load PNBP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (pnbp: Pnbp) => {
    setSelectedPnbp(pnbp);
    setShowPaymentModal(true);
  };

  const handleGenerate = () => {
    setShowGenerateModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPnbp(null);
    loadData();
  };

  const handleGenerateSuccess = () => {
    setShowGenerateModal(false);
    loadData();
  };

  const handlePrintBukti = (pnbp: Pnbp) => {
    setSelectedPnbp(pnbp);
    setShowPrintPreview(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      belum_bayar: 'bg-yellow-100 text-yellow-800',
      lunas: 'bg-green-100 text-green-800',
      terlambat: 'bg-red-100 text-red-800',
    };
    const labels = {
      belum_bayar: 'Pending',
      lunas: 'Lunas',
      terlambat: 'Terlambat',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const canManagePnbp = user?.role === 'ketua' || user?.role === 'bendahara';

  const handleExportExcel = () => {
    const exportData = pnbpList.map((item) => ({
      tahun: item.tahun,
      kodeLahan: item.kodeLahan,
      anggotaNama: item.anggotaNama || '-',
      anggotaNomor: item.anggotaNomor || '-',
      luasLahan: item.luasLahan,
      tarifPerHa: formatCurrency(item.tarifPerHa),
      totalTagihan: formatCurrency(item.totalTagihan),
      tanggalJatuhTempo: item.tanggalJatuhTempo ? formatDate(item.tanggalJatuhTempo) : '-',
      statusPembayaran: item.statusPembayaran === 'lunas' ? 'LUNAS' : item.statusPembayaran === 'belum_bayar' ? 'BELUM BAYAR' : 'TERLAMBAT',
      tanggalBayar: item.tanggalBayar ? formatDate(item.tanggalBayar) : '-',
      metodePembayaran: item.metodePembayaran || '-',
      keterangan: item.keterangan || '-',
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Tahun PNBP', key: 'tahun', width: 12 },
        { header: 'Kode Lahan', key: 'kodeLahan', width: 15 },
        { header: 'Nama Anggota', key: 'anggotaNama', width: 25 },
        { header: 'Nomor Anggota', key: 'anggotaNomor', width: 18 },
        { header: 'Luas Lahan (Ha)', key: 'luasLahan', width: 12 },
        { header: 'Tarif per Ha', key: 'tarifPerHa', width: 18 },
        { header: 'Total Tagihan', key: 'totalTagihan', width: 18 },
        { header: 'Jatuh Tempo', key: 'tanggalJatuhTempo', width: 18 },
        { header: 'Status', key: 'statusPembayaran', width: 15 },
        { header: 'Tanggal Bayar', key: 'tanggalBayar', width: 18 },
        { header: 'Metode Bayar', key: 'metodePembayaran', width: 15 },
        { header: 'Keterangan', key: 'keterangan', width: 30 },
      ],
      `Laporan_PNBP_${selectedYear}_${new Date().toISOString().split('T')[0]}`
    );
  };

  const handleResetFilter = () => {
    setSelectedYear(new Date().getFullYear());
    setStatusFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <MainLayout user={user}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
          <StatsSkeleton count={4} />
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <TableSkeleton rows={10} columns={8} />
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
          <h1 className="text-xl font-bold text-gray-900">PNBP (Penerimaan Negara Bukan Pajak)</h1>
          <p className="text-gray-600 text-sm mt-0.5">Kelola tagihan dan pembayaran PNBP lahan KHDPK</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors"
            style={{ backgroundColor: '#0284C7' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369A1'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284C7'}
          >
            <Download size={16} />
            Export Excel
          </button>
          {canManagePnbp && (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Plus size={16} />
              Generate Tagihan
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TOTAL TAGIHAN</p>
              <p className="text-xs text-gray-600">Keseluruhan tagihan</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">
              {formatCurrency(statistics?.totalTagihan || 0)}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-blue-600" />
              <span>Total keseluruhan</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TERBAYAR</p>
              <p className="text-xs text-gray-600">Sudah dibayar</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">
              {formatCurrency(statistics?.totalTerbayar || 0)}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-green-600" />
              <span>Pembayaran masuk</span>
            </div>
          </div>
        </div>

        <div className="bg-teal-50 border-2 border-teal-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">LUNAS</p>
              <p className="text-xs text-gray-600">Tagihan lunas</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <CheckCircle className="text-teal-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">{statistics?.totalLunas || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-teal-600" />
              <span>Transaksi selesai</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">BELUM BAYAR</p>
              <p className="text-xs text-gray-600">Menunggu pembayaran</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">{statistics?.totalBelumBayar || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={14} className="text-yellow-600" />
              <span>Pending pembayaran</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TERLAMBAT</p>
              <p className="text-xs text-gray-600">Melewati batas</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900">{statistics?.totalTerlambat || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <AlertTriangle size={14} className="text-red-600" />
              <span>Perlu tindakan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="search"
              placeholder="Cari kode lahan atau nama anggota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  loadData();
                }
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
              {statusFilter && (
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                  1
                </span>
              )}
            </button>
            
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
        title="Filter PNBP"
      >
        <FilterField label="Pencarian">
          <FilterInput
            type="search"
            placeholder="Cari kode lahan atau nama anggota..."
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

        <FilterDivider label="Status" />

        <FilterField label="Status Pembayaran">
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'belum_bayar', label: 'Belum Bayar' },
              { value: 'lunas', label: 'Lunas' },
              { value: 'terlambat', label: 'Terlambat' },
            ]}
            placeholder="Semua Status"
          />
        </FilterField>
      </FilterDrawer>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left table-header font-medium text-gray-500 uppercase">
                  Kode
                </th>
                <th className="px-3 py-2 text-left table-header font-medium text-gray-500 uppercase">
                  Anggota
                </th>
                <th className="px-2 py-2 text-left table-header font-medium text-gray-500 uppercase">
                  Luas
                </th>
                <th className="px-2 py-2 text-right table-header font-medium text-gray-500 uppercase">
                  Tarif
                </th>
                <th className="px-2 py-2 text-right table-header font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-2 py-2 text-left table-header font-medium text-gray-500 uppercase">
                  Tempo
                </th>
                <th className="px-2 py-2 text-center table-header font-medium text-gray-500 uppercase">
                  Status
                </th>
                {canManagePnbp && (
                  <th className="px-2 py-2 text-center table-header font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pnbpList.length === 0 ? (
                <tr>
                  <td colSpan={canManagePnbp ? 8 : 7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <DollarSign size={48} className="mb-2 opacity-50" />
                      <p className="font-medium">Tidak ada data PNBP</p>
                      <p className="text-sm">Silakan generate tagihan terlebih dahulu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pnbpList.map((pnbp) => (
                  <tr key={pnbp.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 table-cell font-medium text-gray-900">
                      {pnbp.kodeLahan || '-'}
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="table-cell font-medium text-gray-900">{pnbp.anggotaNama}</div>
                        <div className="text-xs text-gray-500">{pnbp.anggotaNomor}</div>
                      </div>
                    </td>
                    <td className="px-2 py-2 table-cell text-gray-900">
                      {pnbp.luasLahan}
                    </td>
                    <td className="px-2 py-2 table-cell text-gray-900 text-right">
                      {formatCurrency(pnbp.tarifPerHa)}
                    </td>
                    <td className="px-2 py-2 table-cell font-semibold text-gray-900 text-right">
                      {formatCurrency(pnbp.totalTagihan)}
                    </td>
                    <td className="px-2 py-2 table-cell text-gray-900">
                      {new Date(pnbp.tanggalJatuhTempo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {getStatusBadge(pnbp.statusPembayaran)}
                    </td>
                    {canManagePnbp && (
                      <td className="px-2 py-2">
                        <div className="flex flex-col gap-1">
                          {pnbp.statusPembayaran !== 'lunas' && (
                            <button
                              onClick={() => handlePayment(pnbp)}
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-white text-sm rounded-md font-medium transition-colors"
                              style={{ backgroundColor: '#059669' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            >
                              Bayar
                            </button>
                          )}
                          {pnbp.statusPembayaran === 'lunas' && (
                            <button
                              onClick={() => handlePrintBukti(pnbp)}
                              className="px-3 py-1.5 text-white text-sm rounded-md font-medium flex items-center justify-center gap-1.5 transition-colors"
                              style={{ backgroundColor: '#059669' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                              title="Print Bukti Pembayaran"
                            >
                              <Printer size={16} />
                              <span>Print Bukti</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPaymentModal && selectedPnbp && (
        <PnbpPaymentModal
          pnbp={selectedPnbp}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {showGenerateModal && (
        <PnbpGenerateModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={handleGenerateSuccess}
        />
      )}

      {showPrintPreview && selectedPnbp && (
        <PnbpPrintPreview
          pnbp={selectedPnbp}
          onClose={() => {
            setShowPrintPreview(false);
            setSelectedPnbp(null);
          }}
        />
      )}
      </div>
    </MainLayout>
  );
}
