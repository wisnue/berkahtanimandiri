import { api, ApiResponse } from './api';

export interface LahanKhdpk {
  id: string;
  kodeLahan: string;
  anggotaId: string;
  nomorPetak: string;
  luasLahan: string;
  satuanLuas: string;
  jenisTanaman?: string;
  lokasiLahan?: string;
  koordinatLat?: string;
  koordinatLong?: string;
  /** @deprecated use koordinatLat/koordinatLong */
  koordinat?: string;
  statusLegalitas: string;
  /** display status alias */
  statusLahan?: string;
  nomorSKKHDPK?: string;
  tanggalSK?: string;
  masaBerlakuSK?: string;
  tahunMulaiKelola: number;
  /** display year alias */
  tahunTanam?: number;
  kondisiLahan?: string;
  filePetaLahan?: string;
  fileSKKHDPK?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
  anggotaNama?: string;
  anggotaNomor?: string;
}

export interface LahanListParams {
  page?: number;
  limit?: number;
  search?: string;
  statusLegalitas?: string;
  jenisTanaman?: string;
  tahunTanam?: number;
  anggotaId?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LahanStatistics {
  total: number;
  totalLuas: number;
  statusSah: number;
  statusProses: number;
}

export const lahanService = {
  async getAll(params?: LahanListParams): Promise<ApiResponse<LahanKhdpk[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.statusLegalitas) queryParams.append('statusLegalitas', params.statusLegalitas);
    if (params?.anggotaId) queryParams.append('anggotaId', params.anggotaId);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return api.get<LahanKhdpk[]>(`/lahan${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<ApiResponse<LahanKhdpk>> {
    return api.get<LahanKhdpk>(`/lahan/${id}`);
  },

  async getByAnggotaId(anggotaId: string): Promise<ApiResponse<LahanKhdpk[]>> {
    return api.get<LahanKhdpk[]>(`/lahan/anggota/${anggotaId}`);
  },

  async create(data: Partial<LahanKhdpk>): Promise<ApiResponse<LahanKhdpk>> {
    return api.post<LahanKhdpk>('/lahan', data);
  },

  async update(id: string, data: Partial<LahanKhdpk>): Promise<ApiResponse<LahanKhdpk>> {
    return api.put<LahanKhdpk>(`/lahan/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/lahan/${id}`);
  },

  async getStatistics(): Promise<ApiResponse<LahanStatistics>> {
    return api.get<LahanStatistics>('/lahan/statistics');
  },
};
