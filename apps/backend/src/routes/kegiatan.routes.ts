import { Router } from 'express';
import kegiatanController from '../controllers/kegiatan.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET routes (accessible by all authenticated users)
router.get('/', kegiatanController.getAll);
router.get('/statistics', kegiatanController.getStatistics);
router.get('/calendar', kegiatanController.getCalendar);
router.get('/:id', kegiatanController.getById);

// POST routes (Ketua, Sekretaris)
router.post('/', requireRole(['ketua', 'sekretaris']), kegiatanController.create);

// PUT routes (Ketua, Sekretaris)
router.put('/:id', requireRole(['ketua', 'sekretaris']), kegiatanController.update);

// DELETE routes (Ketua only)
router.delete('/:id', requireRole(['ketua']), kegiatanController.delete);

export default router;
