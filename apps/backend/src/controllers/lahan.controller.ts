import { Request, Response } from 'express';
import { db } from '../db';
import { lahanKhdpk } from '../db/schema/lahan';
import { anggota } from '../db/schema/anggota';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { auditTrailService } from '../services/auditTrail.service';

export class LahanController {
  /**
   * Get all lahan with pagination, search, and filter
   */
  static async getAll(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        statusLegalitas = '',
        anggotaId = '',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(lahanKhdpk.kodeLahan, `%${search}%`),
            like(lahanKhdpk.nomorPetak, `%${search}%`),
            like(lahanKhdpk.jenisTanaman, `%${search}%`),
            like(lahanKhdpk.lokasiLahan, `%${search}%`)
          )
        );
      }

      if (statusLegalitas) {
        whereConditions.push(eq(lahanKhdpk.statusLegalitas, statusLegalitas as string));
      }

      if (anggotaId) {
        whereConditions.push(eq(lahanKhdpk.anggotaId, anggotaId as string));
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(lahanKhdpk)
        .where(whereClause);

      // Get data with pagination and join anggota
      const data = await db
        .select({
          id: lahanKhdpk.id,
          kodeLahan: lahanKhdpk.kodeLahan,
          anggotaId: lahanKhdpk.anggotaId,
          nomorPetak: lahanKhdpk.nomorPetak,
          luasLahan: lahanKhdpk.luasLahan,
          satuanLuas: lahanKhdpk.satuanLuas,
          jenisTanaman: lahanKhdpk.jenisTanaman,
          lokasiLahan: lahanKhdpk.lokasiLahan,
          koordinatLat: lahanKhdpk.koordinatLat,
          koordinatLong: lahanKhdpk.koordinatLong,
          statusLegalitas: lahanKhdpk.statusLegalitas,
          nomorSKKHDPK: lahanKhdpk.nomorSKKHDPK,
          tanggalSK: lahanKhdpk.tanggalSK,
          masaBerlakuSK: lahanKhdpk.masaBerlakuSK,
          tahunMulaiKelola: lahanKhdpk.tahunMulaiKelola,
          kondisiLahan: lahanKhdpk.kondisiLahan,
          filePetaLahan: lahanKhdpk.filePetaLahan,
          fileSKKHDPK: lahanKhdpk.fileSKKHDPK,
          keterangan: lahanKhdpk.keterangan,
          createdAt: lahanKhdpk.createdAt,
          updatedAt: lahanKhdpk.updatedAt,
          anggotaNama: anggota.namaLengkap,
          anggotaNomor: anggota.nomorAnggota,
        })
        .from(lahanKhdpk)
        .leftJoin(anggota, eq(lahanKhdpk.anggotaId, anggota.id))
        .where(whereClause)
        .orderBy(sortOrder === 'asc' ? asc(lahanKhdpk.createdAt) : desc(lahanKhdpk.createdAt))
        .limit(limitNum)
        .offset(offset);

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages: Math.ceil(count / limitNum),
        },
      });
    } catch (error) {
      console.error('Get all lahan error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data lahan',
      });
    }
  }

  /**
   * Get lahan by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [data] = await db
        .select({
          id: lahanKhdpk.id,
          kodeLahan: lahanKhdpk.kodeLahan,
          anggotaId: lahanKhdpk.anggotaId,
          nomorPetak: lahanKhdpk.nomorPetak,
          luasLahan: lahanKhdpk.luasLahan,
          satuanLuas: lahanKhdpk.satuanLuas,
          jenisTanaman: lahanKhdpk.jenisTanaman,
          lokasiLahan: lahanKhdpk.lokasiLahan,
          koordinatLat: lahanKhdpk.koordinatLat,
          koordinatLong: lahanKhdpk.koordinatLong,
          statusLegalitas: lahanKhdpk.statusLegalitas,
          nomorSKKHDPK: lahanKhdpk.nomorSKKHDPK,
          tanggalSK: lahanKhdpk.tanggalSK,
          masaBerlakuSK: lahanKhdpk.masaBerlakuSK,
          tahunMulaiKelola: lahanKhdpk.tahunMulaiKelola,
          kondisiLahan: lahanKhdpk.kondisiLahan,
          filePetaLahan: lahanKhdpk.filePetaLahan,
          fileSKKHDPK: lahanKhdpk.fileSKKHDPK,
          keterangan: lahanKhdpk.keterangan,
          createdAt: lahanKhdpk.createdAt,
          updatedAt: lahanKhdpk.updatedAt,
          anggotaNama: anggota.namaLengkap,
          anggotaNomor: anggota.nomorAnggota,
        })
        .from(lahanKhdpk)
        .leftJoin(anggota, eq(lahanKhdpk.anggotaId, anggota.id))
        .where(eq(lahanKhdpk.id, id))
        .limit(1);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Lahan tidak ditemukan',
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get lahan by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data lahan',
      });
    }
  }

  /**
   * Create new lahan
   */
  static async create(req: Request, res: Response) {
    try {
      const lahanData = req.body;

      // Check if kodeLahan already exists
      if (lahanData.kodeLahan) {
        const [existing] = await db
          .select()
          .from(lahanKhdpk)
          .where(eq(lahanKhdpk.kodeLahan, lahanData.kodeLahan))
          .limit(1);

        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Kode lahan sudah terdaftar',
          });
        }
      }

      // Verify anggota exists
      if (lahanData.anggotaId) {
        const [existingAnggota] = await db
          .select()
          .from(anggota)
          .where(eq(anggota.id, lahanData.anggotaId))
          .limit(1);

        if (!existingAnggota) {
          return res.status(404).json({
            success: false,
            message: 'Anggota tidak ditemukan',
          });
        }
      }

      const [newLahan] = await db.insert(lahanKhdpk).values(lahanData).returning();

      // Audit trail: Log CREATE action
      if (req.user?.id) {
        await auditTrailService.logCreate(
          req.user.id,
          'lahan_khdpk',
          newLahan.id,
          newLahan,
          req,
          `Menambahkan lahan KHDPK: ${newLahan.kodeLahan} - ${newLahan.nomorPetak}`
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Lahan berhasil ditambahkan',
        data: newLahan,
      });
    } catch (error) {
      console.error('Create lahan error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan lahan',
      });
    }
  }

  /**
   * Update lahan
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lahanData = req.body;

      // Check if lahan exists
      const [existing] = await db
        .select()
        .from(lahanKhdpk)
        .where(eq(lahanKhdpk.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Lahan tidak ditemukan',
        });
      }

      // Check if kodeLahan already exists (excluding current lahan)
      if (lahanData.kodeLahan && lahanData.kodeLahan !== existing.kodeLahan) {
        const [duplicate] = await db
          .select()
          .from(lahanKhdpk)
          .where(eq(lahanKhdpk.kodeLahan, lahanData.kodeLahan))
          .limit(1);

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: 'Kode lahan sudah terdaftar',
          });
        }
      }

      // Verify anggota exists if changed
      if (lahanData.anggotaId && lahanData.anggotaId !== existing.anggotaId) {
        const [existingAnggota] = await db
          .select()
          .from(anggota)
          .where(eq(anggota.id, lahanData.anggotaId))
          .limit(1);

        if (!existingAnggota) {
          return res.status(404).json({
            success: false,
            message: 'Anggota tidak ditemukan',
          });
        }
      }

      const [updated] = await db
        .update(lahanKhdpk)
        .set({ ...lahanData, updatedAt: new Date() })
        .where(eq(lahanKhdpk.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      if (req.user?.id) {
        await auditTrailService.logUpdate(
          req.user.id,
          'lahan_khdpk',
          updated.id,
          existing,
          updated,
          req,
          `Memperbarui lahan: ${updated.kodeLahan} - ${updated.nomorPetak}`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Lahan berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      console.error('Update lahan error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memperbarui lahan',
      });
    }
  }

  /**
   * Delete lahan
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if lahan exists
      const [existing] = await db
        .select()
        .from(lahanKhdpk)
        .where(eq(lahanKhdpk.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Lahan tidak ditemukan',
        });
      }

      await db.delete(lahanKhdpk).where(eq(lahanKhdpk.id, id));

      // Audit trail: Log DELETE action
      if (req.user?.id) {
        await auditTrailService.logDelete(
          req.user.id,
          'lahan_khdpk',
          existing.id,
          existing,
          req,
          `Menghapus lahan: ${existing.kodeLahan} - ${existing.nomorPetak} (${existing.luasLahan} ha)`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Lahan berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete lahan error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus lahan',
      });
    }
  }

  /**
   * Get lahan statistics
   */
  static async getStatistics(_req: Request, res: Response) {
    try {
      const [total] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(lahanKhdpk);

      const [totalLuas] = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(CAST(luas_lahan AS NUMERIC)), 0)::numeric` 
        })
        .from(lahanKhdpk);

      const [sah] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(lahanKhdpk)
        .where(eq(lahanKhdpk.statusLegalitas, 'sah'));

      const [proses] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(lahanKhdpk)
        .where(eq(lahanKhdpk.statusLegalitas, 'proses'));

      return res.status(200).json({
        success: true,
        data: {
          total: total.count,
          totalLuas: parseFloat(totalLuas.total as any) || 0,
          statusSah: sah.count,
          statusProses: proses.count,
        },
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik',
      });
    }
  }

  /**
   * Get lahan by anggota ID
   */
  static async getByAnggotaId(req: Request, res: Response) {
    try {
      const { anggotaId } = req.params;

      const data = await db
        .select()
        .from(lahanKhdpk)
        .where(eq(lahanKhdpk.anggotaId, anggotaId))
        .orderBy(desc(lahanKhdpk.createdAt));

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get lahan by anggota ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data lahan',
      });
    }
  }
}
