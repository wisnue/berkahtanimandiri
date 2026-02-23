import { pgTable, uuid, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// =====================================================
// TABLE: two_factor_backup_codes
// =====================================================

export const twoFactorBackupCodes = pgTable('two_factor_backup_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 10 }).notNull(),
  used: boolean('used').notNull().default(false),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =====================================================
// TABLE: password_history
// =====================================================

export const passwordHistory = pgTable('password_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =====================================================
// TABLE: login_attempts
// =====================================================

export const loginAttempts = pgTable('login_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 100 }).notNull(),
  ipAddress: varchar('ip_address', { length: 50 }).notNull(),
  userAgent: text('user_agent'),
  success: boolean('success').notNull().default(false),
  failureReason: varchar('failure_reason', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Import users table (for reference)
import { users } from './users';

// =====================================================
// ZOD SCHEMAS
// =====================================================

export const insertBackupCodeSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(10),
  used: z.boolean().default(false),
});

export const insertPasswordHistorySchema = z.object({
  userId: z.string().uuid(),
  passwordHash: z.string(),
});

export const insertLoginAttemptSchema = z.object({
  username: z.string(),
  ipAddress: z.string(),
  userAgent: z.string().optional(),
  success: z.boolean().default(false),
  failureReason: z.string().optional(),
});

// =====================================================
// TYPES
// =====================================================

export type TwoFactorBackupCode = typeof twoFactorBackupCodes.$inferSelect;
export type NewTwoFactorBackupCode = typeof twoFactorBackupCodes.$inferInsert;

export type PasswordHistory = typeof passwordHistory.$inferSelect;
export type NewPasswordHistory = typeof passwordHistory.$inferInsert;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type NewLoginAttempt = typeof loginAttempts.$inferInsert;
