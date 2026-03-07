import { Request, Response } from 'express';
import { db } from '../db';
import { anggota } from '../db/schema/anggota';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { auditTrailService } from '../services/auditTrail.service';

export class AnggotaController {
  /**
   * Get all anggota with pagination, search, and filter
   */
  static async getAll(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
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
            like(anggota.namaLengkap, `%${search}%`),
            like(anggota.nik, `%${search}%`),
            like(anggota.nomorAnggota, `%${search}%`)
          )
        );
      }

      if (status) {
        whereConditions.push(eq(anggota.statusAnggota, status as string));
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(anggota)
        .where(whereClause);

      // Get data with pagination
      const data = await db
        .select()
        .from(anggota)
        .where(whereClause)
        .orderBy(sortOrder === 'asc' ? asc(anggota.createdAt) : desc(anggota.createdAt))
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
      console.error('Get all anggota error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data anggota',
      });
    }
  }

  /**
   * Get anggota by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [data] = await db
        .select()
        .from(anggota)
        .where(eq(anggota.id, id))
        .limit(1);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Anggota tidak ditemukan',
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get anggota by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data anggota',
      });
    }
  }

  /**
   * Create new anggota
   */
  static async create(req: Request, res: Response) {
    try {
      const anggotaData = req.body;

      // Check if NIK already exists
      if (anggotaData.nik) {
        const [existing] = await db
          .select()
          .from(anggota)
          .where(eq(anggota.nik, anggotaData.nik))
          .limit(1);

        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'NIK sudah terdaftar',
          });
        }
      }

      // Check if nomorAnggota already exists
      if (anggotaData.nomorAnggota) {
        const [existing] = await db
          .select()
          .from(anggota)
          .where(eq(anggota.nomorAnggota, anggotaData.nomorAnggota))
          .limit(1);

        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Nomor anggota sudah terdaftar',
          });
        }
      }

      const [newAnggota] = await db.insert(anggota).values(anggotaData).returning();

      // Audit trail: Log CREATE action
      if (req.user?.id) {
        await auditTrailService.logCreate(
          req.user.id,
          'anggota',
          newAnggota.id,
          newAnggota,
          req,
          `Menambahkan anggota baru: ${newAnggota.namaLengkap} (${newAnggota.nomorAnggota})`
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Anggota berhasil ditambahkan',
        data: newAnggota,
      });
    } catch (error) {
      console.error('Create anggota error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan anggota',
      });
    }
  }

  /**
   * Update anggota
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const anggotaData = req.body;

      // Check if anggota exists
      const [existing] = await db
        .select()
        .from(anggota)
        .where(eq(anggota.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Anggota tidak ditemukan',
        });
      }

      // Check if NIK already exists (excluding current anggota)
      if (anggotaData.nik && anggotaData.nik !== existing.nik) {
        const [duplicate] = await db
          .select()
          .from(anggota)
          .where(eq(anggota.nik, anggotaData.nik))
          .limit(1);

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: 'NIK sudah terdaftar',
          });
        }
      }

      // Check if nomorAnggota already exists (excluding current anggota)
      if (anggotaData.nomorAnggota && anggotaData.nomorAnggota !== existing.nomorAnggota) {
        const [duplicate] = await db
          .select()
          .from(anggota)
          .where(eq(anggota.nomorAnggota, anggotaData.nomorAnggota))
          .limit(1);

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: 'Nomor anggota sudah terdaftar',
          });
        }
      }

      const [updated] = await db
        .update(anggota)
        .set({ ...anggotaData, updatedAt: new Date() })
        .where(eq(anggota.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      if (req.user?.id) {
        await auditTrailService.logUpdate(
          req.user.id,
          'anggota',
          updated.id,
          existing,
          updated,
          req,
          `Memperbarui data anggota: ${updated.namaLengkap} (${updated.nomorAnggota})`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Anggota berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      console.error('Update anggota error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memperbarui anggota',
      });
    }
  }

  /**
   * Delete anggota
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if anggota exists
      const [existing] = await db
        .select()
        .from(anggota)
        .where(eq(anggota.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Anggota tidak ditemukan',
        });
      }

      await db.delete(anggota).where(eq(anggota.id, id));

      // Audit trail: Log DELETE action
      if (req.user?.id) {
        await auditTrailService.logDelete(
          req.user.id,
          'anggota',
          existing.id,
          existing,
          req,
          `Menghapus anggota: ${existing.namaLengkap} (${existing.nomorAnggota})`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Anggota berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete anggota error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus anggota',
      });
    }
  }

  /**
   * Get anggota statistics
   */
  static async getStatistics(_req: Request, res: Response) {
    try {
      const [total] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(anggota);

      const [active] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(anggota)
        .where(eq(anggota.statusAnggota, 'aktif'));

      const [inactive] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(anggota)
        .where(eq(anggota.statusAnggota, 'tidak_aktif'));

      return res.status(200).json({
        success: true,
        data: {
          total: total.count,
          active: active.count,
          inactive: inactive.count,
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
   * Bulk import anggota from Excel
   */
  static async bulkImport(req: Request, res: Response) {
    try {
      const { data: importData } = req.body;

      if (!importData || !Array.isArray(importData) || importData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Data import tidak valid atau kosong',
        });
      }

      let imported = 0;
      let failed = 0;
      const errors: Array<{ row: number; error: string }> = [];

      // Process each row
      for (let i = 0; i < importData.length; i++) {
        try {
          const row = importData[i];
          
          // Check if NIK already exists
          const existingAnggota = await db
            .select()
            .from(anggota)
            .where(eq(anggota.nik, row.nik))
            .limit(1);

          if (existingAnggota.length > 0) {
            failed++;
            errors.push({
              row: i + 1,
              error: `NIK ${row.nik} sudah terdaftar`,
            });
            continue;
          }

          // Generate nomor anggota (format: A-XXXX)
          const lastAnggota = await db
            .select()
            .from(anggota)
            .orderBy(desc(anggota.createdAt))
            .limit(1);

          let nextNumber = 1;
          if (lastAnggota.length > 0 && lastAnggota[0].nomorAnggota) {
            const lastNumber = parseInt(lastAnggota[0].nomorAnggota.split('-')[1] || '0');
            nextNumber = lastNumber + imported + 1;
          }

          const nomorAnggota = `A-${String(nextNumber).padStart(4, '0')}`;

          // Insert anggota
          await db.insert(anggota).values({
            nomorAnggota,
            nik: row.nik,
            namaLengkap: row.namaLengkap,
            jenisKelamin: row.jenisKelamin,
            tempatLahir: row.tempatLahir,
            tanggalLahir: row.tanggalLahir,
            alamatLengkap: row.alamatLengkap,
            rt: row.rt,
            rw: row.rw,
            desa: row.desa,
            kecamatan: row.kecamatan,
            kabupaten: row.kabupaten || 'Kabupaten Gembol',
            provinsi: row.provinsi || 'Jawa Tengah',
            kodePos: row.kodePos || '',
            nomorTelepon: row.noTelepon || null,
            email: row.email || null,
            pendidikan: row.pendidikanTerakhir || null,
            pekerjaan: row.pekerjaan || null,
            statusAnggota: row.statusAnggota,
            tanggalBergabung: row.tanggalBergabung,
            keterangan: row.keterangan || null,
          });

          imported++;

          // Audit log
          if (req.session.userId) {
            await auditTrailService.createAuditLog({
              userId: req.session.userId,
              tableName: 'anggota',
              action: 'CREATE',
              recordId: nomorAnggota,
              newValues: row,
              req,
            });
          }
        } catch (rowError) {
          failed++;
          errors.push({
            row: i + 1,
            error: rowError instanceof Error ? rowError.message : 'Unknown error',
          });
          console.error(`Error importing row ${i + 1}:`, rowError);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Import selesai. ${imported} berhasil, ${failed} gagal`,
        data: {
          imported,
          failed,
          errors: failed > 0 ? errors : undefined,
        },
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengimport data',
      });
    }
  }
}
