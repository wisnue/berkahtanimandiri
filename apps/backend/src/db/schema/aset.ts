import { pgTable, uuid, varchar, timestamp, decimal, text, integer } from 'drizzle-orm/pg-core';

export const aset = pgTable('aset', {
  id: uuid('id').primaryKey().defaultRandom(),
  kodeAset: varchar('kode_aset', { length: 50 }).unique().notNull(),
  namaAset: varchar('nama_aset', { length: 255 }).notNull(),
  kategoriAset: varchar('kategori_aset', { length: 100 }).notNull(),
  jenisAset: varchar('jenis_aset', { length: 100 }),
  merkTipe: varchar('merk_tipe', { length: 255 }),
  nomorSeri: varchar('nomor_seri', { length: 100 }),
  tahunPerolehan: integer('tahun_perolehan').notNull(),
  tanggalPerolehan: timestamp('tanggal_perolehan'),
  sumberPerolehan: varchar('sumber_perolehan', { length: 100 }),
  nilaiPerolehan: decimal('nilai_perolehan', { precision: 15, scale: 2 }).notNull(),
  nilaiSekarang: decimal('nilai_sekarang', { precision: 15, scale: 2 }),
  kondisiAset: varchar('kondisi_aset', { length: 50 }).notNull().default('baik'),
  lokasiAset: varchar('lokasi_aset', { length: 255 }),
  penanggungJawab: varchar('penanggung_jawab', { length: 255 }),
  masaManfaat: integer('masa_manfaat'),
  keterangan: text('keterangan'),
  fotoAset: varchar('foto_aset', { length: 500 }),
  buktiPerolehan: varchar('bukti_perolehan', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Zod schemas
// Zod schema removed - will be added manually if needed



export type Aset = typeof aset.$inferSelect;
export type NewAset = typeof aset.$inferInsert;
