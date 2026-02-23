import { pgTable, uuid, varchar, timestamp, decimal, text, integer } from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { anggota } from './anggota';

export const lahanKhdpk = pgTable('lahan_khdpk', {
  id: uuid('id').primaryKey().defaultRandom(),
  kodeLahan: varchar('kode_lahan', { length: 50 }).unique().notNull(),
  anggotaId: uuid('anggota_id').references(() => anggota.id).notNull(),
  nomorPetak: varchar('nomor_petak', { length: 50 }).notNull(),
  luasLahan: decimal('luas_lahan', { precision: 10, scale: 4 }).notNull(),
  satuanLuas: varchar('satuan_luas', { length: 10 }).notNull().default('Ha'),
  jenisTanaman: varchar('jenis_tanaman', { length: 255 }),
  lokasiLahan: text('lokasi_lahan'),
  koordinatLat: varchar('koordinat_lat', { length: 50 }),
  koordinatLong: varchar('koordinat_long', { length: 50 }),
  statusLegalitas: varchar('status_legalitas', { length: 50 }).notNull().default('proses'),
  nomorSKKHDPK: varchar('nomor_sk_khdpk', { length: 100 }),
  tanggalSK: timestamp('tanggal_sk'),
  masaBerlakuSK: timestamp('masa_berlaku_sk'),
  tahunMulaiKelola: integer('tahun_mulai_kelola').notNull(),
  kondisiLahan: varchar('kondisi_lahan', { length: 50 }),
  filePetaLahan: varchar('file_peta_lahan', { length: 500 }),
  fileSKKHDPK: varchar('file_sk_khdpk', { length: 500 }),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const lahanKhdpkRelations = relations(lahanKhdpk, ({ one }) => ({
  anggota: one(anggota, {
    fields: [lahanKhdpk.anggotaId],
    references: [anggota.id],
  }),
}));

// Zod schemas
// Zod schema removed - will be added manually if needed



export type LahanKhdpk = typeof lahanKhdpk.$inferSelect;
export type NewLahanKhdpk = typeof lahanKhdpk.$inferInsert;
