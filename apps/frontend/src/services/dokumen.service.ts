import { api } from './api';

export interface Dokumen {
  id: string;
  kodeDokumen: string;
  judulDokumen: string;
  jenisDokumen: string;
  kategoriDokumen?: string | null;
  nomorDokumen?: string | null;
  tanggalDokumen?: Date | null;
  tanggalBerlaku?: Date | null;
  tanggalKadaluarsa?: Date | null;
  penerbitDokumen?: string | null;
  deskripsi?: string | null;
  filePath: string;
  fileName: string;
  fileSize?: string | null;
  fileType?: string | null;
  versi: number;
  statusDokumen: 'aktif' | 'nonaktif' | 'kadaluarsa';
  uploadedBy: string;
  uploaderNama?: string;
  keterangan?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DokumenStatistics {
  totalDokumen: number;
  expiringSoon: number;
  jenis: {
    jenis: string;
    jumlah: number;
  }[];
  status: {
    aktif?: number;
    nonaktif?: number;
    kadaluarsa?: number;
  };
}

export interface CreateDokumenRequest {
  judulDokumen: string;
  jenisDokumen: string;
  kategoriDokumen?: string;
  nomorDokumen?: string;
  tanggalDokumen?: string;
  tanggalBerlaku?: string;
  tanggalKadaluarsa?: string;
  penerbitDokumen?: string;
  deskripsi?: string;
  fileName: string;
  filePath: string;
  fileSize?: string;
  fileType?: string;
  statusDokumen?: 'aktif' | 'nonaktif' | 'kadaluarsa';
  keterangan?: string;
}

export interface UpdateDokumenRequest extends Partial<Omit<CreateDokumenRequest, 'fileName' | 'filePath' | 'fileSize' | 'fileType'>> {}

export interface GetDokumenParams {
  page?: number;
  limit?: number;
  jenis?: string;
  kategori?: string;
  status?: string;
  tahun?: number;
  search?: string;
}

const dokumenService = {
  async getAll(params?: GetDokumenParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.jenis) queryParams.append('jenis', params.jenis);
    if (params?.kategori) queryParams.append('kategori', params.kategori);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.tahun) queryParams.append('tahun', params.tahun.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return api.get(`/dokumen${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return api.get(`/dokumen/${id}`);
  },

  async create(data: CreateDokumenRequest | FormData) {
    // If FormData, send as multipart for file upload
    if (data instanceof FormData) {
      return api.postForm('/dokumen', data);
    }
    // Otherwise, send as JSON
    return api.post('/dokumen', data);
  },

  async update(id: string, data: UpdateDokumenRequest) {
    return api.put(`/dokumen/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/dokumen/${id}`);
  },

  async getStatistics(tahun?: number) {
    const query = tahun ? `?tahun=${tahun}` : '';
    return api.get(`/dokumen/statistics${query}`);
  },

  async getByKategori(kategori: string) {
    return api.get(`/dokumen/kategori/${kategori}`);
  },
};

export default dokumenService;
