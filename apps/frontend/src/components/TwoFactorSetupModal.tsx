import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Shield, Copy, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { setup2FA, verify2FA } from '@/services/twoFactor';
import { showToast } from '@/lib/toast';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function TwoFactorSetupModal({
  isOpen,
  onClose,
  onComplete,
}: TwoFactorSetupModalProps) {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await setup2FA();
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setStep(2);
      } else {
        setError(response.message || 'Gagal generate QR code');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otpToken.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await verify2FA(otpToken);
      if (response.success && response.data) {
        setBackupCodes(response.data.backupCodes);
        setStep(3);
        showToast.success('2FA berhasil diaktifkan!');
      } else {
        setError(response.message || 'Kode OTP salah');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    showToast.success('Secret berhasil disalin');
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\\n'));
    showToast.success('Backup codes berhasil disalin');
  };

  const handleDownloadBackupCodes = () => {
    const content = `KTH BTM - Two-Factor Authentication Backup Codes\\n\\nSimpan kode-kode ini di tempat yang aman.\\nSetiap kode hanya dapat digunakan sekali.\\n\\n${backupCodes.join('\\n')}\\n\\nDibuat pada: ${new Date().toLocaleString('id-ID')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kth-btm-backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast.success('Backup codes berhasil diunduh');
  };

  const handleComplete = () => {
    setStep(1);
    setQrCode('');
    setSecret('');
    setOtpToken('');
    setBackupCodes([]);
    setError('');
    onComplete();
  };

  const handleCloseModal = () => {
    if (step === 3) {
      handleComplete();
    } else {
      if (confirm('Setup 2FA belum selesai. Yakin ingin keluar?')) {
        setStep(1);
        setQrCode('');
        setSecret('');
        setOtpToken('');
        setBackupCodes([]);
        setError('');
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Setup Two-Factor Authentication"
    >
      <div className="p-6">
        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tingkatkan Keamanan Akun Anda
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Two-Factor Authentication (2FA) menambahkan lapisan keamanan ekstra
                dengan memerlukan kode dari aplikasi authenticator selain password.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 text-sm">
                Sebelum Memulai:
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Install aplikasi authenticator (Google Authenticator, Authy, atau Microsoft Authenticator)</li>
                <li>• Pastikan jam di perangkat Anda sudah sinkron</li>
                <li>• Siapkan tempat aman untuk menyimpan backup codes</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handleStart}
              isLoading={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Lanjutkan
            </Button>
          </div>
        )}

        {/* Step 2: QR Code & Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Scan QR Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Gunakan aplikasi authenticator untuk scan QR code di bawah ini
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center bg-white p-4 border-2 border-gray-200 rounded-lg">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>

            {/* Manual Entry */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Atau masukkan kode ini secara manual:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm font-mono">
                  {secret}
                </code>
                <Button
                  onClick={handleCopySecret}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>

            {/* OTP Verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masukkan kode 6 digit dari aplikasi authenticator:
              </label>
              <Input
                type="text"
                value={otpToken}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpToken(value);
                }}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                variant="outline"
                className="flex-1"
              >
                Kembali
              </Button>
              <Button
                onClick={handleVerify}
                isLoading={loading}
                disabled={otpToken.length !== 6}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Verifikasi
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2FA Berhasil Diaktifkan!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Simpan backup codes di bawah ini di tempat yang aman.
                Kode ini dapat digunakan jika Anda kehilangan akses ke authenticator.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Penting!</p>
                  <p>Setiap kode hanya dapat digunakan satu kali. Kode ini tidak akan ditampilkan lagi.</p>
                </div>
              </div>
            </div>

            {/* Backup Codes Display */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className="bg-white px-3 py-2 rounded border border-gray-300 text-center font-mono text-sm"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-300">
                <Button
                  onClick={handleCopyBackupCodes}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Copy size={14} className="mr-1" />
                  Salin Semua
                </Button>
                <Button
                  onClick={handleDownloadBackupCodes}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download size={14} className="mr-1" />
                  Unduh
                </Button>
              </div>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Selesai
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
