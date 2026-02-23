import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { anggotaService, type Anggota } from '@/services/anggota.service';
import { showToast } from '@/lib/toast';

interface DeleteConfirmModalProps {
  anggota: Anggota;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmModal({ anggota, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await anggotaService.delete(anggota.id);
      
      if (response.success) {
        showToast.success('Data anggota berhasil dihapus!');
        onSuccess();
      } else {
        showToast.error(response.message || 'Gagal menghapus data anggota');
        setError(response.message);
      }
    } catch (err) {
      const errorMsg = 'Terjadi kesalahan saat menghapus data';
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Konfirmasi Hapus"
      icon={
        <div className="bg-red-100 p-2 rounded-lg">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
      }
      size="md"
      footer={
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </ModalFooter>
      }
    >
      <ModalBody>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-700">
          Apakah Anda yakin ingin menghapus anggota berikut?
        </p>

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">No. Anggota:</span>
            <span className="text-sm font-semibold text-gray-900">{anggota.noAnggota}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Nama:</span>
            <span className="text-sm font-semibold text-gray-900">{anggota.namaLengkap}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">NIK:</span>
            <span className="text-sm font-semibold text-gray-900">{anggota.nik}</span>
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Peringatan:</strong> Data yang sudah dihapus tidak dapat dikembalikan.
            Pastikan data lahan dan transaksi terkait sudah ditangani terlebih dahulu.
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
}
