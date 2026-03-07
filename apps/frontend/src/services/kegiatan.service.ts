import { api } from './api';

export interface Kegiatan {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  jenisKegiatan: string;
  tanggalMulai: Date;
  tanggalSelesai?: Date | null;
  lokasiKegiatan?: string | null;
  lahanId?: string | null;
  penanggungJawab?: string | null;
  jumlahPeserta?: string | null;
  targetProduksi?: string | null;
  realisasiProduksi?: string | null;
  satuanProduksi?: string | null;
  biayaKegiatan?: string | null;
  sumberDana?: string | null;
  statusKegiatan: 'rencana' | 'berlangsung' | 'selesai' | 'batal';
  hasilKegiatan?: string | null;
  kendala?: string | null;
  keterangan?: string | null;
  dokumentasiFoto?: string | null;
  laporanKegiatan?: string | null;
  penanggungJawabNama?: string;
  lahanNama?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface KegiatanStatistics {
  totalKegiatan: number;
  totalBiaya: number;
  status: {
    rencana?: number;
    berlangsung?: number;
    selesai?: number;
    batal?: number;
  };
  jenis: {
    jenis: string;
    jumlah: number;
  }[];
}

export interface CalendarEvent {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  jenisKegiatan: string;
  tanggalMulai: Date;
  tanggalSelesai?: Date | null;
  statusKegiatan: string;
}

export interface CreateKegiatanRequest {
  namaKegiatan: string;
  jenisKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  lokasiKegiatan?: string;
  lahanId?: string;
  penanggungJawab?: string;
  jumlahPeserta?: string;
  targetProduksi?: number;
  realisasiProduksi?: number;
  satuanProduksi?: string;
  biayaKegiatan?: number;
  sumberDana?: string;
  statusKegiatan?: 'rencana' | 'berlangsung' | 'selesai' | 'batal';
  hasilKegiatan?: string;
  kendala?: string;
  keterangan?: string;
  dokumentasiFoto?: string;
  laporanKegiatan?: string;
}

export interface UpdateKegiatanRequest extends Partial<CreateKegiatanRequest> {}

export interface GetKegiatanParams {
  page?: number;
  limit?: number;
  jenis?: string;
  status?: string;
  tahun?: number;
  bulan?: number;
  lokasi?: string;
  search?: string;
}

const kegiatanService = {
  async getAll(params?: GetKegiatanParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.jenis) queryParams.append('jenis', params.jenis);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.tahun) queryParams.append('tahun', params.tahun.toString());
    if (params?.bulan) queryParams.append('bulan', params.bulan.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return api.get(`/kegiatan${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return api.get(`/kegiatan/${id}`);
  },

  async create(data: CreateKegiatanRequest) {
    return api.post('/kegiatan', data);
  },

  async update(id: string, data: UpdateKegiatanRequest) {
    return api.put(`/kegiatan/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/kegiatan/${id}`);
  },

  async getStatistics(tahun?: number) {
    const query = tahun ? `?tahun=${tahun}` : '';
    return api.get(`/kegiatan/statistics${query}`);
  },

  async getCalendar(tahun: number, bulan: number) {
    return api.get(`/kegiatan/calendar?tahun=${tahun}&bulan=${bulan}`);
  },
};

export default kegiatanService;
