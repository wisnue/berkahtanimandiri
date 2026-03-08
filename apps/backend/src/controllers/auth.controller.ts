import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import * as twoFactorService from '../services/twoFactor.service';
import * as passwordPolicyService from '../services/passwordPolicy.service';
import { initSessionHistory } from '../middlewares/session.middleware';
import * as loginAttemptsService from '../services/loginAttempts.service';
import { emailService } from '../services/email.service';

// In-memory store for reset tokens: token -> { userId, expiry }
const resetTokenStore = new Map<string, { userId: string; expiry: number }>();

export class AuthController {
  /**
   * Login - Authenticate user and create session
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi',
        });
      }

      // Get IP address and user agent
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Check if IP is blocked due to too many failed attempts
      const isIPBlocked = await loginAttemptsService.shouldBlockIP(ipAddress);
      if (isIPBlocked) {
        return res.status(429).json({
          success: false,
          message: 'IP Anda diblokir sementara karena terlalu banyak percobaan login yang gagal. Silakan coba lagi nanti.',
        });
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user) {
        // Log failed attempt for non-existent user
        await loginAttemptsService.logLoginAttempt({
          username: email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'user_not_found',
        });

        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
        });
      }

      // Check if account should be locked based on recent failed attempts
      const shouldLockAccount = await loginAttemptsService.shouldLockAccount(email);
      if (shouldLockAccount) {
        return res.status(423).json({
          success: false,
          message: 'Akun Anda dikunci sementara karena terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam 15 menit.',
        });
      }

      // Check if user is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda terkunci. Silakan hubungi administrator',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda tidak aktif',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        // Log failed login attempt
        await loginAttemptsService.logLoginAttempt({
          username: email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'wrong_password',
        });

        // Increment login attempts (keep existing logic for backward compatibility)
        const currentAttempts = parseInt(user.loginAttempts || '0');
        const newAttempts = currentAttempts + 1;
        const shouldLock = newAttempts >= 5;

        await db.update(users)
          .set({
            loginAttempts: newAttempts.toString(),
            lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null, // Lock for 30 minutes
          })
          .where(eq(users.id, user.id));

        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
          attemptsLeft: shouldLock ? 0 : 5 - newAttempts,
        });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Don't create session yet, require 2FA verification
        // Don't log as successful yet - wait for 2FA verification
        return res.status(200).json({
          success: true,
          requires2FA: true,
          userId: user.id,
          message: 'Silakan masukkan kode OTP dari Google Authenticator',
        });
      }

      // Log successful login attempt
      await loginAttemptsService.logLoginAttempt({
        username: email,
        ipAddress,
        userAgent,
        success: true,
      });

      // Reset login attempts on successful login
      await db.update(users)
        .set({
          loginAttempts: '0',
          lastLogin: new Date(),
        })
        .where(eq(users.id, user.id));

      // Create session
      req.session.userId = user.id;

      // Explicitly save session to store BEFORE sending response.
      // Required when using async session stores (Supabase/pg) to ensure
      // the session is persisted before the client makes the next request.
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Initialize session history
      await initSessionHistory(user.id, req.sessionID, ipAddress, userAgent);

      // Return user data (without password)
      const { password: _, ...userData } = user;

      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: userData,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat login',
      });
    }
  }

  /**
   * Logout - Destroy session
   */
  static async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat logout',
          });
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({
          success: true,
          message: 'Logout berhasil',
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat logout',
      });
    }
  }

  /**
   * Get current user - Return authenticated user data
   */
  static async me(req: Request, res: Response) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Anda belum login',
        });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      // Return user data (without password)
      const { password: _, ...userData } = user;

      return res.status(200).json({
        success: true,
        data: userData,
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data user',
      });
    }
  }

  /**
   * Register - Create new user account
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, namaLengkap, noTelepon } = req.body;

      if (!email || !password || !namaLengkap) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, dan nama lengkap wajib diisi',
        });
      }

      // Check if email already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        nik: email.split('@')[0], // Generate NIK from email temporarily
        username: email.split('@')[0],
        email,
        password: hashedPassword,
        fullName: namaLengkap,
        phone: noTelepon,
        role: 'anggota',
        isActive: true,
        twoFactorEnabled: false,
        loginAttempts: '0',
      }).returning();

      // Return user data (without password)
      const { password: _, ...userData } = newUser;

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: userData,
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat registrasi',
      });
    }
  }

  /**
   * Change Password - Change user password with validation
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword, oldPassword } = req.body;
      
      // Support both currentPassword and oldPassword field names
      const oldPass = currentPassword || oldPassword;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Anda belum login',
        });
      }

      if (!oldPass || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password lama dan password baru wajib diisi',
        });
      }

      // Get user
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(oldPass, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Password lama tidak sesuai',
        });
      }

      // Validate new password strength
      const validation = passwordPolicyService.validatePasswordStrength(newPassword);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Password baru tidak memenuhi persyaratan',
          errors: validation.errors,
          strength: validation.strength,
        });
      }

      // Check password history
      const isNewPassword = await passwordPolicyService.checkPasswordHistory(userId, newPassword);

      if (!isNewPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password tidak boleh sama dengan 5 password terakhir',
        });
      }

      // Update password
      await passwordPolicyService.updateUserPassword(userId, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Password berhasil diubah',
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengubah password',
      });
    }
  }

  /**
   * Setup 2FA - Generate QR code and secret
   */
  static async setup2FA(req: Request, res: Response) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Anda belum login',
        });
      }

      // Get user
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      if (user.twoFactorEnabled) {
        return res.status(400).json({
          success: false,
          message: '2FA sudah aktif',
        });
      }

      // Generate 2FA secret and QR code
      const { secret, qrCode } = await twoFactorService.generate2FASecret(
        userId,
        user.email || user.username
      );

      // Store secret in session temporarily (not in DB yet)
      req.session.tempTwoFactorSecret = secret;

      return res.status(200).json({
        success: true,
        message: 'QR Code berhasil dibuat. Scan dengan Google Authenticator',
        data: {
          secret,
          qrCode,
        },
      });
    } catch (error) {
      console.error('Setup 2FA error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat setup 2FA',
      });
    }
  }

  /**
   * Verify & Enable 2FA - Verify OTP and enable 2FA
   */
  static async verify2FA(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      const { token } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Anda belum login',
        });
      }

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token OTP wajib diisi',
        });
      }

      const secret = req.session.tempTwoFactorSecret;

      if (!secret) {
        return res.status(400).json({
          success: false,
          message: 'Secret tidak ditemukan. Silakan setup ulang',
        });
      }

      // Verify OTP
      const isValid = twoFactorService.verifyOTP(secret, token);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Kode OTP salah',
        });
      }

      // Enable 2FA
      await twoFactorService.enable2FA(userId, secret);

      // Generate backup codes
      const backupCodes = await twoFactorService.generateBackupCodes(userId);

      // Clear temp secret from session
      delete req.session.tempTwoFactorSecret;

      return res.status(200).json({
        success: true,
        message: '2FA berhasil diaktifkan',
        data: {
          backupCodes,
          message: 'Simpan backup codes ini di tempat yang aman. Anda hanya bisa melihatnya sekali!',
        },
      });
    } catch (error) {
      console.error('Verify 2FA error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat verifikasi 2FA',
      });
    }
  }

  /**
   * Disable 2FA - Turn off 2FA for user
   */
  static async disable2FA(req: Request, res: Response) {
    try {
      const userId = req.session.userId;
      const { password } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Anda belum login',
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password wajib diisi untuk menonaktifkan 2FA',
        });
      }

      // Get user
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Password salah',
        });
      }

      // Disable 2FA
      await twoFactorService.disable2FA(userId);

      return res.status(200).json({
        success: true,
        message: '2FA berhasil dinonaktifkan',
      });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menonaktifkan 2FA',
      });
    }
  }

  /**
   * Verify 2FA Login - Verify OTP during login
   */
  static async verify2FALogin(req: Request, res: Response) {
    try {
      const { userId, token, useBackupCode } = req.body;

      if (!userId || !token) {
        return res.status(400).json({
          success: false,
          message: 'User ID dan token wajib diisi',
        });
      }

      // Get IP address and user agent
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Get user
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      let isValid = false;

      if (useBackupCode) {
        // Verify backup code
        isValid = await twoFactorService.verifyBackupCode(userId, token);
      } else {
        // Verify OTP
        if (!user.twoFactorSecret) {
          return res.status(400).json({
            success: false,
            message: '2FA secret tidak ditemukan',
          });
        }
        isValid = twoFactorService.verifyOTP(user.twoFactorSecret, token);
      }

      if (!isValid) {
        // Log failed 2FA verification
        await loginAttemptsService.logLoginAttempt({
          username: user.email || user.username || String(userId),
          ipAddress,
          userAgent,
          success: false,
          failureReason: useBackupCode ? 'wrong_backup_code' : 'wrong_2fa_code',
        });

        return res.status(401).json({
          success: false,
          message: useBackupCode ? 'Backup code salah atau sudah digunakan' : 'Kode OTP salah',
        });
      }

      // Log successful 2FA verification and login
      await loginAttemptsService.logLoginAttempt({
        username: user.email || user.username || String(userId),
        ipAddress,
        userAgent,
        success: true,
      });

      // Create session
      req.session.userId = userId;

      // Initialize session history
      await initSessionHistory(userId, req.sessionID, ipAddress, userAgent);

      // Update last login and reset login attempts
      await db.update(users)
        .set({ 
          lastLogin: new Date(),
          loginAttempts: '0',
        })
        .where(eq(users.id, userId));

      // Return user data
      const { password: _, twoFactorSecret: __, ...userData } = user;

      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: userData,
      });
    } catch (error) {
      console.error('Verify 2FA Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat verifikasi 2FA',
      });
    }
  }

  /**
   * Get 2FA Status - Check if user has 2FA enabled
   */
  static async get2FAStatus(req: Request, res: Response) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Anda belum login',
        });
      }

      const isEnabled = await twoFactorService.check2FAStatus(userId);
      const backupCodesCount = await twoFactorService.getRemainingBackupCodesCount(userId);

      return res.status(200).json({
        success: true,
        data: {
          enabled: isEnabled,
          backupCodesRemaining: backupCodesCount,
        },
      });
    } catch (error) {
      console.error('Get 2FA Status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengecek status 2FA',
      });
    }
  }

  /**
   * Check Password Strength - Validate password strength (for frontend)
   */
  static async checkPasswordStrength(req: Request, res: Response) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password tidak boleh kosong',
        });
      }

      const validation = passwordPolicyService.validatePasswordStrength(password);

      return res.status(200).json({
        success: true,
        data: {
          isValid: validation.isValid,
          errors: validation.errors,
          strength: validation.strength,
          label: passwordPolicyService.getPasswordStrengthLabel(validation.strength?.score || 0),
          color: passwordPolicyService.getPasswordStrengthColor(validation.strength?.score || 0),
        },
      });
    } catch (error) {
      console.error('Check password strength error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengecek kekuatan password',
      });
    }
  }

  /**
   * Get Password Status - Get password expiry status
   */
  static async getPasswordStatus(req: Request, res: Response) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Anda belum login',
        });
      }

      const status = await passwordPolicyService.checkPasswordExpiry(userId);

      return res.status(200).json({
        success: true,
        data: {
          isExpired: status.isExpired,
          daysUntilExpiry: status.daysUntilExpiry,
          expiryDate: status.expiryDate,
          requiresChange: status.isExpired,
        },
      });
    } catch (error) {
      console.error('Get password status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengecek status password',
      });
    }
  }

  /**
   * Forgot Password - Send reset link to email
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email wajib diisi',
        });
      }

      // Always return success to avoid email enumeration
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user) {
        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 60 * 60 * 1000; // 1 hour
        resetTokenStore.set(token, { userId: user.id, expiry });

        // Build reset URL
        const appUrl = process.env.APP_URL || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173';
        const resetUrl = `${appUrl}/reset-password?token=${token}`;

        // Send email if configured
        await emailService.sendEmail({
          to: email,
          subject: 'Reset Password - KTH Berkah Tani Mandiri',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Reset Password</h2>
              <p>Halo <strong>${user.fullName}</strong>,</p>
              <p>Kami menerima permintaan reset password untuk akun Anda.</p>
              <p>Klik tombol di bawah untuk membuat password baru. Link ini berlaku selama <strong>1 jam</strong>.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; font-size: 13px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">KTH Berkah Tani Mandiri</p>
            </div>
          `,
        });
      }

      // Always return the same message
      return res.status(200).json({
        success: true,
        message: 'Jika email terdaftar, link reset password telah dikirim. Silakan cek inbox (dan folder spam) Anda.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    }
  }

  /**
   * Reset Password - Set new password using token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Token dan password baru wajib diisi',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password minimal 8 karakter',
        });
      }

      const entry = resetTokenStore.get(token);

      if (!entry || Date.now() > entry.expiry) {
        resetTokenStore.delete(token);
        return res.status(400).json({
          success: false,
          message: 'Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.',
        });
      }

      // Hash new password
      const hashed = await bcrypt.hash(password, 10);

      await db
        .update(users)
        .set({ password: hashed, updatedAt: new Date() })
        .where(eq(users.id, entry.userId));

      // Invalidate the token
      resetTokenStore.delete(token);

      return res.status(200).json({
        success: true,
        message: 'Password berhasil diubah. Silakan login dengan password baru.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    }
  }
}
