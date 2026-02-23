import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Session {
      userId?: string;
      userRole?: string;
      userFullName?: string;
    }
    
    interface Request {
      user?: {
        id: string;
        email: string | null;
        fullName: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

export {};
