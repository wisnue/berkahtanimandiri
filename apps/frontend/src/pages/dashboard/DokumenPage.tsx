import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Upload, Filter, AlertCircle, TrendingUp, X, Search } from 'lucide-react';
import { FilterDrawer, FilterField, FilterSelect, FilterInput, FilterDivider } from '@/components/ui/FilterDrawer';
import dokumenService, { Dokumen, DokumenStatistics } from '../../services/dokumen.service';
import { authService } from '../../services/auth.service';
import { exportToExcel, formatDate } from '../../lib/export';
import { Pagination } from '@/components/ui/Pagination';
import { MainLayout } from '../../components/layout/MainLayout';

export default function DokumenPage() {
  const [user, setUser] = useState<any>(null);
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [statistics, setStatistics] = useState<DokumenStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [jenisFilter, setJenisFilter] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [selectedYear, jenisFilter, kategoriFilter, statusFilter, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, dokumenRes] = await Promise.all([
        authService.getCurrentUser(),
        dokumenService.getStatistics(selectedYear),
        dokumenService.getAll({
          page: currentPage,
          limit: itemsPerPage,
          tahun: selectedYear,
          jenis: jenisFilter,
          kategori: kategoriFilter,
          status: statusFilter,
          search: searchQuery,
        }),
      ]);

      if (userRes.success) setUser(userRes.data);
      if (statsRes.success) setStatistics(statsRes.data as DokumenStatistics);
      if (dokumenRes.success) setDokumenList(dokumenRes.data as Dokumen[]);
    } catch (error) {
      console.error('Failed to load dokumen data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (size: string | null | undefined) => {
    if (!size) return '-';
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      aktif: 'bg-green-100 text-green-800',
      nonaktif: 'bg-gray-100 text-gray-800',
      kadaluarsa: 'bg-red-100 text-red-800',
    };
    const labels = {
      aktif: 'Aktif',
      nonaktif: 'Nonaktif',
      kadaluarsa: 'Kadaluarsa',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const isExpiringSoon = (tanggalKadaluarsa: Date | string | null | undefined) => {
    if (!tanggalKadaluarsa) return false;
    const expiry = new Date(tanggalKadaluarsa);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry > today && expiry <= thirtyDaysFromNow;
  };

  const canManageDokumen = user?.role === 'ketua' || user?.role === 'sekretaris';

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await dokumenService.create(formData);

      if (response.success) {
        alert('Dokumen berhasil diupload!');
        setShowUploadModal(false);
        loadData(); // Reload data
        (e.target as HTMLFormElement).reset();
      } else {
        alert('Gagal upload dokumen: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload dokumen');
    } finally {
      setUploading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = dokumenList.map((item) => ({
      kodeDokumen: item.kodeDokumen,
      judulDokumen: item.judulDokumen,
      jenisDokumen: item.jenisDokumen,
      kategoriDokumen: item.kategoriDokumen || '-',
      nomorDokumen: item.nomorDokumen || '-',
      tanggalDokumen: formatDate(item.tanggalDokumen),
      fileName: item.fileName || '-',
      fileSize: formatFileSize(item.fileSize),
      uploaderNama: item.uploaderNama || '-',
      statusDokumen: item.statusDokumen,
      keterangan: item.keterangan || '-',
    }));

    exportToExcel(
      exportData,
      [
        { header: 'Kode Dokumen', key: 'kodeDokumen', width: 18 },
        { header: 'Judul Dokumen', key: 'judulDokumen', width: 30 },
        { header: 'Jenis', key: 'jenisDokumen', width: 20 },
        { header: 'Kategori', key: 'kategoriDokumen', width: 20 },
        { header: 'Nomor Dokumen', key: 'nomorDokumen', width: 18 },
        { header: 'Tanggal', key: 'tanggalDokumen', width: 15 },
        { header: 'Nama File', key: 'fileName', width: 25 },
        { header: 'Ukuran File', key: 'fileSize', width: 12 },
        { header: 'Uploader', key: 'uploaderNama', width: 20 },
        { header: 'Status', key: 'statusDokumen', width: 12 },
        { header: 'Keterangan', key: 'keterangan', width: 30 },
      ],
      'Laporan_Dokumen_KTH'
    );
  };

  const handleResetFilter = () => {
    setSelectedYear(new Date().getFullYear());
    setJenisFilter('');
    setKategoriFilter('');
    setStatusFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data dokumen...</p>
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
          <h1 className="text-lg font-bold text-gray-900">Manajemen Dokumen</h1>
          <p className="text-sm text-gray-600 mt-0.5">Kelola dokumen dan arsip KTH Berkah Tani Mandiri</p>
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
            {(jenisFilter || kategoriFilter || statusFilter) && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                {[jenisFilter, kategoriFilter, statusFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          {canManageDokumen && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md transition-colors text-xs"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              <Upload size={16} />
              Upload Dokumen
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">TOTAL DOKUMEN</p>
              <p className="text-xs text-gray-600">Tahun {selectedYear}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.totalDokumen || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-blue-600" />
              <span>Total keseluruhan</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">DOKUMEN AKTIF</p>
              <p className="text-xs text-gray-600">Sedang berlaku</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.status?.aktif || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-green-600" />
              <span>Masih berlaku</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">SEGERA KADALUARSA</p>
              <p className="text-xs text-gray-600">Dalam 30 hari</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertCircle className="text-yellow-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.expiringSoon || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <AlertCircle size={14} className="text-yellow-600" />
              <span>Perlu diperbaharui</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 transition-all hover:shadow-md flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 tracking-wide mb-1">KADALUARSA</p>
              <p className="text-xs text-gray-600">Perlu pembaharuan</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FileText className="text-red-600" size={20} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="card-number text-gray-900 mb-1">{statistics?.status?.kadaluarsa || 0}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendingUp size={14} className="text-red-600" />
              <span>Expired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
        title="Filter Dokumen"
      >
          <FilterField label="Pencarian">
            <FilterInput
              type="search"
              placeholder="Cari judul, kode, atau nomor dokumen..."
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

        <FilterDivider label="Kriteria" />

        <FilterField label="Jenis Dokumen">
          <FilterSelect
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            options={[
              { value: 'SK', label: 'Surat Keputusan' },
              { value: 'Surat', label: 'Surat' },
              { value: 'Laporan', label: 'Laporan' },
              { value: 'Notulen', label: 'Notulen' },
              { value: 'Proposal', label: 'Proposal' },
              { value: 'MOU', label: 'MOU/PKS' },
              { value: 'Lainnya', label: 'Lainnya' },
            ]}
            placeholder="Semua Jenis"
          />
        </FilterField>

        <FilterField label="Kategori">
          <FilterSelect
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            options={[
              { value: 'Administrasi', label: 'Administrasi' },
              { value: 'Keuangan', label: 'Keuangan' },
              { value: 'Keanggotaan', label: 'Keanggotaan' },
              { value: 'Lahan', label: 'Lahan' },
              { value: 'Perizinan', label: 'Perizinan' },
              { value: 'Kerjasama', label: 'Kerjasama' },
            ]}
            placeholder="Semua Kategori"
          />
        </FilterField>

        <FilterField label="Status">
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'aktif', label: 'Aktif' },
              { value: 'nonaktif', label: 'Nonaktif' },
              { value: 'kadaluarsa', label: 'Kadaluarsa' },
            ]}
            placeholder="Semua Status"
          />
        </FilterField>
      </FilterDrawer>

      {/* Dokumen Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode / Nomor
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul Dokumen
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
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
              {dokumenList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Belum ada dokumen</p>
                      <p className="text-sm">Silakan upload dokumen baru</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dokumenList.map((dokumen) => (
                  <tr key={dokumen.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dokumen.kodeDokumen}</div>
                      {dokumen.nomorDokumen && (
                        <div className="text-sm text-gray-500">{dokumen.nomorDokumen}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900">{dokumen.judulDokumen}</div>
                      {dokumen.uploaderNama && (
                        <div className="text-sm text-gray-500">Upload: {dokumen.uploaderNama}</div>
                      )}
                      {isExpiringSoon(dokumen.tanggalKadaluarsa) && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                          <AlertCircle size={12} />
                          Segera kadaluarsa
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dokumen.jenisDokumen}</div>
                      {dokumen.kategoriDokumen && (
                        <div className="text-sm text-gray-500">{dokumen.kategoriDokumen}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(dokumen.tanggalDokumen)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dokumen.fileName}</div>
                      <div className="text-sm text-gray-500">{formatFileSize(dokumen.fileSize)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusBadge(dokumen.statusDokumen)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <div className="flex gap-2">
                        <button
                          onClick={() => alert('Download akan ditambahkan')}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          <Download size={18} />
                        </button>
                        {canManageDokumen && (
                          <>
                            <button
                              onClick={() => alert('Edit modal akan ditambahkan')}
                              className="text-primary hover:text-primary/80 font-medium"
                            >
                              Edit
                            </button>
                            {user?.role === 'ketua' && (
                              <button
                                onClick={() => alert('Delete akan ditambahkan')}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Hapus
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upload Dokumen Baru</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Judul Dokumen */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Dokumen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judulDokumen"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Masukkan judul dokumen"
                  />
                </div>

                {/* Jenis Dokumen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Dokumen <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jenisDokumen"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="SK">Surat Keputusan</option>
                    <option value="Surat">Surat</option>
                    <option value="Laporan">Laporan</option>
                    <option value="Notulen">Notulen</option>
                    <option value="Proposal">Proposal</option>
                    <option value="MOU">MOU/PKS</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Kategori Dokumen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Dokumen
                  </label>
                  <select
                    name="kategoriDokumen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Internal">Internal</option>
                    <option value="Eksternal">Eksternal</option>
                    <option value="Legal">Legal</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Teknis">Teknis</option>
                  </select>
                </div>

                {/* Nomor Dokumen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Dokumen
                  </label>
                  <input
                    type="text"
                    name="nomorDokumen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Contoh: 001/SK/KTH/2026"
                  />
                </div>

                {/* Tanggal Dokumen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Dokumen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggalDokumen"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Tanggal Kadaluarsa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Kadaluarsa
                  </label>
                  <input
                    type="date"
                    name="tanggalKadaluarsa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Status Dokumen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Dokumen <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="statusDokumen"
                    required
                    defaultValue="aktif"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                {/* File Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="file"
                    required
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: PDF, Word, Excel, atau gambar (Max 10MB)
                  </p>
                </div>

                {/* Keterangan */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Catatan atau keterangan tambahan (opsional)"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Dokumen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}
