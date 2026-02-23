import { pgTable, uuid, varchar, timestamp, decimal, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { anggota } from './anggota';
import { lahanKhdpk } from './lahan';

export const pnbp = pgTable('pnbp', {
  id: uuid('id').primaryKey().defaultRandom(),
  nomorTransaksi: varchar('nomor_transaksi', { length: 100 }).unique().notNull(),
  anggotaId: uuid('anggota_id').references(() => anggota.id).notNull(),
  lahanId: uuid('lahan_id').references(() => lahanKhdpk.id),
  tahunPNBP: integer('tahun_pnbp').notNull(),
  periodeBulan: integer('periode_bulan'),
  luasLahanDihitung: decimal('luas_lahan_dihitung', { precision: 10, scale: 4 }).notNull(),
  tarifPerHa: decimal('tarif_per_ha', { precision: 15, scale: 2 }).notNull(),
  jumlahPNBP: decimal('jumlah_pnbp', { precision: 15, scale: 2 }).notNull(),
  statusBayar: varchar('status_bayar', { length: 20 }).notNull().default('belum'),
  tanggalJatuhTempo: timestamp('tanggal_jatuh_tempo'),
  tanggalBayar: timestamp('tanggal_bayar'),
  metodeBayar: varchar('metode_bayar', { length: 50 }),
  nomorReferensi: varchar('nomor_referensi', { length: 100 }),
  buktiSetor: varchar('bukti_setor', { length: 500 }),
  keterangan: text('keterangan'),
  createdBy: uuid('created_by').references(() => anggota.id),
  verifiedBy: uuid('verified_by').references(() => anggota.id),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const pnbpRelations = relations(pnbp, ({ one }) => ({
  anggota: one(anggota, {
    fields: [pnbp.anggotaId],
    references: [anggota.id],
  }),
  lahan: one(lahanKhdpk, {
    fields: [pnbp.lahanId],
    references: [lahanKhdpk.id],
  }),
}));

// Zod schemas
// Zod schema removed - will be added manually if needed



export type Pnbp = typeof pnbp.$inferSelect;
export type NewPnbp = typeof pnbp.$inferInsert;
