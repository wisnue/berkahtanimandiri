import { Router } from 'express';
import {
  backupDatabase,
  getBackupHistory,
  downloadBackup,
  restoreDatabase,
  getSystemSettings,
  updateSystemSettings,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  testEmail,
  triggerExpiryNotifications,
  getOrganizationSettings,
  updateOrganizationSettings,
  getBackupStatistics,
  deleteBackup,
  runBackupCleanup,
  getSettingsAuditLog
} from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/roles.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/backups/' });

// All settings routes require admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Backup & Restore
router.post('/backup', backupDatabase);
router.get('/backup/history', getBackupHistory);
router.get('/backup/statistics', getBackupStatistics);
router.get('/backup/:id/download', downloadBackup);
router.delete('/backup/:id', deleteBackup);
router.post('/backup/cleanup', runBackupCleanup);
router.post('/restore', upload.single('backup'), restoreDatabase);

// System Settings
router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);

// Organization Settings
router.get('/organization', getOrganizationSettings);
router.put('/organization', updateOrganizationSettings);

// Audit Log
router.get('/audit-log', getSettingsAuditLog);

// Roles
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// Email & Notifications
router.post('/test-email', testEmail);
router.post('/trigger-notifications', triggerExpiryNotifications);

export default router;
