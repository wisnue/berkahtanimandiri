import { Router } from 'express';
import { DokumenOrganisasiController } from '../controllers/dokumenOrganisasi.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @route   GET /api/dokumen-organisasi
 * @desc    Get all dokumen organisasi with filter, search, pagination
 * @access  Private (All authenticated users)
 */
router.get('/', DokumenOrganisasiController.getAll);

/**
 * @route   GET /api/dokumen-organisasi/statistics
 * @desc    Get dokumen organisasi statistics
 * @access  Private (All authenticated users)
 */
router.get('/statistics', DokumenOrganisasiController.getStatistics);

/**
 * @route   GET /api/dokumen-organisasi/expiring
 * @desc    Get documents expiring soon (within specified days)
 * @access  Private (Ketua, Sekretaris, Admin)
 */
router.get(
  '/expiring',
  requireRole('admin', 'ketua', 'sekretaris'),
  DokumenOrganisasiController.getExpiring
);

/**
 * @route   GET /api/dokumen-organisasi/jenis/:jenis
 * @desc    Get dokumen by jenis (sk_pembentukan, ad_art, etc)
 * @access  Private (All authenticated users)
 */
router.get('/jenis/:jenis', DokumenOrganisasiController.getByJenis);

/**
 * @route   GET /api/dokumen-organisasi/:id
 * @desc    Get dokumen organisasi by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', DokumenOrganisasiController.getById);

/**
 * @route   POST /api/dokumen-organisasi
 * @desc    Create new dokumen organisasi
 * @access  Private (Ketua, Sekretaris, Admin only)
 */
router.post(
  '/',
  requireRole('admin', 'ketua', 'sekretaris'),
  uploadSingle,
  DokumenOrganisasiController.create
);

/**
 * @route   PUT /api/dokumen-organisasi/:id
 * @desc    Update dokumen organisasi metadata
 * @access  Private (Ketua, Sekretaris, Admin only)
 */
router.put(
  '/:id',
  requireRole('admin', 'ketua', 'sekretaris'),
  DokumenOrganisasiController.update
);

/**
 * @route   PUT /api/dokumen-organisasi/:id/verify
 * @desc    Verify dokumen organisasi
 * @access  Private (Ketua, Admin only)
 */
router.put(
  '/:id/verify',
  requireRole('admin', 'ketua'),
  DokumenOrganisasiController.verify
);

/**
 * @route   PUT /api/dokumen-organisasi/:id/reject
 * @desc    Reject dokumen organisasi
 * @access  Private (Ketua, Admin only)
 */
router.put(
  '/:id/reject',
  requireRole('admin', 'ketua'),
  DokumenOrganisasiController.reject
);

/**
 * @route   DELETE /api/dokumen-organisasi/:id
 * @desc    Delete dokumen organisasi (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  requireRole('admin'),
  DokumenOrganisasiController.delete
);

export default router;
