import { db } from '../config/db';
import { keuangan } from '../db/schema';
import { and, gte, lte, eq, sql, asc } from 'drizzle-orm';

interface BukuKasEntry {
  tanggal: Date;
  nomorTransaksi: string;
  uraian: string;
  kategori: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  keterangan?: string;
}

interface BukuKasReport {
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

export class BukuKasService {
  /**
   * Generate Buku Kas (Cash Ledger) for a specific month
   */
  static async generateBukuKas(tahun: number, bulan: number): Promise<BukuKasReport> {
    // Validate input
    if (!tahun || !bulan || bulan < 1 || bulan > 12) {
      throw new Error('Tahun dan bulan tidak valid');
    }

    // Calculate period boundaries
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

    // Calculate saldo awal (beginning balance)
    // Sum all transactions before this month
    const [saldoAwalResult] = await db
      .select({
        pemasukan: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pemasukan' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
        pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pengeluaran' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
      })
      .from(keuangan)
      .where(
        and(
          sql`${keuangan.tanggalTransaksi} < ${startDate.toISOString()}`,
          eq(keuangan.statusVerifikasi, 'verified')
        )
      );

    const saldoAwal = Number(saldoAwalResult.pemasukan) - Number(saldoAwalResult.pengeluaran);

    // Get all transactions for this month
    const transactions = await db
      .select()
      .from(keuangan)
      .where(
        and(
          gte(keuangan.tanggalTransaksi, startDate),
          lte(keuangan.tanggalTransaksi, endDate),
          eq(keuangan.statusVerifikasi, 'verified')
        )
      )
      .orderBy(asc(keuangan.tanggalTransaksi), asc(keuangan.createdAt));

    // Build entries with running balance
    let runningSaldo = saldoAwal;
    const entries: BukuKasEntry[] = [];
    const negativeBalanceDates: Date[] = [];
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    for (const trx of transactions) {
      const jumlah = Number(trx.jumlah);
      const isPemasukan = trx.jenisTransaksi === 'pemasukan';

      if (isPemasukan) {
        runningSaldo += jumlah;
        totalPemasukan += jumlah;
      } else {
        runningSaldo -= jumlah;
        totalPengeluaran += jumlah;
      }

      // Detect negative balance
      if (runningSaldo < 0) {
        negativeBalanceDates.push(trx.tanggalTransaksi);
      }

      entries.push({
        tanggal: trx.tanggalTransaksi,
        nomorTransaksi: trx.nomorTransaksi,
        uraian: trx.tujuanPenggunaan || trx.kategori,
        kategori: trx.kategori,
        pemasukan: isPemasukan ? jumlah : 0,
        pengeluaran: isPemasukan ? 0 : jumlah,
        saldo: runningSaldo,
        keterangan: trx.keterangan || undefined,
      });
    }

    const saldoAkhir = runningSaldo;

    // Month names in Indonesian
    const bulanNama = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ][bulan - 1];

    return {
      periode: {
        tahun,
        bulan,
        bulanNama,
      },
      saldoAwal,
      totalPemasukan,
      totalPengeluaran,
      saldoAkhir,
      entries,
      hasNegativeBalance: negativeBalanceDates.length > 0,
      negativeBalanceDates,
    };
  }

  /**
   * Get current cash balance (saldo kas saat ini)
   */
  static async getCurrentBalance(): Promise<number> {
    const [result] = await db
      .select({
        pemasukan: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pemasukan' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
        pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pengeluaran' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
      })
      .from(keuangan)
      .where(eq(keuangan.statusVerifikasi, 'verified'));

    return Number(result.pemasukan) - Number(result.pengeluaran);
  }

  /**
   * Get balance at a specific date
   */
  static async getBalanceAtDate(date: Date): Promise<number> {
    const [result] = await db
      .select({
        pemasukan: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pemasukan' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
        pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pengeluaran' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
      })
      .from(keuangan)
      .where(
        and(
          sql`${keuangan.tanggalTransaksi} <= ${date.toISOString()}`,
          eq(keuangan.statusVerifikasi, 'verified')
        )
      );

    return Number(result.pemasukan) - Number(result.pengeluaran);
  }

  /**
   * Validate cash balance (check for negative balance periods)
   */
  static async validateCashFlow(tahun: number): Promise<{
    isValid: boolean;
    issues: Array<{ date: Date; balance: number; message: string }>;
  }> {
    const issues: Array<{ date: Date; balance: number; message: string }> = [];

    // Check each month in the year
    for (let bulan = 1; bulan <= 12; bulan++) {
      const report = await this.generateBukuKas(tahun, bulan);

      if (report.hasNegativeBalance) {
        for (const date of report.negativeBalanceDates) {
          const entry = report.entries.find(e => e.tanggal === date);
          if (entry) {
            issues.push({
              date,
              balance: entry.saldo,
              message: `Saldo negatif terdeteksi pada ${date.toLocaleDateString('id-ID')}: Rp ${entry.saldo.toLocaleString('id-ID')}`,
            });
          }
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}

export const bukuKasService = BukuKasService;
