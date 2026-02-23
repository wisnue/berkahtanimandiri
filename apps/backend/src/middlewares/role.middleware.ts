import { Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'ketua' | 'sekretaris' | 'bendahara' | 'anggota';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan',
      });
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melakukan operasi ini',
        requiredRole: allowedRoles,
        yourRole: req.user.role,
      });
    }

    next();
  };
}

// Role hierarchy checker
export function hasRoleLevel(userRole: string, requiredLevel: number): boolean {
  const roleLevels: Record<string, number> = {
    admin: 5,
    ketua: 4,
    sekretaris: 3,
    bendahara: 3,
    anggota: 1,
  };

  return (roleLevels[userRole] || 0) >= requiredLevel;
}

// Middleware untuk mengecek level role
export function requireRoleLevel(level: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan',
      });
    }

    if (!hasRoleLevel(req.user.role, level)) {
      return res.status(403).json({
        success: false,
        message: 'Level akses Anda tidak mencukupi',
      });
    }

    next();
  };
}
