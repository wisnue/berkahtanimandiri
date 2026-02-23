import cron from 'node-cron';
import { db } from '../config/db';
import { dokumenOrganisasi } from '../db/schema/dokumen-organisasi';
import { users } from '../db/schema/users';
import { and, eq, gte, isNotNull, isNull, lte, sql } from 'drizzle-orm';
import { emailService } from './email.service';

class NotificationSchedulerService {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Start the notification scheduler
   * Runs daily at 8:00 AM to check for expiring documents
   */
  start() {
    // Schedule: Every day at 8:00 AM
    // Cron format: minute hour day month dayOfWeek
    this.cronJob = cron.schedule('0 8 * * *', async () => {
      console.log('[Scheduler] Running daily document expiry check...');
      await this.checkExpiringDocuments();
    });

    console.log('✅ Notification scheduler started (Daily at 08:00)');
    
    // Run immediately on startup for testing (optional, comment out in production)
    // this.checkExpiringDocuments();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏸️ Notification scheduler stopped');
    }
  }

  /**
   * Check for documents expiring within 30 days and send notifications
   */
  private async checkExpiringDocuments() {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      // Query documents expiring within 30 days
      const expiringDocs = await db
        .select({
          id: dokumenOrganisasi.id,
          judulDokumen: dokumenOrganisasi.judulDokumen,
          jenisDokumen: dokumenOrganisasi.jenisDokumen,
          tanggalKadaluarsa: dokumenOrganisasi.tanggalKadaluarsa,
          statusDokumen: dokumenOrganisasi.statusDokumen,
        })
        .from(dokumenOrganisasi)
        .where(
          and(
            isNull(dokumenOrganisasi.deletedAt), // Not deleted
            isNotNull(dokumenOrganisasi.tanggalKadaluarsa), // Has expiry date
            eq(dokumenOrganisasi.statusDokumen, 'aktif'), // Active status
            lte(dokumenOrganisasi.tanggalKadaluarsa, thirtyDaysFromNow.toISOString()), // Expiring soon
            gte(dokumenOrganisasi.tanggalKadaluarsa, today.toISOString()) // Not yet expired
          )
        );

      if (expiringDocs.length === 0) {
        console.log('[Scheduler] No documents expiring soon');
        return;
      }

      console.log(`[Scheduler] Found ${expiringDocs.length} documents expiring soon`);

      // Calculate days until expiry for each document
      const docsWithDays = expiringDocs.map((doc) => {
        const expiryDate = new Date(doc.tanggalKadaluarsa!);
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...doc,
          tanggalKadaluarsa: doc.tanggalKadaluarsa!,
          daysUntilExpiry,
        };
      });

      // Get admin and ketua emails
      const recipients = await this.getNotificationRecipients();

      if (recipients.length === 0) {
        console.log('[Scheduler] No recipients found for notifications');
        return;
      }

      // Send email notification
      const emailSent = await emailService.sendExpiringDocumentNotification(
        recipients,
        docsWithDays
      );

      if (emailSent) {
        console.log(`[Scheduler] ✅ Notification sent to ${recipients.length} recipients`);
      } else {
        console.log('[Scheduler] ❌ Failed to send notification email');
      }

      // Log to audit trail (optional)
      console.log('[Scheduler] Document expiry check completed');
    } catch (error) {
      console.error('[Scheduler] Error checking expiring documents:', error);
    }
  }

  /**
   * Get email addresses of users who should receive notifications
   * (Admin, Ketua, Sekretaris)
   */
  private async getNotificationRecipients(): Promise<string[]> {
    try {
      const admins = await db
        .select({
          email: users.email,
        })
        .from(users)
        .where(
          and(
            isNull(users.deletedAt),
            sql`${users.role} IN ('admin', 'ketua', 'sekretaris')`
          )
        );

      return admins
        .map((user) => user.email)
        .filter((email): email is string => email !== null && email !== undefined);
    } catch (error) {
      console.error('[Scheduler] Error getting notification recipients:', error);
      return [];
    }
  }

  /**
   * Manually trigger expiry check (for testing)
   */
  async triggerManualCheck() {
    console.log('[Scheduler] Manual document expiry check triggered');
    await this.checkExpiringDocuments();
  }
}

export const notificationScheduler = new NotificationSchedulerService();
