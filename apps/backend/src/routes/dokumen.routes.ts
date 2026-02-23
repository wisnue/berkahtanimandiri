import { Router } from 'express';
import { dokumenController } from '../controllers/dokumen.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Public routes (all authenticated users can view)
router.get('/', dokumenController.getAll);
router.get('/statistics', dokumenController.getStatistics);
router.get('/kategori/:kategori', dokumenController.getByKategori);
router.get('/:id', dokumenController.getById);

// Protected routes (only Ketua and Sekretaris can manage)
router.post('/', requireRole(['ketua', 'sekretaris']), uploadSingle, dokumenController.create);
router.put('/:id', requireRole(['ketua', 'sekretaris']), dokumenController.update);

// Only Ketua can delete
router.delete('/:id', requireRole(['ketua']), dokumenController.delete);

export default router;
