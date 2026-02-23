import { pgTable, serial, uuid, varchar, timestamp, text, integer, bigint, boolean, jsonb } from 'drizzle-orm/pg-core';

// Legacy settings table (kept for backward compatibility)
export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('string'),
  category: varchar('category', { length: 100 }),
  label: varchar('label', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// System Settings Table
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  settingKey: varchar('setting_key', { length: 100 }).unique().notNull(),
  settingValue: text('setting_value'),
  settingCategory: varchar('setting_category', { length: 50 }).notNull(),
  settingType: varchar('setting_type', { length: 20 }).default('string'),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Organization Settings Table
export const organizationSettings = pgTable('organization_settings', {
  id: serial('id').primaryKey(),
  organizationName: varchar('organization_name', { length: 255 }).notNull(),
  organizationShortName: varchar('organization_short_name', { length: 50 }),
  organizationLogo: text('organization_logo'),
  organizationAddress: text('organization_address'),
  organizationPhone: varchar('organization_phone', { length: 20 }),
  organizationEmail: varchar('organization_email', { length: 100 }),
  organizationWebsite: varchar('organization_website', { length: 255 }),
  headName: varchar('head_name', { length: 255 }),
  headPosition: varchar('head_position', { length: 100 }),
  secretaryName: varchar('secretary_name', { length: 255 }),
  treasurerName: varchar('treasurer_name', { length: 255 }),
  fiscalYearStart: integer('fiscal_year_start').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Backup History Table
export const backupHistory = pgTable('backup_history', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }),
  backupType: varchar('backup_type', { length: 20 }).default('manual'),
  status: varchar('status', { length: 20 }).default('pending'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Backup Schedules Table
export const backupSchedules = pgTable('backup_schedules', {
  id: serial('id').primaryKey(),
  scheduleName: varchar('schedule_name', { length: 100 }).notNull(),
  scheduleType: varchar('schedule_type', { length: 20 }).notNull(),
  scheduleTime: varchar('schedule_time', { length: 10 }),
  scheduleDay: integer('schedule_day'),
  scheduleDate: integer('schedule_date'),
  isEnabled: boolean('is_enabled').default(true),
  lastRun: timestamp('last_run', { withTimezone: true }),
  nextRun: timestamp('next_run', { withTimezone: true }),
  retentionDays: integer('retention_days').default(90),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Settings Audit Log Table
export const settingsAuditLog = pgTable('settings_audit_log', {
  id: serial('id').primaryKey(),
  settingCategory: varchar('setting_category', { length: 50 }).notNull(),
  settingKey: varchar('setting_key', { length: 100 }),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changeType: varchar('change_type', { length: 20 }).notNull(),
  changedBy: integer('changed_by'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// System Health Metrics Table
export const systemHealthMetrics = pgTable('system_health_metrics', {
  id: serial('id').primaryKey(),
  metricType: varchar('metric_type', { length: 50 }).notNull(),
  metricValue: integer('metric_value'),
  metricUnit: varchar('metric_unit', { length: 20 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type exports
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;

export type OrganizationSetting = typeof organizationSettings.$inferSelect;
export type NewOrganizationSetting = typeof organizationSettings.$inferInsert;

export type BackupHistory = typeof backupHistory.$inferSelect;
export type NewBackupHistory = typeof backupHistory.$inferInsert;

export type BackupSchedule = typeof backupSchedules.$inferSelect;
export type NewBackupSchedule = typeof backupSchedules.$inferInsert;

export type SettingsAuditLog = typeof settingsAuditLog.$inferSelect;
export type NewSettingsAuditLog = typeof settingsAuditLog.$inferInsert;

export type SystemHealthMetric = typeof systemHealthMetrics.$inferSelect;
export type NewSystemHealthMetric = typeof systemHealthMetrics.$inferInsert;
