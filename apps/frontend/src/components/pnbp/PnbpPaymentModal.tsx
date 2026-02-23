import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import pnbpService, { Pnbp } from '../../services/pnbp.service';
import { showToast } from '@/lib/toast';

interface PnbpPaymentModalProps {
  pnbp: Pnbp;
  onClose: () => void;
  onSuccess: () => void;
}

export function PnbpPaymentModal({ pnbp, onClose, onSuccess }: PnbpPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    statusPembayaran: 'lunas',
    tanggalBayar: new Date().toISOString().split('T')[0],
    jumlahDibayar: pnbp.totalTagihan,
    metodePembayaran: 'tunai',
    keterangan: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await pnbpService.updatePayment(pnbp.id, formData);
      showToast.success('Pembayaran berhasil disimpan!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update payment:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal mengupdate pembayaran';
      showToast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Input Pembayaran PNBP</h2>
              <p className="text-sm text-gray-600">Kode Lahan: {pnbp.kodeLahan}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Info Tagihan */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Anggota</p>
                <p className="font-medium text-gray-900">{pnbp.anggotaNama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Luas Lahan</p>
                <p className="font-medium text-gray-900">{pnbp.luasLahan} Ha</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tarif per Ha</p>
                <p className="font-medium text-gray-900">{formatCurrency(pnbp.tarifPerHa)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tagihan</p>
                <p className="font-bold text-lg text-green-600">{formatCurrency(pnbp.totalTagihan)}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Pembayaran <span className="text-red-500">*</span>
              </label>
              <select
                name="statusPembayaran"
                value={formData.statusPembayaran}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="lunas">Lunas</option>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="terlambat">Terlambat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Bayar <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggalBayar"
                value={formData.tanggalBayar}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Dibayar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="jumlahDibayar"
                value={formData.jumlahDibayar}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran <span className="text-red-500">*</span>
              </label>
              <select
                name="metodePembayaran"
                value={formData.metodePembayaran}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer Bank</option>
                <option value="qris">QRIS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 mt-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border text-gray-700 rounded-lg transition-colors font-medium"
              style={{ borderColor: '#D1D5DB', backgroundColor: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              style={{ backgroundColor: '#059669' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
            >
              {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
