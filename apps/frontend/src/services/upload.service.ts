export interface UploadResponse {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
}

const uploadService = {
  async uploadSingle(file: File, uploadType: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/single`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.data;
  },

  async uploadMultiple(files: File[], uploadType: string): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('uploadType', uploadType);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.data;
  },

  getFileUrl(filePath: string): string {
    return `${import.meta.env.VITE_API_URL}/uploads/${filePath}`;
  },
};

export default uploadService;
