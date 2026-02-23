/**
 * CSRF Protection Middleware
 * 
 * Protects against Cross-Site Request Forgery attacks by validating tokens
 * on state-changing requests (POST, PUT, DELETE, PATCH).
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Extend session type to include CSRF token
declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get or create CSRF token for the session
 */
export function getCSRFToken(req: Request): string {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  return req.session.csrfToken;
}

/**
 * Middleware to attach CSRF token to request object
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Ensure token exists in session
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }

  // Attach token getter to response locals for easy access in routes
  res.locals.csrfToken = req.session.csrfToken;

  next();
}

/**
 * CSRF Protection Middleware
 * Validates CSRF token on state-changing requests
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void | Response {
  // Skip CSRF validation for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF validation for public endpoints (login, register, etc.)
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/2fa/verify-login',
    '/api/session/heartbeat', // Skip heartbeat to avoid CSRF issues
  ];

  if (publicEndpoints.some(endpoint => req.path === endpoint)) {
    return next();
  }

  // For authenticated requests, validate CSRF token
  if (req.session.userId) {
    // Get token from header or body
    const token = req.headers['x-csrf-token'] || req.body._csrf;

    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token tidak ditemukan',
        code: 'CSRF_TOKEN_MISSING',
      });
    }

    // Validate token
    if (token !== req.session.csrfToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token tidak valid',
        code: 'CSRF_TOKEN_INVALID',
      });
    }
  }

  next();
}

/**
 * Double Submit Cookie Pattern
 * Alternative CSRF protection using cookies
 */
export function csrfDoubleCookie(req: Request, res: Response, next: NextFunction): void | Response {
  // Skip for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    // Set cookie for safe methods
    if (!req.cookies.csrfToken) {
      const token = generateToken();
      res.cookie('csrfToken', token, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
    return next();
  }

  // For state-changing methods, validate token
  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token tidak ditemukan',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  if (cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token tidak valid',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  next();
}

/**
 * Middleware to rotate CSRF token after critical actions
 * Call this after login, password change, etc.
 */
export function rotateCSRFToken(req: Request, res: Response, next: NextFunction): void {
  if (req.session) {
    req.session.csrfToken = generateToken();
    res.locals.csrfToken = req.session.csrfToken;
  }
  next();
}

/**
 * Controller to get CSRF token
 * Frontend should call this to get the token before making state-changing requests
 */
export function getCSRFTokenHandler(req: Request, res: Response): void {
  const token = getCSRFToken(req);
  
  res.json({
    success: true,
    data: {
      csrfToken: token,
    },
  });
}
