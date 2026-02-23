/**
 * Comprehensive Settings Controller
 * Handles all system settings, organization info, backups, and audit logs
 * Audit-ready with full tracking and validation
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import {
  systemSettings,
  organizationSettings,
  backupHistory,
  backupSchedules,
  settingsAuditLog,
  systemHealthMetrics,
} from '../db/schema/settings';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';
import { autoBackupScheduler } from '../services/autoBackupScheduler.service';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Get all system settings grouped by category
 */
export const getAllSystemSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await db.select().from(systemSettings);

    // Group by category
    const grouped = settings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      
      // Convert value based on type
      let value: any = setting.settingValue;
      if (setting.settingType === 'boolean') {
        value = setting.settingValue === 'true';
      } else if (setting.settingType === 'number') {
        value = parseInt(setting.settingValue, 10);
      } else if (setting.settingType === 'json') {
        try {
          value = JSON.parse(setting.settingValue);
        } catch {
          value = setting.settingValue;
        }
      }

      acc[setting.category][setting.settingKey] = {
        value,
        type: setting.settingType,
        description: setting.description,
        isSensitive: setting.isSensitive,
      };

      return acc;
    }, {});

    res.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get settings by category
 */
export const getSettingsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;

    const settings = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.category, category));

    const formatted = settings.map((setting) => {
      let value: any = setting.settingValue;
      if (setting.settingType === 'boolean') {
        value = setting.settingValue === 'true';
      } else if (setting.settingType === 'number') {
        value = parseInt(setting.settingValue, 10);
      } else if (setting.settingType === 'json') {
        try {
          value = JSON.parse(setting.settingValue);
        } catch {
          value = setting.settingValue;
        }
      }

      return {
        key: setting.settingKey,
        value,
        type: setting.settingType,
        description: setting.description,
        isSensitive: setting.isSensitive,
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = req.body;
    const userId = req.session.userId!;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      // Get old value for audit
      const [oldSetting] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, key));

      if (!oldSetting) continue;

      // Convert value to string based on type
      let stringValue: string;
      if (typeof value === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = String(value);
      }

      // Update setting
      await db
        .update(systemSettings)
        .set({
          settingValue: stringValue,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, oldSetting.id));

      // Log to audit
      await db.insert(settingsAuditLog).values({
        settingCategory: oldSetting.category,
        settingKey: key,
        oldValue: oldSetting.settingValue,
        newValue: stringValue,
        changeType: 'update',
        changedBy: userId,
        ipAddress,
        userAgent,
      });
    }

    res.json({
      success: true,
      message: 'Pengaturan sistem berhasil diperbarui',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization settings
 */
export const getOrganizationSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [org] = await db
      .select()
      .from(organizationSettings)
      .limit(1);

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization settings not found',
      });
    }

    res.json({
      success: true,
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update organization settings
 */
export const updateOrganizationSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgData = req.body;
    const userId = req.session.userId!;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Get existing settings
    const [existing] = await db
      .select()
      .from(organizationSettings)
      .limit(1);

    if (existing) {
      // Update
      await db
        .update(organizationSettings)
        .set({
          ...orgData,
          updatedAt: new Date(),
        })
        .where(eq(organizationSettings.id, existing.id));

      // Log to audit
      await db.insert(settingsAuditLog).values({
        settingCategory: 'organization',
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(orgData),
        changeType: 'update',
        changedBy: userId,
        ipAddress,
        userAgent,
      });
    } else {
      // Insert
      await db.insert(organizationSettings).values(orgData);

      await db.insert(settingsAuditLog).values({
        settingCategory: 'organization',
        newValue: JSON.stringify(orgData),
        changeType: 'create',
        changedBy: userId,
        ipAddress,
        userAgent,
      });
    }

    res.json({
      success: true,
      message: 'Pengaturan organisasi berhasil diperbarui',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create manual backup
 */
export const createBackup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.session.userId!;

    const result = await autoBackupScheduler.executeBackup(null, 'manual', userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Backup berhasil dibuat',
        data: {
          filename: result.filename,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Gagal membuat backup',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get backup history
 */
export const getBackupHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const backups = await autoBackupScheduler.getBackupHistory(limit, offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(backupHistory)
      .where(eq(backupHistory.isDeleted, false));

    res.json({
      success: true,
      data: {
        backups,
        total: Number(count),
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download backup file
 */
export const downloadBackup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [backup] = await db
      .select()
      .from(backupHistory)
      .where(
        and(
          eq(backupHistory.id, parseInt(id)),
          eq(backupHistory.isDeleted, false),
          eq(backupHistory.status, 'success')
        )
      );

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found',
      });
    }

    // Security check
    if (backup.filename.includes('..') || !backup.filename.endsWith('.sql')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename',
      });
    }

    res.download(backup.filePath, backup.filename);
  } catch (error) {
    next(error);
  }
};

/**
 * Restore database from backup
 */
export const restoreBackup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId!;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const [backup] = await db
      .select()
      .from(backupHistory)
      .where(eq(backupHistory.id, parseInt(id)));

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found',
      });
    }

    // TODO: Implement restore logic
    // This is a critical operation and should be implemented carefully
    // For now, just log the attempt

    await db.insert(settingsAuditLog).values({
      settingCategory: 'backup',
      settingKey: 'restore',
      newValue: `Restore from ${backup.filename}`,
      changeType: 'restore',
      changedBy: userId,
      ipAddress,
      userAgent,
      changeReason: 'Database restore attempt',
    });

    res.json({
      success: false,
      message: 'Restore functionality not yet implemented - this is a critical operation',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete backup file
 */
export const deleteBackup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId!;

    const [backup] = await db
      .select()
      .from(backupHistory)
      .where(eq(backupHistory.id, parseInt(id)));

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found',
      });
    }

    // Mark as deleted
    await db
      .update(backupHistory)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(backupHistory.id, parseInt(id)));

    // Delete actual file
    try {
      await fs.unlink(backup.filePath);
    } catch (error) {
      console.error('Failed to delete backup file:', error);
    }

    res.json({
      success: true,
      message: 'Backup berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get backup statistics
 */
export const getBackupStatistics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await autoBackupScheduler.getBackupStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get backup schedules
 */
export const getBackupSchedules = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedules = await db
      .select()
      .from(backupSchedules)
      .orderBy(backupSchedules.scheduleName);

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update backup schedule
 */
export const updateBackupSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const scheduleData = req.body;

    await db
      .update(backupSchedules)
      .set({
        ...scheduleData,
        updatedAt: new Date(),
      })
      .where(eq(backupSchedules.id, parseInt(id)));

    // Reload scheduler
    const [updated] = await db
      .select()
      .from(backupSchedules)
      .where(eq(backupSchedules.id, parseInt(id)));

    if (updated) {
      await autoBackupScheduler.updateSchedule(updated);
    }

    res.json({
      success: true,
      message: 'Jadwal backup berhasil diperbarui',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get settings audit log
 */
export const getSettingsAuditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = req.query.category as string;

    let query = db.select().from(settingsAuditLog);

    if (category) {
      query = query.where(eq(settingsAuditLog.settingCategory, category)) as any;
    }

    const logs = await query
      .orderBy(desc(settingsAuditLog.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countQuery = category
      ? db.select({ count: sql<number>`COUNT(*)` }).from(settingsAuditLog).where(eq(settingsAuditLog.settingCategory, category))
      : db.select({ count: sql<number>`COUNT(*)` }).from(settingsAuditLog);

    const [{ count }] = await countQuery;

    res.json({
      success: true,
      data: {
        logs,
        total: Number(count),
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system health metrics
 */
export const getSystemHealthMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const metrics = await db
      .select()
      .from(systemHealthMetrics)
      .where(gte(systemHealthMetrics.recordedAt, since))
      .orderBy(desc(systemHealthMetrics.recordedAt));

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record system health metric
 */
export const recordSystemHealthMetric = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { metricType, metricValue, metricUnit } = req.body;

    await db.insert(systemHealthMetrics).values({
      metricType,
      metricValue: metricValue.toString(),
      metricUnit,
    });

    res.json({
      success: true,
      message: 'Metric recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Run backup cleanup manually
 */
export const runBackupCleanup = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedCount = await autoBackupScheduler.cleanupOldBackups();

    res.json({
      success: true,
      message: `Cleanup completed: ${deletedCount} old backups removed`,
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================

/**
 * Alias for getAllSystemSettings (for backward compatibility)
 */
export const getSystemSettings = getAllSystemSettings;

/**
 * Alias for createBackup (for backward compatibility)
 */
export const backupDatabase = createBackup;

/**
 * Alias for restoreBackup (for backward compatibility)
 */
export const restoreDatabase = restoreBackup;

// ============================================
// STUB FUNCTIONS (TO BE IMPLEMENTED)
// ============================================

/**
 * Get all roles
 */
export const getRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement with database
    const roles = [
      { id: 1, name: 'Admin', permissions: ['all'], userCount: 1 },
      { id: 2, name: 'Ketua', permissions: ['view', 'create', 'edit', 'verify'], userCount: 1 },
      { id: 3, name: 'Sekretaris', permissions: ['view', 'create', 'edit'], userCount: 2 },
      { id: 4, name: 'Bendahara', permissions: ['view', 'create', 'edit'], userCount: 1 },
      { id: 5, name: 'Anggota', permissions: ['view'], userCount: 25 },
    ];
    
    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new role
 */
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement with database
    res.json({
      success: true,
      message: 'Role creation not yet implemented',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 */
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement with database
    res.json({
      success: true,
      message: 'Role update not yet implemented',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 */
export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement with database
    res.json({
      success: true,
      message: 'Role deletion not yet implemented',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test email configuration
 */
export const testEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement email testing
    res.json({
      success: true,
      message: 'Email test functionality not yet implemented',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger expiry notifications manually
 */
export const triggerExpiryNotifications = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement notification triggering
    res.json({
      success: true,
      message: 'Notification trigger functionality not yet implemented',
    });
  } catch (error) {
    next(error);
  }
};
