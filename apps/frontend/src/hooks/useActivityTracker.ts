import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const CHECK_SESSION_INTERVAL = 60000; // 1 minute
const WARNING_THRESHOLD = 60; // Show warning when 60 seconds remaining

interface SessionStatus {
  timeRemaining: number; // in seconds
  isWarning: boolean;
  sessionId: string;
  lastActivity: string;
}

export function useActivityTracker() {
  const [, setLocation] = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const lastActivityRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkSessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasActivityRef = useRef<boolean>(false);

  // Track user activity
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    hasActivityRef.current = true;
  }, []);

  // Send heartbeat to server
  const sendHeartbeat = useCallback(async () => {
    // Only send if there was activity since last heartbeat
    if (!hasActivityRef.current) return;

    try {
      const response = await fetch('/api/session/heartbeat', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || data.sessionExpired) {
        // Session expired, redirect to login
        console.log('Session expired during heartbeat');
        setLocation('/login');
      }

      // Reset activity flag
      hasActivityRef.current = false;
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  }, [setLocation]);

  // Check session status
  const checkSessionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/session/status', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || data.sessionExpired) {
        // Session expired
        console.log('Session expired during status check');
        setLocation('/login');
        return;
      }

      if (data.success && data.data) {
        const status: SessionStatus = data.data;

        // Show warning if time remaining is less than threshold
        if (status.timeRemaining <= WARNING_THRESHOLD && status.timeRemaining > 0) {
          setSecondsRemaining(status.timeRemaining);
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }

        // Auto logout if time expired
        if (status.timeRemaining <= 0) {
          console.log('Session timeout detected');
          setLocation('/login');
        }
      }
    } catch (error) {
      console.error('Session status check error:', error);
    }
  }, [setLocation]);

  // Handle "Stay Logged In" button
  const handleStayLoggedIn = useCallback(async () => {
    // Send immediate heartbeat
    hasActivityRef.current = true;
    await sendHeartbeat();

    // Close warning modal
    setShowWarning(false);

    // Record activity
    recordActivity();
  }, [sendHeartbeat, recordActivity]);

  useEffect(() => {
    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      window.addEventListener(event, recordActivity);
    });

    // Start heartbeat interval
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Start session status check interval
    checkSessionIntervalRef.current = setInterval(checkSessionStatus, CHECK_SESSION_INTERVAL);

    // Initial session check
    checkSessionStatus();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, recordActivity);
      });

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      if (checkSessionIntervalRef.current) {
        clearInterval(checkSessionIntervalRef.current);
      }
    };
  }, [recordActivity, sendHeartbeat, checkSessionStatus]);

  return {
    showWarning,
    secondsRemaining,
    handleStayLoggedIn,
  };
}
