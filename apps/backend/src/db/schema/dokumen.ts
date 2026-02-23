import { pgTable, uuid, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { users } from './users';

export const dokumen = pgTable('dokumen', {
  id: uuid('id').primaryKey().defaultRandom(),
  kodeDokumen: varchar('kode_dokumen', { length: 50 }).unique().notNull(),
  judulDokumen: varchar('judul_dokumen', { length: 255 }).notNull(),
  jenisDokumen: varchar('jenis_dokumen', { length: 100 }).notNull(),
  kategoriDokumen: varchar('kategori_dokumen', { length: 100 }),
  nomorDokumen: varchar('nomor_dokumen', { length: 100 }),
  tanggalDokumen: timestamp('tanggal_dokumen'),
  tanggalBerlaku: timestamp('tanggal_berlaku'),
  tanggalKadaluarsa: timestamp('tanggal_kadaluarsa'),
  penerbitDokumen: varchar('penerbit_dokumen', { length: 255 }),
  deskripsi: text('deskripsi'),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: varchar('file_size', { length: 50 }),
  fileType: varchar('file_type', { length: 50 }),
  versi: integer('versi').notNull().default(1),
  statusDokumen: varchar('status_dokumen', { length: 50 }).notNull().default('aktif'),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const dokumenRelations = relations(dokumen, ({ one }) => ({
  uploader: one(users, {
    fields: [dokumen.uploadedBy],
    references: [users.id],
  }),
}));

export type Dokumen = typeof dokumen.$inferSelect;
export type NewDokumen = typeof dokumen.$inferInsert;
