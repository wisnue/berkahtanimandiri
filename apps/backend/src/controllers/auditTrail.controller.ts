import { Request, Response } from 'express';
import { db } from '../config/db';
import { auditTrail } from '../db/schema/audit-trail';
import { users } from '../db/schema';
import { eq, and, like, desc, asc, sql, gte, lte, between } from 'drizzle-orm';

export class AuditTrailController {
  /**
   * Get all audit trail with pagination, search, and filter
   */
  static async getAll(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        tableName = '',
        action = '',
        userId = '',
        startDate = '',
        endDate = '',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          like(auditTrail.description, `%${search}%`)
        );
      }

      if (tableName) {
        whereConditions.push(eq(auditTrail.tableName, tableName as string));
      }

      if (action) {
        whereConditions.push(eq(auditTrail.action, action as string));
      }

      if (userId) {
        whereConditions.push(eq(auditTrail.userId, userId as string));
      }

      if (startDate && endDate) {
        whereConditions.push(
          between(auditTrail.createdAt, new Date(startDate as string), new Date(endDate as string))
        );
      } else if (startDate) {
        whereConditions.push(gte(auditTrail.createdAt, new Date(startDate as string)));
      } else if (endDate) {
        whereConditions.push(lte(auditTrail.createdAt, new Date(endDate as string)));
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditTrail)
        .where(whereClause);

      // Get data with pagination and join with users
      const data = await db
        .select({
          id: auditTrail.id,
          userId: auditTrail.userId,
          userName: users.fullName,
          userEmail: users.email,
          createdAt: auditTrail.createdAt,
          tableName: auditTrail.tableName,
          recordId: auditTrail.recordId,
          action: auditTrail.action,
          oldValues: auditTrail.oldValues,
          newValues: auditTrail.newValues,
          changedFields: auditTrail.changedFields,
          description: auditTrail.description,
          ipAddress: auditTrail.ipAddress,
          userAgent: auditTrail.userAgent,
          metadata: auditTrail.metadata,
        })
        .from(auditTrail)
        .leftJoin(users, eq(auditTrail.userId, users.id))
        .where(whereClause)
        .orderBy(sortOrder === 'asc' ? asc(auditTrail.createdAt) : desc(auditTrail.createdAt))
        .limit(limitNum)
        .offset(offset);

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages: Math.ceil(count / limitNum),
        },
      });
    } catch (error) {
      console.error('Get all audit trail error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data audit trail',
      });
    }
  }

  /**
   * Get audit trail by ID (single entry detail)
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [data] = await db
        .select({
          id: auditTrail.id,
          userId: auditTrail.userId,
          userName: users.fullName,
          userEmail: users.email,
          createdAt: auditTrail.createdAt,
          tableName: auditTrail.tableName,
          recordId: auditTrail.recordId,
          action: auditTrail.action,
          oldValues: auditTrail.oldValues,
          newValues: auditTrail.newValues,
          changedFields: auditTrail.changedFields,
          description: auditTrail.description,
          ipAddress: auditTrail.ipAddress,
          userAgent: auditTrail.userAgent,
          metadata: auditTrail.metadata,
        })
        .from(auditTrail)
        .leftJoin(users, eq(auditTrail.userId, users.id))
        .where(eq(auditTrail.id, id))
        .limit(1);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Audit trail tidak ditemukan',
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get audit trail by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data audit trail',
      });
    }
  }

  /**
   * Get audit trail for specific record
   * Shows complete history of a single record across all tables
   */
  static async getByRecord(req: Request, res: Response) {
    try {
      const { tableName, recordId } = req.params;

      const data = await db
        .select({
          id: auditTrail.id,
          userId: auditTrail.userId,
          userName: users.fullName,
          userEmail: users.email,
          createdAt: auditTrail.createdAt,
          action: auditTrail.action,
          oldValues: auditTrail.oldValues,
          newValues: auditTrail.newValues,
          changedFields: auditTrail.changedFields,
          description: auditTrail.description,
          ipAddress: auditTrail.ipAddress,
        })
        .from(auditTrail)
        .leftJoin(users, eq(auditTrail.userId, users.id))
        .where(and(
          eq(auditTrail.tableName, tableName),
          eq(auditTrail.recordId, recordId)
        ))
        .orderBy(desc(auditTrail.createdAt));

      return res.status(200).json({
        success: true,
        data,
        message: `Ditemukan ${data.length} riwayat perubahan untuk ${tableName}:${recordId}`,
      });
    } catch (error) {
      console.error('Get audit trail by record error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil riwayat perubahan',
      });
    }
  }

  /**
   * Get audit trail statistics
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateFilter = [];
      if (startDate && endDate) {
        dateFilter.push(
          between(auditTrail.createdAt, new Date(startDate as string), new Date(endDate as string))
        );
      } else if (startDate) {
        dateFilter.push(gte(auditTrail.createdAt, new Date(startDate as string)));
      } else if (endDate) {
        dateFilter.push(lte(auditTrail.createdAt, new Date(endDate as string)));
      }

      const dateClause = dateFilter.length > 0 ? and(...dateFilter) : undefined;

      // Total audit entries
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(auditTrail)
        .where(dateClause);

      // By Action
      const byAction = await db
        .select({
          action: auditTrail.action,
          count: sql<number>`count(*)::int`,
        })
        .from(auditTrail)
        .where(dateClause)
        .groupBy(auditTrail.action);

      // By Table
      const byTable = await db
        .select({
          tableName: auditTrail.tableName,
          count: sql<number>`count(*)::int`,
        })
        .from(auditTrail)
        .where(dateClause)
        .groupBy(auditTrail.tableName)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // By User (Top 10)
      const byUser = await db
        .select({
          userId: auditTrail.userId,
          userName: users.fullName,
          count: sql<number>`count(*)::int`,
        })
        .from(auditTrail)
        .leftJoin(users, eq(auditTrail.userId, users.id))
        .where(dateClause)
        .groupBy(auditTrail.userId, users.fullName)
      // Recent Activity (Last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [{ recentActivity }] = await db
        .select({ recentActivity: sql<number>`count(*)::int` })
        .from(auditTrail)
        .where(gte(auditTrail.createdAt, yesterday));

      return res.status(200).json({
        success: true,
        data: {
          total,
          recentActivity,
          byAction,
          byTable,
          byUser,
        },
      });
    } catch (error) {
      console.error('Get audit trail statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik audit trail',
      });
    }
  }

  /**
   * Export audit trail to CSV/Excel format
   * Returns data suitable for download
   */
  static async export(req: Request, res: Response) {
    try {
      const {
        tableName = '',
        action = '',
        userId = '',
        startDate = '',
        endDate = '',
      } = req.query;

      // Build where conditions
      const whereConditions = [];

      if (tableName) {
        whereConditions.push(eq(auditTrail.tableName, tableName as string));
      }

      if (action) {
        whereConditions.push(eq(auditTrail.action, action as string));
      }

      if (userId) {
        whereConditions.push(eq(auditTrail.userId, userId as string));
      }

      if (startDate && endDate) {
        whereConditions.push(
          between(auditTrail.createdAt, new Date(startDate as string), new Date(endDate as string))
        );
      } else if (startDate) {
        whereConditions.push(gte(auditTrail.createdAt, new Date(startDate as string)));
      } else if (endDate) {
        whereConditions.push(lte(auditTrail.createdAt, new Date(endDate as string)));
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get data for export (limit to 10,000 records for safety)
      const data = await db
        .select({
          createdAt: auditTrail.createdAt,
          userName: users.fullName,
          tableName: auditTrail.tableName,
          recordId: auditTrail.recordId,
          action: auditTrail.action,
          description: auditTrail.description,
          changedFields: auditTrail.changedFields,
          ipAddress: auditTrail.ipAddress,
        })
        .from(auditTrail)
        .leftJoin(users, eq(auditTrail.userId, users.id))
        .where(whereClause)
        .orderBy(desc(auditTrail.createdAt))
        .limit(10000);

      return res.status(200).json({
        success: true,
        data,
        message: `${data.length} audit trail records exported`,
      });
    } catch (error) {
      console.error('Export audit trail error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat export audit trail',
      });
    }
  }
}
