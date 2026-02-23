import { useState } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';
import pnbpService from '../../services/pnbp.service';
import { showToast } from '@/lib/toast';

interface PnbpGenerateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PnbpGenerateModal({ onClose, onSuccess }: PnbpGenerateModalProps) {
  const [loading, setLoading] = useState(false);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const confirmed = window.confirm(
      `Yakin ingin generate tagihan PNBP untuk tahun ${tahun}?\n\nProses ini akan membuat tagihan PNBP untuk semua lahan dengan status sah.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const result = await pnbpService.generateForYear({ tahun });
      if (result.success && result.data) {
        showToast.success(`Berhasil generate ${result.data.count} tagihan PNBP untuk tahun ${tahun}!`);
        onSuccess();
      } else {
        showToast.error(result.message || 'Gagal generate tagihan PNBP');
      }
    } catch (error: any) {
      console.error('Failed to generate PNBP:', error);
      showToast.error(error.message || 'Gagal generate tagihan PNBP. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Calendar className="text-primary" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Generate Tagihan PNBP</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info */}
        <div className="p-6 bg-blue-50 border-l-4 border-blue-500 mx-6 mt-6">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Informasi:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Tagihan akan di-generate untuk semua lahan dengan status <strong>sah</strong></li>
                <li>Perhitungan: Luas Lahan × Tarif per Ha</li>
                <li>Jatuh tempo otomatis 3 bulan dari sekarang</li>
                <li>Hanya bisa generate 1 kali per tahun</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun PNBP <span className="text-red-500">*</span>
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              {loading ? 'Memproses...' : 'Generate Tagihan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
