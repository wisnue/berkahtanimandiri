import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lahanService, type LahanKhdpk } from '@/services/lahan.service';
import { anggotaService, type Anggota } from '@/services/anggota.service';

interface LahanFormModalProps {
  mode: 'create' | 'edit';
  lahan: LahanKhdpk | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function LahanFormModal({ mode, lahan, onClose, onSuccess }: LahanFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [formData, setFormData] = useState({
    kodeLahan: '',
    anggotaId: '',
    nomorPetak: '',
    luasLahan: '',
    satuanLuas: 'Ha',
    jenisTanaman: '',
    lokasiLahan: '',
    koordinatLat: '',
    koordinatLong: '',
    statusLegalitas: 'proses',
    nomorSKKHDPK: '',
    tanggalSK: '',
    masaBerlakuSK: '',
    tahunMulaiKelola: new Date().getFullYear(),
    kondisiLahan: 'baik',
    keterangan: '',
  });

  useEffect(() => {
    loadAnggota();
    if (mode === 'edit' && lahan) {
      setFormData({
        kodeLahan: lahan.kodeLahan,
        anggotaId: lahan.anggotaId,
        nomorPetak: lahan.nomorPetak,
        luasLahan: lahan.luasLahan,
        satuanLuas: lahan.satuanLuas,
        jenisTanaman: lahan.jenisTanaman || '',
        lokasiLahan: lahan.lokasiLahan || '',
        koordinatLat: lahan.koordinatLat || '',
        koordinatLong: lahan.koordinatLong || '',
        statusLegalitas: lahan.statusLegalitas,
        nomorSKKHDPK: lahan.nomorSKKHDPK || '',
        tanggalSK: lahan.tanggalSK || '',
        masaBerlakuSK: lahan.masaBerlakuSK || '',
        tahunMulaiKelola: lahan.tahunMulaiKelola,
        kondisiLahan: lahan.kondisiLahan || 'baik',
        keterangan: lahan.keterangan || '',
      });
    }
  }, [mode, lahan]);

  const loadAnggota = async () => {
    const response = await anggotaService.getAll({ limit: 1000, status: 'aktif' });
    if (response.success) {
      setAnggotaList(response.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = mode === 'create'
        ? await lahanService.create(formData)
        : await lahanService.update(lahan!.id, formData);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-secondary-900">
            {mode === 'create' ? 'Tambah Lahan Baru' : 'Edit Data Lahan'}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Identitas Lahan */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Identitas Lahan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Kode Lahan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kodeLahan"
                    value={formData.kodeLahan}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="LHN-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Anggota <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="anggotaId"
                    value={formData.anggotaId}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="">Pilih Anggota</option>
                    {anggotaList.map(anggota => (
                      <option key={anggota.id} value={anggota.id}>
                        {anggota.noAnggota} - {anggota.namaLengkap}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nomor Petak <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nomorPetak"
                    value={formData.nomorPetak}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="P-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Luas Lahan <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="luasLahan"
                      value={formData.luasLahan}
                      onChange={handleChange}
                      required
                      className="input flex-1"
                      placeholder="2.5"
                    />
                    <select
                      name="satuanLuas"
                      value={formData.satuanLuas}
                      onChange={handleChange}
                      className="input w-24"
                    >
                      <option value="Ha">Ha</option>
                      <option value="m²">m²</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Jenis Tanaman
                  </label>
                  <input
                    type="text"
                    name="jenisTanaman"
                    value={formData.jenisTanaman}
                    onChange={handleChange}
                    className="input"
                    placeholder="Jati, Mahoni, dll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Tahun Mulai Kelola <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="tahunMulaiKelola"
                    value={formData.tahunMulaiKelola}
                    onChange={handleChange}
                    required
                    className="input"
                    min="1900"
                    max="2100"
                  />
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Lokasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Lokasi Lahan
                  </label>
                  <textarea
                    name="lokasiLahan"
                    value={formData.lokasiLahan}
                    onChange={handleChange}
                    rows={2}
                    className="input"
                    placeholder="Blok A, Petak 1, Desa ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Koordinat Latitude
                  </label>
                  <input
                    type="text"
                    name="koordinatLat"
                    value={formData.koordinatLat}
                    onChange={handleChange}
                    className="input"
                    placeholder="-6.123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Koordinat Longitude
                  </label>
                  <input
                    type="text"
                    name="koordinatLong"
                    value={formData.koordinatLong}
                    onChange={handleChange}
                    className="input"
                    placeholder="107.123456"
                  />
                </div>
              </div>
            </div>

            {/* Status & Legalitas */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Status & Legalitas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Status Legalitas <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="statusLegalitas"
                    value={formData.statusLegalitas}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="proses">Proses</option>
                    <option value="sah">Sah</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nomor SK KHDPK
                  </label>
                  <input
                    type="text"
                    name="nomorSKKHDPK"
                    value={formData.nomorSKKHDPK}
                    onChange={handleChange}
                    className="input"
                    placeholder="SK/123/2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Tanggal SK
                  </label>
                  <input
                    type="date"
                    name="tanggalSK"
                    value={formData.tanggalSK}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Masa Berlaku SK
                  </label>
                  <input
                    type="date"
                    name="masaBerlakuSK"
                    value={formData.masaBerlakuSK}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Kondisi Lahan
                  </label>
                  <select
                    name="kondisiLahan"
                    value={formData.kondisiLahan}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="baik">Baik</option>
                    <option value="sedang">Sedang</option>
                    <option value="buruk">Buruk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    rows={2}
                    className="input"
                    placeholder="Catatan tambahan"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-secondary-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Lahan' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
