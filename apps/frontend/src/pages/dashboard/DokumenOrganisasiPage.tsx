import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Eye,
  Trash2,
  Clock,
  Shield,
} from 'lucide-react';
import dokumenOrganisasiService, {
  DokumenOrganisasi,
  DokumenOrganisasiStatistics,
} from '@/services/dokumenOrganisasi.service';
import { authService } from '@/services/auth.service';

export default function DokumenOrganisasiPage() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<DokumenOrganisasi[]>([]);
  const [statistics, setStatistics] = useState<DokumenOrganisasiStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Upload form data
  const [uploadForm, setUploadForm] = useState({
    jenisDokumen: 'sk_pembentukan',
    judulDokumen: '',
    nomorDokumen: '',
    tanggalDokumen: '',
    tanggalBerlaku: '',
    tanggalKadaluarsa: '',
    penerbitDokumen: '',
    keterangan: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Filters
  const [jenisDokumen, setJenisDokumen] = useState('');
  const [statusDokumen, setStatusDokumen] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUser();
    loadData();
    loadStatistics();
  }, [currentPage, jenisDokumen, statusDokumen]);

  const loadUser = async () => {
    const res = await authService.getCurrentUser();
    if (res.success) setUser(res.data);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dokumenOrganisasiService.getAll({
        page: currentPage,
        limit: 10,
        search,
        jenisDokumen,
        statusDokumen,
      });
      if (res.success) {
        const data = res.data as any;
        setDocuments((data.data || data) as DokumenOrganisasi[]);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const res = await dokumenOrganisasiService.getStatistics();
      if (res.success) {
        setStatistics(res.data as DokumenOrganisasiStatistics);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleVerify = async (doc: DokumenOrganisasi) => {
    if (!confirm('Verifikasi dokumen ini?')) return;
    
    try {
      const res = await dokumenOrganisasiService.verify(doc.id);
      if (res.success) {
        alert('Dokumen berhasil diverifikasi');
        loadData();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.message || 'Gagal verifikasi dokumen');
    }
  };

  const handleReject = async (doc: DokumenOrganisasi) => {
    const catatan = prompt('Alasan penolakan:');
    if (!catatan) return;
    
    try {
      const res = await dokumenOrganisasiService.reject(doc.id, { catatanVerifikasi: catatan });
      if (res.success) {
        alert('Dokumen ditolak');
        loadData();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.message || 'Gagal tolak dokumen');
    }
  };

  const handleDelete = async (doc: DokumenOrganisasi) => {
    if (!confirm('Hapus dokumen ini?')) return;
    
    try {
      const res = await dokumenOrganisasiService.delete(doc.id);
      if (res.success) {
        alert('Dokumen berhasil dihapus');
        loadData();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.message || 'Gagal hapus dokumen');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      alert('Pilih file terlebih dahulu');
      return;
    }

    if (!uploadForm.judulDokumen.trim()) {
      alert('Judul dokumen wajib diisi');
      return;
    }

    setUploadLoading(true);
    try {
      const res = await dokumenOrganisasiService.create(uploadForm, uploadFile);
      if (res.success) {
        alert('Dokumen berhasil diupload');
        setShowUploadModal(false);
        resetUploadForm();
        loadData();
        loadStatistics();
      } else {
        alert('Gagal upload dokumen');
      }
    } catch (error: any) {
      alert(error.message || 'Gagal upload dokumen');
    } finally {
      setUploadLoading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      jenisDokumen: 'sk_pembentukan',
      judulDokumen: '',
      nomorDokumen: '',
      tanggalDokumen: '',
      tanggalBerlaku: '',
      tanggalKadaluarsa: '',
      penerbitDokumen: '',
      keterangan: '',
    });
    setUploadFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        alert('Hanya file PDF yang diperbolehkan');
        e.target.value = '';
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran file maksimal 10MB');
        e.target.value = '';
        return;
      }
      setUploadFile(file);
    }
  };

  const getJenisDokumenLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      sk_pembentukan: 'SK Pembentukan KTH',
      ad_art: 'AD/ART',
      sk_pengurus: 'SK Pengurus',
      sk_khdpk: 'SK KHDPK',
      sk_perhutanan_sosial: 'SK Perhutanan Sosial',
      rekomendasi_dinas: 'Rekomendasi Dinas',
      nib: 'NIB',
      npwp_organisasi: 'NPWP Organisasi',
      sertifikat_lahan: 'Sertifikat Lahan',
      mou_kerjasama: 'MoU/PKS',
      lainnya: 'Lainnya',
    };
    return labels[jenis] || jenis;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      aktif: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      kadaluarsa: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      pending_verifikasi: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      ditolak: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      diganti: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertTriangle },
    };
    const badge = badges[status] || badges.aktif;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpiringSoon = (tanggalKadaluarsa?: string) => {
    if (!tanggalKadaluarsa) return false;
    const expiry = new Date(tanggalKadaluarsa);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const canVerify = user?.role === 'admin' || user?.role === 'ketua';
  const canDelete = user?.role === 'admin';
  const canUpload = user?.role === 'admin' || user?.role === 'ketua' || user?.role === 'sekretaris';

  return (
    <MainLayout user={user ? { fullName: user.namaLengkap, role: user.role } : undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Dokumen Organisasi
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola dokumen legal dan organisasi KTH
            </p>
          </div>
          {canUpload && (
            <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Upload size={16} className="mr-2" />
              Upload Dokumen
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Dokumen</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalDokumen}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aktif</p>
                    <p className="text-2xl font-bold text-green-600">{statistics.aktif}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Verifikasi</p>
                    <p className="text-2xl font-bold text-yellow-600">{statistics.pendingVerifikasi}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kadaluarsa</p>
                    <p className="text-2xl font-bold text-red-600">{statistics.kadaluarsa}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Dokumen
                </label>
                <select
                  value={jenisDokumen}
                  onChange={(e) => setJenisDokumen(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Jenis</option>
                  <option value="sk_pembentukan">SK Pembentukan KTH</option>
                  <option value="ad_art">AD/ART</option>
                  <option value="sk_pengurus">SK Pengurus</option>
                  <option value="sk_khdpk">SK KHDPK</option>
                  <option value="sk_perhutanan_sosial">SK Perhutanan Sosial</option>
                  <option value="rekomendasi_dinas">Rekomendasi Dinas</option>
                  <option value="nib">NIB</option>
                  <option value="npwp_organisasi">NPWP Organisasi</option>
                  <option value="sertifikat_lahan">Sertifikat Lahan</option>
                  <option value="mou_kerjasama">MoU/PKS</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusDokumen}
                  onChange={(e) => setStatusDokumen(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="pending_verifikasi">Pending Verifikasi</option>
                  <option value="kadaluarsa">Kadaluarsa</option>
                  <option value="ditolak">Ditolak</option>
                  <option value="diganti">Diganti</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul atau nomor dokumen..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && loadData()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Dokumen Organisasi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada dokumen</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis Dokumen
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Judul & Nomor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className={isExpiringSoon(doc.tanggalKadaluarsa) ? 'bg-orange-50' : ''}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {getJenisDokumenLabel(doc.jenisDokumen)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.judulDokumen}</p>
                            {doc.nomorDokumen && (
                              <p className="text-xs text-gray-500">{doc.nomorDokumen}</p>
                            )}
                            {doc.penerbitDokumen && (
                              <p className="text-xs text-gray-500">Penerbit: {doc.penerbitDokumen}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">
                              <Calendar size={12} className="inline mr-1" />
                              {formatDate(doc.tanggalDokumen)}
                            </p>
                            {doc.tanggalKadaluarsa && (
                              <p className={`text-xs ${isExpiringSoon(doc.tanggalKadaluarsa) ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                                Berlaku s/d: {formatDate(doc.tanggalKadaluarsa)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(doc.statusDokumen)}
                          {doc.versi > 1 && (
                            <span className="ml-2 text-xs text-gray-500">v{doc.versi}</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/api/uploads/${doc.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="Lihat dokumen"
                            >
                              <Eye size={16} />
                            </a>
                            
                            {doc.statusDokumen === 'pending_verifikasi' && canVerify && (
                              <>
                                <button
                                  onClick={() => handleVerify(doc)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Verifikasi"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(doc)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Tolak"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(doc)}
                                className="text-red-600 hover:text-red-800"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Modal (placeholder - can be enhanced later) */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Dokumen Organisasi
                  </CardTitle>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {/* Jenis Dokumen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Dokumen <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={uploadForm.jenisDokumen}
                      onChange={(e) => setUploadForm({ ...uploadForm, jenisDokumen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="sk_pembentukan">SK Pembentukan KTH</option>
                      <option value="ad_art">AD/ART</option>
                      <option value="sk_pengurus">SK Pengurus</option>
                      <option value="sk_khdpk">SK KHDPK</option>
                      <option value="sk_perhutanan_sosial">SK Perhutanan Sosial</option>
                      <option value="rekomendasi_dinas">Rekomendasi Dinas</option>
                      <option value="nib">NIB</option>
                      <option value="npwp_organisasi">NPWP Organisasi</option>
                      <option value="sertifikat_lahan">Sertifikat Lahan</option>
                      <option value="mou_kerjasama">MoU/PKS</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Judul Dokumen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Dokumen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadForm.judulDokumen}
                      onChange={(e) => setUploadForm({ ...uploadForm, judulDokumen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: SK Pembentukan KTH Bumi Lestari"
                      required
                    />
                  </div>

                  {/* Nomor Dokumen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Dokumen
                    </label>
                    <input
                      type="text"
                      value={uploadForm.nomorDokumen}
                      onChange={(e) => setUploadForm({ ...uploadForm, nomorDokumen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: 123/SK/KTH-BTM/2024"
                    />
                  </div>

                  {/* Tanggal Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Dokumen
                      </label>
                      <input
                        type="date"
                        value={uploadForm.tanggalDokumen}
                        onChange={(e) => setUploadForm({ ...uploadForm, tanggalDokumen: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Berlaku
                      </label>
                      <input
                        type="date"
                        value={uploadForm.tanggalBerlaku}
                        onChange={(e) => setUploadForm({ ...uploadForm, tanggalBerlaku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Kadaluarsa
                      </label>
                      <input
                        type="date"
                        value={uploadForm.tanggalKadaluarsa}
                        onChange={(e) => setUploadForm({ ...uploadForm, tanggalKadaluarsa: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kosongkan jika permanen</p>
                    </div>
                  </div>

                  {/* Penerbit Dokumen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Penerbit Dokumen
                    </label>
                    <input
                      type="text"
                      value={uploadForm.penerbitDokumen}
                      onChange={(e) => setUploadForm({ ...uploadForm, penerbitDokumen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Dinas Kehutanan Provinsi Jawa Tengah"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Dokumen (PDF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: PDF, Maksimal 10MB
                    </p>
                    {uploadFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan
                    </label>
                    <textarea
                      value={uploadForm.keterangan}
                      onChange={(e) => setUploadForm({ ...uploadForm, keterangan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Catatan tambahan tentang dokumen ini..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false);
                        resetUploadForm();
                      }}
                      variant="outline"
                      disabled={uploadLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploadLoading || !uploadFile}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploadLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          Upload Dokumen
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
