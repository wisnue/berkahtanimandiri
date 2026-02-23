import { Router } from 'express';
import { LahanController } from '../controllers/lahan.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/roles.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/lahan
 * @desc    Get all lahan with pagination and filters
 * @access  Private
 */
router.get('/', LahanController.getAll);

/**
 * @route   GET /api/lahan/statistics
 * @desc    Get lahan statistics
 * @access  Private
 */
router.get('/statistics', LahanController.getStatistics);

/**
 * @route   GET /api/lahan/anggota/:anggotaId
 * @desc    Get lahan by anggota ID
 * @access  Private
 */
router.get('/anggota/:anggotaId', LahanController.getByAnggotaId);

/**
 * @route   GET /api/lahan/:id
 * @desc    Get lahan by ID
 * @access  Private
 */
router.get('/:id', LahanController.getById);

/**
 * @route   POST /api/lahan
 * @desc    Create new lahan
 * @access  Private (Admin/Ketua/Sekretaris)
 */
router.post('/', authorize(['ketua', 'sekretaris']), LahanController.create);

/**
 * @route   PUT /api/lahan/:id
 * @desc    Update lahan
 * @access  Private (Admin/Ketua/Sekretaris)
 */
router.put('/:id', authorize(['ketua', 'sekretaris']), LahanController.update);

/**
 * @route   DELETE /api/lahan/:id
 * @desc    Delete lahan
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize(['ketua']), LahanController.delete);

export default router;
