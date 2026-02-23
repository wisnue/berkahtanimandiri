import { pgTable, uuid, varchar, timestamp, decimal, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const anggota = pgTable('anggota', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  nomorAnggota: varchar('nomor_anggota', { length: 50 }).unique().notNull(),
  nik: varchar('nik', { length: 16 }).unique().notNull(),
  namaLengkap: varchar('nama_lengkap', { length: 255 }).notNull(),
  tempatLahir: varchar('tempat_lahir', { length: 100 }),
  tanggalLahir: timestamp('tanggal_lahir'),
  jenisKelamin: varchar('jenis_kelamin', { length: 20 }),
  alamatLengkap: text('alamat_lengkap').notNull(),
  rt: varchar('rt', { length: 5 }),
  rw: varchar('rw', { length: 5 }),
  desa: varchar('desa', { length: 100 }),
  kecamatan: varchar('kecamatan', { length: 100 }),
  kabupaten: varchar('kabupaten', { length: 100 }),
  provinsi: varchar('provinsi', { length: 100 }),
  kodePos: varchar('kode_pos', { length: 10 }),
  nomorTelepon: varchar('nomor_telepon', { length: 20 }),
  email: varchar('email', { length: 255 }),
  pendidikan: varchar('pendidikan', { length: 50 }),
  pekerjaan: varchar('pekerjaan', { length: 100 }),
  
  // Keanggotaan & Struktural (AUDIT CRITICAL)
  statusAnggota: varchar('status_anggota', { length: 20 }).notNull().default('aktif'),
  /**
   * Values: 'aktif', 'nonaktif', 'keluar', 'meninggal', 'cuti'
   */
  
  jabatanKTH: varchar('jabatan_kth', { length: 50 }).notNull().default('anggota'),
  /**
   * Values:
   * - 'ketua' : Ketua KTH
   * - 'wakil_ketua' : Wakil Ketua
   * - 'sekretaris' : Sekretaris
   * - 'bendahara' : Bendahara
   * - 'pengawas' : Pengawas/Komisaris
   * - 'ketua_kelompok' : Ketua Kelompok Tani
   * - 'anggota' : Anggota Biasa
   */
  
  nomorSKKeanggotaan: varchar('nomor_sk_keanggotaan', { length: 100 }),
  // Example: 001/SK-ANGGOTA/KTH-BTM/II/2026
  
  tanggalSKKeanggotaan: timestamp('tanggal_sk_keanggotaan'),
  fileSKKeanggotaan: varchar('file_sk_keanggotaan', { length: 500 }),
  
  periodeKepengurusan: varchar('periode_kepengurusan', { length: 50 }),
  // Example: "2024-2029" (untuk pengurus)
  
  tanggalBergabung: timestamp('tanggal_bergabung').defaultNow().notNull(),
  tanggalKeluar: timestamp('tanggal_keluar'),
  alasanKeluar: text('alasan_keluar'),
  // Wajib diisi jika status = keluar/nonaktif/meninggal
  luasLahanGarapan: decimal('luas_lahan_garapan', { precision: 10, scale: 4 }),
  
  // Dokumen (AUDIT COMPLIANCE)
  nomorKK: varchar('nomor_kk', { length: 16 }),
  fotoKK: varchar('foto_kk', { length: 500 }),
  fotoKTP: varchar('foto_ktp', { length: 500 }),
  fotoProfile: varchar('foto_profile', { length: 500 }),
  qrCode: text('qr_code'),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const anggotaRelations = relations(anggota, ({ one }) => ({
  user: one(users, {
    fields: [anggota.userId],
    references: [users.id],
  }),
}));

// Zod schemas
// Zod schema removed - will be added manually if needed



export type Anggota = typeof anggota.$inferSelect;
export type NewAnggota = typeof anggota.$inferInsert;
