import { api } from './api';

export interface BukuKasEntry {
  tanggal: Date;
  nomorTransaksi: string;
  uraian: string;
  kategori: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  keterangan?: string;
}

export interface BukuKasReport {
  periode: {
    tahun: number;
    bulan: number;
    bulanNama: string;
  };
  saldoAwal: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
  entries: BukuKasEntry[];
  hasNegativeBalance: boolean;
  negativeBalanceDates: Date[];
}

export interface CashFlowValidation {
  isValid: boolean;
  issues: Array<{
    date: Date;
    balance: number;
    message: string;
  }>;
}

const bukuKasService = {
  async getBukuKas(tahun: number, bulan: number) {
    return api.get(`/buku-kas?tahun=${tahun}&bulan=${bulan}`);
  },

  async getCurrentBalance() {
    return api.get('/buku-kas/current-balance');
  },

  async validateCashFlow(tahun: number) {
    return api.get(`/buku-kas/validate?tahun=${tahun}`);
  },
};

export default bukuKasService;
