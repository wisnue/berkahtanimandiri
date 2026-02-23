// User Roles
export const USER_ROLES = {
  KETUA: 'ketua',
  SEKRETARIS: 'sekretaris',
  BENDAHARA: 'bendahara',
  ANGGOTA: 'anggota',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Anggota Status
export const ANGGOTA_STATUS = {
  AKTIF: 'aktif',
  NONAKTIF: 'nonaktif',
  CUTI: 'cuti',
} as const;

export type AnggotaStatus = (typeof ANGGOTA_STATUS)[keyof typeof ANGGOTA_STATUS];

// PNBP Status
export const PNBP_STATUS = {
  BELUM: 'belum',
  LUNAS: 'lunas',
  SEBAGIAN: 'sebagian',
  TERLAMBAT: 'terlambat',
} as const;

export type PnbpStatus = (typeof PNBP_STATUS)[keyof typeof PNBP_STATUS];

// Keuangan
export const JENIS_TRANSAKSI = {
  MASUK: 'masuk',
  KELUAR: 'keluar',
} as const;

export type JenisTransaksi = (typeof JENIS_TRANSAKSI)[keyof typeof JENIS_TRANSAKSI];

export const STATUS_VERIFIKASI = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type StatusVerifikasi = (typeof STATUS_VERIFIKASI)[keyof typeof STATUS_VERIFIKASI];

// Aset
export const KONDISI_ASET = {
  BAIK: 'baik',
  RUSAK_RINGAN: 'rusak_ringan',
  RUSAK_BERAT: 'rusak_berat',
  TIDAK_LAYAK: 'tidak_layak',
} as const;

export type KondisiAset = (typeof KONDISI_ASET)[keyof typeof KONDISI_ASET];

// Kegiatan
export const STATUS_KEGIATAN = {
  RENCANA: 'rencana',
  BERJALAN: 'berjalan',
  SELESAI: 'selesai',
  BATAL: 'batal',
} as const;

export type StatusKegiatan = (typeof STATUS_KEGIATAN)[keyof typeof STATUS_KEGIATAN];

// Dokumen
export const STATUS_DOKUMEN = {
  AKTIF: 'aktif',
  ARSIP: 'arsip',
  KADALUARSA: 'kadaluarsa',
} as const;

export type StatusDokumen = (typeof STATUS_DOKUMEN)[keyof typeof STATUS_DOKUMEN];

// Lahan KHDPK
export const STATUS_LEGALITAS = {
  PROSES: 'proses',
  TERBIT: 'terbit',
  PERPANJANGAN: 'perpanjangan',
  HABIS: 'habis',
} as const;

export type StatusLegalitas = (typeof STATUS_LEGALITAS)[keyof typeof STATUS_LEGALITAS];
