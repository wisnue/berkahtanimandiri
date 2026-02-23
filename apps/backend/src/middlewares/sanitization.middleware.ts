/**
 * Input Sanitization Middleware
 * 
 * Sanitizes all user input to prevent XSS, SQL injection, and other injection attacks.
 * Applies HTML escaping, trimming, and validation to incoming request data.
 */

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Sanitize a single value (string or nested object/array)
 */
function sanitizeValue(value: any): any {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle strings
  if (typeof value === 'string') {
    // Trim whitespace
    let sanitized = value.trim();
    
    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);
    
    return sanitized;
  }

  // Handle arrays - recursively sanitize each element
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }

  // Handle objects - recursively sanitize each property
  if (typeof value === 'object') {
    const sanitized: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }

  // Return other types as-is (numbers, booleans, etc.)
  return value;
}

/**
 * Middleware to sanitize request body, query, and params
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeValue(req.query);
    }

    // Sanitize route parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeValue(req.params);
    }

    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    // Continue even if sanitization fails - better than blocking the request
    next();
  }
}

/**
 * Strict sanitization for critical operations
 * Rejects requests with potentially dangerous characters
 */
export function strictSanitization(req: Request, res: Response, next: NextFunction): void | Response {
  try {
    // Check for dangerous patterns in all input
    const checkDangerousPatterns = (value: any): boolean => {
      if (typeof value === 'string') {
        // Check for SQL injection patterns
        const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|GRANT)\b|--|;|\/\*|\*\/|xp_|sp_)/gi;
        
        // Check for script injection patterns
        const scriptPattern = /<script|javascript:|onerror=|onload=|eval\(|expression\(/gi;
        
        // Check for command injection patterns
        const commandPattern = /(\||&|;|\$\(|`|>|<|\n|\r)/g;

        if (sqlPattern.test(value) || scriptPattern.test(value) || commandPattern.test(value)) {
          return true;
        }
      }

      if (Array.isArray(value)) {
        return value.some(item => checkDangerousPatterns(item));
      }

      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkDangerousPatterns(v));
      }

      return false;
    };

    // Check body, query, and params
    const hasDangerousInput = 
      checkDangerousPatterns(req.body) ||
      checkDangerousPatterns(req.query) ||
      checkDangerousPatterns(req.params);

    if (hasDangerousInput) {
      return res.status(400).json({
        success: false,
        message: 'Input mengandung karakter atau pola yang tidak diizinkan',
      });
    }

    // Apply normal sanitization
    sanitizeInput(req, res, next);
  } catch (error) {
    console.error('Strict sanitization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memvalidasi input',
    });
  }
}

/**
 * Email validation and sanitization
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // Trim and lowercase
  const cleaned = email.trim().toLowerCase();

  // Validate email format
  if (!validator.isEmail(cleaned)) {
    return null;
  }

  // Normalize email (remove dots in Gmail, etc.)
  return validator.normalizeEmail(cleaned) || cleaned;
}

/**
 * URL validation and sanitization
 */
export function sanitizeURL(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Trim
  const cleaned = url.trim();

  // Validate URL format
  if (!validator.isURL(cleaned, {
    protocols: ['http', 'https'],
    require_protocol: true,
  })) {
    return null;
  }

  return cleaned;
}

/**
 * Phone number sanitization (Indonesian format)
 */
export function sanitizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle Indonesian phone format
  // Convert 0812... to 62812...
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }

  // Validate Indonesian phone number (should start with 62 and be 10-13 digits)
  if (!cleaned.startsWith('62') || cleaned.length < 10 || cleaned.length > 13) {
    return null;
  }

  return cleaned;
}

/**
 * Filename sanitization for uploads
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed_file';
  }

  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 250) + '.' + ext;
  }

  return sanitized;
}

/**
 * Numeric ID validation and sanitization
 */
export function sanitizeNumericId(id: any): number | null {
  // Try to parse as integer
  const parsed = parseInt(id, 10);

  // Check if valid positive integer
  if (isNaN(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

/**
 * Date validation and sanitization
 */
export function sanitizeDate(date: any): Date | null {
  if (!date) {
    return null;
  }

  // Try to parse date
  const parsed = new Date(date);

  // Check if valid date
  if (isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

/**
 * Boolean sanitization
 */
export function sanitizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lowered = value.toLowerCase().trim();
    return lowered === 'true' || lowered === '1' || lowered === 'yes';
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return false;
}
