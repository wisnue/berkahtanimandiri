import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { eq } from 'drizzle-orm';

interface AuditTrailEntry {
  userId: string;
  tableName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'VERIFY' | 'APPROVE' | 'REJECT';
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

/**
 * Enhanced Audit Trail Logger
 * Captures before/after values, IP address, user agent, and changed fields
 */
export async function logAuditTrail(entry: AuditTrailEntry) {
  try {
    const auditTrailModule = await import('../db/schema/audit-trail');
    const auditTrail = auditTrailModule.auditTrail;
    
    await db.insert(auditTrail).values({
      userId: entry.userId,
      tableName: entry.tableName,
      recordId: entry.recordId,
      action: entry.action,
      oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
      newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
      changedFields: entry.changedFields || [],
      description: entry.description,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    });
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}

/**
 * Middleware to capture audit trail for CRUD operations
 */
export function auditMiddleware(tableName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);

    // Store request data
    const requestData = {
      userId: (req as any).session?.userId,
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      method: req.method,
      path: req.path,
      body: req.body,
    };

    // Capture old values for UPDATE and DELETE
    let oldRecord: any = null;
    if ((req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') && req.params.id) {
      try {
        // Get table schema dynamically
        const schemaModule = await import(`../db/schema/${tableName}`);
        const table = schemaModule[Object.keys(schemaModule)[0]];
        
        [oldRecord] = await db.select().from(table).where(eq(table.id, req.params.id)).limit(1);
      } catch (error) {
        console.error('Failed to fetch old record:', error);
      }
    }

    // Override response methods
    const sendAuditLog = async (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          let action: AuditTrailEntry['action'] = 'CREATE';
          let recordId = req.params.id || body.data?.id;
          let newValues: any = null;
          let changedFields: string[] = [];

          // Determine action
          if (req.method === 'POST') {
            action = 'CREATE';
            newValues = body.data || req.body;
          } else if (req.method === 'PUT' || req.method === 'PATCH') {
            action = 'UPDATE';
            newValues = body.data || req.body;
            
            // Calculate changed fields
            if (oldRecord && newValues) {
              changedFields = Object.keys(newValues).filter(key => {
                return JSON.stringify(oldRecord[key]) !== JSON.stringify(newValues[key]);
              });
            }
          } else if (req.method === 'DELETE') {
            action = 'DELETE';
          }

          // Log audit trail
          if (recordId && requestData.userId) {
            await logAuditTrail({
              userId: requestData.userId,
              tableName,
              recordId,
              action,
              oldValues: oldRecord,
              newValues,
              changedFields,
              description: `${action} record in ${tableName}`,
              ipAddress: requestData.ipAddress,
              userAgent: requestData.userAgent,
              metadata: {
                method: requestData.method,
                path: requestData.path,
              },
            });
          }
        } catch (error) {
          console.error('Failed to log audit trail:', error);
        }
      }
    };

    res.send = function (body: any) {
      sendAuditLog(body).finally(() => originalSend(body));
      return this;
    };

    res.json = function (body: any) {
      sendAuditLog(body).finally(() => originalJson(body));
      return this;
    };

    next();
  };
}

/**
 * Manual audit trail helper
 * Use this for complex operations that need custom audit logging
 */
export async function createAuditLog(
  req: Request,
  tableName: string,
  recordId: string,
  action: AuditTrailEntry['action'],
  oldValues?: any,
  newValues?: any,
  description?: string
) {
  const userId = (req as any).session?.userId;
  
  if (!userId) {
    console.warn('No userId found for audit trail');
    return;
  }

  const changedFields = oldValues && newValues
    ? Object.keys(newValues).filter(key => {
        return JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]);
      })
    : [];

  await logAuditTrail({
    userId,
    tableName,
    recordId,
    action,
    oldValues,
    newValues,
    changedFields,
    description,
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
  });
}
