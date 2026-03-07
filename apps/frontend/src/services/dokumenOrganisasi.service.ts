import { api } from './api';

export interface DokumenOrganisasi {
  id: string;
  jenisDokumen: string;
  judulDokumen: string;
  nomorDokumen?: string;
  tanggalDokumen?: string;
  tanggalBerlaku?: string;
  tanggalKadaluarsa?: string;
  penerbitDokumen?: string;
  statusDokumen: string;
  filePath: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  versi: number;
  dokumenSebelumnya?: string;
  keterangan?: string;
  catatanVerifikasi?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DokumenOrganisasiStatistics {
  totalDokumen: number;
  aktif: number;
  kadaluarsa: number;
  pendingVerifikasi: number;
  byJenis: {
    jenis: string;
    count: number;
  }[];
  expiringThisMonth: number;
  expiringNextMonth: number;
}

export interface GetDokumenOrganisasiParams {
  page?: number;
  limit?: number;
  search?: string;
  jenisDokumen?: string;
  statusDokumen?: string;
  tanggalDari?: string;
  tanggalSampai?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDokumenOrganisasiData {
  jenisDokumen: string;
  judulDokumen: string;
  nomorDokumen?: string;
  tanggalDokumen?: string;
  tanggalBerlaku?: string;
  tanggalKadaluarsa?: string;
  penerbitDokumen?: string;
  keterangan?: string;
}

export interface UpdateDokumenOrganisasiData {
  judulDokumen?: string;
  nomorDokumen?: string;
  tanggalDokumen?: string;
  tanggalBerlaku?: string;
  tanggalKadaluarsa?: string;
  penerbitDokumen?: string;
  statusDokumen?: string;
  keterangan?: string;
}

export interface VerifyRejectData {
  catatanVerifikasi?: string;
}

const dokumenOrganisasiService = {
  async getAll(params?: GetDokumenOrganisasiParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.jenisDokumen) queryParams.append('jenisDokumen', params.jenisDokumen);
    if (params?.statusDokumen) queryParams.append('statusDokumen', params.statusDokumen);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return api.get(`/dokumen-organisasi${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return api.get(`/dokumen-organisasi/${id}`);
  },

  async getByJenis(jenis: string) {
    return api.get(`/dokumen-organisasi/jenis/${jenis}`);
  },

  async getStatistics() {
    return api.get('/dokumen-organisasi/statistics');
  },

  async getExpiring(days: number = 30) {
    return api.get(`/dokumen-organisasi/expiring?days=${days}`);
  },

  async create(data: CreateDokumenOrganisasiData, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return api.upload('/dokumen-organisasi', formData);
  },

  async update(id: string, data: UpdateDokumenOrganisasiData) {
    return api.put(`/dokumen-organisasi/${id}`, data);
  },

  async verify(id: string, data?: VerifyRejectData) {
    return api.put(`/dokumen-organisasi/${id}/verify`, data || {});
  },

  async reject(id: string, data: VerifyRejectData) {
    return api.put(`/dokumen-organisasi/${id}/reject`, data);
  },

  async delete(id: string) {
    return api.delete(`/dokumen-organisasi/${id}`);
  },
};

export default dokumenOrganisasiService;
