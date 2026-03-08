import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

// Session timeout duration (15 minutes in milliseconds)
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_TIMEOUT = 60 * 1000; // 1 minute

/**
 * Activity Tracker Middleware
 * Updates last_activity timestamp and checks for session timeout
 */
export async function activityTracker(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Skip for non-authenticated requests
  if (!req.session || !req.session.userId) {
    return next();
  }

  const sessionId = req.sessionID;
  const userId = req.session.userId;

  try {
    // Compute inactivity in the DB to avoid Node.js ↔ PostgreSQL timezone drift.
    // ms_inactive is NULL when last_activity has never been set.
    const result = await pool.query(
      `SELECT
         user_id,
         last_activity,
         CASE WHEN last_activity IS NULL THEN NULL
              ELSE EXTRACT(EPOCH FROM (NOW() - last_activity)) * 1000
         END AS ms_inactive
       FROM sessions WHERE sid = $1`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      // Session doesn't exist in DB anymore
      req.session.destroy((err) => {
        if (err) console.error('Error destroying session:', err);
      });
      res.status(401).json({
        success: false,
        message: 'Session tidak valid',
        sessionExpired: true,
      });
      return;
    }

    const msInactive: number | null = result.rows[0].ms_inactive !== null
      ? parseFloat(result.rows[0].ms_inactive)
      : null;

    // Check if session has timed out (15 minutes of inactivity)
    if (msInactive !== null && msInactive > SESSION_TIMEOUT) {
      // Session timed out
      console.log(`Session timeout for user ${userId}: ${msInactive}ms inactive`);

      // Log to session history
      await logSessionEnd(userId, sessionId, req.ip || 'unknown', 'timeout');

      // Destroy session
      req.session.destroy((err) => {
        if (err) console.error('Error destroying session:', err);
      });

      res.status(401).json({
        success: false,
        message: 'Sesi Anda telah berakhir karena tidak aktif. Silakan login kembali.',
        sessionExpired: true,
        reason: 'timeout',
      });
      return;
    }

    // Add warning header if timeout is approaching (less than 1 minute remaining)
    if (msInactive !== null) {
      const timeRemaining = SESSION_TIMEOUT - msInactive;
      if (timeRemaining <= WARNING_BEFORE_TIMEOUT) {
        res.setHeader('X-Session-Warning', 'true');
        res.setHeader('X-Session-Remaining', Math.floor(timeRemaining / 1000).toString());
      }
    }

    // Update last_activity, ip_address, and user_agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await pool.query(
      `UPDATE sessions 
       SET last_activity = NOW(), 
           user_id = $1,
           ip_address = $2,
           user_agent = $3
       WHERE sid = $4`,
      [userId, ipAddress, userAgent, sessionId]
    );

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Activity tracker error:', error);
    // Don't block the request on error, just log it
    next();
  }
}

/**
 * Session Heartbeat Endpoint
 * Called by frontend to keep session alive
 */
export async function sessionHeartbeat(req: Request, res: Response) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Tidak terautentikasi',
    });
  }

  try {
    const sessionId = req.sessionID;
    const now = new Date();
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Update last_activity
    await pool.query(
      `UPDATE sessions 
       SET last_activity = $1,
           ip_address = $2,
           user_agent = $3
       WHERE sid = $4`,
      [now, ipAddress, userAgent, sessionId]
    );

    return res.json({
      success: true,
      message: 'Session refreshed',
      lastActivity: now,
    });
  } catch (error) {
    console.error('Session heartbeat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan',
    });
  }
}

/**
 * Check Session Status
 * Returns session info including time remaining
 */
export async function checkSessionStatus(req: Request, res: Response) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Tidak terautentikasi',
      sessionExpired: true,
    });
  }

  try {
    const sessionId = req.sessionID;
    const result = await pool.query(
      `SELECT
         last_activity,
         CASE WHEN last_activity IS NULL THEN 0
              ELSE EXTRACT(EPOCH FROM (NOW() - last_activity)) * 1000
         END AS ms_inactive
       FROM sessions WHERE sid = $1`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Session tidak ditemukan',
        sessionExpired: true,
      });
    }

    const msInactive = parseFloat(result.rows[0].ms_inactive);
    const timeRemaining = SESSION_TIMEOUT - msInactive;

    return res.json({
      success: true,
      data: {
        sessionId,
        lastActivity: result.rows[0].last_activity,
        timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)), // in seconds
        isWarning: timeRemaining <= WARNING_BEFORE_TIMEOUT,
        timeout: SESSION_TIMEOUT / 1000, // in seconds
      },
    });
  } catch (error) {
    console.error('Check session status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan',
    });
  }
}

/**
 * Log session end to history
 */
async function logSessionEnd(
  _userId: string,
  sessionId: string,
  _ipAddress: string,
  reason: 'manual' | 'timeout' | 'forced' | 'new_login'
): Promise<void> {
  try {
    // Get session start time from session_history if exists
    const historyResult = await pool.query(
      `SELECT id FROM session_history 
       WHERE session_id = $1 AND logout_at IS NULL
       ORDER BY login_at DESC LIMIT 1`,
      [sessionId]
    );

    if (historyResult.rows.length > 0) {
      // Update existing record
      await pool.query(
        `UPDATE session_history 
         SET logout_at = NOW(), logout_reason = $1
         WHERE id = $2`,
        [reason, historyResult.rows[0].id]
      );
    }
  } catch (error) {
    console.error('Error logging session end:', error);
  }
}

/**
 * Initialize session history on login
 */
export async function initSessionHistory(
  userId: string,
  sessionId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO session_history (user_id, session_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [userId, sessionId, ipAddress, userAgent]
    );

    // Reset last_activity to NOW() so the activity tracker doesn't immediately
    // time out sessions whose DB row was reused from a previous login.
    // Also set the user_id column so logoutAllOtherSessions works correctly.
    await pool.query(
      `UPDATE sessions SET last_activity = NOW(), user_id = $1 WHERE sid = $2`,
      [userId, sessionId]
    );
  } catch (error) {
    console.error('Error initializing session history:', error);
  }
}

/**
 * Logout all sessions for a user (except current)
 */
export async function logoutAllOtherSessions(req: Request, res: Response) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Tidak terautentikasi',
    });
  }

  const userId = req.session.userId;
  const currentSessionId = req.sessionID;

  try {
    // Get all other sessions for this user
    const sessions = await pool.query(
      'SELECT sid FROM sessions WHERE user_id = $1 AND sid != $2',
      [userId, currentSessionId]
    );

    // Log each session end
    for (const session of sessions.rows) {
      await logSessionEnd(userId, session.sid, req.ip || 'unknown', 'forced');
    }

    // Delete all other sessions
    const result = await pool.query(
      'DELETE FROM sessions WHERE user_id = $1 AND sid != $2',
      [userId, currentSessionId]
    );

    return res.json({
      success: true,
      message: `${result.rowCount} sesi lain berhasil dihapus`,
      sessionsTerminated: result.rowCount,
    });
  } catch (error) {
    console.error('Error logging out all sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan',
    });
  }
}

/**
 * Get active sessions for current user
 */
export async function getActiveSessions(req: Request, res: Response) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Tidak terautentikasi',
    });
  }

  const userId = req.session.userId;
  const currentSessionId = req.sessionID;

  try {
    const result = await pool.query(
      `SELECT sid, last_activity, ip_address, user_agent,
              sid = $2 as is_current
       FROM sessions 
       WHERE user_id = $1
       ORDER BY last_activity DESC`,
      [userId, currentSessionId]
    );

    return res.json({
      success: true,
      data: result.rows.map((row) => ({
        sessionId: row.sid,
        lastActivity: row.last_activity,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        isCurrent: row.is_current,
      })),
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan',
    });
  }
}
