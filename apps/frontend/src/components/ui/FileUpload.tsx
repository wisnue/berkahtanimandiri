import { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import uploadService from '../../services/upload.service';

interface FileUploadProps {
  uploadType: string;
  accept?: string;
  maxSize?: number; // in MB
  onUploadSuccess: (fileUrl: string, filePath: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  currentFile?: string;
  label?: string;
}

export function FileUpload({
  uploadType,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSize = 5,
  onUploadSuccess,
  onUploadError,
  currentFile,
  label = 'Upload File',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      const errorMsg = `Ukuran file melebihi batas ${maxSize}MB`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const result = await uploadService.uploadSingle(file, uploadType);
      setPreview(result.fileUrl);
      onUploadSuccess(result.fileUrl, result.filePath, result.fileName);
    } catch (err: any) {
      const errorMsg = err.message || 'Gagal mengupload file';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isImage = preview && (preview.endsWith('.jpg') || preview.endsWith('.jpeg') || preview.endsWith('.png') || preview.endsWith('.gif'));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? 'Mengupload...' : 'Klik untuk upload file'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maksimal {maxSize}MB
          </p>
        </button>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {isImage ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <File className="text-gray-400" size={32} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">File terupload</p>
                <p className="text-xs text-gray-500 mt-1">Klik X untuk menghapus</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
