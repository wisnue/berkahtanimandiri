import { db } from '../config/db';
import { auditTrail } from '../db/schema/audit-trail';
import { Request } from 'express';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'APPROVE' | 'REJECT';

interface AuditLogOptions {
  userId: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  metadata?: Record<string, any>;
  req?: Request;
}

class AuditTrailService {
  /**
   * Create audit trail entry
   * Automatically captures IP address and user agent from request
   */
  async createAuditLog(options: AuditLogOptions): Promise<void> {
    try {
      const {
        userId,
        tableName,
        recordId,
        action,
        oldValues = null,
        newValues = null,
        description,
        metadata = null,
        req,
      } = options;

      // Calculate changed fields if both old and new values provided
      const changedFields = this.getChangedFields(oldValues, newValues);

      // Get IP address from request
      const ipAddress = req ? this.getIpAddress(req) : null;

      // Get user agent from request
      const userAgent = req?.headers['user-agent'] || null;

      // Insert audit log
      await db.insert(auditTrail).values({
        userId,
        tableName,
        recordId,
        action,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        changedFields: changedFields.length > 0 ? changedFields : null,
        description,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });

      console.log(`[AUDIT] ${action} on ${tableName}:${recordId} by user:${userId}`);
    } catch (error) {
      console.error('[AUDIT ERROR] Failed to create audit log:', error);
      // Don't throw - audit logging should not break the main operation
    }
  }

  /**
   * Get list of changed fields between old and new values
   */
  private getChangedFields(
    oldValues: Record<string, any> | null,
    newValues: Record<string, any> | null
  ): string[] {
    if (!oldValues || !newValues) {
      return [];
    }

    const changedFields: string[] = [];

    // Check all keys in new values
    Object.keys(newValues).forEach((key) => {
      // Ignore timestamps and id fields
      if (
        key === 'created_at' ||
        key === 'updated_at' ||
        key === 'deleted_at' ||
        key === 'id'
      ) {
        return;
      }

      const oldValue = oldValues[key];
      const newValue = newValues[key];

      // Compare values (handle null, undefined, objects, arrays)
      if (!this.isEqual(oldValue, newValue)) {
        changedFields.push(key);
      }
    });

    return changedFields;
  }

  /**
   * Deep equality check for values
   */
  private isEqual(value1: any, value2: any): boolean {
    // Handle null and undefined
    if (value1 === null && value2 === null) return true;
    if (value1 === undefined && value2 === undefined) return true;
    if (value1 === null || value2 === null) return false;
    if (value1 === undefined || value2 === undefined) return false;

    // Handle primitives
    if (typeof value1 !== 'object' && typeof value2 !== 'object') {
      return value1 === value2;
    }

    // Handle dates
    if (value1 instanceof Date && value2 instanceof Date) {
      return value1.getTime() === value2.getTime();
    }

    // Handle arrays
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) return false;
      return value1.every((item, index) => this.isEqual(item, value2[index]));
    }

    // Handle objects
    if (typeof value1 === 'object' && typeof value2 === 'object') {
      const keys1 = Object.keys(value1);
      const keys2 = Object.keys(value2);

      if (keys1.length !== keys2.length) return false;

      return keys1.every((key) => this.isEqual(value1[key], value2[key]));
    }

    return false;
  }

  /**
   * Extract IP address from request
   * Handles proxy headers (X-Forwarded-For, X-Real-IP)
   */
  private getIpAddress(req: Request): string | null {
    // Check proxy headers first
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, get the first one
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      return ips.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to socket IP
    return req.socket.remoteAddress || null;
  }

  /**
   * Sanitize data before logging (remove sensitive fields)
   */
  sanitizeData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'apiKey'];
    const sanitized = { ...data };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Helper: Log CREATE action
   */
  async logCreate(
    userId: string,
    tableName: string,
    recordId: string,
    newValues: Record<string, any>,
    req?: Request,
    description?: string
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      tableName,
      recordId,
      action: 'CREATE',
      newValues: this.sanitizeData(newValues),
      description,
      req,
    });
  }

  /**
   * Helper: Log UPDATE action
   */
  async logUpdate(
    userId: string,
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    req?: Request,
    description?: string
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      tableName,
      recordId,
      action: 'UPDATE',
      oldValues: this.sanitizeData(oldValues),
      newValues: this.sanitizeData(newValues),
      description,
      req,
    });
  }

  /**
   * Helper: Log DELETE action
   */
  async logDelete(
    userId: string,
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    req?: Request,
    description?: string
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      tableName,
      recordId,
      action: 'DELETE',
      oldValues: this.sanitizeData(oldValues),
      description,
      req,
    });
  }

  /**
   * Helper: Log VERIFY action (for PNBP verification, document approval, etc)
   */
  async logVerify(
    userId: string,
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    req?: Request,
    description?: string
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      tableName,
      recordId,
      action: 'VERIFY',
      oldValues: this.sanitizeData(oldValues),
      newValues: this.sanitizeData(newValues),
      description,
      req,
    });
  }

  /**
   * Helper: Log APPROVE action
   */
  async logApprove(
    userId: string,
    tableName: string,
    recordId: string,
    metadata?: Record<string, any>,
    req?: Request,
    description?: string
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      tableName,
      recordId,
      action: 'APPROVE',
      metadata,
      description,
      req,
    });
  }

  /**
   * Helper: Log REJECT action
   */
  async logReject(
    userId: string,
    tableName: string,
    recordId: string,
    metadata?: Record<string, any>,
    req?: Request,
    description?: string
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      tableName,
      recordId,
      action: 'REJECT',
      metadata,
      description,
      req,
    });
  }
}

export const auditTrailService = new AuditTrailService();
