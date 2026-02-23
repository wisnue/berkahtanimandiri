import { Request, Response } from 'express';
import { db } from '../config/db';
import { dokumen, users } from '../db/schema';
import { eq, ilike, or, and, sql, isNull } from 'drizzle-orm';
import { auditTrailService } from '../services/auditTrail.service';

export const dokumenController = {
  // Get all dokumen with filters and pagination
  async getAll(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        jenis,
        kategori,
        status,
        tahun,
        search,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      let whereConditions: any[] = [isNull(dokumen.deletedAt)];

      if (jenis) {
        whereConditions.push(eq(dokumen.jenisDokumen, jenis as string));
      }

      if (kategori) {
        whereConditions.push(eq(dokumen.kategoriDokumen, kategori as string));
      }

      if (status) {
        whereConditions.push(eq(dokumen.statusDokumen, status as string));
      }

      if (tahun) {
        const tahunNum = parseInt(tahun as string);
        whereConditions.push(
          sql`EXTRACT(YEAR FROM ${dokumen.tanggalDokumen}) = ${tahunNum}`
        );
      }

      if (search) {
        whereConditions.push(
          or(
            ilike(dokumen.judulDokumen, `%${search}%`),
            ilike(dokumen.kodeDokumen, `%${search}%`),
            ilike(dokumen.nomorDokumen, `%${search}%`)
          )
        );
      }

      const whereClause = and(...whereConditions);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumen)
        .where(whereClause);

      // Get dokumen with uploader info
      const dokumenList = await db
        .select({
          id: dokumen.id,
          kodeDokumen: dokumen.kodeDokumen,
          judulDokumen: dokumen.judulDokumen,
          jenisDokumen: dokumen.jenisDokumen,
          kategoriDokumen: dokumen.kategoriDokumen,
          nomorDokumen: dokumen.nomorDokumen,
          tanggalDokumen: dokumen.tanggalDokumen,
          tanggalBerlaku: dokumen.tanggalBerlaku,
          tanggalKadaluarsa: dokumen.tanggalKadaluarsa,
          penerbitDokumen: dokumen.penerbitDokumen,
          deskripsi: dokumen.deskripsi,
          filePath: dokumen.filePath,
          fileName: dokumen.fileName,
          fileSize: dokumen.fileSize,
          fileType: dokumen.fileType,
          versi: dokumen.versi,
          statusDokumen: dokumen.statusDokumen,
          uploadedBy: dokumen.uploadedBy,
          uploaderNama: users.fullName,
          keterangan: dokumen.keterangan,
          createdAt: dokumen.createdAt,
          updatedAt: dokumen.updatedAt,
        })
        .from(dokumen)
        .leftJoin(users, eq(dokumen.uploadedBy, users.id))
        .where(whereClause)
        .orderBy(sql`${dokumen.createdAt} DESC`)
        .limit(limitNum)
        .offset(offset);

      res.json({
        success: true,
        data: dokumenList,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages: Math.ceil(count / limitNum),
        },
      });
    } catch (error) {
      console.error('Get dokumen error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data dokumen',
      });
    }
  },

  // Get single dokumen by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [dokumenData] = await db
        .select({
          id: dokumen.id,
          kodeDokumen: dokumen.kodeDokumen,
          judulDokumen: dokumen.judulDokumen,
          jenisDokumen: dokumen.jenisDokumen,
          kategoriDokumen: dokumen.kategoriDokumen,
          nomorDokumen: dokumen.nomorDokumen,
          tanggalDokumen: dokumen.tanggalDokumen,
          tanggalBerlaku: dokumen.tanggalBerlaku,
          tanggalKadaluarsa: dokumen.tanggalKadaluarsa,
          penerbitDokumen: dokumen.penerbitDokumen,
          deskripsi: dokumen.deskripsi,
          filePath: dokumen.filePath,
          fileName: dokumen.fileName,
          fileSize: dokumen.fileSize,
          fileType: dokumen.fileType,
          versi: dokumen.versi,
          statusDokumen: dokumen.statusDokumen,
          uploadedBy: dokumen.uploadedBy,
          uploaderNama: users.fullName,
          keterangan: dokumen.keterangan,
          createdAt: dokumen.createdAt,
          updatedAt: dokumen.updatedAt,
        })
        .from(dokumen)
        .leftJoin(users, eq(dokumen.uploadedBy, users.id))
        .where(and(eq(dokumen.id, id), isNull(dokumen.deletedAt)));

      if (!dokumenData) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: dokumenData,
      });
    } catch (error) {
      console.error('Get dokumen by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data dokumen',
      });
    }
  },

  // Create new dokumen (metadata only, file upload handled separately)
  async create(req: Request, res: Response) {
    try {
      const {
        judulDokumen,
        jenisDokumen,
        kategoriDokumen,
        nomorDokumen,
        tanggalDokumen,
        tanggalBerlaku,
        tanggalKadaluarsa,
        penerbitDokumen,
        deskripsi,
        statusDokumen,
        keterangan,
      } = req.body;

      // Get file from multer
      const file = req.file;

      // Validate required fields
      if (!judulDokumen || !jenisDokumen) {
        return res.status(400).json({
          success: false,
          message: 'Judul dokumen dan jenis dokumen wajib diisi',
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'File dokumen wajib diupload',
        });
      }

      // Generate kode dokumen: DOC/JENIS/YYYYMMDD/XXX
      const jenisCode = jenisDokumen.substring(0, 3).toUpperCase();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get count of documents created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [dayCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumen)
        .where(
          and(
            sql`${dokumen.createdAt} >= ${today.toISOString()}`,
            sql`${dokumen.createdAt} < ${tomorrow.toISOString()}`
          )
        );

      const sequence = (Number(dayCount.count) + 1).toString().padStart(3, '0');
      const kodeDokumen = `DOC/${jenisCode}/${dateStr}/${sequence}`;

      const uploadedBy = req.session.userId;
      if (!uploadedBy) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const [newDokumen] = await db
        .insert(dokumen)
        .values({
          kodeDokumen,
          judulDokumen,
          jenisDokumen,
          kategoriDokumen,
          nomorDokumen,
          tanggalDokumen: tanggalDokumen ? new Date(tanggalDokumen) : null,
          tanggalBerlaku: tanggalBerlaku ? new Date(tanggalBerlaku) : null,
          tanggalKadaluarsa: tanggalKadaluarsa ? new Date(tanggalKadaluarsa) : null,
          penerbitDokumen,
          deskripsi,
          fileName: file.filename,
          filePath: file.path,
          fileSize: file.size.toString(),
          fileType: file.mimetype,
          statusDokumen: statusDokumen || 'aktif',
          uploadedBy,
          keterangan,
        })
        .returning();

      // Audit trail: Log CREATE action
      if (uploadedBy) {
        await auditTrailService.logCreate(
          uploadedBy,
          'dokumen',
          newDokumen.id,
          newDokumen,
          req,
          `Menambahkan dokumen: ${newDokumen.judulDokumen} (${newDokumen.kodeDokumen})`
        );
      }

      res.status(201).json({
        success: true,
        message: 'Dokumen berhasil ditambahkan',
        data: newDokumen,
      });
    } catch (error) {
      console.error('Create dokumen error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan dokumen',
      });
    }
  },

  // Update dokumen
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        judulDokumen,
        jenisDokumen,
        kategoriDokumen,
        nomorDokumen,
        tanggalDokumen,
        tanggalBerlaku,
        tanggalKadaluarsa,
        penerbitDokumen,
        deskripsi,
        statusDokumen,
        keterangan,
      } = req.body;

      // Check if dokumen exists
      const [existingDokumen] = await db
        .select()
        .from(dokumen)
        .where(and(eq(dokumen.id, id), isNull(dokumen.deletedAt)));

      if (!existingDokumen) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen tidak ditemukan',
        });
      }

      const [updatedDokumen] = await db
        .update(dokumen)
        .set({
          judulDokumen,
          jenisDokumen,
          kategoriDokumen,
          nomorDokumen,
          tanggalDokumen: tanggalDokumen ? new Date(tanggalDokumen) : null,
          tanggalBerlaku: tanggalBerlaku ? new Date(tanggalBerlaku) : null,
          tanggalKadaluarsa: tanggalKadaluarsa ? new Date(tanggalKadaluarsa) : null,
          penerbitDokumen,
          deskripsi,
          statusDokumen,
          keterangan,
          updatedAt: new Date(),
        })
        .where(eq(dokumen.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      const userId = req.session.userId || req.user?.id;
      if (userId) {
        await auditTrailService.logUpdate(
          userId,
          'dokumen',
          id,
          existingDokumen,
          updatedDokumen,
          req,
          `Memperbarui dokumen: ${updatedDokumen.judulDokumen} (${updatedDokumen.kodeDokumen})`
        );
      }

      res.json({
        success: true,
        message: 'Dokumen berhasil diupdate',
        data: updatedDokumen,
      });
    } catch (error) {
      console.error('Update dokumen error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate dokumen',
      });
    }
  },

  // Delete dokumen (soft delete)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if dokumen exists
      const [existingDokumen] = await db
        .select()
        .from(dokumen)
        .where(and(eq(dokumen.id, id), isNull(dokumen.deletedAt)));

      if (!existingDokumen) {
        return res.status(404).json({
          success: false,
          message: 'Dokumen tidak ditemukan',
        });
      }

      await db
        .update(dokumen)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(dokumen.id, id));

      // Audit trail: Log DELETE action
      const userId = req.session.userId || req.user?.id;
      if (userId) {
        await auditTrailService.logDelete(
          userId,
          'dokumen',
          id,
          existingDokumen,
          req,
          `Menghapus dokumen: ${existingDokumen.judulDokumen} (${existingDokumen.kodeDokumen})`
        );
      }

      res.json({
        success: true,
        message: 'Dokumen berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete dokumen error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus dokumen',
      });
    }
  },

  // Get statistics
  async getStatistics(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      let whereConditions: any[] = [isNull(dokumen.deletedAt)];

      if (tahun) {
        const tahunNum = parseInt(tahun as string);
        whereConditions.push(
          sql`EXTRACT(YEAR FROM ${dokumen.createdAt}) = ${tahunNum}`
        );
      }

      const whereClause = and(...whereConditions);

      // Total dokumen
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumen)
        .where(whereClause);

      // By jenis
      const byJenis = await db
        .select({
          jenis: dokumen.jenisDokumen,
          jumlah: sql<number>`count(*)::int`,
        })
        .from(dokumen)
        .where(whereClause)
        .groupBy(dokumen.jenisDokumen);

      // By status
      const byStatus = await db
        .select({
          status: dokumen.statusDokumen,
          jumlah: sql<number>`count(*)::int`,
        })
        .from(dokumen)
        .where(whereClause)
        .groupBy(dokumen.statusDokumen);

      // Dokumen kadaluarsa atau akan kadaluarsa (dalam 30 hari)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const [expiringSoon] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dokumen)
        .where(
          and(
            isNull(dokumen.deletedAt),
            sql`${dokumen.tanggalKadaluarsa} IS NOT NULL`,
            sql`${dokumen.tanggalKadaluarsa} <= ${thirtyDaysFromNow.toISOString()}`,
            sql`${dokumen.tanggalKadaluarsa} >= ${new Date().toISOString()}`
          )
        );

      const statusObj: any = {};
      byStatus.forEach((item) => {
        statusObj[item.status || 'unknown'] = item.jumlah;
      });

      res.json({
        success: true,
        data: {
          totalDokumen: totalResult.count,
          expiringSoon: expiringSoon.count,
          jenis: byJenis,
          status: statusObj,
        },
      });
    } catch (error) {
      console.error('Get dokumen statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik dokumen',
      });
    }
  },

  // Get dokumen by kategori
  async getByKategori(req: Request, res: Response) {
    try {
      const { kategori } = req.params;

      const dokumenList = await db
        .select({
          id: dokumen.id,
          kodeDokumen: dokumen.kodeDokumen,
          judulDokumen: dokumen.judulDokumen,
          jenisDokumen: dokumen.jenisDokumen,
          nomorDokumen: dokumen.nomorDokumen,
          tanggalDokumen: dokumen.tanggalDokumen,
          fileName: dokumen.fileName,
          fileSize: dokumen.fileSize,
          statusDokumen: dokumen.statusDokumen,
          createdAt: dokumen.createdAt,
        })
        .from(dokumen)
        .where(
          and(
            eq(dokumen.kategoriDokumen, kategori),
            isNull(dokumen.deletedAt)
          )
        )
        .orderBy(sql`${dokumen.createdAt} DESC`);

      res.json({
        success: true,
        data: dokumenList,
      });
    } catch (error) {
      console.error('Get dokumen by kategori error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil dokumen',
      });
    }
  },
};
