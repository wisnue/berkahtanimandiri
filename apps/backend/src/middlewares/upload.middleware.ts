import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different file types
const subdirectories = [
  'anggota/ktp',
  'anggota/foto',
  'lahan/peta',
  'lahan/sk',
  'pnbp/bukti',
  'keuangan/bukti',
  'aset/foto',
  'aset/bukti',
  'kegiatan/foto',
  'kegiatan/laporan',
  'dokumen',
];

subdirectories.forEach((dir) => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    void file; // Required by multer signature but not used
    // Get upload type from request
    const uploadType = req.body.uploadType || 'dokumen';
    const destinationPath = path.join(uploadsDir, uploadType);
    
    // Ensure directory exists
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    void req; // Required by multer signature but not used
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  void req; // Required by multer signature but not used
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Hanya gambar, PDF, Word, dan Excel yang diperbolehkan.'));
  }
};

// Upload middleware configurations
export const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
};

// Single file upload
export const uploadSingle = multer(uploadConfig).single('file');

// Multiple files upload (max 5)
export const uploadMultiple = multer(uploadConfig).array('files', 5);

// Fields upload (for multiple different fields)
export const uploadFields = multer(uploadConfig).fields([
  { name: 'fotoKTP', maxCount: 1 },
  { name: 'fotoAnggota', maxCount: 1 },
  { name: 'petaLahan', maxCount: 1 },
  { name: 'skKhdpk', maxCount: 1 },
  { name: 'buktiBayar', maxCount: 1 },
  { name: 'buktiTransaksi', maxCount: 1 },
  { name: 'fotoAset', maxCount: 1 },
  { name: 'buktiPerolehan', maxCount: 1 },
  { name: 'dokumentasiFoto', maxCount: 5 },
  { name: 'laporanKegiatan', maxCount: 1 },
]);

// Helper function to delete file
export const deleteFile = (filePath: string): void => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Helper function to get file URL
export const getFileUrl = (filePath: string): string => {
  return `/uploads/${filePath.replace(/\\/g, '/')}`;
};
