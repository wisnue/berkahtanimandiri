import { Request, Response } from 'express';
import { bukuKasService } from '../services/bukuKas.service';

export class BukuKasController {
  /**
   * Get Buku Kas report for specific month
   * GET /api/buku-kas?tahun=2026&bulan=2
   */
  static async getBukuKas(req: Request, res: Response) {
    try {
      const { tahun, bulan } = req.query;

      if (!tahun || !bulan) {
        return res.status(400).json({
          success: false,
          message: 'Tahun dan bulan wajib diisi',
        });
      }

      const tahunNum = parseInt(tahun as string);
      const bulanNum = parseInt(bulan as string);

      if (isNaN(tahunNum) || isNaN(bulanNum) || bulanNum < 1 || bulanNum > 12) {
        return res.status(400).json({
          success: false,
          message: 'Tahun atau bulan tidak valid',
        });
      }

      const report = await bukuKasService.generateBukuKas(tahunNum, bulanNum);

      return res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Get Buku Kas error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil Buku Kas',
      });
    }
  }

  /**
   * Get current cash balance
   * GET /api/buku-kas/current-balance
   */
  static async getCurrentBalance(_req: Request, res: Response) {
    try {
      const balance = await bukuKasService.getCurrentBalance();

      return res.status(200).json({
        success: true,
        data: {
          saldoKas: balance,
          formatted: `Rp ${balance.toLocaleString('id-ID')}`,
        },
      });
    } catch (error) {
      console.error('Get current balance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil saldo kas',
      });
    }
  }

  /**
   * Validate cash flow for a year
   * GET /api/buku-kas/validate?tahun=2026
   */
  static async validateCashFlow(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      if (!tahun) {
        return res.status(400).json({
          success: false,
          message: 'Tahun wajib diisi',
        });
      }

      const tahunNum = parseInt(tahun as string);

      if (isNaN(tahunNum)) {
        return res.status(400).json({
          success: false,
          message: 'Tahun tidak valid',
        });
      }

      const validation = await bukuKasService.validateCashFlow(tahunNum);

      return res.status(200).json({
        success: true,
        data: validation,
      });
    } catch (error) {
      console.error('Validate cash flow error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat validasi arus kas',
      });
    }
  }
}
