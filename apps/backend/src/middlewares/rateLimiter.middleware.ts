import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Extend Request type to include rateLimit info from express-rate-limit
declare module 'express' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: Date | undefined;
    };
  }
}

/**
 * Rate limiter untuk login endpoint
 * 5 percobaan per 15 menit per IP address
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
      retryAfter: Math.ceil(req.rateLimit?.resetTime ? (req.rateLimit.resetTime.getTime() - Date.now()) / 1000 : 900),
    });
  },
});

/**
 * Rate limiter untuk general API endpoints
 * 100 requests per 15 menit per IP address
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip rate limiting for certain endpoints
    const skipPaths = ['/api/auth/me', '/api/session/heartbeat', '/api/session/status'];
    return skipPaths.includes(req.path);
  },
});

/**
 * Rate limiter untuk file upload endpoints
 * 10 uploads per jam per IP address
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 upload requests per hour
  message: {
    success: false,
    message: 'Terlalu banyak upload. Silakan coba lagi dalam 1 jam.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak upload. Silakan coba lagi dalam 1 jam.',
      retryAfter: Math.ceil(req.rateLimit?.resetTime ? (req.rateLimit.resetTime.getTime() - Date.now()) / 1000 : 3600),
    });
  },
});

/**
 * Rate limiter untuk password change endpoint
 * 3 percobaan per jam per user
 */
export const passwordChangeRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 password changes per hour
  message: {
    success: false,
    message: 'Terlalu banyak percobaan ubah password. Silakan coba lagi dalam 1 jam.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID instead of IP for authenticated endpoint
    return req.session?.userId || req.ip || 'anonymous';
  },
});

/**
 * Rate limiter untuk 2FA verification endpoint
 * 10 percobaan per 15 menit per user
 */
export const twoFactorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 attempts per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak percobaan verifikasi. Silakan coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.session?.userId || req.body?.userId || req.ip || 'anonymous';
  },
});

/**
 * Strict rate limiter untuk sensitive operations
 * 5 requests per jam
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit to 5 requests per hour
  message: {
    success: false,
    message: 'Operasi ini dibatasi. Silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.session?.userId || req.ip || 'anonymous';
  },
});
