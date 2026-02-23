import { Router } from 'express';
import authRoutes from './auth.routes';
import sessionRoutes from './session.routes';
import anggotaRoutes from './anggota.routes';
import lahanRoutes from './lahan.routes';
import pnbpRoutes from './pnbp.routes';
import keuanganRoutes from './keuangan.routes';
import asetRoutes from './aset.routes';
import kegiatanRoutes from './kegiatan.routes';
import dokumenRoutes from './dokumen.routes';
import dokumenOrganisasiRoutes from './dokumenOrganisasi.routes';
import auditTrailRoutes from './auditTrail.routes';
import uploadRoutes from './upload.routes';
import settingsRoutes from './settings.routes';
import bukuKasRoutes from './bukuKas.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/session', sessionRoutes);
router.use('/anggota', anggotaRoutes);
router.use('/lahan', lahanRoutes);
router.use('/pnbp', pnbpRoutes);
router.use('/keuangan', keuanganRoutes);
router.use('/aset', asetRoutes);
router.use('/kegiatan', kegiatanRoutes);
router.use('/dokumen', dokumenRoutes);
router.use('/dokumen-organisasi', dokumenOrganisasiRoutes);
router.use('/audit-trail', auditTrailRoutes);
router.use('/upload', uploadRoutes);
router.use('/settings', settingsRoutes);
router.use('/buku-kas', bukuKasRoutes);

export default router;
