import { Router } from 'express';
import { PnbpController } from '../controllers/pnbp.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All PNBP routes require authentication
router.use(requireAuth);

// Get all PNBP with filters
router.get('/', PnbpController.getAll);

// Get statistics
router.get('/statistics', PnbpController.getStatistics);

// Get reconciliation report
router.get('/reconciliation', requireRole(['ketua', 'bendahara']), PnbpController.reconciliation);

// Get reconciliation summary for multiple years
router.get('/reconciliation-summary', requireRole(['ketua', 'bendahara']), PnbpController.reconciliationSummary);

// Print bukti pembayaran PNBP per anggota per tahun
router.get('/print/:anggotaId/:tahun', PnbpController.printBuktiPembayaran);

// Get PNBP by ID
router.get('/:id', PnbpController.getById);

// Generate PNBP for a year (Ketua or Bendahara only)
router.post('/generate', requireRole(['ketua', 'bendahara']), PnbpController.generateForYear);

// Update payment status (Bendahara only)
router.patch('/:id/payment', requireRole(['ketua', 'bendahara']), PnbpController.updatePayment);

// Delete PNBP (Ketua only)
router.delete('/:id', requireRole(['ketua']), PnbpController.delete);

export default router;
