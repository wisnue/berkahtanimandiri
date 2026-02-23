import { pgTable, uuid, varchar, timestamp, text, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Dokumen Legal Organisasi KTH
 * Untuk legalitas & compliance audit
 * 
 * Dokumen yang WAJIB ada:
 * 1. SK Pembentukan KTH (dari Kepala Desa/Dinas)
 * 2. AD/ART (Anggaran Dasar & Rumah Tangga)
 * 3. SK Pengurus periode berjalan
 * 4. SK KHDPK (dari Dinas Kehutanan)
 * 5. Surat Rekomendasi Dinas (jika ada)
 * 6. NIB (jika sudah koperasi)
 */

export const dokumenOrganisasi = pgTable('dokumen_organisasi', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Jenis Dokumen
  jenisDokumen: varchar('jenis_dokumen', { length: 50 }).notNull(),
  /**
   * Values:
   * - 'sk_pembentukan' : SK Pembentukan KTH
   * - 'ad_art' : Anggaran Dasar & Rumah Tangga
   * - 'sk_pengurus' : SK Pengurus/Kepengurusan
   * - 'sk_khdpk' : SK KHDPK dari Dinas Kehutanan
   * - 'sk_perhutanan_sosial' : SK Perhutanan Sosial
   * - 'rekomendasi_dinas' : Surat Rekomendasi
   * - 'nib' : Nomor Induk Berusaha
   * - 'npwp_organisasi' : NPWP Organisasi
   * - 'sertifikat_lahan' : Sertifikat Lahan KTH
   * - 'mou_kerjasama' : MoU/PKS dengan pihak lain
   * - 'lainnya' : Dokumen lain
   */
  
  // Detail Dokumen
  judulDokumen: varchar('judul_dokumen', { length: 255 }).notNull(),
  nomorDokumen: varchar('nomor_dokumen', { length: 100 }),
  // Example: 123/SK/KTH-BTM/2024
  
  tanggalDokumen: date('tanggal_dokumen'),
  // Tanggal terbit dokumen
  
  tanggalBerlaku: date('tanggal_berlaku'),
  // Mulai berlaku (bisa beda dengan tanggal terbit)
  
  tanggalKadaluarsa: date('tanggal_kadaluarsa'),
  // Masa berlaku habis (nullable jika permanen)
  
  penerbitDokumen: varchar('penerbit_dokumen', { length: 255 }),
  // Example: "Dinas Kehutanan Provinsi Jawa Tengah"
  
  // Status Dokumen
  statusDokumen: varchar('status_dokumen', { length: 20 }).notNull().default('aktif'),
  /**
   * Values:
   * - 'aktif' : Masih berlaku
   * - 'kadaluarsa' : Sudah expired
   * - 'diganti' : Sudah ada dokumen pengganti (versi baru)
   * - 'ditolak' : Ditolak verifikasi
   * - 'pending_verifikasi' : Menunggu verifikasi
   */
  
  // File Management
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: varchar('file_size', { length: 50 }),
  // Example: "1.2 MB"
  
  fileType: varchar('file_type', { length: 50 }),
  // Example: "application/pdf"
  
  // Versioning
  versi: integer('versi').notNull().default(1),
  // Version 1, 2, 3, ... untuk tracking revisi
  
  dokumenSebelumnya: uuid('dokumen_sebelumnya').references((): any => dokumenOrganisasi.id),
  // Reference ke dokumen versi sebelumnya (jika ada)
  
  // Additional Info
  deskripsi: text('deskripsi'),
  periodeKepengurusan: varchar('periode_kepengurusan', { length: 50 }),
  // Example: "2024-2029" (untuk SK Pengurus)
  
  keterangan: text('keterangan'),
  
  // Audit Fields
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const dokumenOrganisasiRelations = relations(dokumenOrganisasi, ({ one }) => ({
  uploader: one(users, {
    fields: [dokumenOrganisasi.uploadedBy],
    references: [users.id],
  }),
  previousVersion: one(dokumenOrganisasi, {
    fields: [dokumenOrganisasi.dokumenSebelumnya],
    references: [dokumenOrganisasi.id],
  }),
}));

export type DokumenOrganisasi = typeof dokumenOrganisasi.$inferSelect;
export type NewDokumenOrganisasi = typeof dokumenOrganisasi.$inferInsert;
