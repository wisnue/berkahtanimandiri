import { Request, Response, NextFunction } from 'express';
import {
  validatePasswordStrength,
  checkPasswordHistory,
  checkPasswordExpiry
} from '../services/passwordPolicy.service';

/**
 * Middleware to validate password strength
 * Use this on registration and password change endpoints
 */
export async function validatePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { password, newPassword } = req.body;
    const passwordToValidate = newPassword || password;

    if (!passwordToValidate) {
      res.status(400).json({
        success: false,
        message: 'Password tidak boleh kosong'
      });
      return;
    }

    // Validate password strength
    const validation = validatePasswordStrength(passwordToValidate);

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Password tidak memenuhi persyaratan',
        errors: validation.errors,
        strength: validation.strength
      });
      return;
    }

    // Password is valid, continue to next middleware
    next();
  } catch (error) {
    console.error('Password validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat validasi password'
    });
  }
}

/**
 * Middleware to check password history
 * Use this on password change endpoints
 */
export async function checkPasswordReuse(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { newPassword } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Tidak terautentikasi'
      });
      return;
    }

    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: 'Password baru tidak boleh kosong'
      });
      return;
    }

    // Check if password was used in last 5 passwords
    const isNewPassword = await checkPasswordHistory(userId, newPassword);

    if (!isNewPassword) {
      res.status(400).json({
        success: false,
        message: 'Password tidak boleh sama dengan 5 password terakhir'
      });
      return;
    }

    // Password is new, continue
    next();
  } catch (error) {
    console.error('Password history check error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memeriksa riwayat password'
    });
  }
}

/**
 * Middleware to check if password has expired
 * Use this on protected routes to force password change
 */
export async function checkPasswordExpiryMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      // Not logged in, skip check
      next();
      return;
    }

    // Check password expiry
    const { isExpired, daysUntilExpiry } = await checkPasswordExpiry(userId);

    if (isExpired) {
      res.status(403).json({
        success: false,
        message: 'Password Anda telah kedaluwarsa. Silakan ubah password.',
        requiresPasswordChange: true
      });
      return;
    }

    // Warn if password expires soon (7 days or less)
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      // Add warning to response headers
      res.setHeader('X-Password-Expiry-Warning', `${daysUntilExpiry}`);
    }

    next();
  } catch (error) {
    console.error('Password expiry check error:', error);
    // Don't block request on error, just log it
    next();
  }
}

/**
 * Combined validation middleware for password change
 * Validates strength + checks history
 */
export async function validatePasswordChange(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Run validations sequentially
  await validatePassword(req, res, async () => {
    await checkPasswordReuse(req, res, next);
  });
}
