import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/AuthContext';
import { useLocation } from 'wouter';
import { AlertTriangle, Clock } from 'lucide-react';

/**
 * Session Timeout Manager
 * Auto logout after 30 minutes of inactivity
 * Shows warning modal 2 minutes before timeout
 */

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_DURATION = 2 * 60 * 1000; // Show warning 2 minutes before timeout

export function SessionTimeout() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120); // 2 minutes in seconds
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  // Reset all timers
  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setShowWarning(false);
    lastActivityRef.current = Date.now();

    // Set warning timer (28 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingTime(120); // Reset to 2 minutes
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Set logout timer (30 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    await logout();
    setLocation('/login');
  }, [logout, setLocation]);

  // Handle stay logged in
  const handleStayLoggedIn = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetTimers();
  }, [resetTimers]);

  // Activity event handler
  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Only reset if at least 1 minute has passed since last activity
    if (now - lastActivityRef.current > 60000) {
      resetTimers();
    }
  }, [resetTimers]);

  // Setup activity listeners
  useEffect(() => {
    if (!user) return;

    // Start timers on mount
    resetTimers();

    // Activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user, resetTimers, handleActivity]);

  // Format remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-secondary-900">
                Sesi Akan Berakhir
              </h2>
              <p className="text-sm text-secondary-600 mt-0.5">
                Karena tidak ada aktivitas
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-yellow-600 flex-shrink-0" size={20} />
              <p className="text-sm text-yellow-900">
                Sesi Anda akan berakhir dalam:
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-1">
                {formatTime(remainingTime)}
              </div>
              <p className="text-xs text-yellow-700">
                menit:detik
              </p>
            </div>
          </div>

          <p className="text-secondary-700 text-sm mb-4">
            Anda tidak melakukan aktivitas selama lebih dari 28 menit. 
            Untuk keamanan, sesi akan otomatis berakhir dalam {formatTime(remainingTime)}.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              💡 <strong>Tips:</strong> Klik tombol "Tetap Login" untuk memperpanjang sesi Anda.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors font-medium"
          >
            Logout Sekarang
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: '#059669' }}
          >
            Tetap Login
          </button>
        </div>
      </div>
    </div>
  );
}
