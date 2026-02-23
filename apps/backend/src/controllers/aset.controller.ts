import { Request, Response } from 'express';
import { db } from '../config/db';
import { aset } from '../db/schema';
import { eq, desc, like, or, and, sql, gte, lte } from 'drizzle-orm';
import { auditTrailService } from '../services/auditTrail.service';

class AsetController {
  // Get all aset with filters and pagination
  async getAll(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        kategori,
        kondisi,
        tahun,
        search,
      } = req.query;

      const conditions = [];

      if (kategori) {
        conditions.push(eq(aset.kategoriAset, kategori as string));
      }

      if (kondisi) {
        conditions.push(eq(aset.kondisiAset, kondisi as string));
      }

      if (tahun) {
        conditions.push(eq(aset.tahunPerolehan, parseInt(tahun as string)));
      }

      if (search) {
        conditions.push(
          or(
            like(aset.namaAset, `%${search}%`),
            like(aset.kodeAset, `%${search}%`),
            like(aset.merkTipe, `%${search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const results = await db
        .select()
        .from(aset)
        .where(whereClause)
        .orderBy(desc(aset.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(aset)
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
      console.error('Get all aset error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data aset',
      });
    }
  }

  // Get aset by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await db
        .select()
        .from(aset)
        .where(eq(aset.id, id))
        .limit(1);

      if (!result.length) {
        return res.status(404).json({
          success: false,
          message: 'Aset tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error('Get aset by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data aset',
      });
    }
  }

  // Create new aset
  async create(req: Request, res: Response) {
    try {
      const {
        namaAset,
        kategoriAset,
        jenisAset,
        merkTipe,
        nomorSeri,
        tahunPerolehan,
        tanggalPerolehan,
        sumberPerolehan,
        nilaiPerolehan,
        nilaiSekarang,
        kondisiAset,
        lokasiAset,
        penanggungJawab,
        masaManfaat,
        keterangan,
        fotoAset,
        buktiPerolehan,
      } = req.body;

      if (!namaAset || !kategoriAset || !tahunPerolehan || !nilaiPerolehan) {
        return res.status(400).json({
          success: false,
          message: 'Nama, kategori, tahun perolehan, dan nilai perolehan wajib diisi',
        });
      }

      // Generate kode aset: AST/KATEGORI/YYYYMMDD/XXX
      const kategoriCode = kategoriAset.substring(0, 3).toUpperCase();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get count for today to generate sequence number
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(aset)
        .where(
          and(
            gte(aset.createdAt, todayStart),
            lte(aset.createdAt, todayEnd)
          )
        );

      const sequence = (Number(todayCount[0]?.count || 0) + 1).toString().padStart(3, '0');
      const kodeAset = `AST/${kategoriCode}/${dateStr}/${sequence}`;

      const newAset = await db
        .insert(aset)
        .values({
          kodeAset,
          namaAset,
          kategoriAset,
          jenisAset,
          merkTipe,
          nomorSeri,
          tahunPerolehan: parseInt(tahunPerolehan),
          tanggalPerolehan: tanggalPerolehan ? new Date(tanggalPerolehan) : null,
          sumberPerolehan,
          nilaiPerolehan: nilaiPerolehan.toString(),
          nilaiSekarang: nilaiSekarang ? nilaiSekarang.toString() : null,
          kondisiAset: kondisiAset || 'baik',
          lokasiAset,
          penanggungJawab,
          masaManfaat: masaManfaat ? parseInt(masaManfaat) : null,
          keterangan,
          fotoAset,
          buktiPerolehan,
        })
        .returning();

      // Audit trail: Log CREATE action
      if (req.user?.id) {
        await auditTrailService.logCreate(
          req.user.id,
          'aset',
          newAset[0].id,
          newAset[0],
          req,
          `Menambahkan aset: ${newAset[0].namaAset} (${newAset[0].kodeAset})`
        );
      }

      res.status(201).json({
        success: true,
        message: 'Aset berhasil ditambahkan',
        data: newAset[0],
      });
    } catch (error) {
      console.error('Create aset error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan aset',
      });
    }
  }

  // Update aset
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        namaAset,
        kategoriAset,
        jenisAset,
        merkTipe,
        nomorSeri,
        tahunPerolehan,
        tanggalPerolehan,
        sumberPerolehan,
        nilaiPerolehan,
        nilaiSekarang,
        kondisiAset,
        lokasiAset,
        penanggungJawab,
        masaManfaat,
        keterangan,
        fotoAset,
        buktiPerolehan,
      } = req.body;

      // Capture existing values for audit trail
      const [existing] = await db
        .select()
        .from(aset)
        .where(eq(aset.id, id));

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Aset tidak ditemukan',
        });
      }

      const updated = await db
        .update(aset)
        .set({
          namaAset,
          kategoriAset,
          jenisAset,
          merkTipe,
          nomorSeri,
          tahunPerolehan: tahunPerolehan ? parseInt(tahunPerolehan) : undefined,
          tanggalPerolehan: tanggalPerolehan ? new Date(tanggalPerolehan) : undefined,
          sumberPerolehan,
          nilaiPerolehan: nilaiPerolehan ? nilaiPerolehan.toString() : undefined,
          nilaiSekarang: nilaiSekarang ? nilaiSekarang.toString() : undefined,
          kondisiAset,
          lokasiAset,
          penanggungJawab,
          masaManfaat: masaManfaat ? parseInt(masaManfaat) : undefined,
          keterangan,
          fotoAset,
          buktiPerolehan,
          updatedAt: new Date(),
        })
        .where(eq(aset.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      if (req.user?.id && updated.length) {
        await auditTrailService.logUpdate(
          req.user.id,
          'aset',
          id,
          existing,
          updated[0],
          req,
          `Memperbarui aset: ${updated[0].namaAset} (${updated[0].kodeAset})`
        );
      }

      res.json({
        success: true,
        message: 'Aset berhasil diupdate',
        data: updated[0],
      });
    } catch (error) {
      console.error('Update aset error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate aset',
      });
    }
  }

  // Delete aset (soft delete)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Capture existing values for audit trail
      const [existing] = await db
        .select()
        .from(aset)
        .where(eq(aset.id, id));

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Aset tidak ditemukan',
        });
      }

      const deleted = await db
        .update(aset)
        .set({ deletedAt: new Date() })
        .where(eq(aset.id, id))
        .returning();

      // Audit trail: Log DELETE action
      if (req.user?.id && deleted.length) {
        await auditTrailService.logDelete(
          req.user.id,
          'aset',
          id,
          existing,
          req,
          `Menghapus aset: ${existing.namaAset} (${existing.kodeAset}) - Nilai: Rp ${existing.nilaiPerolehan}`
        );
      }

      res.json({
        success: true,
        message: 'Aset berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete aset error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus aset',
      });
    }
  }

  // Get aset statistics
  async getStatistics(req: Request, res: Response) {
    try {
      const { tahun } = req.query;

      let whereClause;
      if (tahun) {
        whereClause = eq(aset.tahunPerolehan, parseInt(tahun as string));
      }

      // Total aset
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(aset)
        .where(whereClause);

      // Total nilai perolehan
      const [{ totalNilai }] = await db
        .select({ 
          totalNilai: sql<number>`COALESCE(SUM(CAST(${aset.nilaiPerolehan} AS DECIMAL)), 0)` 
        })
        .from(aset)
        .where(whereClause);

      // Total nilai sekarang
      const [{ totalNilaiSekarang }] = await db
        .select({ 
          totalNilaiSekarang: sql<number>`COALESCE(SUM(CAST(${aset.nilaiSekarang} AS DECIMAL)), 0)` 
        })
        .from(aset)
        .where(whereClause);

      // Kondisi breakdown
      const kondisiStats = await db
        .select({
          kondisi: aset.kondisiAset,
          count: sql<number>`count(*)`,
        })
        .from(aset)
        .where(whereClause)
        .groupBy(aset.kondisiAset);

      // Kategori breakdown
      const kategoriStats = await db
        .select({
          kategori: aset.kategoriAset,
          count: sql<number>`count(*)`,
          totalNilai: sql<number>`COALESCE(SUM(CAST(${aset.nilaiPerolehan} AS DECIMAL)), 0)`,
        })
        .from(aset)
        .where(whereClause)
        .groupBy(aset.kategoriAset)
        .orderBy(sql`count(*) DESC`);

      res.json({
        success: true,
        data: {
          totalAset: Number(total),
          totalNilaiPerolehan: Number(totalNilai),
          totalNilaiSekarang: Number(totalNilaiSekarang),
          penyusutan: Number(totalNilai) - Number(totalNilaiSekarang),
          kondisi: kondisiStats.reduce((acc, item) => {
            acc[item.kondisi] = Number(item.count);
            return acc;
          }, {} as Record<string, number>),
          kategori: kategoriStats.map(item => ({
            kategori: item.kategori,
            jumlah: Number(item.count),
            totalNilai: Number(item.totalNilai),
          })),
        },
      });
    } catch (error) {
      console.error('Get aset statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik aset',
      });
    }
  }

  // Get kategori list
  async getKategori(_req: Request, res: Response) {
    try {
      const results = await db
        .selectDistinct({ kategori: aset.kategoriAset })
        .from(aset)
        .orderBy(aset.kategoriAset);

      res.json({
        success: true,
        data: results.map(r => r.kategori),
      });
    } catch (error) {
      console.error('Get kategori error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil daftar kategori',
      });
    }
  }
}

export default new AsetController();
