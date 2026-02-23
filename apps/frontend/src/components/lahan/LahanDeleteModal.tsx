import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lahanService, type LahanKhdpk } from '@/services/lahan.service';

interface LahanDeleteModalProps {
  lahan: LahanKhdpk;
  onClose: () => void;
  onSuccess: () => void;
}

export function LahanDeleteModal({ lahan, onClose, onSuccess }: LahanDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await lahanService.delete(lahan.id);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-display font-bold text-secondary-900">
              Konfirmasi Hapus
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <p className="text-secondary-700 mb-4">
            Apakah Anda yakin ingin menghapus lahan berikut?
          </p>

          <div className="bg-secondary-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Kode Lahan:</span>
              <span className="text-sm font-semibold text-secondary-900">{lahan.kodeLahan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Nomor Petak:</span>
              <span className="text-sm font-semibold text-secondary-900">{lahan.nomorPetak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Luas:</span>
              <span className="text-sm font-semibold text-secondary-900">
                {lahan.luasLahan} {lahan.satuanLuas}
              </span>
            </div>
            {lahan.anggotaNama && (
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Anggota:</span>
                <span className="text-sm font-semibold text-secondary-900">{lahan.anggotaNama}</span>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Peringatan:</strong> Data yang sudah dihapus tidak dapat dikembalikan.
              Pastikan tidak ada transaksi PNBP terkait lahan ini.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </div>
      </div>
    </div>
  );
}
