import { pgTable, uuid, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nik: varchar('nik', { length: 16 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('anggota'),
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  passwordChangedAt: timestamp('password_changed_at').defaultNow(),
  forcePasswordChange: boolean('force_password_change').default(false),
  passwordExpiresAt: timestamp('password_expires_at'),
  backupCodes: text('backup_codes'),
  lastLogin: timestamp('last_login'),
  loginAttempts: varchar('login_attempts', { length: 10 }).default('0'),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const sessions = pgTable('sessions', {
  sid: varchar('sid', { length: 255 }).primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire').notNull(),
});

// Zod schemas for validation
export const insertUserSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  email: z.string().email('Email tidak valid').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  role: z.enum(['ketua', 'sekretaris', 'bendahara', 'anggota']).default('anggota'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const selectUserSchema = z.object({
  id: z.string().uuid(),
  nik: z.string(),
  email: z.string().nullable(),
  username: z.string(),
  fullName: z.string(),
  role: z.string(),
  phone: z.string().nullable(),
  isActive: z.boolean(),
  lastLogin: z.date().nullable(),
  createdAt: z.date(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

