import { Router } from 'express';
import { AuditTrailController } from '../controllers/auditTrail.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// All routes require authentication AND admin role
router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @route   GET /api/audit-trail
 * @desc    Get all audit trail with filter, search, pagination
 * @access  Private (Admin only)
 */
router.get('/', AuditTrailController.getAll);

/**
 * @route   GET /api/audit-trail/statistics
 * @desc    Get audit trail statistics
 * @access  Private (Admin only)
 */
router.get('/statistics', AuditTrailController.getStatistics);

/**
 * @route   GET /api/audit-trail/export
 * @desc    Export audit trail data (CSV/Excel format)
 * @access  Private (Admin only)
 */
router.get('/export', AuditTrailController.export);

/**
 * @route   GET /api/audit-trail/:id
 * @desc    Get single audit trail entry by ID
 * @access  Private (Admin only)
 */
router.get('/:id', AuditTrailController.getById);

/**
 * @route   GET /api/audit-trail/:tableName/:recordId
 * @desc    Get complete history for specific record
 * @access  Private (Admin only)
 */
router.get('/:tableName/:recordId', AuditTrailController.getByRecord);

export default router;
