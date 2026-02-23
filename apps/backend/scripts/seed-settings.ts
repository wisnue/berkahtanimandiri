/**
 * Seed initial settings data to database
 * 
 * This populates:
 * - system_settings (20 default settings)
 * - organization_settings (1 default organization)
 * - backup_schedules (1 daily backup schedule)
 */

import { db } from '../src/config/db';
import { systemSettings, organizationSettings, backupSchedules } from '../src/db/schema/settings';
import { sql } from 'drizzle-orm';

async function seedSettings() {
  console.log('🌱 Seeding settings data...\n');

  try {
    // Check if system_settings redan populated
    const existingSettings = await db.select().from(systemSettings).limit(1);
    
    if (existingSettings.length > 0) {
      console.log('⚠️  System settings already exist!');
      console.log('   Do you want to re-seed? This will DELETE existing settings.');
      console.log('   Run with --force flag to proceed.\n');
      
      if (!process.argv.includes('--force')) {
        console.log('✅ Skipping seed. Use --force to override.');
        process.exit(0);
      }
      
      // Delete existing settings
      console.log('🗑️  Deleting existing settings...');
      await db.delete(systemSettings);
      console.log('✅ Existing settings deleted.\n');
    }

    // Insert default system settings
    console.log('📝 Inserting system settings...');
    await db.insert(systemSettings).values([
      // General Settings
      { settingKey: 'app_name', settingValue: 'KTH BTM Management System', settingCategory: 'general', settingType: 'string', description: 'Application name', isPublic: true },
      { settingKey: 'app_version', settingValue: '1.0.0', settingCategory: 'general', settingType: 'string', description: 'Application version', isPublic: true },
      { settingKey: 'app_timezone', settingValue: 'Asia/Jakarta', settingCategory: 'general', settingType: 'string', description: 'Default timezone', isPublic: false },
      { settingKey: 'date_format', settingValue: 'DD/MM/YYYY', settingCategory: 'general', settingType: 'string', description: 'Date display format', isPublic: false },
      { settingKey: 'currency', settingValue: 'IDR', settingCategory: 'general', settingType: 'string', description: 'Default currency', isPublic: true },

      // Security Settings
      { settingKey: 'session_timeout', settingValue: '1800', settingCategory: 'security', settingType: 'number', description: 'Session timeout in seconds (30 min)', isPublic: false },
      { settingKey: 'max_login_attempts', settingValue: '5', settingCategory: 'security', settingType: 'number', description: 'Maximum login attempts before lockout', isPublic: false },
      { settingKey: 'account_lockout_duration', settingValue: '900', settingCategory: 'security', settingType: 'number', description: 'Account lockout duration in seconds (15 min)', isPublic: false },
      { settingKey: 'password_expiry_days', settingValue: '90', settingCategory: 'security', settingType: 'number', description: 'Password expiration days', isPublic: false },
      { settingKey: 'password_min_length', settingValue: '8', settingCategory: 'security', settingType: 'number', description: 'Minimum password length', isPublic: false },
      { settingKey: 'password_require_uppercase', settingValue: 'true', settingCategory: 'security', settingType: 'boolean', description: 'Require uppercase in password', isPublic: false },
      { settingKey: 'password_require_lowercase', settingValue: 'true', settingCategory: 'security', settingType: 'boolean', description: 'Require lowercase in password', isPublic: false },
      { settingKey: 'password_require_number', settingValue: 'true', settingCategory: 'security', settingType: 'boolean', description: 'Require number in password', isPublic: false },
      { settingKey: 'password_require_special', settingValue: 'true', settingCategory: 'security', settingType: 'boolean', description: 'Require special character in password', isPublic: false },
      { settingKey: 'two_factor_enabled', settingValue: 'false', settingCategory: 'security', settingType: 'boolean', description: 'Enable two-factor authentication', isPublic: false },

      // Backup Settings
      { settingKey: 'backup_retention_days', settingValue: '90', settingCategory: 'backup', settingType: 'number', description: 'Backup retention period in days', isPublic: false },
      { settingKey: 'backup_auto_cleanup', settingValue: 'true', settingCategory: 'backup', settingType: 'boolean', description: 'Automatically cleanup old backups', isPublic: false },
      { settingKey: 'backup_compression', settingValue: 'true', settingCategory: 'backup', settingType: 'boolean', description: 'Compress backup files', isPublic: false },

      // Email Settings
      { settingKey: 'email_from_name', settingValue: 'KTH BTM System', settingCategory: 'email', settingType: 'string', description: 'Email sender name', isPublic: false },
      { settingKey: 'email_from_address', settingValue: 'noreply@kthbtm.org', settingCategory: 'email', settingType: 'string', description: 'Email sender address', isPublic: false },

      // Notification Settings
      { settingKey: 'notification_email_enabled', settingValue: 'true', settingCategory: 'notification', settingType: 'boolean', description: 'Enable email notifications', isPublic: false },
      { settingKey: 'notification_expiry_reminder_days', settingValue: '30', settingCategory: 'notification', settingType: 'number', description: 'Days before expiry to send reminder', isPublic: false },
    ]);
    console.log('✅ Inserted 22 system settings\n');

    // Check organization settings
    const existingOrg = await db.select().from(organizationSettings).limit(1);
    
    if (existingOrg.length === 0) {
      console.log('📝 Inserting default organization settings...');
      await db.insert(organizationSettings).values({
        organizationName: 'Kelompok Tani Hutan Bina Taruna Mandiri',
        organizationShortName: 'KTH BTM',
        organizationAddress: 'Desa Gembol, Kec. Karanganyar, Kab. Ngawi, Jawa Timur',
        organizationPhone: '081234567890',
        organizationEmail: 'info@kthbtm.org',
        organizationWebsite: 'https://kthbtm.org',
        headName: '',
        headPosition: 'Ketua',
        secretaryName: '',
        treasurerName: '',
        fiscalYearStart: 1,
      });
      console.log('✅ Inserted default organization settings\n');
    } else {
      console.log('⏭️  Organization settings already exist, skipping\n');
    }

    // Check backup schedules
    const existingSchedules = await db.select().from(backupSchedules).limit(1);
    
    if (existingSchedules.length === 0) {
      console.log('📝 Inserting default backup schedule...');
      await db.insert(backupSchedules).values({
        scheduleName: 'Daily Backup',
        scheduleType: 'daily',
        scheduleTime: '03:00',
        isEnabled: true,
        retentionDays: 90,
        nextRun: sql`CURRENT_TIMESTAMP + INTERVAL '1 day'`,
      });
      console.log('✅ Inserted default daily backup schedule\n');
    } else {
      console.log('⏭️  Backup schedules already exist, skipping\n');
    }

    // Summary
    console.log('=== SEED SUMMARY ===');
    const totalSettings = await db.select().from(systemSettings);
    const totalOrg = await db.select().from(organizationSettings);
    const totalSchedules = await db.select().from(backupSchedules);
    
    console.log(`✅ System Settings: ${totalSettings.length} rows`);
    console.log(`✅ Organization: ${totalOrg.length} row`);
    console.log(`✅ Backup Schedules: ${totalSchedules.length} row\n`);
    
    console.log('🎉 Settings data seeded successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart backend server');
    console.log('   2. Login to frontend and navigate to Settings page');
    console.log('   3. Verify all tabs load correctly\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    process.exit(1);
  }
}

seedSettings();
