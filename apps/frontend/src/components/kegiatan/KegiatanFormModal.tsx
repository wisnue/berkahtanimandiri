import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Kegiatan, CreateKegiatanRequest } from '../../services/kegiatan.service';
import { anggotaService, Anggota } from '../../services/anggota.service';
import { lahanService, LahanKhdpk } from '../../services/lahan.service';

interface KegiatanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateKegiatanRequest) => Promise<void>;
  kegiatan?: Kegiatan;
  mode: 'create' | 'edit';
}

export function KegiatanFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  kegiatan,
  mode 
}: KegiatanFormModalProps) {
  const [formData, setFormData] = useState<CreateKegiatanRequest>({
    namaKegiatan: '',
    jenisKegiatan: '',
    tanggalMulai: '',
  });
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [lahanList, setLahanList] = useState<LahanKhdpk[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      if (mode === 'edit' && kegiatan) {
        const formatDate = (date: Date | string | null | undefined) => {
          if (!date) return '';
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        };

        setFormData({
          namaKegiatan: kegiatan.namaKegiatan,
          jenisKegiatan: kegiatan.jenisKegiatan,
          tanggalMulai: formatDate(kegiatan.tanggalMulai),
          tanggalSelesai: formatDate(kegiatan.tanggalSelesai),
          lokasiKegiatan: kegiatan.lokasiKegiatan || '',
          lahanId: kegiatan.lahanId || '',
          penanggungJawab: kegiatan.penanggungJawab || '',
          jumlahPeserta: kegiatan.jumlahPeserta || '',
          targetProduksi: kegiatan.targetProduksi ? parseFloat(kegiatan.targetProduksi) : undefined,
          realisasiProduksi: kegiatan.realisasiProduksi ? parseFloat(kegiatan.realisasiProduksi) : undefined,
          satuanProduksi: kegiatan.satuanProduksi || '',
          biayaKegiatan: kegiatan.biayaKegiatan ? parseFloat(kegiatan.biayaKegiatan) : undefined,
          sumberDana: kegiatan.sumberDana || '',
          statusKegiatan: kegiatan.statusKegiatan,
          hasilKegiatan: kegiatan.hasilKegiatan || '',
          kendala: kegiatan.kendala || '',
          dokumentasiFoto: kegiatan.dokumentasiFoto || '',
          laporanKegiatan: kegiatan.laporanKegiatan || '',
          keterangan: kegiatan.keterangan || '',
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, kegiatan]);

  const loadDropdownData = async () => {
    try {
      const [anggotaRes, lahanRes] = await Promise.all([
        anggotaService.getAll({ limit: 1000 }),
        lahanService.getAll({ limit: 1000 }),
      ]);
      if (anggotaRes.success) setAnggotaList(anggotaRes.data as Anggota[]);
      if (lahanRes.success) setLahanList(lahanRes.data as LahanKhdpk[]);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      namaKegiatan: '',
      jenisKegiatan: '',
      tanggalMulai: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit kegiatan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Tambah Kegiatan Baru' : 'Edit Kegiatan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaKegiatan}
                  onChange={(e) => setFormData({ ...formData, namaKegiatan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Rapat Anggota Bulanan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kegiatan <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.jenisKegiatan}
                  onChange={(e) => setFormData({ ...formData, jenisKegiatan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Jenis</option>
                  <option value="Rapat">Rapat</option>
                  <option value="Pelatihan">Pelatihan</option>
                  <option value="Penanaman">Penanaman</option>
                  <option value="Panen">Panen</option>
                  <option value="Pemeliharaan">Pemeliharaan</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.statusKegiatan || 'rencana'}
                  onChange={(e) => setFormData({ ...formData, statusKegiatan: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rencana">Rencana</option>
                  <option value="berlangsung">Berlangsung</option>
                  <option value="selesai">Selesai</option>
                  <option value="batal">Batal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Schedule & Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Jadwal & Lokasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalMulai}
                  onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={formData.tanggalSelesai || ''}
                  onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Kegiatan
                </label>
                <input
                  type="text"
                  value={formData.lokasiKegiatan || ''}
                  onChange={(e) => setFormData({ ...formData, lokasiKegiatan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Kantor KTH"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lahan KHDPK (Opsional)
                </label>
                <select
                  value={formData.lahanId || ''}
                  onChange={(e) => setFormData({ ...formData, lahanId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Lahan</option>
                  {lahanList.map((lahan) => (
                    <option key={lahan.id} value={lahan.id}>
                      {lahan.kodeLahan} - {lahan.jenisTanaman}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: People */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Peserta & Penanggung Jawab
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penanggung Jawab
                </label>
                <select
                  value={formData.penanggungJawab || ''}
                  onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih Anggota</option>
                  {anggotaList.map((anggota) => (
                    <option key={anggota.id} value={anggota.id}>
                      {anggota.namaLengkap}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Peserta
                </label>
                <input
                  type="text"
                  value={formData.jumlahPeserta || ''}
                  onChange={(e) => setFormData({ ...formData, jumlahPeserta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Production (for relevant activities) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Target & Realisasi Produksi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Produksi
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetProduksi || ''}
                  onChange={(e) => setFormData({ ...formData, targetProduksi: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Realisasi Produksi
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.realisasiProduksi || ''}
                  onChange={(e) => setFormData({ ...formData, realisasiProduksi: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="95"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  value={formData.satuanProduksi || ''}
                  onChange={(e) => setFormData({ ...formData, satuanProduksi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="kg"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Anggaran
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biaya Kegiatan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.biayaKegiatan || ''}
                  onChange={(e) => setFormData({ ...formData, biayaKegiatan: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sumber Dana
                </label>
                <input
                  type="text"
                  value={formData.sumberDana || ''}
                  onChange={(e) => setFormData({ ...formData, sumberDana: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Kas KTH, APBD, dll"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Results & Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Hasil & Catatan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasil Kegiatan
                </label>
                <textarea
                  rows={3}
                  value={formData.hasilKegiatan || ''}
                  onChange={(e) => setFormData({ ...formData, hasilKegiatan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsikan hasil kegiatan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kendala
                </label>
                <textarea
                  rows={2}
                  value={formData.kendala || ''}
                  onChange={(e) => setFormData({ ...formData, kendala: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Kendala yang dihadapi (jika ada)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan || ''}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Keterangan tambahan..."
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
            >
              {loading ? 'Menyimpan...' : mode === 'create' ? 'Simpan' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
