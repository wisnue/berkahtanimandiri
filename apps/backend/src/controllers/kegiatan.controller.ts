import { Request, Response } from 'express';
import { db } from '../config/db';
import { kegiatan, anggota, lahanKhdpk } from '../db/schema';
import { eq, desc, like, or, and, sql, gte, lte } from 'drizzle-orm';
import { auditTrailService } from '../services/auditTrail.service';

class KegiatanController {
  // Get all kegiatan with filters and pagination
  async getAll(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        jenis,
        status,
        tahun,
        bulan,
        search,
      } = req.query;

      const conditions = [];

      if (jenis) {
        conditions.push(eq(kegiatan.jenisKegiatan, jenis as string));
      }

      if (status) {
        conditions.push(eq(kegiatan.statusKegiatan, status as string));
      }

      if (tahun) {
        const year = parseInt(tahun as string);
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        conditions.push(
          and(
            gte(kegiatan.tanggalMulai, startDate),
            lte(kegiatan.tanggalMulai, endDate)
          )
        );
      }

      if (bulan && tahun) {
        const year = parseInt(tahun as string);
        const month = parseInt(bulan as string) - 1;
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        conditions.push(
          and(
            gte(kegiatan.tanggalMulai, startDate),
            lte(kegiatan.tanggalMulai, endDate)
          )
        );
      }

      if (search) {
        conditions.push(
          or(
            like(kegiatan.namaKegiatan, `%${search}%`),
            like(kegiatan.kodeKegiatan, `%${search}%`),
            like(kegiatan.lokasiKegiatan, `%${search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const results = await db
        .select({
          id: kegiatan.id,
          kodeKegiatan: kegiatan.kodeKegiatan,
          namaKegiatan: kegiatan.namaKegiatan,
          jenisKegiatan: kegiatan.jenisKegiatan,
          tanggalMulai: kegiatan.tanggalMulai,
          tanggalSelesai: kegiatan.tanggalSelesai,
          lokasiKegiatan: kegiatan.lokasiKegiatan,
          jumlahPeserta: kegiatan.jumlahPeserta,
          statusKegiatan: kegiatan.statusKegiatan,
          biayaKegiatan: kegiatan.biayaKegiatan,
          penanggungJawabNama: sql<string>`COALESCE(${anggota.namaLengkap}, 'Tidak ada')`,
          lahanNama: sql<string>`COALESCE(${lahanKhdpk.kodeLahan}, 'Tidak ada')`,
          createdAt: kegiatan.createdAt,
        })
        .from(kegiatan)
        .leftJoin(anggota, eq(kegiatan.penanggungJawab, anggota.id))
        .leftJoin(lahanKhdpk, eq(kegiatan.lahanId, lahanKhdpk.id))
        .where(whereClause)
        .orderBy(desc(kegiatan.tanggalMulai))
        .limit(parseInt(limit as string))
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(kegiatan)
        .where(whereClause);

      res.json({
        success: true,
        data: results,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: Number(count),
          totalPages: Math.ceil(Number(count) / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('Get all kegiatan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kegiatan',
      });
    }
  }

  // Get kegiatan by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await db
        .select({
          id: kegiatan.id,
          kodeKegiatan: kegiatan.kodeKegiatan,
          namaKegiatan: kegiatan.namaKegiatan,
          jenisKegiatan: kegiatan.jenisKegiatan,
          tanggalMulai: kegiatan.tanggalMulai,
          tanggalSelesai: kegiatan.tanggalSelesai,
          lokasiKegiatan: kegiatan.lokasiKegiatan,
          lahanId: kegiatan.lahanId,
          penanggungJawab: kegiatan.penanggungJawab,
          jumlahPeserta: kegiatan.jumlahPeserta,
          targetProduksi: kegiatan.targetProduksi,
          realisasiProduksi: kegiatan.realisasiProduksi,
          satuanProduksi: kegiatan.satuanProduksi,
          biayaKegiatan: kegiatan.biayaKegiatan,
          sumberDana: kegiatan.sumberDana,
          statusKegiatan: kegiatan.statusKegiatan,
          hasilKegiatan: kegiatan.hasilKegiatan,
          kendala: kegiatan.kendala,
          keterangan: kegiatan.keterangan,
          dokumentasiFoto: kegiatan.dokumentasiFoto,
          laporanKegiatan: kegiatan.laporanKegiatan,
          penanggungJawabNama: sql<string>`COALESCE(${anggota.namaLengkap}, 'Tidak ada')`,
          lahanNama: sql<string>`COALESCE(${lahanKhdpk.kodeLahan}, 'Tidak ada')`,
          createdAt: kegiatan.createdAt,
          updatedAt: kegiatan.updatedAt,
        })
        .from(kegiatan)
        .leftJoin(anggota, eq(kegiatan.penanggungJawab, anggota.id))
        .leftJoin(lahanKhdpk, eq(kegiatan.lahanId, lahanKhdpk.id))
        .where(eq(kegiatan.id, id))
        .limit(1);

      if (!result.length) {
        return res.status(404).json({
          success: false,
          message: 'Kegiatan tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error('Get kegiatan by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kegiatan',
      });
    }
  }

  // Create new kegiatan
  async create(req: Request, res: Response) {
    try {
      const {
        namaKegiatan,
        jenisKegiatan,
        tanggalMulai,
        tanggalSelesai,
        lokasiKegiatan,
        lahanId,
        penanggungJawab,
        jumlahPeserta,
        targetProduksi,
        realisasiProduksi,
        satuanProduksi,
        biayaKegiatan,
        sumberDana,
        statusKegiatan,
        hasilKegiatan,
        kendala,
        keterangan,
        dokumentasiFoto,
        laporanKegiatan,
      } = req.body;

      if (!namaKegiatan || !jenisKegiatan || !tanggalMulai) {
        return res.status(400).json({
          success: false,
          message: 'Nama kegiatan, jenis, dan tanggal mulai wajib diisi',
        });
      }

      // Generate kode kegiatan: KEG/JENIS/YYYYMMDD/XXX
      const jenisCode = jenisKegiatan.substring(0, 3).toUpperCase();
      const dateStr = new Date(tanggalMulai).toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get count for the day to generate sequence number
      const dayStart = new Date(tanggalMulai);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(tanggalMulai);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(kegiatan)
        .where(
          and(
            gte(kegiatan.tanggalMulai, dayStart),
            lte(kegiatan.tanggalMulai, dayEnd)
          )
        );

      const sequence = (Number(dayCount[0]?.count || 0) + 1).toString().padStart(3, '0');
      const kodeKegiatan = `KEG/${jenisCode}/${dateStr}/${sequence}`;

      const newKegiatan = await db
        .insert(kegiatan)
        .values({
          kodeKegiatan,
          namaKegiatan,
          jenisKegiatan,
          tanggalMulai: new Date(tanggalMulai),
          tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
          lokasiKegiatan,
          lahanId: lahanId || null,
          penanggungJawab: penanggungJawab || null,
          jumlahPeserta,
          targetProduksi: targetProduksi ? targetProduksi.toString() : null,
          realisasiProduksi: realisasiProduksi ? realisasiProduksi.toString() : null,
          satuanProduksi,
          biayaKegiatan: biayaKegiatan ? biayaKegiatan.toString() : null,
          sumberDana,
          statusKegiatan: statusKegiatan || 'rencana',
          hasilKegiatan,
          kendala,
          keterangan,
          dokumentasiFoto,
          laporanKegiatan,
        })
        .returning();

      // Audit trail: Log CREATE action
      if (req.user?.id) {
        await auditTrailService.logCreate(
          req.user.id,
          'kegiatan',
          newKegiatan[0].id,
          newKegiatan[0],
          req,
          `Menambahkan kegiatan: ${newKegiatan[0].namaKegiatan} (${newKegiatan[0].kodeKegiatan})`
        );
      }

      res.status(201).json({
        success: true,
        message: 'Kegiatan berhasil ditambahkan',
        data: newKegiatan[0],
      });
    } catch (error) {
      console.error('Create kegiatan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan kegiatan',
      });
    }
  }

  // Update kegiatan
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        namaKegiatan,
        jenisKegiatan,
        tanggalMulai,
        tanggalSelesai,
        lokasiKegiatan,
        lahanId,
        penanggungJawab,
        jumlahPeserta,
        targetProduksi,
        realisasiProduksi,
        satuanProduksi,
        biayaKegiatan,
        sumberDana,
        statusKegiatan,
        hasilKegiatan,
        kendala,
        keterangan,
        dokumentasiFoto,
        laporanKegiatan,
      } = req.body;

      // Capture existing values for audit trail
      const [existing] = await db
        .select()
        .from(kegiatan)
        .where(eq(kegiatan.id, id));

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kegiatan tidak ditemukan',
        });
      }

      const updated = await db
        .update(kegiatan)
        .set({
          namaKegiatan,
          jenisKegiatan,
          tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : undefined,
          tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : undefined,
          lokasiKegiatan,
          lahanId: lahanId || null,
          penanggungJawab: penanggungJawab || null,
          jumlahPeserta,
          targetProduksi: targetProduksi ? targetProduksi.toString() : undefined,
          realisasiProduksi: realisasiProduksi ? realisasiProduksi.toString() : undefined,
          satuanProduksi,
          biayaKegiatan: biayaKegiatan ? biayaKegiatan.toString() : undefined,
          sumberDana,
          statusKegiatan,
          hasilKegiatan,
          kendala,
          keterangan,
          dokumentasiFoto,
          laporanKegiatan,
          updatedAt: new Date(),
        })
        .where(eq(kegiatan.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      if (req.user?.id && updated.length) {
        await auditTrailService.logUpdate(
          req.user.id,
          'kegiatan',
          id,
          existing,
          updated[0],
          req,
          `Memperbarui kegiatan: ${updated[0].namaKegiatan} (${updated[0].kodeKegiatan})`
        );
      }

      res.json({
        success: true,
        message: 'Kegiatan berhasil diupdate',
        data: updated[0],
      });
    } catch (error) {
      console.error('Update kegiatan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate kegiatan',
      });
    }
  }

  // Delete kegiatan (soft delete)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Capture existing values for audit trail
      const [existing] = await db
        .select()
        .from(kegiatan)
        .where(eq(kegiatan.id, id));

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kegiatan tidak ditemukan',
        });
      }

      const deleted = await db
        .update(kegiatan)
        .set({ deletedAt: new Date() })
        .where(eq(kegiatan.id, id))
        .returning();

      // Audit trail: Log DELETE action
      if (req.user?.id && deleted.length) {
        await auditTrailService.logDelete(
          req.user.id,
          'kegiatan',
          id,
          existing,
          req,
          `Menghapus kegiatan: ${existing.namaKegiatan} (${existing.kodeKegiatan}) - ${existing.jenisKegiatan}`
        );
      }

      res.json({
        success: true,
        message: 'Kegiatan berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete kegiatan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus kegiatan',
      });
    }
  }

  // Get statistics
  async getStatistics(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      let whereClause;
      if (tahun) {
        const year = parseInt(tahun as string);
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        whereClause = and(
          gte(kegiatan.tanggalMulai, startDate),
          lte(kegiatan.tanggalMulai, endDate)
        );
      }

      // Total kegiatan
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(kegiatan)
        .where(whereClause);

      // Status breakdown
      const statusStats = await db
        .select({
          status: kegiatan.statusKegiatan,
          count: sql<number>`count(*)`,
        })
        .from(kegiatan)
        .where(whereClause)
        .groupBy(kegiatan.statusKegiatan);

      // Jenis breakdown
      const jenisStats = await db
        .select({
          jenis: kegiatan.jenisKegiatan,
          count: sql<number>`count(*)`,
        })
        .from(kegiatan)
        .where(whereClause)
        .groupBy(kegiatan.jenisKegiatan)
        .orderBy(sql`count(*) DESC`);

      // Total biaya
      const [{ totalBiaya }] = await db
        .select({
          totalBiaya: sql<number>`COALESCE(SUM(CAST(${kegiatan.biayaKegiatan} AS DECIMAL)), 0)`,
        })
        .from(kegiatan)
        .where(whereClause);

      res.json({
        success: true,
        data: {
          totalKegiatan: Number(total),
          totalBiaya: Number(totalBiaya),
          status: statusStats.reduce((acc, item) => {
            acc[item.status] = Number(item.count);
            return acc;
          }, {} as Record<string, number>),
          jenis: jenisStats.map(item => ({
            jenis: item.jenis,
            jumlah: Number(item.count),
          })),
        },
      });
    } catch (error) {
      console.error('Get kegiatan statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik kegiatan',
      });
    }
  }

  // Get calendar data (kegiatan by month)
  async getCalendar(req: Request, res: Response) {
    try {
      const { tahun, bulan } = req.query;

      if (!tahun || !bulan) {
        return res.status(400).json({
          success: false,
          message: 'Tahun dan bulan wajib diisi',
        });
      }

      const year = parseInt(tahun as string);
      const month = parseInt(bulan as string) - 1;
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const results = await db
        .select({
          id: kegiatan.id,
          kodeKegiatan: kegiatan.kodeKegiatan,
          namaKegiatan: kegiatan.namaKegiatan,
          jenisKegiatan: kegiatan.jenisKegiatan,
          tanggalMulai: kegiatan.tanggalMulai,
          tanggalSelesai: kegiatan.tanggalSelesai,
          statusKegiatan: kegiatan.statusKegiatan,
        })
        .from(kegiatan)
        .where(
          and(
            gte(kegiatan.tanggalMulai, startDate),
            lte(kegiatan.tanggalMulai, endDate)
          )
        )
        .orderBy(kegiatan.tanggalMulai);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Get calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kalender',
      });
    }
  }
}

export default new KegiatanController();
