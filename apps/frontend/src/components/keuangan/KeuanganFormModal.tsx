import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Keuangan } from '../../services/keuangan.service';

interface KeuanganFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  keuangan?: Keuangan;
  categories: string[];
}

export default function KeuanganFormModal({
  isOpen,
  onClose,
  onSubmit,
  keuangan,
  categories,
}: KeuanganFormModalProps) {
  const [formData, setFormData] = useState({
    tanggalTransaksi: '',
    jenisTransaksi: 'pemasukan' as 'pemasukan' | 'pengeluaran',
    kategori: '',
    subKategori: '',
    jumlah: '',
    sumberDana: '',
    tujuanPenggunaan: '',
    keterangan: '',
  });

  useEffect(() => {
    if (keuangan) {
      setFormData({
        tanggalTransaksi: new Date(keuangan.tanggalTransaksi).toISOString().split('T')[0],
        jenisTransaksi: keuangan.jenisTransaksi as 'pemasukan' | 'pengeluaran',
        kategori: keuangan.kategori,
        subKategori: keuangan.subKategori || '',
        jumlah: keuangan.jumlah.toString(),
        sumberDana: keuangan.sumberDana || '',
        tujuanPenggunaan: keuangan.tujuanPenggunaan || '',
        keterangan: keuangan.keterangan || '',
      });
    } else {
      setFormData({
        tanggalTransaksi: new Date().toISOString().split('T')[0],
        jenisTransaksi: 'pemasukan',
        kategori: '',
        subKategori: '',
        jumlah: '',
        sumberDana: '',
        tujuanPenggunaan: '',
        keterangan: '',
      });
    }
  }, [keuangan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      jumlah: parseFloat(formData.jumlah),
    });
  };

  if (!isOpen) return null;

  const commonCategories = [
    'Iuran Anggota',
    'PNBP',
    'Bantuan Pemerintah',
    'Donasi',
    'Operasional',
    'Konsumsi Rapat',
    'ATK',
    'Transport',
    'Pemeliharaan',
    'Lain-lain',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {keuangan ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Transaksi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalTransaksi}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalTransaksi: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Transaksi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jenisTransaksi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jenisTransaksi: e.target.value as 'pemasukan' | 'pengeluaran',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Kategori</option>
                {commonCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {categories
                  .filter((cat) => !commonCategories.includes(cat))
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Kategori
              </label>
              <input
                type="text"
                value={formData.subKategori}
                onChange={(e) =>
                  setFormData({ ...formData, subKategori: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Opsional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.jumlah}
              onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan jumlah"
              min="0"
              step="1000"
              required
            />
          </div>

          {formData.jenisTransaksi === 'pemasukan' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sumber Dana
              </label>
              <input
                type="text"
                value={formData.sumberDana}
                onChange={(e) =>
                  setFormData({ ...formData, sumberDana: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Anggota, Pemerintah, Donatur"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tujuan Penggunaan
              </label>
              <input
                type="text"
                value={formData.tujuanPenggunaan}
                onChange={(e) =>
                  setFormData({ ...formData, tujuanPenggunaan: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Untuk apa dana digunakan"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Keterangan tambahan (opsional)"
            />
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
              {keuangan ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
