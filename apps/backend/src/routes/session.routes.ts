import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  sessionHeartbeat,
  checkSessionStatus,
  logoutAllOtherSessions,
  getActiveSessions,
} from '../middlewares/session.middleware';

const router = Router();

/**
 * @route   POST /api/session/heartbeat
 * @desc    Refresh session activity (keep alive)
 * @access  Private
 */
router.post('/heartbeat', authenticate, sessionHeartbeat);

/**
 * @route   GET /api/session/status
 * @desc    Check session status and time remaining
 * @access  Private
 */
router.get('/status', authenticate, checkSessionStatus);

/**
 * @route   GET /api/session/active
 * @desc    Get all active sessions for current user
 * @access  Private
 */
router.get('/active', authenticate, getActiveSessions);

/**
 * @route   DELETE /api/session/logout-all
 * @desc    Logout all other sessions (keep current)
 * @access  Private
 */
router.delete('/logout-all', authenticate, logoutAllOtherSessions);

export default router;
