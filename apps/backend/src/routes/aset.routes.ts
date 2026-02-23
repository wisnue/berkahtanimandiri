import { Router } from 'express';
import asetController from '../controllers/aset.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET routes (accessible by all authenticated users)
router.get('/', asetController.getAll);
router.get('/statistics', asetController.getStatistics);
router.get('/kategori', asetController.getKategori);
router.get('/:id', asetController.getById);

// POST routes (Ketua, Sekretaris, Bendahara)
router.post('/', requireRole(['ketua', 'sekretaris', 'bendahara']), asetController.create);

// PUT routes (Ketua, Sekretaris, Bendahara)
router.put('/:id', requireRole(['ketua', 'sekretaris', 'bendahara']), asetController.update);

// DELETE routes (Ketua only)
router.delete('/:id', requireRole(['ketua']), asetController.delete);

export default router;
