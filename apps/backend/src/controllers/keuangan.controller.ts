import { Request, Response } from 'express';
import { db } from '../config/db';
import { keuangan, users } from '../db/schema';
import { eq, sql, desc, and, gte, lte, or, like } from 'drizzle-orm';
import { auditTrailService } from '../services/auditTrail.service';

export const KeuanganController = {
  // Get all transactions with filters
  async getAll(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        jenis = '',
        kategori = '',
        bulan = '',
        tahun = new Date().getFullYear().toString(),
        search = '',
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let whereConditions: any[] = [];

      // Filter by year
      if (tahun) {
        const startDate = new Date(`${tahun}-01-01`);
        const endDate = new Date(`${tahun}-12-31`);
        whereConditions.push(
          and(
            gte(keuangan.tanggalTransaksi, startDate),
            lte(keuangan.tanggalTransaksi, endDate)
          )
        );
      }

      // Filter by month
      if (bulan) {
        const month = parseInt(bulan as string);
        const startDate = new Date(parseInt(tahun as string), month - 1, 1);
        const endDate = new Date(parseInt(tahun as string), month, 0);
        whereConditions.push(
          and(
            gte(keuangan.tanggalTransaksi, startDate),
            lte(keuangan.tanggalTransaksi, endDate)
          )
        );
      }

      // Filter by transaction type
      if (jenis) {
        whereConditions.push(eq(keuangan.jenisTransaksi, jenis as string));
      }

      // Filter by category
      if (kategori) {
        whereConditions.push(eq(keuangan.kategori, kategori as string));
      }

      // Search in nomor transaksi, kategori, keterangan
      if (search) {
        whereConditions.push(
          or(
            like(keuangan.nomorTransaksi, `%${search}%`),
            like(keuangan.kategori, `%${search}%`),
            like(keuangan.keterangan, `%${search}%`)
          )
        );
      }

      const whereClause = whereConditions.length > 0
        ? whereConditions.reduce((acc, cond) => and(acc, cond))
        : undefined;

      const result = await db
        .select({
          id: keuangan.id,
          nomorTransaksi: keuangan.nomorTransaksi,
          tanggalTransaksi: keuangan.tanggalTransaksi,
          jenisTransaksi: keuangan.jenisTransaksi,
          kategori: keuangan.kategori,
          subKategori: keuangan.subKategori,
          jumlah: keuangan.jumlah,
          sumberDana: keuangan.sumberDana,
          tujuanPenggunaan: keuangan.tujuanPenggunaan,
          keterangan: keuangan.keterangan,
          buktiTransaksi: keuangan.buktiTransaksi,
          statusVerifikasi: keuangan.statusVerifikasi,
          dibuatOleh: sql<string>`COALESCE(${users.fullName}, 'Unknown')`,
          createdAt: keuangan.createdAt,
        })
        .from(keuangan)
        .leftJoin(users, eq(keuangan.dibuatOleh, users.id))
        .where(whereClause)
        .orderBy(desc(keuangan.tanggalTransaksi))
        .limit(parseInt(limit as string))
        .offset(offset);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get keuangan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data keuangan',
      });
    }
  },

  // Get transaction by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await db
        .select()
        .from(keuangan)
        .leftJoin(users, eq(keuangan.dibuatOleh, users.id))
        .where(eq(keuangan.id, id))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error('Get keuangan by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data transaksi',
      });
    }
  },

  // Create new transaction
  async create(req: Request, res: Response) {
    try {
      const {
        tanggalTransaksi,
        jenisTransaksi,
        kategori,
        subKategori,
        jumlah,
        sumberDana,
        tujuanPenggunaan,
        keterangan,
      } = req.body;

      if (!tanggalTransaksi || !jenisTransaksi || !kategori || !jumlah) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal, jenis, kategori, dan jumlah wajib diisi',
        });
      }

      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Generate nomor transaksi: TRX/YYYYMMDD/XXXX
      const date = new Date(tanggalTransaksi);
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get count for today to generate sequence number
      const todayStart = new Date(date.setHours(0, 0, 0, 0));
      const todayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const todayCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(keuangan)
        .where(
          and(
            gte(keuangan.tanggalTransaksi, todayStart),
            lte(keuangan.tanggalTransaksi, todayEnd)
          )
        );

      const sequence = (Number(todayCount[0]?.count || 0) + 1).toString().padStart(4, '0');
      const nomorTransaksi = `TRX/${dateStr}/${sequence}`;

      const newTransaction = await db
        .insert(keuangan)
        .values({
          nomorTransaksi,
          tanggalTransaksi: new Date(tanggalTransaksi),
          jenisTransaksi,
          kategori,
          subKategori,
          jumlah: jumlah.toString(),
          sumberDana,
          tujuanPenggunaan,
          keterangan,
          dibuatOleh: userId,
          statusVerifikasi: 'pending',
        })
        .returning();

      // Audit trail: Log CREATE action
      if (req.user?.id) {
        await auditTrailService.logCreate(
          req.user.id,
          'keuangan',
          newTransaction[0].id,
          newTransaction[0],
          req,
          `Menambahkan transaksi ${jenisTransaksi}: ${nomorTransaksi} - Rp ${jumlah}`
        );
      }

      res.status(201).json({
        success: true,
        message: 'Transaksi berhasil ditambahkan',
        data: newTransaction[0],
      });
    } catch (error) {
      console.error('Create keuangan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan transaksi',
      });
    }
  },

  // Update transaction
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        tanggalTransaksi,
        jenisTransaksi,
        kategori,
        subKategori,
        jumlah,
        sumberDana,
        tujuanPenggunaan,
        keterangan,
      } = req.body;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (tanggalTransaksi) updateData.tanggalTransaksi = new Date(tanggalTransaksi);
      if (jenisTransaksi) updateData.jenisTransaksi = jenisTransaksi;
      if (kategori) updateData.kategori = kategori;
      if (subKategori !== undefined) updateData.subKategori = subKategori;
      if (jumlah) updateData.jumlah = jumlah.toString();
      if (sumberDana !== undefined) updateData.sumberDana = sumberDana;
      if (tujuanPenggunaan !== undefined) updateData.tujuanPenggunaan = tujuanPenggunaan;
      if (keterangan !== undefined) updateData.keterangan = keterangan;

      // Get old values before update
      const [existing] = await db
        .select()
        .from(keuangan)
        .where(eq(keuangan.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan',
        });
      }

      const [updated] = await db
        .update(keuangan)
        .set(updateData)
        .where(eq(keuangan.id, id))
        .returning();

      // Audit trail: Log UPDATE action
      if (req.user?.id) {
        await auditTrailService.logUpdate(
          req.user.id,
          'keuangan',
          updated.id,
          existing,
          updated,
          req,
          `Memperbarui transaksi: ${existing.nomorTransaksi}`
        );
      }

      res.json({
        success: true,
        message: 'Transaksi berhasil diupdate',
      });
    } catch (error) {
      console.error('Update keuangan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate transaksi',
      });
    }
  },

  // Verify transaction (Ketua/Bendahara only)
  async verify(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { statusVerifikasi } = req.body;

      if (!statusVerifikasi) {
        return res.status(400).json({
          success: false,
          message: 'Status verifikasi wajib diisi',
        });
      }

      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get old values before verify
      const [existing] = await db
        .select()
        .from(keuangan)
        .where(eq(keuangan.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan',
        });
      }

      const [verified] = await db
        .update(keuangan)
        .set({
          statusVerifikasi,
          diverifikasiOleh: userId,
          tanggalVerifikasi: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(keuangan.id, id))
        .returning();

      // Audit trail: Log VERIFY action
      if (req.user?.id) {
        await auditTrailService.logVerify(
          req.user.id,
          'keuangan',
          verified.id,
          existing,
          verified,
          req,
          `Verifikasi transaksi: ${existing.nomorTransaksi} - Status: ${statusVerifikasi}`
        );
      }

      res.json({
        success: true,
        message: 'Transaksi berhasil diverifikasi',
      });
    } catch (error) {
      console.error('Verify keuangan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal verifikasi transaksi',
      });
    }
  },

  // Delete transaction
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Get data before delete
      const [existing] = await db
        .select()
        .from(keuangan)
        .where(eq(keuangan.id, id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan',
        });
      }

      await db
        .delete(keuangan)
        .where(eq(keuangan.id, id));

      // Audit trail: Log DELETE action
      if (req.user?.id) {
        await auditTrailService.logDelete(
          req.user.id,
          'keuangan',
          existing.id,
          existing,
          req,
          `Menghapus transaksi: ${existing.nomorTransaksi} - ${existing.jenisTransaksi} Rp ${existing.jumlah}`
        );
      }

      res.json({
        success: true,
        message: 'Transaksi berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete keuangan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus transaksi',
      });
    }
  },

  // Get statistics (saldo, pemasukan, pengeluaran)
  async getStatistics(req: Request, res: Response) {
    try {
      const { tahun = new Date().getFullYear().toString() } = req.query;

      const startDate = new Date(`${tahun}-01-01`);
      const endDate = new Date(`${tahun}-12-31`);

      const result = await db
        .select({
          totalPemasukan: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pemasukan' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
          totalPengeluaran: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pengeluaran' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
          jumlahTransaksi: sql<number>`COUNT(*)`,
          transaksiPending: sql<number>`COUNT(CASE WHEN ${keuangan.statusVerifikasi} = 'pending' THEN 1 END)`,
        })
        .from(keuangan)
        .where(
          and(
            gte(keuangan.tanggalTransaksi, startDate),
            lte(keuangan.tanggalTransaksi, endDate)
          )
        );

      const stats = result[0] || {
        totalPemasukan: 0,
        totalPengeluaran: 0,
        jumlahTransaksi: 0,
        transaksiPending: 0,
      };

      const saldoKas = Number(stats.totalPemasukan) - Number(stats.totalPengeluaran);

      res.json({
        success: true,
        data: {
          ...stats,
          saldoKas,
        },
      });
    } catch (error) {
      console.error('Get keuangan statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik keuangan',
      });
    }
  },

  // Get monthly report
  async getMonthlyReport(req: Request, res: Response) {
    try {
      const { tahun = new Date().getFullYear().toString() } = req.query;

      const startDate = new Date(`${tahun}-01-01`);
      const endDate = new Date(`${tahun}-12-31`);

      const result = await db
        .select({
          bulan: sql<number>`EXTRACT(MONTH FROM ${keuangan.tanggalTransaksi})`,
          pemasukan: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pemasukan' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
          pengeluaran: sql<number>`COALESCE(SUM(CASE WHEN ${keuangan.jenisTransaksi} = 'pengeluaran' THEN CAST(${keuangan.jumlah} AS DECIMAL) ELSE 0 END), 0)`,
        })
        .from(keuangan)
        .where(
          and(
            gte(keuangan.tanggalTransaksi, startDate),
            lte(keuangan.tanggalTransaksi, endDate)
          )
        )
        .groupBy(sql`EXTRACT(MONTH FROM ${keuangan.tanggalTransaksi})`)
        .orderBy(sql`EXTRACT(MONTH FROM ${keuangan.tanggalTransaksi})`);

      // Fill in missing months with zeros
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthData = result.find((r) => Number(r.bulan) === i + 1);
        return {
          bulan: i + 1,
          pemasukan: monthData ? Number(monthData.pemasukan) : 0,
          pengeluaran: monthData ? Number(monthData.pengeluaran) : 0,
          saldo: monthData
            ? Number(monthData.pemasukan) - Number(monthData.pengeluaran)
            : 0,
        };
      });

      res.json({
        success: true,
        data: monthlyData,
      });
    } catch (error) {
      console.error('Get monthly report error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil laporan bulanan',
      });
    }
  },

  // Get categories with totals
  async getCategories(req: Request, res: Response) {
    try {
      const { tahun = new Date().getFullYear().toString(), jenis } = req.query;

      const startDate = new Date(`${tahun}-01-01`);
      const endDate = new Date(`${tahun}-12-31`);

      let whereConditions = [
        gte(keuangan.tanggalTransaksi, startDate),
        lte(keuangan.tanggalTransaksi, endDate),
      ];

      if (jenis) {
        whereConditions.push(eq(keuangan.jenisTransaksi, jenis as string));
      }

      const result = await db
        .select({
          kategori: keuangan.kategori,
          total: sql<number>`COALESCE(SUM(CAST(${keuangan.jumlah} AS DECIMAL)), 0)`,
          jumlah: sql<number>`COUNT(*)`,
        })
        .from(keuangan)
        .where(and(...whereConditions))
        .groupBy(keuangan.kategori)
        .orderBy(sql`SUM(CAST(${keuangan.jumlah} AS DECIMAL)) DESC`);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kategori',
      });
    }
  },
};
