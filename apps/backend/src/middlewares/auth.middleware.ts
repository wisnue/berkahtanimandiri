import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Anda harus login terlebih dahulu',
      });
    }

    // Get user from database
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid. Silakan login kembali',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memverifikasi autentikasi',
    });
  }
}

export const authenticate = requireAuth;

export function requireRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Anda harus login terlebih dahulu',
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk melakukan tindakan ini',
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memverifikasi role',
      });
    }
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return requireAuth(req, res, next);
  }
  next();
}
