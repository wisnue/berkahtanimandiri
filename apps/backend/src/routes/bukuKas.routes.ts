import { Router } from 'express';
import { BukuKasController } from '../controllers/bukuKas.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/buku-kas
 * @desc    Get Buku Kas report for specific month
 * @access  Private (Ketua, Bendahara)
 * @query   tahun, bulan
 */
router.get(
  '/',
  requireRole(['ketua', 'bendahara']),
  BukuKasController.getBukuKas
);

/**
 * @route   GET /api/buku-kas/current-balance
 * @desc    Get current cash balance
 * @access  Private (Ketua, Bendahara)
 */
router.get(
  '/current-balance',
  requireRole(['ketua', 'bendahara']),
  BukuKasController.getCurrentBalance
);

/**
 * @route   GET /api/buku-kas/validate
 * @desc    Validate cash flow for a year (detect negative balance)
 * @access  Private (Ketua, Bendahara)
 * @query   tahun
 */
router.get(
  '/validate',
  requireRole(['ketua', 'bendahara']),
  BukuKasController.validateCashFlow
);

export default router;
