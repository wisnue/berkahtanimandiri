import { Request, Response } from 'express';
import { db } from '../config/db';
import { dokumenOrganisasi } from '../db/schema/dokumen-organisasi';
import { eq, and, or, like, desc, asc, sql, isNull, lte } from 'drizzle-orm';
import { auditTrailService } from '../services/auditTrail.service';

export class DokumenOrganisasiController {
  /**
   * Get all dokumen organisasi with pagination, search, and filter
   */
  static async getAll(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        jenisDokumen = '',
        statusDokumen = '',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const whereConditions = [];

      // Exclude soft-deleted documents
      whereConditions.push(isNull(dokumenOrganisasi.deletedAt));

      if (search) {
        whereConditions.push(
          or(
            like(dokumenOrganisasi.judulDokumen, `%${search}%`),
            like(dokumenOrganisasi.nomorDokumen, `%${search}%`)
          )
        );
      }

      if (jenisDokumen) {
        whereConditions.push(eq(dokumenOrganisasi.jenisDokumen, jenisDokumen as string));
      }

      if (statusDokumen) {
        whereConditions.push(eq(dokumenOrganisasi.statusDokumen, statusDokumen as string));
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumenOrganisasi)
        .where(whereClause);

      // Get data with pagination
      const data = await db
        .select()
        .from(dokumenOrganisasi)
        .where(whereClause)
        .orderBy(sortOrder === 'asc' ? asc(dokumenOrganisasi.createdAt) : desc(dokumenOrganisasi.createdAt))
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
      console.error('Get all dokumen organisasi error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data dokumen organisasi',
      });
    }
  }

  /**
   * Get dokumen organisasi by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [data] = await db
        .select()
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.id, id),
          isNull(dokumenOrganisasi.deletedAt)
        ))
        .limit(1);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen organisasi tidak ditemukan',
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get dokumen organisasi by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data dokumen organisasi',
      });
    }
  }

  /**
   * Get dokumen by jenis (SK Pembentukan, AD/ART, etc)
   */
  static async getByJenis(req: Request, res: Response) {
    try {
      const { jenis } = req.params;

      const data = await db
        .select()
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.jenisDokumen, jenis),
          isNull(dokumenOrganisasi.deletedAt)
        ))
        .orderBy(desc(dokumenOrganisasi.createdAt));

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get dokumen by jenis error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data dokumen',
      });
    }
  }

  /**
   * Get expired or expiring soon documents
   */
  static async getExpiring(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const daysNum = parseInt(days as string);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysNum);
      const expiryDateStr = expiryDate.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'

      const data = await db
        .select()
        .from(dokumenOrganisasi)
        .where(and(
          lte(dokumenOrganisasi.tanggalKadaluarsa, expiryDateStr),
          eq(dokumenOrganisasi.statusDokumen, 'aktif'),
          isNull(dokumenOrganisasi.deletedAt)
        ))
        .orderBy(asc(dokumenOrganisasi.tanggalKadaluarsa));

      return res.status(200).json({
        success: true,
        data,
        message: `Ditemukan ${data.length} dokumen yang akan kadaluarsa dalam ${daysNum} hari`,
      });
    } catch (error) {
      console.error('Get expiring documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data dokumen',
      });
    }
  }

  /**
   * Create new dokumen organisasi
   */
  static async create(req: Request, res: Response) {
    try {
      const dokumenData = req.body;

      // If uploaded file exists, attach file info
      if (req.file) {
        dokumenData.filePath = req.file.path;
        dokumenData.fileName = req.file.originalname;
        dokumenData.fileSize = req.file.size;
        dokumenData.fileType = req.file.mimetype;
      }

      // Set uploaded_by from authenticated user
      if (req.user?.id) {
        dokumenData.uploadedBy = req.user.id;
      }

      const [newDokumen] = await db.insert(dokumenOrganisasi).values(dokumenData).returning();

      // Audit trail: Log CREATE action
      if (req.user?.id) {
        await auditTrailService.logCreate(
          req.user.id,
          'dokumen_organisasi',
          newDokumen.id,
          newDokumen,
          req,
          `Menambahkan dokumen: ${newDokumen.jenisDokumen} - ${newDokumen.judulDokumen}`
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Dokumen organisasi berhasil ditambahkan',
        data: newDokumen,
      });
    } catch (error) {
      console.error('Create dokumen organisasi error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan dokumen organisasi',
      });
    }
  }

  /**
   * Update dokumen organisasi metadata
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dokumenData = req.body;

      // Check if dokumen exists
      const [existing] = await db
        .select()
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.id, id),
          isNull(dokumenOrganisasi.deletedAt)
        ))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen organisasi tidak ditemukan',
        });
      }

      const [updated] = await db
        .update(dokumenOrganisasi)
        .set({ ...dokumenData, updatedAt: new Date() })
        .where(eq(dokumenOrganisasi.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      if (req.user?.id) {
        await auditTrailService.logUpdate(
          req.user.id,
          'dokumen_organisasi',
          updated.id,
          existing,
          updated,
          req,
          `Memperbarui dokumen: ${updated.jenisDokumen} - ${updated.judulDokumen}`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Dokumen organisasi berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      console.error('Update dokumen organisasi error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memperbarui dokumen organisasi',
      });
    }
  }

  /**
   * Verify dokumen organisasi (Admin only)
   */
  static async verify(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if dokumen exists
      const [existing] = await db
        .select()
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.id, id),
          isNull(dokumenOrganisasi.deletedAt)
        ))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen organisasi tidak ditemukan',
        });
      }

      const [verified] = await db
        .update(dokumenOrganisasi)
        .set({
          statusDokumen: 'aktif',
          verifiedBy: req.user?.id,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(dokumenOrganisasi.id, id))
        .returning();

      // Audit trail: Log VERIFY action
      if (req.user?.id) {
        await auditTrailService.logVerify(
          req.user.id,
          'dokumen_organisasi',
          verified.id,
          existing,
          verified,
          req,
          `Memverifikasi dokumen: ${verified.jenisDokumen} - ${verified.judulDokumen}`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Dokumen organisasi berhasil diverifikasi',
        data: verified,
      });
    } catch (error) {
      console.error('Verify dokumen organisasi error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memverifikasi dokumen organisasi',
      });
    }
  }

  /**
   * Reject dokumen organisasi (Admin only)
   */
  static async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { alasan } = req.body;

      // Check if dokumen exists
      const [existing] = await db
        .select()
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.id, id),
          isNull(dokumenOrganisasi.deletedAt)
        ))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen organisasi tidak ditemukan',
        });
      }

      const [rejected] = await db
        .update(dokumenOrganisasi)
        .set({
          statusDokumen: 'ditolak',
          keterangan: alasan,
          verifiedBy: req.user?.id,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(dokumenOrganisasi.id, id))
        .returning();

      // Audit trail: Log REJECT action
      if (req.user?.id) {
        await auditTrailService.logReject(
          req.user.id,
          'dokumen_organisasi',
          rejected.id,
          { alasan },
          req,
          `Menolak dokumen: ${rejected.jenisDokumen} - ${rejected.judulDokumen}. Alasan: ${alasan || 'N/A'}`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Dokumen organisasi berhasil ditolak',
        data: rejected,
      });
    } catch (error) {
      console.error('Reject dokumen organisasi error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menolak dokumen organisasi',
      });
    }
  }

  /**
   * Soft delete dokumen organisasi
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if dokumen exists
      const [existing] = await db
        .select()
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.id, id),
          isNull(dokumenOrganisasi.deletedAt)
        ))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen organisasi tidak ditemukan',
        });
      }

      // Soft delete
      await db
        .update(dokumenOrganisasi)
        .set({ deletedAt: new Date() })
        .where(eq(dokumenOrganisasi.id, id));

      // Audit trail: Log DELETE action
      if (req.user?.id) {
        await auditTrailService.logDelete(
          req.user.id,
          'dokumen_organisasi',
          existing.id,
          existing,
          req,
          `Menghapus dokumen: ${existing.jenisDokumen} - ${existing.judulDokumen}`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Dokumen organisasi berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete dokumen organisasi error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus dokumen organisasi',
      });
    }
  }

  /**
   * Get dokumen organisasi statistics
   */
  static async getStatistics(_req: Request, res: Response) {
    try {
      const [total] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumenOrganisasi)
        .where(isNull(dokumenOrganisasi.deletedAt));

      const [aktif] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.statusDokumen, 'aktif'),
          isNull(dokumenOrganisasi.deletedAt)
        ));

      const [pendingVerifikasi] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumenOrganisasi)
        .where(and(
          eq(dokumenOrganisasi.statusDokumen, 'pending_verifikasi'),
          isNull(dokumenOrganisasi.deletedAt)
        ));

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const expiryDateStr = expiryDate.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'

      const [expiringSoon] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumenOrganisasi)
        .where(and(
          lte(dokumenOrganisasi.tanggalKadaluarsa, expiryDateStr),
          eq(dokumenOrganisasi.statusDokumen, 'aktif'),
          isNull(dokumenOrganisasi.deletedAt)
        ));

      return res.status(200).json({
        success: true,
        data: {
          total: total.count,
          aktif: aktif.count,
          pendingVerifikasi: pendingVerifikasi.count,
          expiringSoon: expiringSoon.count,
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
}
