import { Request, Response } from 'express';
import path from 'path';
import { getFileUrl } from '../middlewares/upload.middleware';

export const uploadController = {
  // Single file upload
  uploadSingle(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diupload',
        });
      }

      const uploadType = req.body.uploadType || 'dokumen';
      const relativePath = path.join(uploadType, req.file.filename).replace(/\\/g, '/');

      res.json({
        success: true,
        message: 'File berhasil diupload',
        data: {
          fileName: req.file.originalname,
          filePath: relativePath,
          fileUrl: getFileUrl(relativePath),
          fileSize: req.file.size.toString(),
          fileType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload file',
      });
    }
  },

  // Multiple files upload
  uploadMultiple(req: Request, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diupload',
        });
      }

      const uploadType = req.body.uploadType || 'dokumen';
      const uploadedFiles = req.files.map((file) => {
        const relativePath = path.join(uploadType, file.filename).replace(/\\/g, '/');
        return {
          fileName: file.originalname,
          filePath: relativePath,
          fileUrl: getFileUrl(relativePath),
          fileSize: file.size.toString(),
          fileType: file.mimetype,
        };
      });

      res.json({
        success: true,
        message: `${uploadedFiles.length} file berhasil diupload`,
        data: uploadedFiles,
      });
    } catch (error) {
      console.error('Upload multiple error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload file',
      });
    }
  },

  // Upload with fields (for forms with multiple file inputs)
  uploadFields(req: Request, res: Response) {
    try {
      if (!req.files || typeof req.files !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diupload',
        });
      }

      const uploadType = req.body.uploadType || 'dokumen';
      const uploadedFiles: Record<string, any> = {};

      Object.keys(req.files).forEach((fieldName) => {
        const files = (req.files as any)[fieldName];
        if (Array.isArray(files)) {
          uploadedFiles[fieldName] = files.map((file: Express.Multer.File) => {
            const relativePath = path.join(uploadType, file.filename).replace(/\\/g, '/');
            return {
              fileName: file.originalname,
              filePath: relativePath,
              fileUrl: getFileUrl(relativePath),
              fileSize: file.size.toString(),
              fileType: file.mimetype,
            };
          });
        }
      });

      res.json({
        success: true,
        message: 'File berhasil diupload',
        data: uploadedFiles,
      });
    } catch (error) {
      console.error('Upload fields error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload file',
      });
    }
  },
};
