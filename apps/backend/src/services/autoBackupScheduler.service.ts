import cron from 'node-cron';
import { db } from '../config/db';
import { backupSchedules, backupHistory } from '../db/schema/settings';
import { eq, desc, and, lt } from 'drizzle-orm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execPromise = promisify(exec);

interface BackupSchedule {
  id: number;
  scheduleName: string;
  scheduleType: string;
  scheduleTime: string | null;
  scheduleDay: number | null;
  scheduleDate: number | null;
  isEnabled: boolean;
  retentionDays: number | null;
  lastRun: Date | null;
  nextRun: Date | null;
}

interface BackupResult {
  success: boolean;
  filename?: string;
  filePath?: string;
  fileSize?: number;
  error?: string;
}

class AutoBackupScheduler {
  private jobs: Map<number, cron.ScheduledTask> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize scheduler - load all active schedules from database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Backup scheduler already initialized');
      return;
    }

    try {
      console.log('📅 Initializing backup scheduler...');

      // Load all enabled schedules
      const schedules = await db
        .select()
        .from(backupSchedules)
        .where(eq(backupSchedules.isEnabled, true));

      // Start each schedule
      for (const schedule of schedules) {
        await this.addSchedule(schedule as unknown as BackupSchedule);
      }

      // Start cleanup job (runs daily at 4 AM)
      this.startCleanupJob();

      this.isInitialized = true;
      console.log(`✅ Backup scheduler initialized with ${schedules.length} active schedule(s)`);
    } catch (error: any) {
      console.error('❌ Failed to initialize backup scheduler:', error.message);
      throw error;
    }
  }

  /**
   * Add a new scheduled backup job
   */
  async addSchedule(schedule: BackupSchedule): Promise<void> {
    try {
      // Stop existing job if any
      this.removeSchedule(schedule.id);

      // Get cron expression
      const cronExpression = this.getCronExpression(schedule);
      if (!cronExpression) {
        console.warn(`⚠️ Invalid schedule configuration for ${schedule.scheduleName}`);
        return;
      }

      // Create cron job
      const job = cron.schedule(cronExpression, async () => {
        console.log(`⏰ Running scheduled backup: ${schedule.scheduleName}`);
        await this.executeBackup(schedule.id, schedule.scheduleType, 0);
      });

      this.jobs.set(schedule.id, job);

      // Calculate and update next run time
      const nextRun = this.calculateNextRun();
      await db
        .update(backupSchedules)
        .set({ nextRun })
        .where(eq(backupSchedules.id, schedule.id));

      console.log(`✅ Scheduled backup: ${schedule.scheduleName} (${cronExpression})`);
    } catch (error: any) {
      console.error(`❌ Failed to add schedule ${schedule.scheduleName}:`, error.message);
    }
  }

  /**
   * Remove a scheduled backup job
   */
  removeSchedule(scheduleId: number): void {
    const job = this.jobs.get(scheduleId);
    if (job) {
      job.stop();
      this.jobs.delete(scheduleId);
      console.log(`🛑 Stopped backup schedule ID: ${scheduleId}`);
    }
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(schedule: BackupSchedule): Promise<void> {
    if (schedule.isEnabled) {
      await this.addSchedule(schedule);
    } else {
      this.removeSchedule(schedule.id);
    }
  }

  /**
   * Execute a backup
   */
  async executeBackup(
    scheduleId: number | null,
    backupType: string,
    createdBy: number
  ): Promise<BackupResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `backup-${timestamp}.sql`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'backups');
    const filePath = path.join(uploadDir, filename);

    try {
      // Ensure backup directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Get database connection info from environment
      const dbUrl = process.env.DATABASE_URL || '';
      const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      
      if (!match) {
        throw new Error('Invalid DATABASE_URL format');
      }

      const [, user, password, host, port, database] = match;

      // Execute pg_dump
      const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F c -f "${filePath}"`;
      
      // Set PGPASSWORD environment variable
      await execPromise(command, {
        env: { ...process.env, PGPASSWORD: password },
      });

      // Get file size
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      // Record backup in database
      await db.insert(backupHistory).values({
        filename,
        filePath,
        fileSize,
        backupType,
        status: 'success',
        createdBy: createdBy || null,
        metadata: scheduleId ? { scheduleId } : null,
      });

      // Update schedule's last run time
      if (scheduleId) {
        await db
          .update(backupSchedules)
          .set({ lastRun: new Date() })
          .where(eq(backupSchedules.id, scheduleId));
      }

      console.log(`✅ Backup created successfully: ${filename} (${this.formatBytes(fileSize)})`);

      return {
        success: true,
        filename,
        filePath,
        fileSize,
      };
    } catch (error: any) {
      console.error('❌ Backup failed:', error.message);

      // Record failed backup
      await db.insert(backupHistory).values({
        filename,
        filePath: '',
        fileSize: 0,
        backupType,
        status: 'failed',
        errorMessage: error.message,
        createdBy: createdBy || null,
        metadata: scheduleId ? { scheduleId } : null,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<number> {
    try {
      console.log('🧹 Starting backup cleanup...');

      // Get retention days from settings (default 90 days)
      const retentionDays = 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Get backups to delete
      const oldBackups = await db
        .select()
        .from(backupHistory)
        .where(
          and(
            eq(backupHistory.status, 'success'),
            lt(backupHistory.createdAt, cutoffDate)
          )
        );

      let deletedCount = 0;

      // Delete files and mark as deleted
      for (const backup of oldBackups) {
        try {
          // Delete file
          if (backup.filePath) {
            await fs.unlink(backup.filePath);
          }

          // Mark as deleted in database
          await db
            .update(backupHistory)
            .set({ deletedAt: new Date() })
            .where(eq(backupHistory.id, backup.id));

          deletedCount++;
        } catch (error: any) {
          console.error(`Failed to delete backup ${backup.filename}:`, error.message);
        }
      }

      console.log(`✅ Cleanup complete: ${deletedCount} old backup(s) deleted`);
      return deletedCount;
    } catch (error: any) {
      console.error('❌ Cleanup failed:', error.message);
      return 0;
    }
  }

  /**
   * Get backup history
   */
  async getBackupHistory(limit: number = 50, offset: number = 0) {
    const backups = await db
      .select()
      .from(backupHistory)
      .where(eq(backupHistory.deletedAt, null as any))
      .orderBy(desc(backupHistory.createdAt))
      .limit(limit)
      .offset(offset);

    return backups;
  }

  /**
   * Get backup statistics
   */
  async getBackupStatistics() {
    const allBackups = await db
      .select()
      .from(backupHistory)
      .where(eq(backupHistory.deletedAt, null as any));

    const totalBackups = allBackups.length;
    const successfulBackups = allBackups.filter(b => b.status === 'success').length;
    const failedBackups = allBackups.filter(b => b.status === 'failed').length;
    const totalSize = allBackups.reduce((sum, b) => sum + (Number(b.fileSize) || 0), 0);

    const latestBackup = allBackups.find(b => b.status === 'success');

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      totalSize,
      latestBackup: latestBackup?.createdAt || null,
    };
  }

  /**
   * Convert schedule config to cron expression
   */
  private getCronExpression(schedule: BackupSchedule): string | null {
    const time = schedule.scheduleTime || '03:00';
    const [hour, minute] = time.split(':').map(Number);

    switch (schedule.scheduleType) {
      case 'daily':
        return `${minute} ${hour} * * *`; // Every day at specified time

      case 'weekly':
        const day = schedule.scheduleDay || 0; // 0 = Sunday
        return `${minute} ${hour} * * ${day}`;

      case 'monthly':
        const date = schedule.scheduleDate || 1;
        return `${minute} ${hour} ${date} * *`;

      default:
        return null;
    }
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(): Date {
    // Simple calculation - for production use a proper cron parser
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  /**
   * Start cleanup job (runs daily at 4 AM)
   */
  private startCleanupJob(): void {
    cron.schedule('0 4 * * *', async () => {
      console.log('⏰ Running scheduled backup cleanup');
      await this.cleanupOldBackups();
    });
    console.log('✅ Backup cleanup job scheduled (daily at 4:00 AM)');
  }

  /**
   * Format bytes to human readable size
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export singleton instance
export const autoBackupScheduler = new AutoBackupScheduler();
