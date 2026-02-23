import { Router } from 'express';
import { KeuanganController } from '../controllers/keuangan.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All keuangan routes require authentication
router.use(requireAuth);

// Get all transactions with filters
router.get('/', KeuanganController.getAll);

// Get statistics
router.get('/statistics', KeuanganController.getStatistics);

// Get monthly report
router.get('/monthly-report', KeuanganController.getMonthlyReport);

// Get categories
router.get('/categories', KeuanganController.getCategories);

// Get transaction by ID
router.get('/:id', KeuanganController.getById);

// Create new transaction (Ketua, Bendahara, Sekretaris)
router.post('/', requireRole(['ketua', 'bendahara', 'sekretaris']), KeuanganController.create);

// Update transaction (Ketua, Bendahara)
router.put('/:id', requireRole(['ketua', 'bendahara']), KeuanganController.update);

// Verify transaction (Ketua, Bendahara)
router.patch('/:id/verify', requireRole(['ketua', 'bendahara']), KeuanganController.verify);

// Delete transaction (Ketua only)
router.delete('/:id', requireRole(['ketua']), KeuanganController.delete);

export default router;
