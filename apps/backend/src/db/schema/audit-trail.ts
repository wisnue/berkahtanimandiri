import { pgTable, uuid, varchar, timestamp, text, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Audit Trail Table - Track ALL data changes
 * Untuk audit pemerintahan (BPKP, Inspektorat, Dinas)
 * 
 * Setiap CREATE, UPDATE, DELETE harus tercatat:
 * - Siapa yang melakukan (user_id)
 * - Kapan dilakukan (created_at)
 * - Data lama apa (old_values)
 * - Data baru apa (new_values)
 * - Field apa yang berubah (changed_fields)
 */

export const auditTrail = pgTable('audit_trail', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Who & When
  userId: uuid('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // What & Where
  tableName: varchar('table_name', { length: 100 }).notNull(),
  // 'anggota', 'lahan_khdpk', 'pnbp', 'keuangan', 'aset', 'kegiatan', 'dokumen'
  
  recordId: uuid('record_id').notNull(),
  // ID dari record yang diubah
  
  action: varchar('action', { length: 20 }).notNull(),
  // 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'VERIFY', 'APPROVE', 'REJECT'
  
  // Changes Detail (CRITICAL for audit)
  oldValues: json('old_values'),
  // Data sebelum perubahan (untuk UPDATE & DELETE)
  // Example: { "statusBayar": "belum", "jumlahPNBP": "5000000" }
  
  newValues: json('new_values'),
  // Data setelah perubahan (untuk CREATE & UPDATE)
  // Example: { "statusBayar": "lunas", "jumlahPNBP": "5000000" }
  
  changedFields: text('changed_fields').array(),
  // Array field yang berubah
  // Example: ['statusBayar', 'tanggalBayar', 'buktiSetor']
  
  // Context
  description: text('description'),
  // Human-readable description
  // Example: "Pembayaran PNBP tahun 2026 sebesar Rp 5.000.000 diverifikasi"
  
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  
  // Additional metadata
  metadata: json('metadata'),
  // Extra info jika diperlukan
  // Example: { "verifiedBy": "admin", "paymentMethod": "transfer" }
});

export const auditTrailRelations = relations(auditTrail, ({ one }) => ({
  user: one(users, {
    fields: [auditTrail.userId],
    references: [users.id],
  }),
}));

export type AuditTrail = typeof auditTrail.$inferSelect;
export type NewAuditTrail = typeof auditTrail.$inferInsert;
