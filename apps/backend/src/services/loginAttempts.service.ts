import { pool } from '../config/db';

interface LoginAttemptData {
  username: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

/**
 * Log login attempt to database
 */
export async function logLoginAttempt(data: LoginAttemptData): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO login_attempts (username, ip_address, user_agent, success, failure_reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.username,
        data.ipAddress,
        data.userAgent,
        data.success,
        data.failureReason || null,
      ]
    );
  } catch (error) {
    console.error('Error logging login attempt:', error);
    // Don't throw error, just log it - login should continue
  }
}

/**
 * Get failed login attempts count for username in the last 15 minutes
 */
export async function getRecentFailedAttempts(username: string): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM login_attempts
       WHERE username = $1
       AND success = FALSE
       AND created_at > NOW() - INTERVAL '15 minutes'`,
      [username]
    );

    return parseInt(result.rows[0]?.count || '0');
  } catch (error) {
    console.error('Error getting failed attempts:', error);
    return 0;
  }
}

/**
 * Get failed login attempts count by IP in the last hour
 */
export async function getFailedAttemptsByIP(ipAddress: string): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM login_attempts
       WHERE ip_address = $1
       AND success = FALSE
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [ipAddress]
    );

    return parseInt(result.rows[0]?.count || '0');
  } catch (error) {
    console.error('Error getting failed attempts by IP:', error);
    return 0;
  }
}

/**
 * Check if account should be locked due to failed attempts
 * Returns true if >= 5 failed attempts in last 15 minutes
 */
export async function shouldLockAccount(username: string): Promise<boolean> {
  const failedAttempts = await getRecentFailedAttempts(username);
  return failedAttempts >= 5;
}

/**
 * Check if IP should be blocked due to failed attempts
 * Returns true if >= 10 failed attempts in last hour
 */
export async function shouldBlockIP(ipAddress: string): Promise<boolean> {
  const failedAttempts = await getFailedAttemptsByIP(ipAddress);
  return failedAttempts >= 10;
}

/**
 * Get login attempt history for a user
 */
export async function getLoginHistory(
  username: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT id, username, ip_address, user_agent, success, failure_reason, created_at
       FROM login_attempts
       WHERE username = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [username, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting login history:', error);
    return [];
  }
}

/**
 * Get login statistics for admin
 */
export async function getLoginStatistics(days: number = 7): Promise<{
  totalAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  suspiciousIPs: string[];
}> {
  try {
    const statsQuery = await pool.query(
      `SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN success = TRUE THEN 1 END) as successful_logins,
        COUNT(CASE WHEN success = FALSE THEN 1 END) as failed_logins,
        COUNT(DISTINCT username) as unique_users
       FROM login_attempts
       WHERE created_at > NOW() - INTERVAL '${days} days'`
    );

    const suspiciousIPsQuery = await pool.query(
      `SELECT ip_address, COUNT(*) as failed_count
       FROM login_attempts
       WHERE success = FALSE
       AND created_at > NOW() - INTERVAL '${days} days'
       GROUP BY ip_address
       HAVING COUNT(*) >= 5
       ORDER BY failed_count DESC
       LIMIT 10`
    );

    return {
      totalAttempts: parseInt(statsQuery.rows[0]?.total_attempts || '0'),
      successfulLogins: parseInt(statsQuery.rows[0]?.successful_logins || '0'),
      failedLogins: parseInt(statsQuery.rows[0]?.failed_logins || '0'),
      uniqueUsers: parseInt(statsQuery.rows[0]?.unique_users || '0'),
      suspiciousIPs: suspiciousIPsQuery.rows.map((row) => row.ip_address),
    };
  } catch (error) {
    console.error('Error getting login statistics:', error);
    return {
      totalAttempts: 0,
      successfulLogins: 0,
      failedLogins: 0,
      uniqueUsers: 0,
      suspiciousIPs: [],
    };
  }
}

/**
 * Clear old login attempts (called by cron or manually)
 */
export async function cleanupOldLoginAttempts(): Promise<number> {
  try {
    const result = await pool.query(
      `DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '90 days'`
    );

    return result.rowCount || 0;
  } catch (error) {
    console.error('Error cleaning up login attempts:', error);
    return 0;
  }
}
