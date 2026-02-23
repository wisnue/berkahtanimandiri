import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { anggotaService } from '@/services/anggota.service';
import { showToast } from '@/lib/toast';
import * as XLSX from 'xlsx';

interface ImportData {
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamatLengkap: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  noTelepon?: string;
  noWhatsapp?: string;
  email?: string;
  pendidikanTerakhir?: string;
  pekerjaan?: string;
  namaBank?: string;
  nomorRekening?: string;
  atasNamaRekening?: string;
  statusAnggota: string;
  tanggalBergabung: string;
  keterangan?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface AnggotaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AnggotaImportModal: React.FC<AnggotaImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [previewPage, setPreviewPage] = useState(1);
  const previewItemsPerPage = 10;

  const requiredFields = [
    'nik',
    'namaLengkap',
    'jenisKelamin',
    'tempatLahir',
    'tanggalLahir',
    'alamatLengkap',
    'rt',
    'rw',
    'desa',
    'kecamatan',
    'statusAnggota',
    'tanggalBergabung',
  ];

  const fieldLabels: Record<string, string> = {
    nik: 'NIK',
    namaLengkap: 'Nama Lengkap',
    jenisKelamin: 'Jenis Kelamin (L/P)',
    tempatLahir: 'Tempat Lahir',
    tanggalLahir: 'Tanggal Lahir (YYYY-MM-DD)',
    alamatLengkap: 'Alamat Lengkap',
    rt: 'RT',
    rw: 'RW',
    desa: 'Desa',
    kecamatan: 'Kecamatan',
    kabupaten: 'Kabupaten',
    provinsi: 'Provinsi',
    kodePos: 'Kode Pos',
    noTelepon: 'No. Telepon',
    noWhatsapp: 'No. WhatsApp',
    email: 'Email',
    pendidikanTerakhir: 'Pendidikan Terakhir',
    pekerjaan: 'Pekerjaan',
    namaBank: 'Nama Bank',
    nomorRekening: 'Nomor Rekening',
    atasNamaRekening: 'Atas Nama Rekening',
    statusAnggota: 'Status (aktif/nonaktif)',
    tanggalBergabung: 'Tanggal Bergabung (YYYY-MM-DD)',
    keterangan: 'Keterangan',
  };

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        'NIK': '3201234567890123',
        'Nama Lengkap': 'John Doe',
        'Jenis Kelamin (L/P)': 'L',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir (YYYY-MM-DD)': '1990-01-15',
        'Alamat Lengkap': 'Jl. Contoh No. 123',
        'RT': '001',
        'RW': '002',
        'Desa': 'Desa Gembol',
        'Kecamatan': 'Kecamatan Gembol',
        'Kabupaten': 'Kabupaten Gembol',
        'Provinsi': 'Jawa Tengah',
        'Kode Pos': '50000',
        'No. Telepon': '081234567890',
        'No. WhatsApp': '081234567890',
        'Email': 'john.doe@example.com',
        'Pendidikan Terakhir': 'S1',
        'Pekerjaan': 'Wiraswasta',
        'Nama Bank': 'BRI',
        'Nomor Rekening': '1234567890',
        'Atas Nama Rekening': 'John Doe',
        'Status (aktif/nonaktif)': 'aktif',
        'Tanggal Bergabung (YYYY-MM-DD)': '2024-01-01',
        'Keterangan': 'Anggota baru',
      },
      {
        'NIK': '3201234567890124',
        'Nama Lengkap': 'Jane Smith',
        'Jenis Kelamin (L/P)': 'P',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir (YYYY-MM-DD)': '1992-03-20',
        'Alamat Lengkap': 'Jl. Sample No. 456',
        'RT': '003',
        'RW': '004',
        'Desa': 'Desa Gembol',
        'Kecamatan': 'Kecamatan Gembol',
        'Kabupaten': 'Kabupaten Gembol',
        'Provinsi': 'Jawa Tengah',
        'Kode Pos': '50001',
        'No. Telepon': '081234567891',
        'No. WhatsApp': '081234567891',
        'Email': 'jane.smith@example.com',
        'Pendidikan Terakhir': 'SMA',
        'Pekerjaan': 'Karyawan Swasta',
        'Nama Bank': 'BNI',
        'Nomor Rekening': '0987654321',
        'Atas Nama Rekening': 'Jane Smith',
        'Status (aktif/nonaktif)': 'aktif',
        'Tanggal Bergabung (YYYY-MM-DD)': '2024-02-15',
        'Keterangan': '',
      },
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    ws['!cols'] = [
      { wch: 18 }, // NIK
      { wch: 25 }, // Nama Lengkap
      { wch: 20 }, // Jenis Kelamin
      { wch: 20 }, // Tempat Lahir
      { wch: 25 }, // Tanggal Lahir
      { wch: 35 }, // Alamat
      { wch: 8 },  // RT
      { wch: 8 },  // RW
      { wch: 20 }, // Desa
      { wch: 20 }, // Kecamatan
      { wch: 20 }, // Kabupaten
      { wch: 20 }, // Provinsi
      { wch: 12 }, // Kode Pos
      { wch: 18 }, // No. Telepon
      { wch: 18 }, // No. WhatsApp
      { wch: 30 }, // Email
      { wch: 20 }, // Pendidikan
      { wch: 25 }, // Pekerjaan
      { wch: 15 }, // Nama Bank
      { wch: 18 }, // Nomor Rekening
      { wch: 25 }, // Atas Nama
      { wch: 20 }, // Status
      { wch: 25 }, // Tanggal Bergabung
      { wch: 30 }, // Keterangan
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Anggota');

    // Download
    XLSX.writeFile(wb, 'Template_Import_Anggota.xlsx');
  };

  const validateData = (data: any[]): { valid: ImportData[], errors: ValidationError[] } => {
    const validData: ImportData[] = [];
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because row 1 is header, and array is 0-indexed

      // Check required fields
      requiredFields.forEach(field => {
        const excelFieldName = fieldLabels[field];
        if (!row[excelFieldName] || row[excelFieldName].toString().trim() === '') {
          errors.push({
            row: rowNum,
            field: excelFieldName,
            message: `${excelFieldName} tidak boleh kosong`,
          });
        }
      });

      // Validate NIK (must be 16 digits)
      if (row['NIK']) {
        const nik = row['NIK'].toString().trim();
        if (!/^\d{16}$/.test(nik)) {
          errors.push({
            row: rowNum,
            field: 'NIK',
            message: 'NIK harus 16 digit angka',
          });
        }
      }

      // Validate Jenis Kelamin
      if (row['Jenis Kelamin (L/P)']) {
        const jk = row['Jenis Kelamin (L/P)'].toString().trim().toUpperCase();
        if (jk !== 'L' && jk !== 'P') {
          errors.push({
            row: rowNum,
            field: 'Jenis Kelamin',
            message: 'Jenis Kelamin harus L atau P',
          });
        }
      }

      // Validate Status
      if (row['Status (aktif/nonaktif)']) {
        const status = row['Status (aktif/nonaktif)'].toString().trim().toLowerCase();
        if (status !== 'aktif' && status !== 'nonaktif') {
          errors.push({
            row: rowNum,
            field: 'Status',
            message: 'Status harus aktif atau nonaktif',
          });
        }
      }

      // Validate Email format (if provided)
      if (row['Email']) {
        const email = row['Email'].toString().trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push({
            row: rowNum,
            field: 'Email',
            message: 'Format email tidak valid',
          });
        }
      }

      // Validate date format
      const validateDate = (dateStr: string, fieldName: string) => {
        if (!dateStr) return;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          errors.push({
            row: rowNum,
            field: fieldName,
            message: `Format tanggal tidak valid, gunakan YYYY-MM-DD`,
          });
        }
      };

      validateDate(row['Tanggal Lahir (YYYY-MM-DD)'], 'Tanggal Lahir');
      validateDate(row['Tanggal Bergabung (YYYY-MM-DD)'], 'Tanggal Bergabung');

      // If no errors for this row, add to valid data
      const rowErrors = errors.filter(e => e.row === rowNum);
      if (rowErrors.length === 0) {
        validData.push({
          nik: row['NIK']?.toString().trim() || '',
          namaLengkap: row['Nama Lengkap']?.toString().trim() || '',
          jenisKelamin: row['Jenis Kelamin (L/P)']?.toString().trim().toUpperCase() || '',
          tempatLahir: row['Tempat Lahir']?.toString().trim() || '',
          tanggalLahir: row['Tanggal Lahir (YYYY-MM-DD)']?.toString().trim() || '',
          alamatLengkap: row['Alamat Lengkap']?.toString().trim() || '',
          rt: row['RT']?.toString().trim() || '',
          rw: row['RW']?.toString().trim() || '',
          desa: row['Desa']?.toString().trim() || '',
          kecamatan: row['Kecamatan']?.toString().trim() || '',
          kabupaten: row['Kabupaten']?.toString().trim() || '',
          provinsi: row['Provinsi']?.toString().trim() || '',
          kodePos: row['Kode Pos']?.toString().trim() || '',
          noTelepon: row['No. Telepon']?.toString().trim() || '',
          noWhatsapp: row['No. WhatsApp']?.toString().trim() || '',
          email: row['Email']?.toString().trim() || '',
          pendidikanTerakhir: row['Pendidikan Terakhir']?.toString().trim() || '',
          pekerjaan: row['Pekerjaan']?.toString().trim() || '',
          namaBank: row['Nama Bank']?.toString().trim() || '',
          nomorRekening: row['Nomor Rekening']?.toString().trim() || '',
          atasNamaRekening: row['Atas Nama Rekening']?.toString().trim() || '',
          statusAnggota: row['Status (aktif/nonaktif)']?.toString().trim().toLowerCase() || '',
          tanggalBergabung: row['Tanggal Bergabung (YYYY-MM-DD)']?.toString().trim() || '',
          keterangan: row['Keterangan']?.toString().trim() || '',
        });
      }
    });

    return { valid: validData, errors };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log('Parsed Excel data:', jsonData);

          // Validate data
          const { valid, errors } = validateData(jsonData);

          setPreviewData(valid);
          setValidationErrors(errors);
          setPreviewPage(1); // Reset pagination to first page

          if (valid.length > 0) {
            setStep('preview');
          }
        } catch (error) {
          console.error('Error parsing Excel:', error);
          alert('Error membaca file Excel. Pastikan format file sesuai template.');
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        alert('Error membaca file');
        setLoading(false);
      };

      reader.readAsBinaryString(uploadedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Terjadi kesalahan saat mengupload file');
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      showToast.error('Tidak ada data valid untuk diimport');
      return;
    }

    setLoading(true);

    try {
      console.log('Importing data:', previewData);

      const response = await anggotaService.bulkImport(previewData);

      if (response.success) {
        const { imported, failed } = response.data;
        showToast.success(
          `Berhasil mengimport ${imported} data anggota!${failed > 0 ? ` ${failed} data gagal.` : ''}`
        );
        onSuccess();
        handleClose();
      } else {
        showToast.error(response.message || 'Gagal mengimport data');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      showToast.error('Terjadi kesalahan saat mengimport data');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setStep('upload');
    setPreviewPage(1); // Reset pagination
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-white" />
            <h2 className="text-xl font-display font-bold text-white">
              Import Data Anggota
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' ? (
            <div className="space-y-6">
              {/* Download Template Button */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Download Template Excel
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Download template Excel untuk memudahkan input data anggota secara bulk.
                      Template sudah berisi contoh data dan format yang benar.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-emerald-600 font-semibold hover:text-emerald-700">
                    Pilih file Excel
                  </span>
                  <span className="text-gray-600"> atau drag & drop file di sini</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Format: .xlsx, .xls (Max 5MB)
                </p>
                {file && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Petunjuk Import:</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Download template Excel terlebih dahulu</li>
                  <li>Isi data anggota sesuai dengan kolom yang tersedia</li>
                  <li>Pastikan NIK 16 digit, Jenis Kelamin (L/P), Status (aktif/nonaktif)</li>
                  <li>Format tanggal: YYYY-MM-DD (contoh: 2024-01-15)</li>
                  <li>Kolom bertanda merah wajib diisi</li>
                  <li>Upload file Excel yang sudah diisi</li>
                  <li>Preview data akan ditampilkan sebelum import</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-2">
                        Ditemukan {validationErrors.length} Error Validasi
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {validationErrors.map((error, idx) => (
                          <p key={idx} className="text-sm text-red-700">
                            Baris {error.row}, {error.field}: {error.message}
                          </p>
                        ))}
                      </div>
                      <p className="text-sm text-red-600 mt-2">
                        Data dengan error tidak akan diimport. Silakan perbaiki file Excel dan upload ulang.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {previewData.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">
                        {previewData.length} Data Valid Siap Diimport
                      </h4>
                      <p className="text-sm text-emerald-700">
                        Silakan periksa preview data di bawah sebelum mengkonfirmasi import.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {previewData.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">No</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">NIK</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Nama Lengkap</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">JK</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Tempat Lahir</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Tgl Lahir</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Alamat</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Desa</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData
                          .slice((previewPage - 1) * previewItemsPerPage, previewPage * previewItemsPerPage)
                          .map((row, idx) => {
                            const actualIndex = (previewPage - 1) * previewItemsPerPage + idx;
                            return (
                              <tr key={actualIndex} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm border-b">{actualIndex + 1}</td>
                                <td className="px-3 py-2 text-sm border-b">{row.nik}</td>
                                <td className="px-3 py-2 text-sm border-b">{row.namaLengkap}</td>
                                <td className="px-3 py-2 text-sm border-b">{row.jenisKelamin}</td>
                                <td className="px-3 py-2 text-sm border-b">{row.tempatLahir}</td>
                                <td className="px-3 py-2 text-sm border-b">{row.tanggalLahir}</td>
                                <td className="px-3 py-2 text-sm border-b max-w-xs truncate">{row.alamatLengkap}</td>
                                <td className="px-3 py-2 text-sm border-b">{row.desa}</td>
                                <td className="px-3 py-2 text-sm border-b">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    row.statusAnggota === 'aktif' 
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {row.statusAnggota}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {previewData.length > previewItemsPerPage && (
                    <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Menampilkan {(previewPage - 1) * previewItemsPerPage + 1} - {Math.min(previewPage * previewItemsPerPage, previewData.length)} dari {previewData.length} data
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                          disabled={previewPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <div className="px-3 py-1 text-sm">
                          Halaman {previewPage} dari {Math.ceil(previewData.length / previewItemsPerPage)}
                        </div>
                        <button
                          onClick={() => setPreviewPage(p => Math.min(Math.ceil(previewData.length / previewItemsPerPage), p + 1))}
                          disabled={previewPage >= Math.ceil(previewData.length / previewItemsPerPage)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {step === 'preview' && (
              <span>
                {previewData.length} data valid
                {validationErrors.length > 0 && `, ${validationErrors.length} error`}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={step === 'preview' ? () => setStep('upload') : handleClose}
              disabled={loading}
            >
              {step === 'preview' ? 'Kembali' : 'Batal'}
            </Button>
            {step === 'preview' && (
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={loading || previewData.length === 0}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengimport...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {previewData.length} Data
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
