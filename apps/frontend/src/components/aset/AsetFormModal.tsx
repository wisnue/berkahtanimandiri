import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Aset } from '../../services/aset.service';

interface AsetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  aset?: Aset;
}

export default function AsetFormModal({
  isOpen,
  onClose,
  onSubmit,
  aset,
}: AsetFormModalProps) {
  const [formData, setFormData] = useState({
    namaAset: '',
    kategoriAset: '',
    jenisAset: '',
    merkTipe: '',
    nomorSeri: '',
    tahunPerolehan: new Date().getFullYear(),
    tanggalPerolehan: '',
    sumberPerolehan: '',
    nilaiPerolehan: '',
    nilaiSekarang: '',
    kondisiAset: 'baik' as 'baik' | 'rusak' | 'hilang',
    lokasiAset: '',
    penanggungJawab: '',
    masaManfaat: '',
    keterangan: '',
  });

  useEffect(() => {
    if (aset) {
      setFormData({
        namaAset: aset.namaAset,
        kategoriAset: aset.kategoriAset,
        jenisAset: aset.jenisAset || '',
        merkTipe: aset.merkTipe || '',
        nomorSeri: aset.nomorSeri || '',
        tahunPerolehan: aset.tahunPerolehan,
        tanggalPerolehan: aset.tanggalPerolehan 
          ? new Date(aset.tanggalPerolehan).toISOString().split('T')[0]
          : '',
        sumberPerolehan: aset.sumberPerolehan || '',
        nilaiPerolehan: aset.nilaiPerolehan,
        nilaiSekarang: aset.nilaiSekarang || '',
        kondisiAset: aset.kondisiAset,
        lokasiAset: aset.lokasiAset || '',
        penanggungJawab: aset.penanggungJawab || '',
        masaManfaat: aset.masaManfaat?.toString() || '',
        keterangan: aset.keterangan || '',
      });
    } else {
      setFormData({
        namaAset: '',
        kategoriAset: '',
        jenisAset: '',
        merkTipe: '',
        nomorSeri: '',
        tahunPerolehan: new Date().getFullYear(),
        tanggalPerolehan: new Date().toISOString().split('T')[0],
        sumberPerolehan: '',
        nilaiPerolehan: '',
        nilaiSekarang: '',
        kondisiAset: 'baik',
        lokasiAset: '',
        penanggungJawab: '',
        masaManfaat: '',
        keterangan: '',
      });
    }
  }, [aset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      nilaiPerolehan: parseFloat(formData.nilaiPerolehan),
      nilaiSekarang: formData.nilaiSekarang ? parseFloat(formData.nilaiSekarang) : undefined,
      masaManfaat: formData.masaManfaat ? parseInt(formData.masaManfaat) : undefined,
    });
  };

  if (!isOpen) return null;

  const kategoriOptions = [
    'Kendaraan',
    'Peralatan',
    'Elektronik',
    'Furniture',
    'Bangunan',
    'Tanah',
    'Mesin',
    'Alat Pertanian',
    'Lainnya',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {aset ? 'Edit Aset' : 'Tambah Aset'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Aset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaAset}
                  onChange={(e) => setFormData({ ...formData, namaAset: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Mobil Pickup Toyota Hilux"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Aset <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kategoriAset}
                  onChange={(e) => setFormData({ ...formData, kategoriAset: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriOptions.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Aset
                </label>
                <input
                  type="text"
                  value={formData.jenisAset}
                  onChange={(e) => setFormData({ ...formData, jenisAset: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Kendaraan Operasional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merk/Tipe
                </label>
                <input
                  type="text"
                  value={formData.merkTipe}
                  onChange={(e) => setFormData({ ...formData, merkTipe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Toyota Hilux 2.4 D-Cab"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Seri/BPKB/Identitas
                </label>
                <input
                  type="text"
                  value={formData.nomorSeri}
                  onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nomor unik aset"
                />
              </div>
            </div>
          </div>

          {/* Acquisition Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Perolehan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Perolehan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.tahunPerolehan}
                  onChange={(e) =>
                    setFormData({ ...formData, tahunPerolehan: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Perolehan
                </label>
                <input
                  type="date"
                  value={formData.tanggalPerolehan}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggalPerolehan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sumber Perolehan
                </label>
                <input
                  type="text"
                  value={formData.sumberPerolehan}
                  onChange={(e) =>
                    setFormData({ ...formData, sumberPerolehan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Hibah Pemerintah, Pembelian, Swadaya"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Masa Manfaat (tahun)
                </label>
                <input
                  type="number"
                  value={formData.masaManfaat}
                  onChange={(e) => setFormData({ ...formData, masaManfaat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Estimasi masa pakai"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nilai Perolehan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.nilaiPerolehan}
                  onChange={(e) =>
                    setFormData({ ...formData, nilaiPerolehan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Harga saat perolehan"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nilai Sekarang (Rp)
                </label>
                <input
                  type="number"
                  value={formData.nilaiSekarang}
                  onChange={(e) =>
                    setFormData({ ...formData, nilaiSekarang: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nilai setelah penyusutan"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* Status & Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Lokasi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kondisi Aset <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kondisiAset}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiAset: e.target.value as 'baik' | 'rusak' | 'hilang',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="baik">Baik</option>
                  <option value="rusak">Rusak</option>
                  <option value="hilang">Hilang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Aset
                </label>
                <input
                  type="text"
                  value={formData.lokasiAset}
                  onChange={(e) => setFormData({ ...formData, lokasiAset: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Kantor KTH, Lahan A, Gudang"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.penanggungJawab}
                  onChange={(e) =>
                    setFormData({ ...formData, penanggungJawab: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama anggota yang bertanggung jawab"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Keterangan tambahan tentang aset..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md transition-colors"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              {aset ? 'Simpan Perubahan' : 'Tambah Aset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
