import { api } from './api';

export interface Aset {
  id: string;
  kodeAset: string;
  namaAset: string;
  kategoriAset: string;
  jenisAset?: string | null;
  merkTipe?: string | null;
  nomorSeri?: string | null;
  tahunPerolehan: number;
  tanggalPerolehan?: Date | null;
  sumberPerolehan?: string | null;
  nilaiPerolehan: string;
  nilaiSekarang?: string | null;
  kondisiAset: 'baik' | 'rusak' | 'hilang';
  lokasiAset?: string | null;
  penanggungJawab?: string | null;
  masaManfaat?: number | null;
  keterangan?: string | null;
  fotoAset?: string | null;
  buktiPerolehan?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AsetStatistics {
  totalAset: number;
  totalNilaiPerolehan: number;
  totalNilaiSekarang: number;
  penyusutan: number;
  kondisi: {
    baik?: number;
    rusak?: number;
    hilang?: number;
  };
  kategori: {
    kategori: string;
    jumlah: number;
    totalNilai: number;
  }[];
}

export interface CreateAsetRequest {
  namaAset: string;
  kategoriAset: string;
  jenisAset?: string;
  merkTipe?: string;
  nomorSeri?: string;
  tahunPerolehan: number;
  tanggalPerolehan?: string;
  sumberPerolehan?: string;
  nilaiPerolehan: number;
  nilaiSekarang?: number;
  kondisiAset?: 'baik' | 'rusak' | 'hilang';
  lokasiAset?: string;
  penanggungJawab?: string;
  masaManfaat?: number;
  keterangan?: string;
  fotoAset?: string;
  buktiPerolehan?: string;
}

export interface UpdateAsetRequest extends Partial<CreateAsetRequest> {}

export interface GetAsetParams {
  page?: number;
  limit?: number;
  kategori?: string;
  kondisi?: string;
  tahun?: number;
  search?: string;
}

const asetService = {
  async getAll(params?: GetAsetParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.kategori) queryParams.append('kategori', params.kategori);
    if (params?.kondisi) queryParams.append('kondisi', params.kondisi);
    if (params?.tahun) queryParams.append('tahun', params.tahun.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return api.get(`/aset${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return api.get(`/aset/${id}`);
  },

  async create(data: CreateAsetRequest) {
    return api.post('/aset', data);
  },

  async update(id: string, data: UpdateAsetRequest) {
    return api.put(`/aset/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/aset/${id}`);
  },

  async getStatistics(tahun?: number) {
    const query = tahun ? `?tahun=${tahun}` : '';
    return api.get(`/aset/statistics${query}`);
  },

  async getKategori() {
    return api.get('/aset/kategori');
  },
};

export default asetService;
