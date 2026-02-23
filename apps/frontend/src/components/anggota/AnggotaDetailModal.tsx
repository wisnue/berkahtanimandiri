import { X } from 'lucide-react';
import { Anggota } from '../../services/anggota.service';

interface AnggotaDetailModalProps {
  anggota: Anggota;
  onClose: () => void;
}

export function AnggotaDetailModal({ anggota, onClose }: AnggotaDetailModalProps) {
  const formatDate = (date: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detail Anggota</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Foto & Identitas */}
          <div className="flex gap-6 mb-6">
            {anggota.fotoAnggota ? (
              <div className="flex-shrink-0">
                <img 
                  src={anggota.fotoAnggota} 
                  alt={anggota.namaLengkap}
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <span className="text-4xl text-gray-400">👤</span>
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{anggota.namaLengkap}</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-32 text-sm text-gray-600">Nomor Anggota:</span>
                  <span className="text-sm font-medium text-gray-900">{anggota.noAnggota || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    anggota.statusAnggota === 'aktif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {anggota.statusAnggota}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Data Pribadi
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">NIK</label>
                <p className="text-sm font-medium text-gray-900">{anggota.nik || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Jenis Kelamin</label>
                <p className="text-sm font-medium text-gray-900">{anggota.jenisKelamin || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tempat Lahir</label>
                <p className="text-sm font-medium text-gray-900">{anggota.tempatLahir || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tanggal Lahir</label>
                <p className="text-sm font-medium text-gray-900">{formatDate(anggota.tanggalLahir)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Pendidikan</label>
                <p className="text-sm font-medium text-gray-900">{anggota.pendidikanTerakhir || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Pekerjaan</label>
                <p className="text-sm font-medium text-gray-900">{anggota.pekerjaan || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Telepon</label>
                <p className="text-sm font-medium text-gray-900">{anggota.noTelepon || '-'}</p>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Alamat
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Alamat</label>
                <p className="text-sm font-medium text-gray-900">{anggota.alamatLengkap || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Desa/Kelurahan</label>
                <p className="text-sm font-medium text-gray-900">{anggota.desa || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Kecamatan</label>
                <p className="text-sm font-medium text-gray-900">{anggota.kecamatan || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Kabupaten/Kota</label>
                <p className="text-sm font-medium text-gray-900">{anggota.kabupaten || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Provinsi</label>
                <p className="text-sm font-medium text-gray-900">{anggota.provinsi || '-'}</p>
              </div>
            </div>
          </div>

          {/* Informasi Keanggotaan */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Informasi Keanggotaan
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Tanggal Bergabung</label>
                <p className="text-sm font-medium text-gray-900">{formatDate(anggota.tanggalBergabung)}</p>
              </div>
              {anggota.keterangan && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Keterangan</label>
                  <p className="text-sm font-medium text-gray-900">{anggota.keterangan}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
