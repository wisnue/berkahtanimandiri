import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { activityLogs } from '../db/schema';

export async function auditLog(req: Request, res: Response, next: NextFunction) {
  // Store original res.json
  const originalJson = res.json.bind(res);

  // Override res.json
  res.json = function (body: any) {
    // Log activity after response is sent
    setImmediate(async () => {
      try {
        const action = `${req.method} ${req.path}`;
        const module = req.path.split('/')[2] || 'unknown';
        
        await db.insert(activityLogs).values({
          userId: req.user?.id || null,
          action,
          module,
          description: `${req.user?.fullName || 'Anonymous'} melakukan ${req.method} pada ${req.path}`,
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
          userAgent: req.get('user-agent') || 'unknown',
          requestMethod: req.method,
          requestUrl: req.originalUrl,
          statusCode: res.statusCode.toString(),
          errorMessage: !body.success ? JSON.stringify(body.message) : null,
          metadata: JSON.stringify({
            body: req.body,
            query: req.query,
            params: req.params,
          }),
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    });

    return originalJson(body);
  };

  next();
}

// Specific audit logger untuk aksi penting
export async function logActivity(
  userId: string | null,
  action: string,
  module: string,
  description: string,
  metadata?: any
) {
  try {
    await db.insert(activityLogs).values({
      userId,
      action,
      module,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
