import { api } from './api';

export interface Pnbp {
  id: string;
  tahun: number;
  lahanId: string;
  kodeLahan: string;
  nomorPetak?: string;
  anggotaId: string;
  anggotaNama: string;
  anggotaNomor: string;
  luasLahan: string;
  tarifPerHa: string;
  totalTagihan: string;
  statusPembayaran: 'belum_bayar' | 'lunas' | 'terlambat';
  tanggalJatuhTempo: string;
  tanggalBayar?: string | null;
  jumlahDibayar?: string | null;
  metodePembayaran?: string | null;
  buktiPembayaran?: string | null;
  keterangan?: string | null;
  createdAt: Date;
}

export interface PnbpDetail extends Pnbp {
  nomorPetak: string;
  anggotaId: string;
  updatedAt: Date;
}

export interface PnbpStatistics {
  totalTagihan: number;
  totalTerbayar: number;
  totalBelumBayar: number;
  totalLunas: number;
  totalTerlambat: number;
}

export interface GeneratePnbpRequest {
  tahun: number;
}

export interface UpdatePaymentRequest {
  statusPembayaran: string;
  tanggalBayar?: string;
  jumlahDibayar?: string;
  metodePembayaran?: string;
  keterangan?: string;
}

export interface GetPnbpParams {
  page?: number;
  limit?: number;
  search?: string;
  tahun?: number;
  bulan?: number;
  statusPembayaran?: string;
  metodePembayaran?: string;
}

const pnbpService = {
  async getAll(params: GetPnbpParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.tahun) queryParams.append('tahun', params.tahun.toString());
    if (params.statusPembayaran) queryParams.append('statusPembayaran', params.statusPembayaran);

    return api.get<Pnbp[]>(`/pnbp?${queryParams.toString()}`);
  },

  async getById(id: string) {
    return api.get<PnbpDetail>(`/pnbp/${id}`);
  },

  async generateForYear(data: GeneratePnbpRequest) {
    return api.post<{ count: number }>('/pnbp/generate', data);
  },

  async updatePayment(id: string, data: UpdatePaymentRequest) {
    return api.patch<void>(`/pnbp/${id}/payment`, data);
  },

  async delete(id: string) {
    return api.delete<void>(`/pnbp/${id}`);
  },

  async getStatistics(tahun?: number) {
    const queryParams = tahun ? `?tahun=${tahun}` : '';
    return api.get<PnbpStatistics>(`/pnbp/statistics${queryParams}`);
  },

  async getReconciliation(tahun: number) {
    return api.get(`/pnbp/reconciliation?tahun=${tahun}`);
  },

  async getReconciliationSummary(startYear: number, endYear: number) {
    return api.get(`/pnbp/reconciliation-summary?startYear=${startYear}&endYear=${endYear}`);
  },
};

export default pnbpService;
