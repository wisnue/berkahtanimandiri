import { pgTable, uuid, varchar, timestamp, decimal, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const keuangan = pgTable('keuangan', {
  id: uuid('id').primaryKey().defaultRandom(),
  nomorTransaksi: varchar('nomor_transaksi', { length: 100 }).unique().notNull(),
  tanggalTransaksi: timestamp('tanggal_transaksi').defaultNow().notNull(),
  jenisTransaksi: varchar('jenis_transaksi', { length: 20 }).notNull(),
  kategori: varchar('kategori', { length: 100 }).notNull(),
  subKategori: varchar('sub_kategori', { length: 100 }),
  jumlah: decimal('jumlah', { precision: 15, scale: 2 }).notNull(),
  sumberDana: varchar('sumber_dana', { length: 100 }),
  tujuanPenggunaan: varchar('tujuan_penggunaan', { length: 255 }),
  keterangan: text('keterangan'),
  buktiTransaksi: varchar('bukti_transaksi', { length: 500 }),
  dibuatOleh: uuid('dibuat_oleh').references(() => users.id).notNull(),
  diverifikasiOleh: uuid('diverifikasi_oleh').references(() => users.id),
  statusVerifikasi: varchar('status_verifikasi', { length: 20 }).notNull().default('pending'),
  tanggalVerifikasi: timestamp('tanggal_verifikasi'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const keuanganRelations = relations(keuangan, ({ one }) => ({
  creator: one(users, {
    fields: [keuangan.dibuatOleh],
    references: [users.id],
  }),
}));

// Zod schemas
// Zod schema removed - will be added manually if needed



export type Keuangan = typeof keuangan.$inferSelect;
export type NewKeuangan = typeof keuangan.$inferInsert;
