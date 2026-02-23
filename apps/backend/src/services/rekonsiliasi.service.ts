import { db } from '../config/db';
import { pnbp, keuangan } from '../db/schema';
import { and, eq, sql } from 'drizzle-orm';

interface ReconciliationDiscrepancy {
  type: 'count' | 'amount';
  pnbpValue: number;
  keuanganValue: number;
  difference: number;
  percentage: number;
}

interface ReconciliationReport {
  tahun: number;
  periode: {
    startDate: Date;
    endDate: Date;
  };
  pnbpData: {
    totalRecords: number;
    totalAmount: number;
    paidCount: number;
    paidAmount: number;
    unpaidCount: number;
    unpaidAmount: number;
  };
  keuanganData: {
    totalRecords: number;
    totalAmount: number;
  };
  reconciliation: {
    isMatched: boolean;
    discrepancies: ReconciliationDiscrepancy[];
  };
  details: {
    matchedTransactions: number;
    unmatchedPnbp: Array<{
      nomorPembayaran: string;
      tahun: number;
      jumlah: number;
      status: string;
    }>;
    unmatchedKeuangan: Array<{
      nomorTransaksi: string;
      tanggal: Date;
      jumlah: number;
    }>;
  };
}

export class RekonsiliasipnbpService {
  /**
   * Perform PNBP reconciliation for a specific year
   * Compares total PNBP received vs Keuangan income (kategori: PNBP)
   */
  static async reconcilePNBP(tahun: number): Promise<ReconciliationReport> {
    // Calculate period boundaries
    const startDate = new Date(tahun, 0, 1);
    const endDate = new Date(tahun, 11, 31, 23, 59, 59);

    // Query PNBP data
    const [pnbpStats] = await db
      .select({
        totalRecords: sql<number>`count(*)::int`,
        totalAmount: sql<number>`COALESCE(SUM(CAST(${pnbp.jumlahPNBP} AS DECIMAL)), 0)`,
        paidCount: sql<number>`count(CASE WHEN ${pnbp.statusBayar} = 'lunas' THEN 1 END)::int`,
        paidAmount: sql<number>`COALESCE(SUM(CASE WHEN ${pnbp.statusBayar} = 'lunas' THEN CAST(${pnbp.jumlahPNBP} AS DECIMAL) ELSE 0 END), 0)`,
        unpaidCount: sql<number>`count(CASE WHEN ${pnbp.statusBayar} != 'lunas' THEN 1 END)::int`,
        unpaidAmount: sql<number>`COALESCE(SUM(CASE WHEN ${pnbp.statusBayar} != 'lunas' THEN CAST(${pnbp.jumlahPNBP} AS DECIMAL) ELSE 0 END), 0)`,
      })
      .from(pnbp)
      .where(eq(pnbp.tahunPNBP, tahun));

    // Query Keuangan data (kategori = PNBP, jenis = pemasukan)
    const [keuanganStats] = await db
      .select({
        totalRecords: sql<number>`count(*)::int`,
        totalAmount: sql<number>`COALESCE(SUM(CAST(${keuangan.jumlah} AS DECIMAL)), 0)`,
      })
      .from(keuangan)
      .where(
        and(
          eq(keuangan.kategori, 'PNBP'),
          eq(keuangan.jenisTransaksi, 'pemasukan'),
          sql`EXTRACT(YEAR FROM ${keuangan.tanggalTransaksi}) = ${tahun}`
        )
      );

    // Calculate discrepancies
    const discrepancies: ReconciliationDiscrepancy[] = [];

    // Check count mismatch (only for paid PNBP)
    const countDiff = Number(pnbpStats.paidCount) - Number(keuanganStats.totalRecords);
    if (countDiff !== 0) {
      discrepancies.push({
        type: 'count',
        pnbpValue: Number(pnbpStats.paidCount),
        keuanganValue: Number(keuanganStats.totalRecords),
        difference: countDiff,
        percentage: Number(pnbpStats.paidCount) > 0 
          ? (countDiff / Number(pnbpStats.paidCount)) * 100
          : 0,
      });
    }

    // Check amount mismatch (only for paid PNBP)
    const amountDiff = Number(pnbpStats.paidAmount) - Number(keuanganStats.totalAmount);
    if (Math.abs(amountDiff) > 0.01) { // Allow 1 cent tolerance for rounding
      discrepancies.push({
        type: 'amount',
        pnbpValue: Number(pnbpStats.paidAmount),
        keuanganValue: Number(keuanganStats.totalAmount),
        difference: amountDiff,
        percentage: Number(pnbpStats.paidAmount) > 0
          ? (amountDiff / Number(pnbpStats.paidAmount)) * 100
          : 0,
      });
    }

    // Get unmatched transactions (simplified - in production, would need more complex matching logic)
    const unmatchedPnbp = await db
      .select({
        nomorPembayaran: pnbp.nomorTransaksi,
        tahun: pnbp.tahunPNBP,
        jumlah: pnbp.jumlahPNBP,
        status: pnbp.statusBayar,
      })
      .from(pnbp)
      .where(
        and(
          eq(pnbp.tahunPNBP, tahun),
          eq(pnbp.statusBayar, 'lunas')
        )
      )
      .limit(10); // Limit for performance

    const unmatchedKeuangan = await db
      .select({
        nomorTransaksi: keuangan.nomorTransaksi,
        tanggal: keuangan.tanggalTransaksi,
        jumlah: keuangan.jumlah,
      })
      .from(keuangan)
      .where(
        and(
          eq(keuangan.kategori, 'PNBP'),
          eq(keuangan.jenisTransaksi, 'pemasukan'),
          sql`EXTRACT(YEAR FROM ${keuangan.tanggalTransaksi}) = ${tahun}`
        )
      )
      .limit(10); // Limit for performance

    return {
      tahun,
      periode: {
        startDate,
        endDate,
      },
      pnbpData: {
        totalRecords: Number(pnbpStats.totalRecords),
        totalAmount: Number(pnbpStats.totalAmount),
        paidCount: Number(pnbpStats.paidCount),
        paidAmount: Number(pnbpStats.paidAmount),
        unpaidCount: Number(pnbpStats.unpaidCount),
        unpaidAmount: Number(pnbpStats.unpaidAmount),
      },
      keuanganData: {
        totalRecords: Number(keuanganStats.totalRecords),
        totalAmount: Number(keuanganStats.totalAmount),
      },
      reconciliation: {
        isMatched: discrepancies.length === 0,
        discrepancies,
      },
      details: {
        matchedTransactions: Math.min(Number(pnbpStats.paidCount), Number(keuanganStats.totalRecords)),
        unmatchedPnbp: unmatchedPnbp.map(p => ({
          nomorPembayaran: p.nomorPembayaran,
          tahun: p.tahun,
          jumlah: Number(p.jumlah),
          status: p.status,
        })),
        unmatchedKeuangan: unmatchedKeuangan.map(k => ({
          nomorTransaksi: k.nomorTransaksi,
          tanggal: k.tanggal,
          jumlah: Number(k.jumlah),
        })),
      },
    };
  }

  /**
   * Get reconciliation summary for multiple years
   */
  static async getReconciliationSummary(startYear: number, endYear: number): Promise<Array<{
    tahun: number;
    isMatched: boolean;
    pnbpAmount: number;
    keuanganAmount: number;
    difference: number;
  }>> {
    const summary = [];

    for (let tahun = startYear; tahun <= endYear; tahun++) {
      const report = await this.reconcilePNBP(tahun);
      summary.push({
        tahun,
        isMatched: report.reconciliation.isMatched,
        pnbpAmount: report.pnbpData.paidAmount,
        keuanganAmount: report.keuanganData.totalAmount,
        difference: report.pnbpData.paidAmount - report.keuanganData.totalAmount,
      });
    }

    return summary;
  }
}

export const rekonsiliasipnbpService = RekonsiliasipnbpService;
