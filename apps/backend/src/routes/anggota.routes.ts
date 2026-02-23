import { Router } from 'express';
import { AnggotaController } from '../controllers/anggota.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/roles.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/anggota
 * @desc    Get all anggota with pagination and filters
 * @access  Private
 */
router.get('/', AnggotaController.getAll);

/**
 * @route   GET /api/anggota/statistics
 * @desc    Get anggota statistics
 * @access  Private
 */
router.get('/statistics', AnggotaController.getStatistics);

/**
 * @route   GET /api/anggota/:id
 * @desc    Get anggota by ID
 * @access  Private
 */
router.get('/:id', AnggotaController.getById);

/**
 * @route   POST /api/anggota
 * @desc    Create new anggota
 * @access  Private (Admin only)
 */
router.post('/', authorize(['admin', 'ketua']), AnggotaController.create);

/**
 * @route   POST /api/anggota/bulk-import
 * @desc    Bulk import anggota from Excel
 * @access  Private (Admin only)
 */
router.post('/bulk-import', authorize(['admin', 'ketua']), AnggotaController.bulkImport);

/**
 * @route   PUT /api/anggota/:id
 * @desc    Update anggota
 * @access  Private (Admin only)
 */
router.put('/:id', authorize(['admin', 'ketua']), AnggotaController.update);

/**
 * @route   DELETE /api/anggota/:id
 * @desc    Delete anggota
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize(['admin']), AnggotaController.delete);

export default router;
