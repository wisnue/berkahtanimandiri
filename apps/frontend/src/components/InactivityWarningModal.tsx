import { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { AlertCircle, Clock } from 'lucide-react';
import { useLocation } from 'wouter';

interface InactivityWarningModalProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  secondsRemaining: number;
}

export default function InactivityWarningModal({
  isOpen,
  onStayLoggedIn,
  secondsRemaining,
}: InactivityWarningModalProps) {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(secondsRemaining);

  useEffect(() => {
    setCountdown(secondsRemaining);
  }, [secondsRemaining]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto logout and redirect to login
          setTimeout(() => {
            setLocation('/login');
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, setLocation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (countdown / secondsRemaining) * 100;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onStayLoggedIn}
      title="Peringatan Tidak Aktif"
    >
      <div className="p-6 space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sesi Anda Akan Berakhir
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Anda tidak aktif dalam waktu yang lama. Sesi Anda akan otomatis berakhir dalam:
          </p>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-gray-600" />
            <div className="text-4xl font-bold text-gray-900 font-mono">
              {formatTime(countdown)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-linear rounded-full"
              style={{
                width: `${getProgressPercentage()}%`,
                backgroundColor: countdown <= 10 ? '#DC2626' : countdown <= 30 ? '#F59E0B' : '#059669',
              }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              Klik "Tetap Login" untuk melanjutkan sesi Anda, atau Anda akan otomatis logout.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onStayLoggedIn}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Tetap Login
          </Button>
          <Button
            onClick={() => setLocation('/login')}
            variant="outline"
            className="flex-1"
          >
            Logout Sekarang
          </Button>
        </div>
      </div>
    </Modal>
  );
}
