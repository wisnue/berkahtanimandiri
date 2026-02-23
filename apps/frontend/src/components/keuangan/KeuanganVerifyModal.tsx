import { X, CheckCircle, XCircle } from 'lucide-react';
import type { Keuangan } from '../../services/keuangan.service';

interface KeuanganVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (id: string, status: 'verified' | 'rejected') => void;
  keuangan?: Keuangan;
}

export default function KeuanganVerifyModal({
  isOpen,
  onClose,
  onVerify,
  keuangan,
}: KeuanganVerifyModalProps) {
  if (!isOpen || !keuangan) return null;

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Verifikasi Transaksi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nomor Transaksi</span>
              <span className="font-semibold">{keuangan.nomorTransaksi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tanggal</span>
              <span className="font-semibold">{formatDate(keuangan.tanggalTransaksi)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Jenis</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  keuangan.jenisTransaksi === 'pemasukan'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {keuangan.jenisTransaksi === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Kategori</span>
              <span className="font-semibold">{keuangan.kategori}</span>
            </div>
            {keuangan.subKategori && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sub Kategori</span>
                <span className="font-semibold">{keuangan.subKategori}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">Jumlah</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(keuangan.jumlah)}
              </span>
            </div>
            {keuangan.sumberDana && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sumber Dana</span>
                <span className="font-semibold">{keuangan.sumberDana}</span>
              </div>
            )}
            {keuangan.tujuanPenggunaan && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tujuan</span>
                <span className="font-semibold">{keuangan.tujuanPenggunaan}</span>
              </div>
            )}
            {keuangan.keterangan && (
              <div>
                <span className="text-sm text-gray-600 block mb-1">Keterangan</span>
                <p className="text-sm">{keuangan.keterangan}</p>
              </div>
            )}
            {keuangan.dibuatOleh && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Dibuat Oleh</span>
                <span className="text-sm">{keuangan.dibuatOleh}</span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Pastikan semua informasi transaksi sudah benar sebelum melakukan verifikasi.
              Transaksi yang sudah diverifikasi tidak dapat diubah.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onVerify(keuangan.id, 'rejected');
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Tolak
          </button>
          <button
            onClick={() => {
              onVerify(keuangan.id, 'verified');
              onClose();
            }}
            className="px-4 py-2 text-white rounded-md transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#059669' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          >
            <CheckCircle className="w-4 h-4" />
            Verifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
