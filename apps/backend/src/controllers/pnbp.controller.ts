import { Request, Response } from 'express';
import { db } from '../config/db';
import { pnbp, lahanKhdpk, anggota } from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { config } from '../config/env';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { auditTrailService } from '../services/auditTrail.service';
import { rekonsiliasipnbpService } from '../services/rekonsiliasi.service';

export const PnbpController = {
  // Get all PNBP with filters
  async getAll(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        tahun = config.pnbp.tahun.toString(),
        statusPembayaran = '',
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereClause = eq(pnbp.tahunPNBP, parseInt(tahun as string));

      const result = await db
        .select({
          id: pnbp.id,
          nomorTransaksi: pnbp.nomorTransaksi,
          tahun: pnbp.tahunPNBP,
          lahanId: pnbp.lahanId,
          kodeLahan: lahanKhdpk.kodeLahan,
          nomorPetak: lahanKhdpk.nomorPetak,
          anggotaId: pnbp.anggotaId,
          anggotaNama: anggota.namaLengkap,
          anggotaNomor: anggota.nomorAnggota,
          luasLahan: pnbp.luasLahanDihitung,
          tarifPerHa: pnbp.tarifPerHa,
          totalTagihan: pnbp.jumlahPNBP,
          statusPembayaran: pnbp.statusBayar,
          tanggalJatuhTempo: pnbp.tanggalJatuhTempo,
          tanggalBayar: pnbp.tanggalBayar,
          jumlahDibayar: pnbp.jumlahPNBP,
          metodePembayaran: pnbp.metodeBayar,
          buktiPembayaran: pnbp.buktiSetor,
          keterangan: pnbp.keterangan,
          createdAt: pnbp.createdAt,
        })
        .from(pnbp)
        .leftJoin(lahanKhdpk, eq(pnbp.lahanId, lahanKhdpk.id))
        .leftJoin(anggota, eq(pnbp.anggotaId, anggota.id))
        .where(statusPembayaran ? and(whereClause, eq(pnbp.statusBayar, statusPembayaran as string)) : whereClause)
        .orderBy(desc(pnbp.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Map status dari database format ke frontend format
      const mappedResult = result.map(item => {
        let status = item.statusPembayaran;
        // Map 'belum' to 'belum_bayar'
        if (status === 'belum') {
          status = 'belum_bayar';
          // Check if terlambat (past due date)
          if (item.tanggalJatuhTempo && new Date(item.tanggalJatuhTempo) < new Date()) {
            status = 'terlambat';
          }
        }
        return {
          ...item,
          statusPembayaran: status,
        };
      });

      res.json({
        success: true,
        data: mappedResult,
      });
    } catch (error) {
      console.error('Get PNBP error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data PNBP',
      });
    }
  },

  // Get PNBP by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await db
        .select({
          id: pnbp.id,
          nomorTransaksi: pnbp.nomorTransaksi,
          tahun: pnbp.tahunPNBP,
          lahanId: pnbp.lahanId,
          kodeLahan: lahanKhdpk.kodeLahan,
          nomorPetak: lahanKhdpk.nomorPetak,
          anggotaId: anggota.id,
          anggotaNama: anggota.namaLengkap,
          anggotaNomor: anggota.nomorAnggota,
          luasLahan: pnbp.luasLahanDihitung,
          tarifPerHa: pnbp.tarifPerHa,
          totalTagihan: pnbp.jumlahPNBP,
          statusPembayaran: pnbp.statusBayar,
          tanggalJatuhTempo: pnbp.tanggalJatuhTempo,
          tanggalBayar: pnbp.tanggalBayar,
          jumlahDibayar: pnbp.jumlahPNBP,
          metodePembayaran: pnbp.metodeBayar,
          buktiPembayaran: pnbp.buktiSetor,
          keterangan: pnbp.keterangan,
          createdAt: pnbp.createdAt,
          updatedAt: pnbp.updatedAt,
        })
        .from(pnbp)
        .leftJoin(lahanKhdpk, eq(pnbp.lahanId, lahanKhdpk.id))
        .leftJoin(anggota, eq(pnbp.anggotaId, anggota.id))
        .where(eq(pnbp.id, id))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Data PNBP tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error('Get PNBP by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data PNBP',
      });
    }
  },

  // Generate PNBP for a year (auto calculate from lahan)
  async generateForYear(req: Request, res: Response) {
    try {
      const { tahun, force } = req.body;

      if (!tahun) {
        return res.status(400).json({
          success: false,
          message: 'Tahun wajib diisi',
        });
      }

      // Get all active lahan
      const lahanList = await db
        .select()
        .from(lahanKhdpk)
        .where(eq(lahanKhdpk.statusLegalitas, 'sah'));

      if (lahanList.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada lahan dengan status sah',
        });
      }

      // Check which lahan already have PNBP for this year (INCREMENTAL)
      const lahanToGenerate = [];
      let existingCount = 0;
      
      for (const lahan of lahanList) {
        const existing = await db
          .select()
          .from(pnbp)
          .where(
            and(
              eq(pnbp.lahanId, lahan.id),
              eq(pnbp.tahunPNBP, parseInt(tahun))
            )
          )
          .limit(1);

        if (existing.length === 0) {
          lahanToGenerate.push(lahan);
        } else {
          existingCount++;
        }
      }

      if (lahanToGenerate.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Semua lahan (${lahanList.length}) sudah memiliki tagihan PNBP untuk tahun ${tahun}`,
        });
      }

      // Warning if previous year has unpaid PNBP
      if (!force && parseInt(tahun) > new Date().getFullYear()) {
        const prevYear = parseInt(tahun) - 1;
        const prevYearUnpaid = await db
          .select({ count: sql<number>`count(*)` })
          .from(pnbp)
          .where(
            and(
              eq(pnbp.tahunPNBP, prevYear),
              eq(pnbp.statusBayar, 'belum')
            )
          );

        const unpaidCount = Number(prevYearUnpaid[0]?.count || 0);
        if (unpaidCount > 0) {
          return res.status(200).json({
            success: true,
            warning: true,
            message: `Perhatian: Tahun ${prevYear} masih ada ${unpaidCount} tagihan belum lunas`,
            data: {
              requireConfirmation: true,
              prevYear,
              unpaidCount,
              newTagihan: lahanToGenerate.length,
            },
          });
        }
      }

      // Get current count for nomor transaksi
      const currentCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(pnbp)
        .where(eq(pnbp.tahunPNBP, parseInt(tahun)));

      const startIndex = Number(currentCount[0]?.count || 0);

      // Generate PNBP records
      const pnbpRecords = lahanToGenerate.map((lahan, index) => {
        const luas = parseFloat(lahan.luasLahan);
        const tarif = config.pnbp.tarifPerHa;
        const total = luas * tarif;

        // Set jatuh tempo 3 bulan dari sekarang
        const jatuhTempo = new Date();
        jatuhTempo.setMonth(jatuhTempo.getMonth() + 3);

        // Generate nomor transaksi - continue numbering
        const nomorTransaksi = `PNBP/${tahun}/${String(startIndex + index + 1).padStart(5, '0')}`;

        return {
          nomorTransaksi,
          anggotaId: lahan.anggotaId,
          lahanId: lahan.id,
          tahunPNBP: parseInt(tahun),
          luasLahanDihitung: lahan.luasLahan,
          tarifPerHa: tarif.toString(),
          jumlahPNBP: total.toString(),
          statusBayar: 'belum',
          tanggalJatuhTempo: jatuhTempo,
        };
      });

      await db.insert(pnbp).values(pnbpRecords);

      res.json({
        success: true,
        message: `Berhasil generate ${pnbpRecords.length} tagihan PNBP baru untuk tahun ${tahun}`,
        data: { 
          count: pnbpRecords.length,
          tahun: parseInt(tahun),
          totalLahan: lahanList.length,
          sudahAda: existingCount,
          baru: pnbpRecords.length,
        },
      });
    } catch (error) {
      console.error('Generate PNBP error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal generate PNBP',
      });
    }
  },

  // Update payment status
  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        statusPembayaran,
        tanggalBayar,
        jumlahDibayar,
        metodePembayaran,
        keterangan,
      } = req.body;

      if (!statusPembayaran) {
        return res.status(400).json({
          success: false,
          message: 'Status pembayaran wajib diisi',
        });
      }

      // Map frontend status to database status
      let dbStatus = statusPembayaran;
      if (statusPembayaran === 'belum_bayar') {
        dbStatus = 'belum';
      } else if (statusPembayaran === 'terlambat') {
        dbStatus = 'belum';
      }

      const updateData: any = {
        statusBayar: dbStatus,
        updatedAt: new Date(),
      };

      if (statusPembayaran === 'lunas') {
        if (!tanggalBayar) {
          return res.status(400).json({
            success: false,
            message: 'Tanggal bayar wajib diisi untuk status lunas',
          });
        }
        updateData.tanggalBayar = new Date(tanggalBayar);
        updateData.metodeBayar = metodePembayaran;
      }

      if (keterangan) {
        updateData.keterangan = keterangan;
      }

      // Get old values before update
      const [existing] = await db
        .select()
        .from(pnbp)
        .where(eq(pnbp.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Data PNBP tidak ditemukan',
        });
      }

      const [updated] = await db
        .update(pnbp)
        .set(updateData)
        .where(eq(pnbp.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      if (req.user?.id) {
        await auditTrailService.logUpdate(
          req.user.id,
          'pnbp',
          updated.id,
          existing,
          updated,
          req,
          `Memperbarui pembayaran PNBP: ${existing.nomorTransaksi} - Status: ${statusPembayaran}`
        );
      }

      res.json({
        success: true,
        message: 'Pembayaran berhasil diupdate',
      });
    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal update pembayaran',
      });
    }
  },

  // Get statistics
  async getStatistics(req: Request, res: Response) {
    try {
      const { tahun = config.pnbp.tahun.toString() } = req.query;

      const result = await db
        .select({
          totalTagihan: sql<number>`COALESCE(SUM(CAST(${pnbp.jumlahPNBP} AS DECIMAL)), 0)`,
          totalTerbayar: sql<number>`COALESCE(SUM(CASE WHEN ${pnbp.statusBayar} = 'lunas' THEN CAST(${pnbp.jumlahPNBP} AS DECIMAL) ELSE 0 END), 0)`,
          totalBelumBayar: sql<number>`COUNT(CASE WHEN ${pnbp.statusBayar} = 'belum' THEN 1 END)`,
          totalLunas: sql<number>`COUNT(CASE WHEN ${pnbp.statusBayar} = 'lunas' THEN 1 END)`,
          totalTerlambat: sql<number>`COUNT(CASE WHEN ${pnbp.statusBayar} = 'terlambat' THEN 1 END)`,
        })
        .from(pnbp)
        .where(eq(pnbp.tahunPNBP, parseInt(tahun as string)));

      res.json({
        success: true,
        data: result[0] || {
          totalTagihan: 0,
          totalTerbayar: 0,
          totalBelumBayar: 0,
          totalLunas: 0,
          totalTerlambat: 0,
        },
      });
    } catch (error) {
      console.error('Get PNBP statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik PNBP',
      });
    }
  },

  // Delete PNBP (admin only)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Get data before delete
      const [existing] = await db
        .select()
        .from(pnbp)
        .where(eq(pnbp.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Data PNBP tidak ditemukan',
        });
      }

      await db.delete(pnbp).where(eq(pnbp.id, id));

      // Audit trail: Log DELETE action
      if (req.user?.id) {
        await auditTrailService.logDelete(
          req.user.id,
          'pnbp',
          existing.id,
          existing,
          req,
          `Menghapus data PNBP: ${existing.nomorTransaksi} - Tahun ${existing.tahunPNBP}`
        );
      }

      res.json({
        success: true,
        message: 'Data PNBP berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete PNBP error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus data PNBP',
      });
    }
  },

  // Print bukti pembayaran PNBP per anggota per tahun
  async printBuktiPembayaran(req: Request, res: Response) {
    try {
      const { anggotaId, tahun } = req.params;

      // Get PNBP data untuk anggota dan tahun tertentu
      const pnbpData = await db
        .select({
          id: pnbp.id,
          nomorTransaksi: pnbp.nomorTransaksi,
          tahun: pnbp.tahunPNBP,
          anggotaNama: anggota.namaLengkap,
          anggotaNomor: anggota.nomorAnggota,
          anggotaAlamat: anggota.alamatLengkap,
          anggotaDesa: anggota.desa,
          anggotaKecamatan: anggota.kecamatan,
          anggotaKabupaten: anggota.kabupaten,
          anggotaTelepon: anggota.nomorTelepon,
          luasLahan: pnbp.luasLahanDihitung,
          tarifPerHa: pnbp.tarifPerHa,
          totalTagihan: pnbp.jumlahPNBP,
          statusPembayaran: pnbp.statusBayar,
          tanggalBayar: pnbp.tanggalBayar,
          metodePembayaran: pnbp.metodeBayar,
          nomorReferensi: pnbp.nomorReferensi,
          keterangan: pnbp.keterangan,
        })
        .from(pnbp)
        .leftJoin(anggota, eq(pnbp.anggotaId, anggota.id))
        .where(and(
          eq(pnbp.anggotaId, anggotaId),
          eq(pnbp.tahunPNBP, parseInt(tahun)),
          eq(pnbp.statusBayar, 'lunas')
        ))
        .limit(1);

      if (pnbpData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Data pembayaran PNBP tidak ditemukan atau belum lunas',
        });
      }

      const data = pnbpData[0];

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('BUKTI PEMBAYARAN PNBP', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('Kelompok Tani Hutan Berkah Tani Mandiri', pageWidth / 2, 28, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Desa Gembol, Kecamatan Karanganyar, Kabupaten Ngawi, Jawa Timur', pageWidth / 2, 34, { align: 'center' });

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(15, 38, pageWidth - 15, 38);

      // Nomor Transaksi & Tahun
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`No. Transaksi: ${data.nomorTransaksi}`, 15, 48);
      doc.text(`Tahun PNBP: ${data.tahun}`, pageWidth - 15, 48, { align: 'right' });

      // Data Anggota
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DATA ANGGOTA', 15, 58);
      
      doc.setFont('helvetica', 'normal');
      const anggotaInfo = [
        ['Nomor Anggota', `: ${data.anggotaNomor}`],
        ['Nama Lengkap', `: ${data.anggotaNama}`],
        ['Alamat', `: ${data.anggotaAlamat}`],
        ['Desa/Kecamatan', `: ${data.anggotaDesa}, ${data.anggotaKecamatan}`],
        ['Kabupaten', `: ${data.anggotaKabupaten}`],
        ['No. Telepon', `: ${data.anggotaTelepon || '-'}`],
      ];

      let yPos = 64;
      anggotaInfo.forEach(([label, value]) => {
        doc.text(label, 15, yPos);
        doc.text(value, 55, yPos);
        yPos += 6;
      });

      // Data PNBP
      yPos += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('DATA PNBP', 15, yPos);
      
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const pnbpInfo = [
        ['Luas Lahan', `: ${parseFloat(data.luasLahan).toFixed(4)} Ha`],
        ['Tarif per Hektar', `: Rp ${parseFloat(data.tarifPerHa).toLocaleString('id-ID')}`],
        ['Total Tagihan', `: Rp ${parseFloat(data.totalTagihan).toLocaleString('id-ID')}`],
        ['Status', `: ${data.statusPembayaran.toUpperCase()}`],
        ['Tanggal Bayar', `: ${data.tanggalBayar ? new Date(data.tanggalBayar).toLocaleDateString('id-ID') : '-'}`],
        ['Metode Bayar', `: ${data.metodePembayaran || '-'}`],
        ['No. Referensi', `: ${data.nomorReferensi || '-'}`],
      ];

      pnbpInfo.forEach(([label, value]) => {
        doc.text(label, 15, yPos);
        doc.text(value, 55, yPos);
        yPos += 6;
      });

      // Keterangan
      if (data.keterangan) {
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('Keterangan:', 15, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(data.keterangan, 15, yPos, { maxWidth: pageWidth - 30 });
        yPos += 12;
      }

      // Footer - TTD
      yPos = Math.max(yPos + 10, 240);
      doc.text(`Ngawi, ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 15, yPos, { align: 'right' });
      
      yPos += 6;
      doc.text('Mengetahui,', 15, yPos);
      doc.text('Penerima,', pageWidth - 15, yPos, { align: 'right' });

      yPos += 20;
      doc.text('(_________________)', 15, yPos);
      doc.text('(_________________)', pageWidth - 15, yPos, { align: 'right' });
      
      yPos += 6;
      doc.setFontSize(9);
      doc.text('Ketua KTH BTM', 15, yPos);
      doc.text(data.anggotaNama || '', pageWidth - 15, yPos, { align: 'right' });

      // Watermark
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Dokumen ini dicetak secara otomatis dari Sistem Informasi KTH BTM', pageWidth / 2, 285, { align: 'center' });

      // Send PDF
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Bukti_PNBP_${data.anggotaNomor}_${tahun}.pdf`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Print bukti PNBP error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mencetak bukti pembayaran PNBP',
      });
    }
  },

  /**
   * PNBP Reconciliation with Keuangan
   * GET /api/pnbp/reconciliation?tahun=2026
   */
  async reconciliation(req: Request, res: Response) {
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

      const report = await rekonsiliasipnbpService.reconcilePNBP(tahunNum);

      return res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('PNBP reconciliation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat melakukan rekonsiliasi PNBP',
      });
    }
  },

  /**
   * Get reconciliation summary for multiple years
   * GET /api/pnbp/reconciliation-summary?startYear=2024&endYear=2026
   */
  async reconciliationSummary(req: Request, res: Response) {
    try {
      const { startYear, endYear } = req.query;

      if (!startYear || !endYear) {
        return res.status(400).json({
          success: false,
          message: 'Start year dan end year wajib diisi',
        });
      }

      const start = parseInt(startYear as string);
      const end = parseInt(endYear as string);

      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({
          success: false,
          message: 'Tahun tidak valid',
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Start year tidak boleh lebih besar dari end year',
        });
      }

      const summary = await rekonsiliasipnbpService.getReconciliationSummary(start, end);

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('PNBP reconciliation summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil ringkasan rekonsiliasi',
      });
    }
  },
};
