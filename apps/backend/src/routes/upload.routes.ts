import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { uploadSingle, uploadMultiple, uploadFields } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// All upload routes require authentication
router.use(requireAuth);

// Apply upload rate limiter to all upload endpoints
router.use(uploadRateLimiter);

// Single file upload
router.post('/single', uploadSingle, uploadController.uploadSingle);

// Multiple files upload
router.post('/multiple', uploadMultiple, uploadController.uploadMultiple);

// Fields upload (multiple different fields)
router.post('/fields', uploadFields, uploadController.uploadFields);

export default router;
