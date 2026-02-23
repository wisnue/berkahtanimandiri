import { api, ApiResponse } from './api';

export interface Anggota {
  id: string;
  nomorAnggota: string; // ✅ Fixed: was noAnggota
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamatLengkap: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  nomorTelepon?: string; // ✅ Fixed: was noTelepon
  email?: string;
  pendidikan?: string; // ✅ Fixed: was pendidikanTerakhir
  pekerjaan?: string;
  statusAnggota: string;
  jabatanKTH?: string;
  nomorSKKeanggotaan?: string;
  tanggalSKKeanggotaan?: string;
  tanggalBergabung: string;
  tanggalKeluar?: string;
  luasLahanGarapan?: string;
  nomorKK?: string;
  fotoKK?: string;
  fotoKTP?: string;
  fotoProfile?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnggotaListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AnggotaStatistics {
  total: number;
  active: number;
  inactive: number;
}

export const anggotaService = {
  async getAll(params?: AnggotaListParams): Promise<ApiResponse<Anggota[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return api.get<Anggota[]>(`/anggota${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<ApiResponse<Anggota>> {
    return api.get<Anggota>(`/anggota/${id}`);
  },

  async create(data: Partial<Anggota>): Promise<ApiResponse<Anggota>> {
    return api.post<Anggota>('/anggota', data);
  },

  async update(id: string, data: Partial<Anggota>): Promise<ApiResponse<Anggota>> {
    return api.put<Anggota>(`/anggota/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/anggota/${id}`);
  },

  async getStatistics(): Promise<ApiResponse<AnggotaStatistics>> {
    return api.get<AnggotaStatistics>('/anggota/statistics');
  },

  async bulkImport(data: Partial<Anggota>[]): Promise<ApiResponse<{ imported: number; failed: number }>> {
    return api.post<{ imported: number; failed: number }>('/anggota/bulk-import', { data });
  },
};
