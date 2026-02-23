import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  loginRateLimiter,
  passwordChangeRateLimiter,
  twoFactorRateLimiter,
  strictRateLimiter,
} from '../middlewares/rateLimiter.middleware';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginRateLimiter, AuthController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, AuthController.me);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, passwordChangeRateLimiter, AuthController.changePassword);

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Setup 2FA - Generate QR code
 * @access  Private
 */
router.post('/2fa/setup', authenticate, AuthController.setup2FA);

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify & Enable 2FA
 * @access  Private
 */
router.post('/2fa/verify', authenticate, AuthController.verify2FA);

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/2fa/disable', authenticate, strictRateLimiter, AuthController.disable2FA);

/**
 * @route   POST /api/auth/2fa/verify-login
 * @desc    Verify 2FA during login
 * @access  Public
 */
router.post('/2fa/verify-login', twoFactorRateLimiter, AuthController.verify2FALogin);

/**
 * @route   GET /api/auth/2fa/status
 * @desc    Get 2FA status
 * @access  Private
 */
router.get('/2fa/status', authenticate, AuthController.get2FAStatus);

/**
 * @route   POST /api/auth/password/check-strength
 * @desc    Check password strength (for frontend validation)
 * @access  Public
 */
router.post('/password/check-strength', AuthController.checkPasswordStrength);

/**
 * @route   GET /api/auth/password/status
 * @desc    Get password expiry status
 * @access  Private
 */
router.get('/password/status', authenticate, AuthController.getPasswordStatus);

export default router;
