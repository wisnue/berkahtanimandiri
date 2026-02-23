import { pgTable, uuid, varchar, timestamp, decimal, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { anggota } from './anggota';
import { lahanKhdpk } from './lahan';

export const kegiatan = pgTable('kegiatan', {
  id: uuid('id').primaryKey().defaultRandom(),
  kodeKegiatan: varchar('kode_kegiatan', { length: 50 }).unique().notNull(),
  namaKegiatan: varchar('nama_kegiatan', { length: 255 }).notNull(),
  jenisKegiatan: varchar('jenis_kegiatan', { length: 100 }).notNull(),
  tanggalMulai: timestamp('tanggal_mulai').notNull(),
  tanggalSelesai: timestamp('tanggal_selesai'),
  lokasiKegiatan: text('lokasi_kegiatan'),
  lahanId: uuid('lahan_id').references(() => lahanKhdpk.id),
  penanggungJawab: uuid('penanggung_jawab').references(() => anggota.id),
  jumlahPeserta: varchar('jumlah_peserta', { length: 10 }),
  targetProduksi: decimal('target_produksi', { precision: 10, scale: 2 }),
  realisasiProduksi: decimal('realisasi_produksi', { precision: 10, scale: 2 }),
  satuanProduksi: varchar('satuan_produksi', { length: 50 }),
  biayaKegiatan: decimal('biaya_kegiatan', { precision: 15, scale: 2 }),
  sumberDana: varchar('sumber_dana', { length: 100 }),
  statusKegiatan: varchar('status_kegiatan', { length: 50 }).notNull().default('rencana'),
  hasilKegiatan: text('hasil_kegiatan'),
  kendala: text('kendala'),
  keterangan: text('keterangan'),
  dokumentasiFoto: varchar('dokumentasi_foto', { length: 500 }),
  laporanKegiatan: varchar('laporan_kegiatan', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const kegiatanRelations = relations(kegiatan, ({ one }) => ({
  lahan: one(lahanKhdpk, {
    fields: [kegiatan.lahanId],
    references: [lahanKhdpk.id],
  }),
  penanggungJawabAnggota: one(anggota, {
    fields: [kegiatan.penanggungJawab],
    references: [anggota.id],
  }),
}));

// Zod schemas
// Zod schema removed - will be added manually if needed



export type Kegiatan = typeof kegiatan.$inferSelect;
export type NewKegiatan = typeof kegiatan.$inferInsert;
