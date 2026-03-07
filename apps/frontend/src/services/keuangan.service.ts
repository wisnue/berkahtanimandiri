import { api } from './api';

export interface Keuangan {
  id: string;
  nomorTransaksi: string;
  tanggalTransaksi: Date;
  jenisTransaksi: 'pemasukan' | 'pengeluaran';
  kategori: string;
  subKategori?: string | null;
  jumlah: string;
  sumberDana?: string | null;
  tujuanPenggunaan?: string | null;
  keterangan?: string | null;
  buktiTransaksi?: string | null;
  statusVerifikasi: 'pending' | 'verified' | 'rejected';
  dibuatOleh: string;
  createdAt: Date;
}

export interface KeuanganStatistics {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoKas: number;
  jumlahTransaksi: number;
  transaksiPending: number;
}

export interface MonthlyReport {
  bulan: number;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
}

export interface CategoryData {
  kategori: string;
  total: number;
  jumlah: number;
}

export interface CreateKeuanganRequest {
  tanggalTransaksi: string;
  jenisTransaksi: string;
  kategori: string;
  subKategori?: string;
  jumlah: number;
  sumberDana?: string;
  tujuanPenggunaan?: string;
  keterangan?: string;
}

export interface UpdateKeuanganRequest {
  tanggalTransaksi?: string;
  jenisTransaksi?: string;
  kategori?: string;
  subKategori?: string;
  jumlah?: number;
  sumberDana?: string;
  tujuanPenggunaan?: string;
  keterangan?: string;
}

export interface GetKeuanganParams {
  page?: number;
  limit?: number;
  jenis?: string;
  kategori?: string;
  bulan?: number;
  tahun?: number;
  statusVerifikasi?: string;
  search?: string;
}

const keuanganService = {
  async getAll(params: GetKeuanganParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.jenis) queryParams.append('jenis', params.jenis);
    if (params.kategori) queryParams.append('kategori', params.kategori);
    if (params.bulan) queryParams.append('bulan', params.bulan.toString());
    if (params.tahun) queryParams.append('tahun', params.tahun.toString());
    if (params.search) queryParams.append('search', params.search);

    return api.get<Keuangan[]>(`/keuangan?${queryParams.toString()}`);
  },

  async getById(id: string) {
    return api.get<Keuangan>(`/keuangan/${id}`);
  },

  async create(data: CreateKeuanganRequest) {
    return api.post<Keuangan>('/keuangan', data);
  },

  async update(id: string, data: UpdateKeuanganRequest) {
    return api.put<void>(`/keuangan/${id}`, data);
  },

  async verify(id: string, statusVerifikasi: string) {
    return api.put<void>(`/keuangan/${id}/verify`, { statusVerifikasi });
  },

  async delete(id: string) {
    return api.delete<void>(`/keuangan/${id}`);
  },

  async getStatistics(tahun?: number) {
    const queryParams = tahun ? `?tahun=${tahun}` : '';
    return api.get<KeuanganStatistics>(`/keuangan/statistics${queryParams}`);
  },

  async getMonthlyReport(tahun?: number) {
    const queryParams = tahun ? `?tahun=${tahun}` : '';
    return api.get<MonthlyReport[]>(`/keuangan/monthly-report${queryParams}`);
  },

  async getCategories(tahun?: number, jenis?: string) {
    const queryParams = new URLSearchParams();
    if (tahun) queryParams.append('tahun', tahun.toString());
    if (jenis) queryParams.append('jenis', jenis);
    
    return api.get<CategoryData[]>(`/keuangan/categories?${queryParams.toString()}`);
  },
};

export default keuanganService;
